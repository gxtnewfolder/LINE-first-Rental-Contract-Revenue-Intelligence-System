// Public endpoint — tenant calls this from LIFF to save their lineUserId.
// Supports two modes:
//   1. token-based (owner sent invite link)
//   2. phone-based (tenant self-registers from LINE OA)
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      token?: string;
      phone?: string;
      lineUserId: string;
      displayName?: string;
    };

    const { token, phone, lineUserId, displayName } = body;

    if (!lineUserId) {
      return NextResponse.json({ error: 'Missing lineUserId' }, { status: 400 });
    }

    // ── Mode 1: invite token ──────────────────────────────────────
    if (token) {
      const tenant = await prisma.tenant.findUnique({ where: { inviteToken: token } });
      if (!tenant) {
        return NextResponse.json({ error: 'ลิงก์หมดอายุหรือใช้ไปแล้ว กรุณาขอลิงก์ใหม่จากเจ้าของห้อง' }, { status: 404 });
      }
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { lineUserId, inviteToken: null, ...(displayName && !tenant.name ? { name: displayName } : {}) },
      });
      return NextResponse.json({ success: true, tenantName: tenant.name });
    }

    // ── Mode 2: phone number ──────────────────────────────────────
    if (phone) {
      const normalized = phone.replace(/[-\s]/g, '');

      // Check if already registered with this LINE account
      const alreadyLinked = await prisma.tenant.findUnique({ where: { lineUserId } });
      if (alreadyLinked) {
        return NextResponse.json({ success: true, tenantName: alreadyLinked.name, alreadyRegistered: true });
      }

      const tenant = await prisma.tenant.findFirst({
        where: { phone: normalized, lineUserId: null },
      });

      if (!tenant) {
        return NextResponse.json(
          { error: 'ไม่พบเบอร์นี้ในระบบ กรุณาตรวจสอบเบอร์ที่ให้ไว้กับเจ้าของห้อง' },
          { status: 404 }
        );
      }

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { lineUserId, inviteToken: null },
      });

      return NextResponse.json({ success: true, tenantName: tenant.name });
    }

    return NextResponse.json({ error: 'ต้องระบุ token หรือ phone' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/tenant/register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
