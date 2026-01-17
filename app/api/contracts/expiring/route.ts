// Expiring contracts endpoint - GET
import { NextResponse } from 'next/server';
import { contractService } from '@/services/contract.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const contracts = await contractService.findExpiring(days);
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('GET /api/contracts/expiring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expiring contracts' },
      { status: 500 }
    );
  }
}
