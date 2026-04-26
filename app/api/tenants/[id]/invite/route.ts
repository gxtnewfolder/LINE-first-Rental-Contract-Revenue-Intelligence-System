import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import prisma from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const tenant = await prisma.tenant.findFirst({
    where: { id, ownerId: session.ownerId },
  });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  // Generate a new one-time token (32 hex chars)
  const inviteToken = randomBytes(16).toString('hex');

  await prisma.tenant.update({
    where: { id },
    data: { inviteToken },
  });

  const registerUrl = `${config.app.url}/tenant/register?token=${inviteToken}`;
  const liffId = config.liff.id;
  const liffUrl = liffId
    ? `https://liff.line.me/${liffId}?token=${inviteToken}`
    : registerUrl;

  return NextResponse.json({ liffUrl, registerUrl, tenantName: tenant.name });
}
