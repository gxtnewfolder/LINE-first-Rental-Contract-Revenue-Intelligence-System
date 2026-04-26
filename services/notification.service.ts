// Notification service - send LINE notifications
import { pushMessage, textMessage } from '@/integrations/line/client';
import prisma from '@/lib/db';

export const notificationService = {
  async notifyExpiringContracts(daysAhead: number = 30): Promise<number> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiring = await prisma.contract.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING'] },
        endDate: { lte: futureDate, gte: new Date() },
      },
      include: {
        room: { include: { building: { include: { owner: true } } } },
        tenant: true,
      },
    });

    if (expiring.length === 0) return 0;

    // Group by owner lineUserId
    const byOwner = new Map<string, typeof expiring>();
    for (const c of expiring) {
      const lineUserId = c.room.building.owner?.lineUserId;
      if (!lineUserId) continue;
      if (!byOwner.has(lineUserId)) byOwner.set(lineUserId, []);
      byOwner.get(lineUserId)!.push(c);
    }

    let sent = 0;
    for (const [lineUserId, contracts] of byOwner) {
      const lines = contracts.map((c) => {
        const daysLeft = Math.ceil((c.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return `• ${c.room.building.name} ${c.room.roomNumber} - ${c.tenant.name} (${daysLeft} วัน)`;
      });
      const msg = textMessage(
        `⚠️ สัญญาใกล้หมดอายุ (${contracts.length} สัญญา)\n\n${lines.join('\n')}\n\n💡 โปรดติดต่อผู้เช่าเพื่อต่อสัญญา`
      );
      const ok = await pushMessage(lineUserId, [msg]);
      if (ok) sent++;
    }

    return sent;
  },

  async notifyOverduePayments(): Promise<number> {
    const overdue = await prisma.payment.findMany({
      where: { status: 'OVERDUE' },
      include: {
        contract: {
          include: {
            room: { include: { building: { include: { owner: true } } } },
            tenant: true,
          },
        },
      },
    });

    if (overdue.length === 0) return 0;

    // Group by owner lineUserId
    const byOwner = new Map<string, typeof overdue>();
    for (const p of overdue) {
      const lineUserId = p.contract.room.building.owner?.lineUserId;
      if (!lineUserId) continue;
      if (!byOwner.has(lineUserId)) byOwner.set(lineUserId, []);
      byOwner.get(lineUserId)!.push(p);
    }

    let sent = 0;
    for (const [lineUserId, payments] of byOwner) {
      const total = payments.reduce((s, p) => s + (p.amountTHB - p.paidTHB), 0);
      const lines = payments.map((p) => {
        const amount = p.amountTHB - p.paidTHB;
        const daysPast = Math.ceil((Date.now() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return `• ${p.contract.room.building.name} ${p.contract.room.roomNumber} - ฿${amount.toLocaleString()} (${daysPast} วัน)`;
      });
      const msg = textMessage(
        `🔴 ค่าเช่าค้างชำระ (${payments.length} รายการ)\n\n` +
          `รวม: ฿${total.toLocaleString()}\n\n` +
          `${lines.join('\n')}\n\n` +
          `💡 โปรดติดตามเก็บเงิน`
      );
      const ok = await pushMessage(lineUserId, [msg]);
      if (ok) sent++;
    }

    return sent;
  },

  async sendRentDueReminder(contractId: string): Promise<boolean> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { room: { include: { building: true } }, tenant: true },
    });

    if (!contract || !contract.tenant.lineUserId) return false;

    const msg = textMessage(
      `🔔 แจ้งเตือนค่าเช่า\n\n` +
        `ห้อง ${contract.room.building.name} ${contract.room.roomNumber}\n` +
        `จำนวน ฿${contract.rentAmountTHB.toLocaleString()}\n\n` +
        `กรุณาชำระภายในวันที่ 5 ของเดือน\n` +
        `ขอบคุณค่ะ 🙏`
    );

    return pushMessage(contract.tenant.lineUserId, [msg]);
  },

  async notifyContractRenewal(contractId: string): Promise<boolean> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        room: { include: { building: { include: { owner: true } } } },
        tenant: true,
      },
    });

    if (!contract) return false;

    const ownerLineUserId = contract.room.building.owner?.lineUserId;
    if (ownerLineUserId) {
      const ownerMsg = textMessage(
        `✅ ต่อสัญญาสำเร็จ\n\n` +
          `ห้อง ${contract.room.building.name} ${contract.room.roomNumber}\n` +
          `ผู้เช่า: ${contract.tenant.name}\n` +
          `ค่าเช่า: ฿${contract.rentAmountTHB.toLocaleString()}/เดือน\n` +
          `ระยะเวลา: ${contract.startDate.toLocaleDateString('th-TH')} - ${contract.endDate.toLocaleDateString('th-TH')}`
      );
      await pushMessage(ownerLineUserId, [ownerMsg]);
    }

    if (contract.tenant.lineUserId) {
      const tenantMsg = textMessage(
        `🎉 ต่อสัญญาเรียบร้อยแล้ว!\n\n` +
          `ห้อง ${contract.room.building.name} ${contract.room.roomNumber}\n` +
          `สัญญาใหม่: ${contract.startDate.toLocaleDateString('th-TH')} - ${contract.endDate.toLocaleDateString('th-TH')}\n\n` +
          `ขอบคุณที่ไว้วางใจค่ะ 🙏`
      );
      await pushMessage(contract.tenant.lineUserId, [tenantMsg]);
    }

    return true;
  },
};
