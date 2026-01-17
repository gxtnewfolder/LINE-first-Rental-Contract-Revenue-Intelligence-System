// Rent adjustment API - GET recommendations based on inflation
import { NextResponse } from 'next/server';
import { inflationService } from '@/services/inflation.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    // If specific contract requested
    if (contractId) {
      try {
        const adjustment = await inflationService.calculateRentAdjustment(contractId);
        return NextResponse.json(adjustment);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to calculate';
        return NextResponse.json({ error: message }, { status: 404 });
      }
    }

    // Return all adjustments
    const allAdjustments = await inflationService.getAllRentAdjustments();
    return NextResponse.json(allAdjustments);
  } catch (error) {
    console.error('GET /api/analytics/rent-adjustment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rent adjustments' },
      { status: 500 }
    );
  }
}
