// LINE webhook endpoint
import { NextResponse } from 'next/server';
import { validateWebhookRequest } from '@/integrations/line/verify';
import { replyMessage, type LineWebhookBody } from '@/integrations/line/client';
import { handleCommand } from '@/integrations/line/commands';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-line-signature');

    // In development, skip signature verification if no secret configured
    if (config.line.channelSecret) {
      const validation = validateWebhookRequest(rawBody, signature);
      if (!validation.valid) {
        console.error('LINE webhook validation failed:', validation.error);
        return NextResponse.json({ error: validation.error }, { status: 401 });
      }
    } else if (config.app.isDev) {
      console.warn('LINE signature verification skipped (no secret configured)');
    }

    // Parse body
    const body: LineWebhookBody = JSON.parse(rawBody);

    // Process events
    for (const event of body.events) {
      // Only handle text messages
      if (event.type === 'message' && event.message?.type === 'text') {
        const result = await handleCommand(event);

        // Send reply
        if (result.messages.length > 0) {
          await replyMessage(event.replyToken, result.messages);
        }
      }

      // Handle follow event (new friend)
      if (event.type === 'follow') {
        await replyMessage(event.replyToken, [
          {
            type: 'text',
            text:
              '👋 สวัสดีค่ะ! ยินดีต้อนรับสู่ระบบจัดการการเช่า\n\n' +
              'พิมพ์ "ช่วย" เพื่อดูคำสั่งที่ใช้ได้',
          },
        ]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LINE webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// LINE webhook verification (GET for LINE Developers Console)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'LINE webhook endpoint is active',
  });
}
