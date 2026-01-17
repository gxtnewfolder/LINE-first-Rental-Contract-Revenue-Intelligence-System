# LINE Messaging API Integration Design

## 1. LINE Webhook Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INBOUND MESSAGE FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

User (LINE App)
      │
      │ Text: "รายได้เดือนนี้"
      ▼
LINE Platform ──────────────────────────────────────────┐
      │                                                 │
      │ POST /api/webhooks/line                         │
      │ Headers: x-line-signature                       │
      ▼                                                 │
┌─────────────┐                                         │
│  Webhook    │ 1. Verify signature                     │
│  Handler    │ 2. Parse events                         │
└──────┬──────┘                                         │
       │                                                │
       ▼                                                │
┌─────────────┐                                         │
│  Command    │ 3. Match Thai text → Command            │
│  Router     │ 4. Extract parameters                   │
└──────┬──────┘                                         │
       │                                                │
       ▼                                                │
┌─────────────┐                                         │
│  Service    │ 5. Execute business logic               │
│  Layer      │ 6. Query database                       │
└──────┬──────┘                                         │
       │                                                │
       ▼                                                │
┌─────────────┐      Reply Message                      │
│  LINE       │ ◀───────────────────────────────────────┘
│  Reply API  │
└─────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         OUTBOUND NOTIFICATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

Cron Job (Daily 9AM)
      │
      ▼
┌─────────────┐
│  Reminder   │ 1. Query contracts expiring in 30 days
│  Service    │ 2. Query overdue payments
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  LINE Push  │ 3. Build Flex Message
│  API        │ 4. Send to owner's lineUserId
└─────────────┘
```

---

## 2. Command Mapping

### Thai Command → Handler Mapping

| Thai Command | Aliases | Handler | Description |
|-------------|---------|---------|-------------|
| `รายได้เดือนนี้` | `รายได้`, `income` | `getMonthlyIncome` | Current month income |
| `รายได้ {month}` | `รายได้ ม.ค.` | `getMonthlyIncome` | Specific month |
| `ห้องว่าง` | `ว่าง`, `vacant` | `getVacantRooms` | List vacant rooms |
| `สรุปตึก {name}` | `ตึก A`, `ตึก B` | `getBuildingSummary` | Building summary |
| `สัญญาใกล้หมด` | `หมดสัญญา` | `getExpiringContracts` | Contracts expiring soon |
| `ค้างชำระ` | `overdue` | `getOverduePayments` | Overdue payments |
| `ดูสัญญา {room}` | `สัญญา 101` | `getContractDetails` | Contract for room |
| `ช่วยเหลือ` | `help`, `?` | `showHelp` | Show available commands |

### Command Router Implementation

```typescript
// integrations/line/commands.ts

interface Command {
  patterns: RegExp[];
  handler: string;
  extractParams: (match: RegExpMatchArray) => Record<string, string>;
}

const commands: Command[] = [
  {
    patterns: [/^รายได้เดือนนี้$/, /^รายได้$/, /^income$/i],
    handler: 'getMonthlyIncome',
    extractParams: () => ({ month: 'current' })
  },
  {
    patterns: [/^รายได้\s*(ม\.ค\.|ก\.พ\.|มี\.ค\.|...)$/],
    handler: 'getMonthlyIncome',
    extractParams: (m) => ({ month: parseThaiMonth(m[1]) })
  },
  {
    patterns: [/^ห้องว่าง$/, /^ว่าง$/, /^vacant$/i],
    handler: 'getVacantRooms',
    extractParams: () => ({})
  },
  {
    patterns: [/^สรุปตึก\s*(.+)$/, /^ตึก\s*(.+)$/],
    handler: 'getBuildingSummary',
    extractParams: (m) => ({ buildingName: m[1].trim() })
  },
  {
    patterns: [/^สัญญาใกล้หมด$/, /^หมดสัญญา$/],
    handler: 'getExpiringContracts',
    extractParams: () => ({})
  },
  {
    patterns: [/^ค้างชำระ$/, /^overdue$/i],
    handler: 'getOverduePayments',
    extractParams: () => ({})
  }
];

export function parseCommand(text: string): ParsedCommand | null {
  const normalized = text.trim().toLowerCase();
  
  for (const cmd of commands) {
    for (const pattern of cmd.patterns) {
      const match = normalized.match(pattern);
      if (match) {
        return {
          handler: cmd.handler,
          params: cmd.extractParams(match),
          raw: text
        };
      }
    }
  }
  
  return null; // Unknown command
}
```

---

## 3. Security Considerations

### Signature Verification (Critical)

```typescript
// integrations/line/verify.ts
import crypto from 'crypto';

