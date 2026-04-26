import { NextResponse } from 'next/server';
import { roomService } from '@/services/room.service';
import { getSession } from '@/lib/auth';
import type { RoomStatus } from '@/app/generated/prisma/client';
import { CreateRoomSchema } from '@/lib/validations/room.schema';

const LITE_ROOM_LIMIT = 5;

export async function GET(request: Request) {
  const session = await getSession();
  const ownerId = session?.ownerId;
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId') || undefined;
    const status = searchParams.get('status') as RoomStatus | undefined;
    const rooms = await roomService.findAll({ buildingId, status, ownerId });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('GET /api/rooms error:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Freemium: LITE plan can have at most 5 rooms total
    if (session.plan === 'LITE') {
      const count = await roomService.countByOwner(session.ownerId);
      if (count >= LITE_ROOM_LIMIT) {
        return NextResponse.json(
          { error: 'PLAN_LIMIT', message: 'แผน HaTy Lite รองรับ 5 ห้อง — อัพเกรดเป็น Pro เพื่อเพิ่มห้องไม่จำกัด' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const parsed = CreateRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const room = await roomService.create(parsed.data);
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('POST /api/rooms error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create room';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
