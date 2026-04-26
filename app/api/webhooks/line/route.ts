// LINE webhook endpoint
import { NextResponse } from 'next/server';
import { validateWebhookRequest } from '@/integrations/line/verify';
import { replyMessage, withMenu, isOwner, textMessage, type LineWebhookBody } from '@/integrations/line/client';
import { handleCommand } from '@/integrations/line/commands';
import { handleTenantCommand, handleUnregisteredTenant, tenantMenu } from '@/integrations/line/tenant-commands';
import { config } from '@/lib/config';
import prisma from '@/lib/db';

async function findTenantByLineId(lineUserId: string) {
  return prisma.tenant.findUnique({ where: { lineUserId } });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-line-signature');

    if (config.line.channelSecret) {
      const validation = validateWebhookRequest(rawBody, signature);
      if (!validation.valid) {
        console.error('LINE webhook validation failed:', validation.error);
        return NextResponse.json({ error: validation.error }, { status: 401 });
      }
    } else if (config.app.isDev) {
      console.warn('LINE signature verification skipped (no secret configured)');
    }

    const body: LineWebhookBody = JSON.parse(rawBody);

    for (const event of body.events) {
      const userId = event.source.userId;
      if (!userId) continue;

      // ── Follow event (new friend) ────────────────────────────────
      if (event.type === 'follow') {
        if (isOwner(userId)) {
          await replyMessage(event.replyToken, withMenu([
            textMessage('👋 สวัสดีครับ เจ้าของ!\nกดปุ่มด้านล่างเพื่อดูข้อมูล 👇'),
          ]));
        } else {
          const tenant = await findTenantByLineId(userId);
          if (tenant) {
            await replyMessage(event.replyToken, tenantMenu([
              textMessage(`👋 ยินดีต้อนรับกลับมา คุณ${tenant.name}!\nกดปุ่มด้านล่างเพื่อดูข้อมูล 👇`),
            ]));
          } else {
            await replyMessage(event.replyToken, [
              textMessage(
                '👋 สวัสดีจาก HaTy!\n\n' +
                  'เพื่อดูข้อมูลสัญญาและค่าเช่า กรุณาลงทะเบียน:\n\n' +
                  '📱 พิมพ์: ลงทะเบียน [เบอร์มือถือ]\n' +
                  'ตัวอย่าง: ลงทะเบียน 0812345678'
              ),
            ]);
          }
        }
        continue;
      }

      // ── Text messages ────────────────────────────────────────────
      if (event.type !== 'message' || event.message?.type !== 'text') continue;

      // Anyone can query their LINE User ID (setup helper)
      if (event.message.text?.trim().toLowerCase() === 'myid') {
        await replyMessage(event.replyToken, [{
          type: 'text',
          text: `🪪 LINE User ID:\n\n${userId}\n\nคัดลอกไปใส่ใน OWNER_LINE_IDS ใน .env.local`,
        }]);
        continue;
      }

      // ── Route by identity ────────────────────────────────────────
      if (isOwner(userId)) {
        // Owner commands (รายได้, ห้องว่าง, สรุป, แนะนำ)
        const result = await handleCommand(event);
        if (result.messages.length > 0) {
          await replyMessage(event.replyToken, result.messages);
        }
      } else {
        const tenant = await findTenantByLineId(userId);
        if (tenant) {
          // Registered tenant commands (ค่าเช่า, สัญญา, ประวัติ, ติดต่อ)
          const result = await handleTenantCommand(event, tenant.id);
          await replyMessage(event.replyToken, result.messages);
        } else {
          // Unregistered — guide to register with phone number
          const result = await handleUnregisteredTenant(event);
          await replyMessage(event.replyToken, result.messages);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LINE webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'LINE webhook endpoint is active' });
}
