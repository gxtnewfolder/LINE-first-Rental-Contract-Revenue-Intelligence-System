import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import prisma from '@/lib/db';

function isPlatformAdmin(lineUserId: string) {
  return config.line.ownerLineIds.includes(lineUserId);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isPlatformAdmin(session.lineUserId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { plan } = await request.json() as { plan: 'LITE' | 'PRO' };

  if (!['LITE', 'PRO'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const owner = await prisma.owner.update({
    where: { id },
    data: { plan },
  });

  return NextResponse.json(owner);
}
