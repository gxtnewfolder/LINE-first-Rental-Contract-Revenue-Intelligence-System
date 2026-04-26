// Transition contract status - POST
import { NextResponse } from 'next/server';
import { contractService } from '@/services/contract.service';
import { ContractTransitionSchema } from '@/lib/validations/contract.schema';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = ContractTransitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const contract = await contractService.transitionStatus(
      id,
      parsed.data.status,
      parsed.data.reason,
      'api'
    );

    return NextResponse.json(contract);
  } catch (error) {
    console.error('POST /api/contracts/[id]/transition error:', error);
    const message = error instanceof Error ? error.message : 'Failed to transition contract';
    const statusCode = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
