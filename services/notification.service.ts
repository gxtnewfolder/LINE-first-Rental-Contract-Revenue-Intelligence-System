// Notification service - send LINE notifications
import { pushMessage, textMessage } from '@/integrations/line/client';
import { config } from '@/lib/config';
import prisma from '@/lib/db';

export const notificationService = {
  /**
   * Notify owner about expiring contracts
   */
  async notifyExpiringContracts(daysAhead: number = 30): Promise<number> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiring = await prisma.contract.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING'] },
        endDate: { lte: futureDate, gte: new Date() },
      },
      include: {
        room: {
          include: { building: true },
        },
        tenant: true,
      },
    });

    if (expiring.length === 0) {
      return 0;
    }

    // Build notification message
    const lines = expiring.map((c) => {
      const daysLeft = Math.ceil(
        (c.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return `• ${c.room.building.name} ${c.room.roomNumber} - ${c.tenant.name} (${daysLeft} วัน)`;
    });

    const message = textMessage(
      `⚠️ สัญญาใกล้หมดอายุ (${expiring.length} สัญญา)\n\n${lines.join('\n')}\n\n💡 โปรดติดต่อผู้เช่าเพื่อต่อสัญญา`
    );

    // Send to all owners
    let sent = 0;
    for (const ownerId of config.line.ownerLineIds) {
      const success = await pushMessage(ownerId, [message]);
      if (success) sent++;
    }

    return sent;
  },

  /**
   * Notify owner about overdue payments
   */
  async notifyOverduePayments(): Promise<number> {
    const overdue = await prisma.payment.findMany({
      where: {
        status: 'OVERDUE',
      },
      include: {
        contract: {
          include: {
            room: {
              include: { building: true },
            },
            tenant: true,
          },
        },
      },
    });

    if (overdue.length === 0) {
      return 0;
    }

    // Calculate total overdue
    const totalOverdue = overdue.reduce(
      (sum, p) => sum + (p.amountTHB - p.paidTHB),
      0
    );

    // Build message
    const lines = overdue.map((p) => {
      const amount = p.amountTHB - p.paidTHB;
      const daysPast = Math.ceil(
        (Date.now() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `• ${p.contract.room.building.name} ${p.contract.room.roomNumber} - ฿${amount.toLocaleString()} (${daysPast} วัน)`;
    });

    const message = textMessage(
      `🔴 ค่าเช่าค้างชำระ (${overdue.length} รายการ)\n\n` +
        `รวม: ฿${totalOverdue.toLocaleString()}\n\n` +
        `${lines.join('\n')}\n\n` +
        `💡 โปรดติดตามเก็บเงิน`
    );

    // Send to all owners
    let sent = 0;
    for (const ownerId of config.line.ownerLineIds) {
      const success = await pushMessage(ownerId, [message]);
      if (success) sent++;
    }

    return sent;
  },

  /**
   * Send rent due reminder to tenant
   */
  async sendRentDueReminder(contractId: string): Promise<boolean> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        room: {
          include: { building: true },
        },
        tenant: true,
      },
    });

    if (!contract || !contract.tenant.lineUserId) {
      return false;
    }

    const message = textMessage(
      `🔔 แจ้งเตือนค่าเช่า\n\n` +
        `ห้อง ${contract.room.building.name} ${contract.room.roomNumber}\n` +
        `จำนวน ฿${contract.rentAmountTHB.toLocaleString()}\n\n` +
        `กรุณาชำระภายในวันที่ 5 ของเดือน\n` +
        `ขอบคุณค่ะ 🙏`
    );

    return pushMessage(contract.tenant.lineUserId, [message]);
  },

  /**
   * Notify contract renewal success
   */
  async notifyContractRenewal(contractId: string): Promise<boolean> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        room: {
          include: { building: true },
        },
        tenant: true,
      },
    });

    if (!contract) {
      return false;
    }

    // Notify owner
    const ownerMessage = textMessage(
      `✅ ต่อสัญญาสำเร็จ\n\n` +
        `ห้อง ${contract.room.building.name} ${contract.room.roomNumber}\n` +
        `ผู้เช่า: ${contract.tenant.name}\n` +
        `ค่าเช่า: ฿${contract.rentAmountTHB.toLocaleString()}/เดือน\n` +
        `ระยะเวลา: ${contract.startDate.toLocaleDateString('th-TH')} - ${contract.endDate.toLocaleDateString('th-TH')}`
    );

    for (const ownerId of config.line.ownerLineIds) {
      await pushMessage(ownerId, [ownerMessage]);
    }

    // Notify tenant if linked
    if (contract.tenant.lineUserId) {
      const tenantMessage = textMessage(
        `🎉 ต่อสัญญาเรียบร้อยแล้ว!\n\n` +
          `ห้อง ${contract.room.building.name} ${contract.room.roomNumber}\n` +
          `สัญญาใหม่: ${contract.startDate.toLocaleDateString('th-TH')} - ${contract.endDate.toLocaleDateString('th-TH')}\n\n` +
          `ขอบคุณที่ไว้วางใจค่ะ 🙏`
      );

      await pushMessage(contract.tenant.lineUserId, [tenantMessage]);
    }

    return true;
  },
};
