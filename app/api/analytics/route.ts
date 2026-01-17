// Analytics API - GET income, occupancy, trends
import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'snapshot';
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const now = new Date();
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1;

    switch (type) {
      case 'income':
        const income = await analyticsService.getMonthlyIncome(year, month);
        return NextResponse.json(income);

      case 'income-by-room':
        const incomeByRoom = await analyticsService.getIncomeByRoom(year, month);
        return NextResponse.json(incomeByRoom);

      case 'occupancy':
        const occupancy = await analyticsService.getOccupancy();
        return NextResponse.json(occupancy);

      case 'trend':
        const months = parseInt(searchParams.get('months') || '6');
        const trend = await analyticsService.getIncomeTrend(months);
        return NextResponse.json(trend);

      case 'collection':
        const collection = await analyticsService.getCollectionRate(year, month);
        return NextResponse.json(collection);

      case 'snapshot':
      default:
        const snapshot = await analyticsService.getSnapshot(year, month);
        return NextResponse.json(snapshot);
    }
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
