import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import prisma from '@/lib/db';

function isPlatformAdmin(lineUserId: string) {
  return config.line.ownerLineIds.includes(lineUserId);
}

export async function GET() {
  const session = await getSession();
  if (!session || !isPlatformAdmin(session.lineUserId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const owners = await prisma.owner.findMany({
    include: {
      _count: { select: { buildings: true, tenants: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(owners);
}
