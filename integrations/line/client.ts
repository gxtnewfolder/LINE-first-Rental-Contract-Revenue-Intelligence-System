// LINE Messaging API client
import { config } from '@/lib/config';
import crypto from 'crypto';

const LINE_API_BASE = 'https://api.line.me/v2/bot';

interface LineMessage {
  type: 'text' | 'flex';
  text?: string;
  altText?: string;
  contents?: object;
}

interface LineEvent {
  type: 'message' | 'follow' | 'unfollow' | 'postback';
  replyToken: string;
  source: {
    type: 'user' | 'group' | 'room';
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  message?: {
    type: 'text' | 'image' | 'sticker';
    id: string;
    text?: string;
  };
  postback?: {
    data: string;
  };
  timestamp: number;
}

export interface LineWebhookBody {
  destination: string;
  events: LineEvent[];
}

/**
 * Verify LINE webhook signature
 */
export function verifySignature(body: string, signature: string): boolean {
  const channelSecret = config.line.channelSecret;
  if (!channelSecret) {
    console.warn('LINE channel secret not configured');
    return false;
  }

  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');

  return hash === signature;
}

/**
 * Check if user is authorized owner
 */
export function isOwner(userId: string): boolean {
  return config.line.ownerLineIds.includes(userId);
}

/**
 * Send reply message
 */
export async function replyMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<boolean> {
  const accessToken = config.line.channelAccessToken;
  if (!accessToken) {
    console.warn('LINE access token not configured');
    return false;
  }

  try {
    const res = await fetch(`${LINE_API_BASE}/message/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('LINE reply failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('LINE reply error:', error);
    return false;
  }
}

/**
 * Send push message
 */
export async function pushMessage(
  to: string,
  messages: LineMessage[]
): Promise<boolean> {
  const accessToken = config.line.channelAccessToken;
  if (!accessToken) {
    console.warn('LINE access token not configured');
    return false;
  }

  try {
    const res = await fetch(`${LINE_API_BASE}/message/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to,
        messages,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('LINE push failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('LINE push error:', error);
    return false;
  }
}

/**
 * Create text message
 */
export function textMessage(text: string): LineMessage {
  return { type: 'text', text };
}

/**
 * Create Flex message for income summary
 */
export function incomeFlexMessage(data: {
  month: string;
  total: number;
  buildings: { name: string; amount: number }[];
  collected: number;
  pending: number;
}): LineMessage {
  return {
    type: 'flex',
    altText: `รายได้เดือน${data.month}: ฿${data.total.toLocaleString()}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `📊 รายได้${data.month}`,
            weight: 'bold',
            size: 'lg',
            color: '#1DB446',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `฿${data.total.toLocaleString()}`,
            weight: 'bold',
            size: 'xxl',
            color: '#1a1a1a',
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            contents: data.buildings.map((b) => ({
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: b.name, flex: 1, size: 'sm' },
                {
                  type: 'text',
                  text: `฿${b.amount.toLocaleString()}`,
                  size: 'sm',
                  align: 'end',
                },
              ],
            })),
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: '✅ เก็บแล้ว', size: 'sm', color: '#1DB446' },
              {
                type: 'text',
                text: `฿${data.collected.toLocaleString()}`,
                size: 'sm',
                align: 'end',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '⏳ ค้างชำระ', size: 'sm', color: '#FF6B6B' },
              {
                type: 'text',
                text: `฿${data.pending.toLocaleString()}`,
                size: 'sm',
                align: 'end',
              },
            ],
          },
        ],
      },
    },
  };
}

/**
 * Create Flex message for vacant rooms
 */
export function vacantRoomsFlexMessage(rooms: {
  roomNumber: string;
  buildingName: string;
  rent: number;
}[]): LineMessage {
  if (rooms.length === 0) {
    return textMessage('🎉 ไม่มีห้องว่าง ทุกห้องมีผู้เช่าแล้ว!');
  }

  return {
    type: 'flex',
    altText: `ห้องว่าง ${rooms.length} ห้อง`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `🏠 ห้องว่าง (${rooms.length} ห้อง)`,
            weight: 'bold',
            size: 'lg',
            color: '#5B5FC7',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: rooms.map((room) => ({
          type: 'box',
          layout: 'horizontal',
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: `${room.buildingName} ${room.roomNumber}`,
              flex: 2,
              size: 'sm',
            },
            {
              type: 'text',
              text: `฿${room.rent.toLocaleString()}/ด.`,
              flex: 1,
              size: 'sm',
              align: 'end',
              color: '#1DB446',
            },
          ],
        })),
      },
    },
  };
}

export type { LineEvent, LineMessage };
