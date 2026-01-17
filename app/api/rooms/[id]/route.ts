// Room by ID - GET, PATCH, DELETE
import { NextResponse } from 'next/server';
import { roomService } from '@/services/room.service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const room = await roomService.findById(id);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json(room);
  } catch (error) {
    console.error('GET /api/rooms/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const room = await roomService.update(id, body);
    return NextResponse.json(room);
  } catch (error) {
    console.error('PATCH /api/rooms/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update room';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await roomService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/rooms/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete room';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
