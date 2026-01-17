// Rooms API - GET all (with filters), POST create
import { NextResponse } from 'next/server';
import { roomService } from '@/services/room.service';
import type { RoomStatus } from '@/app/generated/prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId') || undefined;
    const status = searchParams.get('status') as RoomStatus | undefined;
    
    const rooms = await roomService.findAll({ buildingId, status });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('GET /api/rooms error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const room = await roomService.create(body);
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('POST /api/rooms error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create room';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
