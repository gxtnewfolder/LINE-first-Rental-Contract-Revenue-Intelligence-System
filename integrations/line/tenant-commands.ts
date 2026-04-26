// Tenant-facing LINE bot commands
import type { LineEvent, LineMessage } from './client';
import { textMessage } from './client';
import prisma from '@/lib/db';

// Quick reply menu for registered tenants
export function tenantMenu(messages: LineMessage[]): LineMessage[] {
  const items = [
    { label: '💰 ค่าเช่า', text: 'ค่าเช่า' },
    { label: '📄 สัญญา', text: 'สัญญา' },
    { label: '📊 ประวัติ', text: 'ประวัติ' },
    { label: '📞 ติดต่อ', text: 'ติดต่อ' },
  ];

  return messages.map((msg, i) => {
    if (i !== messages.length - 1) return msg;
    return {
      ...msg,
      quickReply: {
        items: items.map((item) => ({
          type: 'action' as const,
          action: { type: 'message' as const, label: item.label, text: item.text },
        })),
      },
    };
  });
}

interface TenantCommandResult {
  messages: LineMessage[];
}

// Route tenant message — called after confirming user is a registered tenant
export async function handleTenantCommand(
  event: LineEvent,
  tenantId: string
): Promise<TenantCommandResult> {
  const text = event.message?.text?.trim().toLowerCase() || '';

  if (matchAny(text, ['ค่าเช่า', 'ยอด', 'จ่าย', 'payment'])) {
    return handleTenantPayment(tenantId);
  }
  if (matchAny(text, ['สัญญา', 'contract'])) {
    return handleTenantContract(tenantId);
  }
  if (matchAny(text, ['ประวัติ', 'history'])) {
    return handleTenantHistory(tenantId);
  }
  if (matchAny(text, ['ติดต่อ', 'contact', 'เจ้าของ'])) {
    return handleTenantContact(tenantId);
  }

  return {
    messages: tenantMenu([
      textMessage('👋 สวัสดี! กดปุ่มด้านล่างเพื่อดูข้อมูลของคุณ 👇'),
    ]),
  };
}

// Handle unregistered user — guide to self-register via phone number
export async function handleUnregisteredTenant(
  event: LineEvent
): Promise<TenantCommandResult> {
  const text = event.message?.text?.trim() || '';

  // "ลงทะเบียน 0812345678"
  const regMatch = text.match(/^ลงทะเบียน\s+(0\d{8,9})/);
  if (regMatch) {
    return registerByPhone(event.source.userId!, regMatch[1]);
  }

  // Also try plain phone number
  const phoneMatch = text.match(/^(0\d{8,9})$/);
  if (phoneMatch) {
    return registerByPhone(event.source.userId!, phoneMatch[1]);
  }

  return {
    messages: [
      textMessage(
        '👋 สวัสดีจาก HaTy!\n\n' +
          'เพื่อดูข้อมูลสัญญาและค่าเช่าของคุณ กรุณาลงทะเบียน:\n\n' +
          '📱 พิมพ์: ลงทะเบียน [เบอร์มือถือ]\n' +
          'ตัวอย่าง: ลงทะเบียน 0812345678\n\n' +
          '(ใช้เบอร์โทรที่ให้ไว้กับเจ้าของห้อง)'
      ),
    ],
  };
}

// ----- Private helpers -----

async function registerByPhone(
  lineUserId: string,
  phone: string
): Promise<TenantCommandResult> {
  // Normalize phone (remove dashes/spaces)
  const normalized = phone.replace(/[-\s]/g, '');

  const tenant = await prisma.tenant.findFirst({
    where: { phone: normalized, lineUserId: null },
  });

  if (!tenant) {
    // Check if already linked with this lineUserId
    const existing = await prisma.tenant.findFirst({
      where: { phone: normalized },
    });
    if (existing?.lineUserId === lineUserId) {
      return {
        messages: tenantMenu([
          textMessage(`✅ คุณลงทะเบียนไว้แล้ว\nกดปุ่มด้านล่างเพื่อดูข้อมูล 👇`),
        ]),
      };
    }
    return {
      messages: [
        textMessage(
          '❌ ไม่พบเบอร์โทรนี้ในระบบ\n\n' +
            'กรุณาตรวจสอบเบอร์ที่ให้ไว้กับเจ้าของห้อง หรือติดต่อเจ้าของห้องเพื่อแก้ไขข้อมูล'
        ),
      ],
    };
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { lineUserId, inviteToken: null },
  });

  return {
    messages: tenantMenu([
      textMessage(
        `✅ ลงทะเบียนสำเร็จ!\nยินดีต้อนรับ คุณ${tenant.name} 🎉\n\n` +
          `กดปุ่มด้านล่างเพื่อดูข้อมูลสัญญาและค่าเช่าของคุณ 👇`
      ),
    ]),
  };
}

