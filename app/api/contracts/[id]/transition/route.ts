// Transition contract status - POST
import { NextResponse } from 'next/server';
import { contractService } from '@/services/contract.service';
import type { ContractStatus } from '@/app/generated/prisma/client';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { status, reason } = body as {
      status: ContractStatus;
      reason?: string;
    };
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    const contract = await contractService.transitionStatus(
      id,
      status,
      reason,
      'api'
    );
    
    return NextResponse.json(contract);
  } catch (error) {
    console.error('POST /api/contracts/[id]/transition error:', error);
    const message = error instanceof Error ? error.message : 'Failed to transition contract';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
