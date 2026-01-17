// Payment service - manage rent payments and automation
import prisma from '@/lib/db';
import type { Payment, PaymentStatus } from '@/app/generated/prisma/client';

export interface CreatePaymentInput {
  contractId: string;
  periodYear: number;
  periodMonth: number;
  amountTHB: number;
  dueDate: Date;
  notes?: string;
}

export interface RecordPaymentInput {
  amount: number;
  paidDate?: Date;
  notes?: string;
}

export const paymentService = {
  /**
   * Find all payments with optional filters
   */
  async findAll(filters: {
    contractId?: string;
    periodYear?: number;
    periodMonth?: number;
    status?: PaymentStatus;
  } = {}): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: {
        contractId: filters.contractId,
        periodYear: filters.periodYear,
        periodMonth: filters.periodMonth,
        status: filters.status,
      },
      orderBy: [
        { periodYear: 'desc' },
        { periodMonth: 'desc' },
      ],
      include: {
        contract: {
          include: {
            room: true,
            tenant: true,
          },
        },
      },
    });
  },

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            room: true,
            tenant: true,
          },
        },
      },
    });
  },

  /**
   * Create a new payment record
   */
  async create(data: CreatePaymentInput): Promise<Payment> {
    return prisma.payment.create({
      data: {
        contractId: data.contractId,
        periodYear: data.periodYear,
        periodMonth: data.periodMonth,
        amountTHB: data.amountTHB,
        dueDate: data.dueDate,
        status: 'PENDING',
        notes: data.notes,
      },
    });
  },

  /**
   * Record a payment (update paid amount)
   */
  async recordPayment(id: string, data: RecordPaymentInput): Promise<Payment> {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new Error('Payment record not found');

    const totalPaid = payment.paidTHB + data.amount;
    const status: PaymentStatus = totalPaid >= payment.amountTHB ? 'PAID' : 'PARTIAL';

    return prisma.payment.update({
      where: { id },
      data: {
        paidTHB: totalPaid,
        paidDate: data.paidDate || new Date(),
        status,
        notes: data.notes ? `${payment.notes || ''}\n${data.notes}` : payment.notes,
      },
    });
  },

  /**
   * Mark payment as overdue
   */
  async markOverdue(id: string): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data: { status: 'OVERDUE' },
    });
  },

  /**
   * Generate monthly payments for all active contracts
   */
  async generateMonthlyPayments(year: number, month: number): Promise<{ created: number; skipped: number }> {
    // 1. Find all ACTIVE and EXPIRING contracts
    const activeContracts = await prisma.contract.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING'] },
        startDate: { lte: new Date(year, month, 0) }, // Started before or during this month
        endDate: { gte: new Date(year, month - 1, 1) }, // Ends during or after this month
      },
    });

    let created = 0;
    let skipped = 0;

    for (const contract of activeContracts) {
      // Check if payment already exists for this period
      const existing = await prisma.payment.findUnique({
        where: {
          contractId_periodYear_periodMonth: {
            contractId: contract.id,
            periodYear: year,
            periodMonth: month,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create payment
      // Default due date is 5th of the month
      const dueDate = new Date(year, month - 1, 5);
      
      await prisma.payment.create({
        data: {
          contractId: contract.id,
          periodYear: year,
          periodMonth: month,
          amountTHB: contract.rentAmountTHB,
          dueDate,
          status: 'PENDING',
        },
      });
      created++;
    }

    return { created, skipped };
  },

  /**
   * Auto-mark overdue payments
   */
  async autoMarkOverdue(): Promise<number> {
    const now = new Date();
    const result = await prisma.payment.updateMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: now },
      },
      data: {
        status: 'OVERDUE',
      },
    });
    return result.count;
  },
};