async function handleTenantPayment(tenantId: string): Promise<TenantCommandResult> {
  const now = new Date();
  const payments = await prisma.payment.findMany({
    where: {
      contract: { tenantId },
      status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
    },
    include: { contract: { include: { room: { include: { building: true } } } } },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });

  if (payments.length === 0) {
    return {
      messages: tenantMenu([textMessage('✅ ไม่มียอดค้างชำระ\nคุณชำระครบทุกรายการแล้ว 👍')]),
    };
  }

  const lines = payments.map((p) => {
    const overdue = p.dueDate < now && p.status !== 'PAID';
    const remaining = p.amountTHB - p.paidTHB;
    const dueStr = p.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    return `${overdue ? '🔴' : '🟡'} ${p.contract.room.building.name} ${p.contract.room.roomNumber}\n   ฿${remaining.toLocaleString()} — ครบกำหนด ${dueStr}`;
  });

  const total = payments.reduce((s, p) => s + (p.amountTHB - p.paidTHB), 0);

  return {
    messages: tenantMenu([
      textMessage(
        `💰 ยอดค้างชำระของคุณ\n\n${lines.join('\n\n')}\n\n` +
          `รวม: ฿${total.toLocaleString()}`
      ),
    ]),
  };
}

async function handleTenantContract(tenantId: string): Promise<TenantCommandResult> {
  const contract = await prisma.contract.findFirst({
    where: { tenantId, status: { in: ['ACTIVE', 'EXPIRING', 'PENDING_SIGNATURE', 'SIGNED'] } },
    include: { room: { include: { building: true } } },
    orderBy: { createdAt: 'desc' },
  });

  if (!contract) {
    return {
      messages: tenantMenu([textMessage('📋 ไม่พบสัญญาที่ active\nกรุณาติดต่อเจ้าของห้อง')]),
    };
  }

  const statusTH: Record<string, string> = {
    PENDING_SIGNATURE: '⏳ รอลายเซ็น',
    SIGNED: '✍️ เซ็นแล้ว รอเริ่ม',
    ACTIVE: '✅ มีผลบังคับใช้',
    EXPIRING: '⚠️ ใกล้หมดอายุ',
  };

  const start = contract.startDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  const end = contract.endDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

  return {
    messages: tenantMenu([
      textMessage(
        `📄 สัญญาเช่าของคุณ\n\n` +
          `🏠 ห้อง: ${contract.room.building.name} ${contract.room.roomNumber}\n` +
          `💰 ค่าเช่า: ฿${contract.rentAmountTHB.toLocaleString()}/เดือน\n` +
          `📅 ${start} — ${end}\n` +
          `สถานะ: ${statusTH[contract.status] ?? contract.status}`
      ),
    ]),
  };
}

async function handleTenantHistory(tenantId: string): Promise<TenantCommandResult> {
  const payments = await prisma.payment.findMany({
    where: { contract: { tenantId } },
    include: { contract: { include: { room: { include: { building: true } } } } },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    take: 6,
  });

  if (payments.length === 0) {
    return {
      messages: tenantMenu([textMessage('📊 ยังไม่มีประวัติการชำระเงิน')]),
    };
  }

  const thaiMonths = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const lines = payments.map((p) => {
    const icon = p.status === 'PAID' ? '✅' : p.status === 'OVERDUE' ? '🔴' : '🟡';
    return `${icon} ${thaiMonths[p.periodMonth]} ${p.periodYear} — ฿${p.paidTHB.toLocaleString()}/${p.amountTHB.toLocaleString()}`;
  });

  return {
    messages: tenantMenu([
      textMessage(`📊 ประวัติค่าเช่า (6 เดือนล่าสุด)\n\n${lines.join('\n')}`),
    ]),
  };
}

async function handleTenantContact(tenantId: string): Promise<TenantCommandResult> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { owner: true },
  });

  const ownerName = tenant?.owner?.displayName ?? 'เจ้าของห้อง';

  return {
    messages: tenantMenu([
      textMessage(
        `📞 ข้อมูลติดต่อเจ้าของห้อง\n\n` +
          `👤 ${ownerName}\n\n` +
          `หากมีปัญหาหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อโดยตรง`
      ),
    ]),
  };
}

function matchAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}
