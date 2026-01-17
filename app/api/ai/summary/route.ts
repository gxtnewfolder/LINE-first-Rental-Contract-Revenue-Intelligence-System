// AI Summary API - GET monthly summary
import { NextResponse } from 'next/server';
import { aiService } from '@/ai';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const year = yearParam ? parseInt(yearParam) : undefined;
    const month = monthParam ? parseInt(monthParam) : undefined;

    const result = await aiService.generateMonthlySummary(year, month);

    return NextResponse.json({
      success: result.success,
      summary: result.content,
      fallback: result.fallback,
      error: result.error,
    });
  } catch (error) {
    console.error('GET /api/ai/summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
