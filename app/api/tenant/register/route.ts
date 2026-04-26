// Public endpoint — tenant calls this from LIFF to save their lineUserId
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token, lineUserId, displayName } = await request.json() as {
      token: string;
      lineUserId: string;
      displayName?: string;
    };

    if (!token || !lineUserId) {
      return NextResponse.json({ error: 'Missing token or lineUserId' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { inviteToken: token },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
    }

    // Save lineUserId and clear the token (one-time use)
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        lineUserId,
        inviteToken: null,
        // Update name if tenant hasn't set one yet and LINE provides it
        ...(displayName && !tenant.name ? { name: displayName } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      tenantName: tenant.name,
      message: 'ลงทะเบียนสำเร็จ! คุณจะได้รับการแจ้งเตือนผ่าน LINE',
    });
  } catch (error) {
    console.error('POST /api/tenant/register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
