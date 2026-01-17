// Inflation service - Thai CPI data management and rent comparison
import prisma from '@/lib/db';
import type { RentAdjustmentResult, InflationData } from '@/domain/inflation/types';

export const inflationService = {
  /**
   * Get inflation data for a period
   */
  async getInflation(year: number, month: number): Promise<InflationData | null> {
    const data = await prisma.inflationIndex.findFirst({
      where: { year, month },
    });

    if (!data) return null;

    return {
      year: data.year,
      month: data.month,
      ratePct: data.ratePct,
    };
  },

  /**
   * Get all inflation data
   */
  async getAllInflation(): Promise<InflationData[]> {
    const data = await prisma.inflationIndex.findMany({
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    return data.map((d) => ({
      year: d.year,
      month: d.month,
      ratePct: d.ratePct,
    }));
  },

  /**
   * Add or update inflation data
   */
  async upsertInflation(
    year: number,
    month: number,
    ratePct: number,
    source: string = 'manual'
  ): Promise<InflationData> {
    const existing = await prisma.inflationIndex.findFirst({
      where: { year, month },
    });

    if (existing) {
      const updated = await prisma.inflationIndex.update({
        where: { id: existing.id },
        data: { ratePct, source },
      });
      return { year: updated.year, month: updated.month, ratePct: updated.ratePct };
    }

    const created = await prisma.inflationIndex.create({
      data: { year, month, ratePct, source },
    });

    return { year: created.year, month: created.month, ratePct: created.ratePct };
  },

  /**
   * Calculate cumulative inflation between two dates
   */
  async getCumulativeInflation(
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ): Promise<number> {
    const data = await prisma.inflationIndex.findMany({
      where: {
        OR: [
          { year: { gt: startYear, lt: endYear } },
          { year: startYear, month: { gte: startMonth } },
          { year: endYear, month: { lte: endMonth } },
        ],
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    // Compound the monthly rates
    let cumulative = 1;
    for (const d of data) {
      cumulative *= 1 + d.ratePct / 100;
    }

    return (cumulative - 1) * 100; // Return as percentage
  },

  /**
   * Calculate rent adjustment recommendation
   */
  async calculateRentAdjustment(contractId: string): Promise<RentAdjustmentResult> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        room: true,
        tenant: true,
      },
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Get contract start date
    const startYear = contract.startDate.getFullYear();
    const startMonth = contract.startDate.getMonth() + 1;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Calculate cumulative inflation
    const inflationPct = await this.getCumulativeInflation(
      startYear,
      startMonth,
      currentYear,
      currentMonth
    );

    // Original rent (from room base or first contract)
    const originalRent = contract.room.baseRentTHB;
    const currentRent = contract.rentAmountTHB;

    // Calculate rent growth
    const rentGrowthPct =
      originalRent > 0
        ? ((currentRent - originalRent) / originalRent) * 100
        : 0;

    // Gap analysis
    const gap = rentGrowthPct - inflationPct;

    // Minimum inflation-adjusted rent
    const minimumRent = Math.round(originalRent * (1 + inflationPct / 100));

    // Tenant years for loyalty discount
    const tenantYears = Math.floor(
      (now.getTime() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    );

    // Tenant factor (loyalty discount)
    let tenantFactor = 0;
    if (tenantYears >= 5) tenantFactor = 0.05;
    else if (tenantYears >= 3) tenantFactor = 0.03;
    else if (tenantYears >= 1) tenantFactor = 0.01;

    // Suggested rent with tenant discount
    const suggestedRent = Math.round(minimumRent * (1 - tenantFactor));

    // Determine recommendation
    let recommendation: 'INCREASE' | 'MAINTAIN' | 'REVIEW';
    let reasoning: string;

    if (gap < -5) {
      recommendation = 'INCREASE';
      reasoning = `ค่าเช่าต่ำกว่าเงินเฟ้อ ${Math.abs(gap).toFixed(1)}% ควรปรับขึ้น`;
    } else if (gap < -2) {
      recommendation = 'INCREASE';
      reasoning = `ค่าเช่าต่ำกว่าเงินเฟ้อเล็กน้อย แนะนำปรับ`;
    } else if (gap < 2) {
      recommendation = 'MAINTAIN';
      reasoning = `ค่าเช่าสอดคล้องกับเงินเฟ้อ ไม่จำเป็นต้องปรับ`;
    } else if (gap < 5) {
      recommendation = 'MAINTAIN';
      reasoning = `ค่าเช่าสูงกว่าเงินเฟ้อเล็กน้อย`;
    } else {
      recommendation = 'REVIEW';
      reasoning = `ค่าเช่าสูงกว่าเงินเฟ้อมาก ระวังผู้เช่าย้าย`;
    }

    // Add tenant factor to reasoning
    if (tenantFactor > 0) {
      reasoning += ` (ผู้เช่าอยู่มา ${tenantYears} ปี ให้ส่วนลด ${(tenantFactor * 100).toFixed(0)}%)`;
    }

    return {
      currentRent,
      suggestedRent,
      minimumRent,
      adjustmentPct:
        currentRent > 0
          ? ((suggestedRent - currentRent) / currentRent) * 100
          : 0,
      inflationPct,
      rentGrowthPct,
      gap,
      recommendation,
      reasoning,
      tenantFactor,
    };
  },

  /**
   * Get rent adjustment for all active contracts
   */
  async getAllRentAdjustments(): Promise<
    {
      contractId: string;
      roomNumber: string;
      buildingName: string;
      tenantName: string;
      adjustment: RentAdjustmentResult;
    }[]
  > {
    const contracts = await prisma.contract.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING'] },
      },
      include: {
        room: {
          include: { building: true },
        },
        tenant: true,
      },
    });

    const results = [];

    for (const contract of contracts) {
      try {
        const adjustment = await this.calculateRentAdjustment(contract.id);
        results.push({
          contractId: contract.id,
          roomNumber: contract.room.roomNumber,
          buildingName: contract.room.building.name,
          tenantName: contract.tenant.name,
          adjustment,
        });
      } catch (error) {
        console.error(`Error calculating adjustment for ${contract.id}:`, error);
      }
    }

    return results;
  },
};
