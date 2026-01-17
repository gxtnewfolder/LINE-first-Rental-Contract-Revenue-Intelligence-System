// Inflation API - GET/POST inflation data
import { NextResponse } from 'next/server';
import { inflationService } from '@/services/inflation.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    // If specific year/month requested
    if (yearParam && monthParam) {
      const data = await inflationService.getInflation(
        parseInt(yearParam),
        parseInt(monthParam)
      );
      if (!data) {
        return NextResponse.json(
          { error: 'No inflation data for this period' },
          { status: 404 }
        );
      }
      return NextResponse.json(data);
    }

    // Return all inflation data
    const allData = await inflationService.getAllInflation();
    return NextResponse.json(allData);
  } catch (error) {
    console.error('GET /api/analytics/inflation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inflation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month, ratePct, source } = body;

    if (!year || !month || ratePct === undefined) {
      return NextResponse.json(
        { error: 'year, month, and ratePct are required' },
        { status: 400 }
      );
    }

    const data = await inflationService.upsertInflation(
      year,
      month,
      ratePct,
      source || 'manual'
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/analytics/inflation error:', error);
    return NextResponse.json(
      { error: 'Failed to save inflation data' },
      { status: 500 }
    );
  }
}
