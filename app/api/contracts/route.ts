// Contracts API - GET all, POST create
import { NextResponse } from 'next/server';
import { contractService } from '@/services/contract.service';
import type { ContractStatus } from '@/app/generated/prisma/client';
import { CreateContractSchema } from '@/lib/validations/contract.schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ContractStatus | undefined;
    const roomId = searchParams.get('roomId') || undefined;
    const tenantId = searchParams.get('tenantId') || undefined;

    const contracts = await contractService.findAll({ status, roomId, tenantId });
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('GET /api/contracts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const contract = await contractService.create({
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    });
    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('POST /api/contracts error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create contract';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
