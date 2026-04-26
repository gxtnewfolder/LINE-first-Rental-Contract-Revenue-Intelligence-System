// LINE command parser and router
import type { LineEvent, LineMessage } from './client';
import {
  textMessage,
  incomeFlexMessage,
  vacantRoomsFlexMessage,
  withMenu,
  isOwner,
} from './client';
import { roomService } from '@/services/room.service';
import { aiService } from '@/ai';
import prisma from '@/lib/db';
import type { PaymentStatus } from '@/app/generated/prisma/client';

// Command definitions with Thai aliases
const COMMANDS = {
  INCOME: ['รายได้', 'รายได้เดือนนี้', 'income', 'เงิน'],
  VACANT: ['ห้องว่าง', 'vacant', 'ว่าง'],
  HELP: ['help', 'ช่วย', 'คำสั่ง', '?'],
  SUMMARY: ['สรุป', 'summary', 'สรุปเดือนนี้'],
  ADVICE: ['แนะนำ', 'ปรับค่าเช่า', 'advice'],
} as const;

interface CommandResult {
  messages: LineMessage[];
  authorized: boolean;
}

/**
 * Parse and execute command from LINE message
 */
export async function handleCommand(event: LineEvent): Promise<CommandResult> {
  const userId = event.source.userId;
  
  // Check authorization for owner-only commands
  if (!userId || !isOwner(userId)) {
    return {
      messages: [textMessage('❌ คุณไม่มีสิทธิ์ใช้งานระบบนี้')],
      authorized: false,
    };
  }

  const text = event.message?.text?.trim().toLowerCase() || '';
  
  // Match command
  if (matchCommand(text, COMMANDS.INCOME)) {
    return handleIncomeCommand();
  }
  
  if (matchCommand(text, COMMANDS.VACANT)) {
    return handleVacantCommand();
  }
  
  if (matchCommand(text, COMMANDS.HELP)) {
    return handleHelpCommand();
  }
  
  if (matchCommand(text, COMMANDS.SUMMARY)) {
    return handleSummaryCommand();
  }
  
  if (matchCommand(text, COMMANDS.ADVICE)) {
    return handleAdviceCommand();
  }

  // Unknown command — show menu
  return {
    messages: withMenu([
      textMessage('🤔 ไม่เข้าใจคำสั่ง กดปุ่มด้านล่างได้เลย 👇'),
    ]),
    authorized: true,
  };
}

/**
 * Check if text matches any command alias
 */
function matchCommand(text: string, aliases: readonly string[]): boolean {
  return aliases.some((alias) => text.includes(alias.toLowerCase()));
}

/**
 * Handle income command - show monthly income
 */
async function handleIncomeCommand(): Promise<CommandResult> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Query monthly income
  const payments = await prisma.payment.findMany({
    where: {
      periodYear: year,
      periodMonth: month,
    },
    include: {
      contract: {
        include: {
          room: {
            include: { building: true },
          },
        },
      },
    },
  });

  // Aggregate by building
  const buildingMap = new Map<string, number>();
  let collected = 0;
  let pending = 0;

  for (const payment of payments) {
    const buildingName = payment.contract.room.building.name;
    const current = buildingMap.get(buildingName) || 0;
    buildingMap.set(buildingName, current + payment.amountTHB);

    if (payment.status === 'PAID') {
      collected += payment.paidTHB;
    } else {
      pending += payment.amountTHB - payment.paidTHB;
    }
  }

  const buildings = Array.from(buildingMap.entries()).map(([name, amount]) => ({
    name,
    amount,
  }));

  const total = buildings.reduce((sum, b) => sum + b.amount, 0);

  const thaiMonths = [
    '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];

  return {
    messages: withMenu([
      incomeFlexMessage({
        month: thaiMonths[month],
        total,
        buildings,
        collected,
        pending,
      }),
    ]),
    authorized: true,
  };
}

/**
 * Handle vacant rooms command
 */
async function handleVacantCommand(): Promise<CommandResult> {
  const rooms = await roomService.findVacant();

  const formattedRooms = rooms.map((room) => ({
    roomNumber: room.roomNumber,
    buildingName: room.building.name,
    rent: room.baseRentTHB,
  }));

  return {
    messages: withMenu([vacantRoomsFlexMessage(formattedRooms)]),
    authorized: true,
  };
}

/**
 * Handle summary command - use AI if available, else fallback
 */
async function handleSummaryCommand(): Promise<CommandResult> {
  const aiSummary = await aiService.generateMonthlySummary();
  
  return {
    messages: withMenu([textMessage(aiSummary.content)]),
    authorized: true,
  };
}

/**
 * Handle advice command - detect anomalies and give high-level advice
 */
async function handleAdviceCommand(): Promise<CommandResult> {
  const anomaly = await aiService.detectAnomalies();
  const expiry = await aiService.generateExpiryReminder();
  
  return {
    messages: withMenu([
      textMessage(`🤖 AI วิเคราะห์ระบบ:\n\n${anomaly.content}\n\n${expiry.content}`),
    ]),
    authorized: true,
  };
}

/**
 * Handle help command
 */
function handleHelpCommand(): Promise<CommandResult> {
  return Promise.resolve({
    messages: withMenu([
      textMessage('📋 กดปุ่มด้านล่างเพื่อใช้งาน หรือพิมพ์คำสั่งได้เลย 👇'),
    ]),
    authorized: true,
  });
}
