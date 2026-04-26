import { NextResponse } from 'next/server';
import { buildingService } from '@/services/building.service';
import { getSession } from '@/lib/auth';
import { CreateBuildingSchema } from '@/lib/validations/building.schema';

const LITE_BUILDING_LIMIT = 1;

export async function GET() {
  const session = await getSession();
  const ownerId = session?.ownerId;
  try {
    const buildings = await buildingService.findAll(ownerId);
    return NextResponse.json(buildings);
  } catch (error) {
    console.error('GET /api/buildings error:', error);
    return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Freemium: LITE plan can have at most 1 building
    if (session.plan === 'LITE') {
      const count = await buildingService.countByOwner(session.ownerId);
      if (count >= LITE_BUILDING_LIMIT) {
        return NextResponse.json(
          { error: 'PLAN_LIMIT', message: 'แผน HaTy Lite รองรับ 1 ตึก — อัพเกรดเป็น Pro เพื่อเพิ่มตึกไม่จำกัด' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const parsed = CreateBuildingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const building = await buildingService.create({ ...parsed.data, ownerId: session.ownerId });
    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    console.error('POST /api/buildings error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create building';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
