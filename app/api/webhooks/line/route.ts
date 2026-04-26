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

// Welcome card for new users — focuses on owner sign-up
function ownerWelcomeFlexMessage(): LineMessage {
  const dashboardUrl = config.app.url;

  return {
    type: 'flex',
    altText: 'ยินดีต้อนรับสู่ HaTy — ระบบจัดการเช่าที่พัก',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#136960',
        paddingAll: '20px',
        contents: [
          { type: 'text', text: 'HaTy หาที่', color: '#ffffff', weight: 'bold', size: 'xl' },
          { type: 'text', text: 'ระบบจัดการเช่าที่พัก · ฟรีเริ่มต้น', color: '#ffffffcc', size: 'sm', margin: 'xs' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          { type: 'text', text: 'จัดการห้องเช่าง่ายขึ้น 10 เท่า 🏠', weight: 'bold', size: 'md' },
          { type: 'text', text: 'ครบทุกอย่างในที่เดียว ตั้งแต่สัญญาจนถึงรับเงิน', wrap: true, size: 'sm', color: '#666666' },
          { type: 'separator', margin: 'lg' },
          {
            type: 'box', layout: 'vertical', spacing: 'sm', margin: 'lg',
            contents: [
              { type: 'text', text: '📄 สร้างสัญญาเช่าดิจิทัลได้เลย', size: 'sm', color: '#333333' },
              { type: 'text', text: '✍️ ส่งให้ผู้เช่าเซ็นผ่านลิงก์', size: 'sm', color: '#333333' },
              { type: 'text', text: '💰 ติดตามค่าเช่าและการชำระเงิน', size: 'sm', color: '#333333' },
              { type: 'text', text: '🤖 AI วิเคราะห์รายได้และแนะนำ', size: 'sm', color: '#333333' },
            ],
          },
          {
            type: 'box', layout: 'horizontal', spacing: 'md', margin: 'lg',
            contents: [
              { type: 'box', layout: 'vertical', contents: [{ type: 'text', text: 'ฟรี', weight: 'bold', color: '#136960', size: 'lg', align: 'center' }, { type: 'text', text: '1 ตึก · 5 ห้อง', size: 'xs', color: '#666666', align: 'center' }], backgroundColor: '#e8f5f3', cornerRadius: '8px', paddingAll: '10px', flex: 1 },
              { type: 'box', layout: 'vertical', contents: [{ type: 'text', text: 'Pro', weight: 'bold', color: '#ffffff', size: 'lg', align: 'center' }, { type: 'text', text: 'ไม่จำกัด', size: 'xs', color: '#ffffffcc', align: 'center' }], backgroundColor: '#136960', cornerRadius: '8px', paddingAll: '10px', flex: 1 },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [
          {
            type: 'button', style: 'primary', color: '#136960', height: 'sm',
            action: { type: 'uri', label: '🚀 เริ่มใช้งานฟรีเลย', uri: dashboardUrl },
          },
        ],
      },
    },
  } as LineMessage;
}

// Tenant-facing registration card (shown only when tenant explicitly asks)
function tenantRegistrationFlexMessage(): LineMessage {
  const liffId = config.liff.id;
  const liffUrl = liffId ? `https://liff.line.me/${liffId}` : `${config.app.url}/tenant/register`;

  return {
    type: 'flex',
    altText: 'ลงทะเบียนผู้เช่า',
    contents: {
      type: 'bubble',
      size: 'kilo',
      body: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '16px',
        contents: [
          { type: 'text', text: 'ลงทะเบียนผู้เช่า 📋', weight: 'bold', size: 'md' },
          { type: 'text', text: 'เพื่อดูสัญญา ค่าเช่า และรับการแจ้งเตือน', wrap: true, size: 'sm', color: '#555555' },
        ],
      },
      footer: {
        type: 'box', layout: 'vertical', paddingAll: '12px',
        contents: [{ type: 'button', style: 'primary', color: '#06C755', height: 'sm', action: { type: 'uri', label: '📱 ลงทะเบียนเลย', uri: liffUrl } }],
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
          // Existing owner — show quick-access menu
          await replyMessage(event.replyToken, withMenu([
            textMessage('👋 สวัสดีครับ!\nกดปุ่มด้านล่างเพื่อดูข้อมูลได้เลย 👇'),
          ]));
        } else {
          const tenant = await findTenantByLineId(userId);
          if (tenant) {
            // Registered tenant — show tenant menu
            await replyMessage(event.replyToken, tenantMenu([
              textMessage(`👋 ยินดีต้อนรับกลับมา คุณ${tenant.name}!\nกดปุ่มด้านล่างเพื่อดูข้อมูล 👇`),
            ]));
          } else {
            // Unknown — owner onboarding first
            await replyMessage(event.replyToken, [ownerWelcomeFlexMessage()]);
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
          const text = event.message?.text?.trim() || '';
          const isTenantRegisterAttempt = /^ลงทะเบียน|^0\d{8,9}$/.test(text);
          const isTenantKeyword = /ผู้เช่า|เช่า|สัญญา|ค่าเช่า/i.test(text);

          if (isTenantRegisterAttempt || isTenantKeyword) {
            // Looks like a tenant — guide to register
            const result = await handleUnregisteredTenant(event);
            const isPhoneAttempt = /^ลงทะเบียน|^0\d{8,9}$/.test(text);
            await replyMessage(event.replyToken, [
              ...result.messages,
              ...(isPhoneAttempt ? [] : [tenantRegistrationFlexMessage()]),
            ]);
          } else {
            // Default: guide to owner signup
            await replyMessage(event.replyToken, [ownerWelcomeFlexMessage()]);
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
