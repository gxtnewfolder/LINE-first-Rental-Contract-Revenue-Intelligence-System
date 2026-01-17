// Building by ID - GET, PATCH, DELETE
import { NextResponse } from 'next/server';
import { buildingService } from '@/services/building.service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const building = await buildingService.findById(id);
    
    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }
    
    return NextResponse.json(building);
  } catch (error) {
    console.error('GET /api/buildings/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const building = await buildingService.update(id, body);
    return NextResponse.json(building);
  } catch (error) {
    console.error('PATCH /api/buildings/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update building';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await buildingService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/buildings/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete building';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
