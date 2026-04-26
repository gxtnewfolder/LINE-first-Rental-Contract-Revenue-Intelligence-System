// LINE webhook endpoint
import { NextResponse } from 'next/server';
import { validateWebhookRequest } from '@/integrations/line/verify';
import { replyMessage, withMenu, isOwner, textMessage, type LineWebhookBody, type LineMessage } from '@/integrations/line/client';
import { handleCommand } from '@/integrations/line/commands';
import { handleTenantCommand, handleUnregisteredTenant, tenantMenu } from '@/integrations/line/tenant-commands';
import { config } from '@/lib/config';
import prisma from '@/lib/db';

async function findTenantByLineId(lineUserId: string) {
  return prisma.tenant.findUnique({ where: { lineUserId } });
}

function registrationFlexMessage(): LineMessage {
  const liffId = config.liff.id;
  const liffUrl = liffId
    ? `https://liff.line.me/${liffId}`
    : `${config.app.url}/tenant/register`;

  return {
    type: 'flex',
    altText: 'ลงทะเบียนเพื่อดูข้อมูลสัญญาและค่าเช่า',
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#06C755',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'HaTy หาที่',
            color: '#ffffff',
            weight: 'bold',
            size: 'lg',
          },
          {
            type: 'text',
            text: 'ระบบจัดการเช่าที่พัก',
            color: '#ffffff',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'สวัสดีจากเจ้าของห้อง! 👋',
            weight: 'bold',
            size: 'md',
          },
          {
            type: 'text',
            text: 'ลงทะเบียนเพื่อดูข้อมูลสัญญา ค่าเช่า และรับการแจ้งเตือนผ่าน LINE ได้เลย',
            wrap: true,
            size: 'sm',
            color: '#555555',
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            margin: 'md',
            contents: [
              { type: 'text', text: '💰 เช็คยอดค่าเช่า', size: 'sm', color: '#333333' },
              { type: 'text', text: '📄 ดูสัญญาของคุณ', size: 'sm', color: '#333333' },
              { type: 'text', text: '📊 ประวัติการชำระ', size: 'sm', color: '#333333' },
              { type: 'text', text: '🔔 รับแจ้งเตือนอัตโนมัติ', size: 'sm', color: '#333333' },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#06C755',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📱 ลงทะเบียนเลย',
              uri: liffUrl,
            },
          },
        ],
      },
    },
  } as LineMessage;
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
            textMessage('👋 สวัสดีครับ!\nกดปุ่มด้านล่างเพื่อดูข้อมูลได้เลย 👇'),
          ]));
        } else {
          const tenant = await findTenantByLineId(userId);
          if (tenant) {
            await replyMessage(event.replyToken, tenantMenu([
              textMessage(`👋 ยินดีต้อนรับกลับมา คุณ${tenant.name}!\nกดปุ่มด้านล่างเพื่อดูข้อมูล 👇`),
            ]));
          } else {
            // New user — show registration Flex Message with button
            await replyMessage(event.replyToken, [registrationFlexMessage()]);
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
        const result = await handleCommand(event);
        if (result.messages.length > 0) {
          await replyMessage(event.replyToken, result.messages);
        }
      } else {
        const tenant = await findTenantByLineId(userId);
        if (tenant) {
          const result = await handleTenantCommand(event, tenant.id);
          await replyMessage(event.replyToken, result.messages);
        } else {
          // Check if user is trying to register via bot command
          const result = await handleUnregisteredTenant(event);
          // If still not registered after command, append the registration button
          const text = event.message?.text?.trim() || '';
          const isRegisterAttempt = /^ลงทะเบียน|^0\d{8,9}$/.test(text);
          if (!isRegisterAttempt) {
            await replyMessage(event.replyToken, [
              ...result.messages,
              registrationFlexMessage(),
            ]);
          } else {
            await replyMessage(event.replyToken, result.messages);
          }
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