export function verifyLineSignature(
  body: string,
  signature: string,
  channelSecret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  );
}
```

### Security Checklist

| Concern | Mitigation |
|---------|------------|
| **Webhook spoofing** | Always verify `x-line-signature` header |
| **Replay attacks** | Check `timestamp` in event (reject if >5min old) |
| **Rate limiting** | Limit commands per user per minute |
| **Owner-only commands** | Verify `userId` matches registered owner |
| **Sensitive data in logs** | Never log full message payloads |
| **Channel secret exposure** | Store in environment variables only |

### Owner Authorization

```typescript
// Only owner can query financial data
const OWNER_LINE_IDS = process.env.OWNER_LINE_IDS?.split(',') || [];

function isOwner(userId: string): boolean {
  return OWNER_LINE_IDS.includes(userId);
}

// In handler
if (!isOwner(event.source.userId)) {
  return replyText(event.replyToken, 'ขออภัย คุณไม่มีสิทธิ์ใช้คำสั่งนี้');
}
```

---

## 4. Example Message Payloads

### Inbound: Text Message Event

```json
{
  "destination": "U1234567890abcdef",
  "events": [
    {
      "type": "message",
      "message": {
        "type": "text",
        "id": "468789577898321920",
        "text": "รายได้เดือนนี้"
      },
      "timestamp": 1706000000000,
      "source": {
        "type": "user",
        "userId": "U0987654321fedcba"
      },
      "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
      "mode": "active"
    }
  ]
}
```

### Outbound: Income Reply (Flex Message)

```json
{
  "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
  "messages": [
    {
      "type": "flex",
      "altText": "รายได้เดือน ม.ค. 2026",
      "contents": {
        "type": "bubble",
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "💰 รายได้เดือน ม.ค. 2026",
              "weight": "bold",
              "size": "lg"
            }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ตึก A", "flex": 2 },
                { "type": "text", "text": "฿45,000", "align": "end" }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ตึก B", "flex": 2 },
                { "type": "text", "text": "฿38,000", "align": "end" }
              ]
            },
            { "type": "separator", "margin": "md" },
            {
              "type": "box",
              "layout": "horizontal",
              "margin": "md",
              "contents": [
                { "type": "text", "text": "รวมทั้งหมด", "weight": "bold" },
                { "type": "text", "text": "฿83,000", "weight": "bold", "align": "end", "color": "#1DB446" }
              ]
            }
          ]
        }
      }
    }
  ]
}
```

### Outbound: Push Notification (Contract Expiring)

```json
{
  "to": "U0987654321fedcba",
  "messages": [
    {
      "type": "flex",
      "altText": "⚠️ สัญญาใกล้หมดอายุ",
      "contents": {
        "type": "bubble",
        "styles": {
          "header": { "backgroundColor": "#FFEB3B" }
        },
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            { "type": "text", "text": "⚠️ สัญญาใกล้หมดอายุ", "weight": "bold" }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            { "type": "text", "text": "ห้อง 101 - ตึก A" },
            { "type": "text", "text": "ผู้เช่า: คุณสมชาย" },
            { "type": "text", "text": "หมดอายุ: 15 ก.พ. 2026", "color": "#ff0000" },
            { "type": "text", "text": "เหลือ 28 วัน", "size": "sm", "color": "#888888" }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "uri",
                "label": "ต่อสัญญา",
                "uri": "https://your-domain.com/contracts/renew/abc123"
              },
              "style": "primary"
            }
          ]
        }
      }
    }
  ]
}
```

### Outbound: Payment Overdue Reminder

```json
{
  "to": "U0987654321fedcba",
  "messages": [
    {
      "type": "flex",
      "altText": "🔴 ค่าเช่าค้างชำระ",
      "contents": {
        "type": "bubble",
        "styles": {
          "header": { "backgroundColor": "#F44336" }
        },
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            { "type": "text", "text": "🔴 ค่าเช่าค้างชำระ", "weight": "bold", "color": "#ffffff" }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            { "type": "text", "text": "ห้อง 203 - ตึก B" },
            { "type": "text", "text": "ค่าเช่า: ฿8,500" },
            { "type": "text", "text": "ครบกำหนด: 5 ม.ค. 2026" },
            { "type": "text", "text": "ค้าง 12 วัน", "color": "#ff0000", "weight": "bold" }
          ]
        }
      }
    }
  ]
}
```

---

## 5. File Structure

```
integrations/line/
├── client.ts          # LINE API client wrapper
├── verify.ts          # Signature verification
├── commands.ts        # Command parsing logic
├── handlers.ts        # Command handlers (thin)
└── templates/
    ├── income.ts      # Income Flex message builder
    ├── vacant.ts      # Vacant rooms message
    ├── expiring.ts    # Expiring contract notification
    └── overdue.ts     # Overdue payment notification

app/api/webhooks/line/
└── route.ts           # Webhook endpoint

services/
└── notification.service.ts  # Push notification orchestration
```

---

## 6. Environment Variables

```env
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN="your-channel-access-token"
LINE_CHANNEL_SECRET="your-channel-secret"

# Owner authorization
OWNER_LINE_IDS="U0987654321fedcba,U1234567890abcdef"
```
