// Contract by ID - GET, PATCH, DELETE
import { NextResponse } from 'next/server';
import { contractService } from '@/services/contract.service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const contract = await contractService.findById(id);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    return NextResponse.json(contract);
  } catch (error) {
    console.error('GET /api/contracts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const contract = await contractService.update(id, body);
    return NextResponse.json(contract);
  } catch (error) {
    console.error('PATCH /api/contracts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update contract';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await contractService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/contracts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete contract';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
