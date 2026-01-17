// Vacant rooms endpoint - convenience for LINE commands
import { NextResponse } from 'next/server';
import { roomService } from '@/services/room.service';

export async function GET() {
  try {
    const rooms = await roomService.findVacant();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('GET /api/rooms/vacant error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vacant rooms' },
      { status: 500 }
    );
  }
}
