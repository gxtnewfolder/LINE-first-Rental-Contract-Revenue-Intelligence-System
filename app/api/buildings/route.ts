// Buildings API - GET all, POST create
import { NextResponse } from 'next/server';
import { buildingService } from '@/services/building.service';

export async function GET() {
  try {
    const buildings = await buildingService.findAll();
    return NextResponse.json(buildings);
  } catch (error) {
    console.error('GET /api/buildings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buildings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const building = await buildingService.create(body);
    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    console.error('POST /api/buildings error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create building';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
