import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { pushMessage, textMessage } from '@/integrations/line/client';

// GET — return LINE config status (no secrets)
export async function GET() {
  const hasAccessToken  = !!config.line.channelAccessToken;
  const hasSecret       = !!config.line.channelSecret;
  const hasOwnerIds     = config.line.ownerLineIds.length > 0;
  const appUrl          = config.app.url || process.env.NEXT_PUBLIC_APP_URL || '';
  const webhookUrl      = `${appUrl}/api/webhooks/line`;

  return NextResponse.json({
    hasAccessToken,
    hasSecret,
    hasOwnerIds,
    ownerCount: config.line.ownerLineIds.length,
    webhookUrl,
    ready: hasAccessToken && hasSecret && hasOwnerIds,
  });
}

// POST — send a test push message to the first owner LINE ID
export async function POST() {
  const hasAccessToken = !!config.line.channelAccessToken;
  const ownerIds       = config.line.ownerLineIds;

  if (!hasAccessToken) {
    return NextResponse.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN ยังไม่ได้ตั้งค่า' }, { status: 400 });
  }
  if (ownerIds.length === 0) {
    return NextResponse.json({ error: 'OWNER_LINE_IDS ยังไม่ได้ตั้งค่า' }, { status: 400 });
  }

  const ok = await pushMessage(ownerIds[0], [
    textMessage('✅ uSabai เชื่อมต่อสำเร็จ!\n\nพิมพ์ "ช่วย" เพื่อดูคำสั่งทั้งหมด'),
  ]);

  if (!ok) {
    return NextResponse.json({ error: 'ส่งข้อความไม่สำเร็จ — ตรวจสอบ Channel Access Token อีกครั้ง' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
