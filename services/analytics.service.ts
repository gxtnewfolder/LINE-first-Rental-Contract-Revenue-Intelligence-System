// Analytics service - income aggregation and reporting
import prisma from '@/lib/db';
import type { AnalyticsSnapshot, MonthlyIncome, OccupancyReport } from '@/domain/analytics/types';

export const analyticsService = {
  /**
   * Get monthly income breakdown
   */
  async getMonthlyIncome(year: number, month: number): Promise<MonthlyIncome> {
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
    const buildingMap = new Map<string, { buildingId: string; name: string; amount: number }>();

    for (const payment of payments) {
      const building = payment.contract.room.building;
      const current = buildingMap.get(building.id) || {
        buildingId: building.id,
        name: building.name,
        amount: 0,
      };
      current.amount += payment.paidTHB;
      buildingMap.set(building.id, current);
    }

    const byBuilding = Array.from(buildingMap.values());
    const total = byBuilding.reduce((sum, b) => sum + b.amount, 0);

    return {
      year,
      month,
      total,
      byBuilding,
    };
  },

  /**
   * Get income by room for a period
   */
  async getIncomeByRoom(
    year: number,
    month: number
  ): Promise<
    {
      roomId: string;
      roomNumber: string;
      buildingName: string;
      expected: number;
      collected: number;
      status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';
    }[]
  > {
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

    return payments.map((p) => ({
      roomId: p.contract.room.id,
      roomNumber: p.contract.room.roomNumber,
      buildingName: p.contract.room.building.name,
      expected: p.amountTHB,
      collected: p.paidTHB,
      status:
        p.status === 'PAID'
          ? 'PAID'
          : p.paidTHB > 0
            ? 'PARTIAL'
            : p.status === 'OVERDUE'
              ? 'OVERDUE'
              : 'PENDING',
    }));
  },

  /**
   * Get current occupancy report
   */
  async getOccupancy(): Promise<OccupancyReport> {
    const rooms = await prisma.room.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalRooms = rooms.reduce((sum, r) => sum + r._count, 0);
    const occupied = rooms.find((r) => r.status === 'OCCUPIED')?._count || 0;
    const vacant = rooms.find((r) => r.status === 'VACANT')?._count || 0;
    const maintenance = rooms.find((r) => r.status === 'MAINTENANCE')?._count || 0;

    return {
      date: new Date(),
      totalRooms,
      occupiedRooms: occupied,
      vacantRooms: vacant,
      maintenanceRooms: maintenance,
      occupancyRate: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
    };
  },

  /**
   * Get income trend for last N months
   */
  async getIncomeTrend(
    months: number = 6
  ): Promise<{ year: number; month: number; total: number }[]> {
    const result: { year: number; month: number; total: number }[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const income = await prisma.payment.aggregate({
        where: {
          periodYear: year,
          periodMonth: month,
          status: 'PAID',
        },
        _sum: { paidTHB: true },
      });

      result.push({
        year,
        month,
        total: income._sum.paidTHB || 0,
      });
    }

    return result.reverse();
  },

  /**
   * Get collection rate
   */
  async getCollectionRate(year: number, month: number): Promise<{
    expected: number;
    collected: number;
    rate: number;
    overdue: number;
    overdueCount: number;
  }> {
    const payments = await prisma.payment.findMany({
      where: {
        periodYear: year,
        periodMonth: month,
      },
    });

    const expected = payments.reduce((sum, p) => sum + p.amountTHB, 0);
    const collected = payments.reduce((sum, p) => sum + p.paidTHB, 0);
    const overduePayments = payments.filter((p) => p.status === 'OVERDUE');
    const overdue = overduePayments.reduce((sum, p) => sum + (p.amountTHB - p.paidTHB), 0);

    return {
      expected,
      collected,
      rate: expected > 0 ? Math.round((collected / expected) * 100) : 0,
      overdue,
      overdueCount: overduePayments.length,
    };
  },

  /**
   * Get full analytics snapshot for AI
   */
  async getSnapshot(year: number, month: number): Promise<AnalyticsSnapshot> {
    const [income, occupancy, collection, expiring, inflation] = await Promise.all([
      this.getMonthlyIncome(year, month),
      this.getOccupancy(),
      this.getCollectionRate(year, month),
      prisma.contract.findMany({
        where: {
          status: { in: ['ACTIVE', 'EXPIRING'] },
          endDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
        include: {
          room: true,
          tenant: true,
        },
      }),
      prisma.inflationIndex.findFirst({
        where: { year, month },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Get vacant rooms
    const vacantRooms = await prisma.room.findMany({
      where: { status: 'VACANT' },
      include: { building: true },
    });

    // Get overdue payments
    const overduePayments = await prisma.payment.findMany({
      where: { status: 'OVERDUE' },
      include: {
        contract: {
          include: { room: true },
        },
      },
    });

    return {
      period: { year, month },
      income: {
        total: income.total,
        byBuilding: income.byBuilding.map((b) => ({ name: b.name, amount: b.amount })),
        vsLastMonth: 0, // Would calculate from previous month
        vsLastYear: 0,
      },
      occupancy: {
        current: occupancy.occupancyRate,
        vacant: vacantRooms.map((r) => ({
          room: r.roomNumber,
          building: r.building.name,
          daysSinceVacant: 0, // Would need tracking
        })),
      },
      collection: {
        rate: collection.rate,
        overdue: overduePayments.map((p) => ({
          room: p.contract.room.roomNumber,
          amount: p.amountTHB - p.paidTHB,
          daysPastDue: Math.ceil(
            (Date.now() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
        avgDaysToCollect: 0, // Would calculate from payment history
      },
      contracts: {
        expiringSoon: expiring.map((c) => ({
          room: c.room.roomNumber,
          tenant: c.tenant.name,
          daysRemaining: Math.ceil(
            (c.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        })),
        recentRenewals: 0,
        recentTerminations: 0,
      },
      inflation: {
        currentRate: inflation?.ratePct || 0,
        avgRentGrowth: 0, // Would calculate from rent history
        roomsBelowInflation: [], // Would compare with rent history
      },
    };
  },
};
