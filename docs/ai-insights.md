# AI Insight Generator - Design Document

## Overview

AI module that generates Thai-language summaries of rental performance for LINE delivery. The AI is **decision support only** - it never auto-executes actions.

---

## 1. Prompt Templates

### System Prompt (Base Context)

```
คุณเป็นผู้ช่วยวิเคราะห์ธุรกิจให้เช่าอสังหาริมทรัพย์ขนาดเล็ก
หน้าที่ของคุณคือสรุปข้อมูลให้เจ้าของตึกเข้าใจง่าย ใช้ภาษาไทยเป็นกันเอง

กฎสำคัญ:
1. ตอบเป็นภาษาไทยเท่านั้น
2. ใช้ภาษาง่าย เจ้าของไม่ใช่นักบัญชี
3. สรุปสั้น กระชับ ไม่เกิน 200 ตัวอักษร
4. มีคำแนะนำที่ทำได้จริง
5. ห้ามสร้างตัวเลขเอง ใช้เฉพาะข้อมูลที่ให้มา
6. ถ้าไม่แน่ใจ ให้บอกว่า "ข้อมูลไม่เพียงพอ"

รูปแบบการตอบ:
📊 [หัวข้อสรุป]
[เนื้อหา 1-2 ประโยค]

💡 [คำแนะนำ]
[สิ่งที่ควรทำ]
```

### Monthly Summary Template

```typescript
const monthlyPrompt = `
ข้อมูลรายได้เดือน ${monthName} ${year}:
- รายได้รวม: ฿${totalIncome.toLocaleString()}
- เทียบเดือนก่อน: ${vsLastMonth > 0 ? '+' : ''}${vsLastMonth}%
- เทียบปีก่อน: ${vsLastYear > 0 ? '+' : ''}${vsLastYear}%

รายได้แยกตึก:
${buildings.map(b => `- ${b.name}: ฿${b.income.toLocaleString()}`).join('\n')}

สถานะการเช่า:
- ห้องว่าง: ${vacantRooms} ห้อง จาก ${totalRooms} ห้อง
- Occupancy: ${occupancyRate}%

ค้างชำระ:
${overduePayments.length === 0 
  ? '- ไม่มี'
  : overduePayments.map(p => `- ห้อง ${p.room}: ฿${p.amount.toLocaleString()} (${p.daysPastDue} วัน)`).join('\n')}

สรุปให้เจ้าของตึกเข้าใจง่าย พร้อมคำแนะนำ:
`;
```

### Rent Adjustment Template

```typescript
const rentAdjustmentPrompt = `
วิเคราะห์การปรับค่าเช่า:

ห้อง: ${roomNumber} (${buildingName})
ค่าเช่าปัจจุบัน: ฿${currentRent.toLocaleString()}
ค่าเช่าแนะนำ: ฿${suggestedRent.toLocaleString()}
การเปลี่ยนแปลง: ${adjustmentPct > 0 ? '+' : ''}${adjustmentPct}%

ข้อมูลเงินเฟ้อ:
- เงินเฟ้อสะสม: ${inflationPct}%
- ค่าเช่าโตกว่าเงินเฟ้อ: ${gap > 0 ? 'ใช่' : 'ไม่'}

ข้อมูลผู้เช่า:
- ระยะเวลาเช่า: ${tenantYears} ปี
- ประวัติชำระ: ${paymentHistory}

อธิบายให้เจ้าของเข้าใจว่าทำไมควรปรับหรือไม่ปรับ:
`;
```

### Anomaly Detection Template

```typescript
const anomalyPrompt = `
ตรวจพบความผิดปกติ:

ห้อง: ${roomNumber}
ปกติได้: ฿${expectedIncome.toLocaleString()}/เดือน
เดือนนี้ได้: ฿${actualIncome.toLocaleString()}
ผลต่าง: ${difference > 0 ? '+' : ''}฿${difference.toLocaleString()} (${diffPct}%)

ประวัติ 6 เดือนล่าสุด:
${history.map(h => `- ${h.month}: ฿${h.income.toLocaleString()}`).join('\n')}

อธิบายว่าผิดปกติอย่างไร และควรทำอะไร:
`;
```

---

## 2. Example Input → Output

### Example 1: Monthly Summary

**Input Data:**
```json
{
  "month": "มกราคม",
  "year": 2569,
  "totalIncome": 83000,
  "vsLastMonth": 2.5,
  "vsLastYear": 8.2,
  "buildings": [
    { "name": "ตึก A", "income": 45000 },
    { "name": "ตึก B", "income": 38000 }
  ],
  "vacantRooms": 1,
  "totalRooms": 10,
  "occupancyRate": 90,
  "overduePayments": [
    { "room": "203", "amount": 8500, "daysPastDue": 5 }
  ]
}
```

**AI Output:**
```
📊 สรุปเดือน ม.ค. 69

รายได้รวม ฿83,000 เพิ่มขึ้น 2.5% จากเดือนก่อน 
ตึก A ทำได้ดี ฿45,000 ตึก B ฿38,000
มีห้องว่าง 1 ห้อง (203 ว่างอยู่)

⚠️ ห้อง 203 ค้าง ฿8,500 มา 5 วันแล้ว

💡 แนะนำ
- ติดตามค่าเช่าห้อง 203 ด่วน
- หาผู้เช่าห้องว่างก่อนสิ้นเดือน
```

### Example 2: Rent Adjustment

**Input Data:**
```json
{
  "roomNumber": "101",
  "buildingName": "ตึก A",
  "currentRent": 8000,
  "suggestedRent": 8500,
  "adjustmentPct": 6.25,
  "inflationPct": 6.57,
  "gap": -6.57,
  "tenantYears": 2,
  "paymentHistory": "ชำระตรงทุกเดือน"
}
```

**AI Output:**
```
📊 วิเคราะห์ค่าเช่าห้อง 101

ค่าเช่าปัจจุบัน ฿8,000 ไม่ได้ปรับมา 2 ปี
เงินเฟ้อสะสม 6.57% ค่าเช่าควรเป็น ฿8,526
ผู้เช่าอยู่มา 2 ปี จ่ายตรงเสมอ 👍

💡 แนะนำ
ปรับขึ้น ฿500 (เป็น ฿8,500) ตอนต่อสัญญา
ให้ส่วนลด 1% เพราะเป็นผู้เช่าเก่าดี
```

### Example 3: Anomaly Alert

**Input Data:**
```json
{
  "roomNumber": "102",
  "expectedIncome": 9000,
  "actualIncome": 4500,
  "difference": -4500,
  "diffPct": -50,
  "history": [
    { "month": "ธ.ค.", "income": 9000 },
    { "month": "พ.ย.", "income": 9000 },
    { "month": "ต.ค.", "income": 9000 }
  ]
}
```

**AI Output:**
```
🔴 พบความผิดปกติ ห้อง 102

เดือนนี้ได้ ฿4,500 น้อยกว่าปกติ 50%
ห้องนี้เคยได้ ฿9,000 ทุกเดือน

💡 ตรวจสอบด่วน
- ผู้เช่าจ่ายบางส่วนหรือเปล่า?
- มีปัญหาหักค่าซ่อมไหม?
- ข้อมูลบันทึกผิดหรือไม่?
```

---

## 3. Guardrails (ป้องกัน Hallucination)

### Rule 1: Data-Only Responses

```typescript
// ai/summary/generator.ts

interface SummaryInput {
  // All fields are required with actual values
  income: number;        // Must be from database
  occupancy: number;     // Must be calculated
  overdueCount: number;  // Must be from query
}

function validateInput(input: SummaryInput): void {
  // Reject if any required field is missing
  if (input.income === undefined) {
    throw new Error('Income data required');
  }
  // All numbers must be non-negative
  if (input.income < 0 || input.occupancy < 0) {
    throw new Error('Invalid negative values');
  }
}
```

### Rule 2: Response Validation

```typescript
// Validate AI response before sending to user
function validateResponse(response: string, input: SummaryInput): boolean {
  // Check that mentioned numbers exist in input
  const numbersInResponse = response.match(/฿[\d,]+/g) || [];
  
  for (const numStr of numbersInResponse) {
    const num = parseInt(numStr.replace(/[฿,]/g, ''));
    if (!isNumberInInput(num, input)) {
      console.warn(`Hallucinated number detected: ${numStr}`);
      return false;
    }
  }
  
  return true;
}

function isNumberInInput(num: number, input: SummaryInput): boolean {
  const validNumbers = [
    input.income,
    input.vsLastMonth,
    ...input.buildings.map(b => b.income),
    ...input.overduePayments.map(p => p.amount)
  ];
  return validNumbers.includes(num);
}
```

### Rule 3: Fallback Response

```typescript
// If AI fails validation, use template-based fallback
function getFallbackResponse(input: SummaryInput): string {
  return `📊 สรุปรายได้

รายได้รวม: ฿${input.income.toLocaleString()}
ห้องว่าง: ${input.vacantRooms} ห้อง
ค้างชำระ: ${input.overduePayments.length} รายการ

💡 ดูรายละเอียดที่ Dashboard`;
}
```

### Rule 4: Confidence Scoring

```typescript
interface AIResponse {
  summary: string;
  confidence: 'high' | 'medium' | 'low';
  dataUsed: string[];  // Which input fields were used
}

// Only show AI response if confidence is high
if (response.confidence === 'low') {
  return getFallbackResponse(input);
}
```

### Rule 5: No Predictions Without Data

```typescript
// System prompt includes:
const noPredicationRule = `
ห้ามทำนายอนาคต เช่น:
❌ "เดือนหน้าน่าจะได้ ฿90,000"
❌ "ห้องนี้จะหาผู้เช่าได้ภายใน 2 สัปดาห์"

ให้พูดถึงแค่ข้อมูลที่มี:
✅ "เดือนนี้ได้ ฿83,000"
✅ "ห้องนี้ว่างมา 30 วันแล้ว"
`;
```

### Rule 6: Action Requires Human

```typescript
// All AI suggestions are advisory only
interface AISuggestion {
  action: string;
  isRequired: false;  // Always false - human decides
  reasoning: string;
}

// In system prompt:
const advisoryOnlyRule = `
คำแนะนำทุกข้อต้องเป็น "แนะนำ" ไม่ใช่ "ต้องทำ"
❌ "ต้องปรับค่าเช่าทันที"
✅ "แนะนำพิจารณาปรับค่าเช่า"
`;
```

---

## 4. Service Implementation

```typescript
// ai/summary/generator.ts

import { OpenAI } from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateMonthlySummary(
  data: AnalyticsSnapshot
): Promise<string> {
  // 1. Validate input
  validateInput(data);
  
  // 2. Build prompt
  const prompt = buildMonthlyPrompt(data);
  
  // 3. Call LLM
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300,
    temperature: 0.3  // Low temperature for consistency
  });
  
  const summary = response.choices[0].message.content;
  
  // 4. Validate response
  if (!validateResponse(summary, data)) {
    return getFallbackResponse(data);
  }
  
  // 5. Return validated summary
  return summary;
}
```

---

## 5. File Structure

```
ai/
├── summary/
│   ├── generator.ts       # Main summary generation
│   ├── prompts.ts         # Prompt templates
│   ├── validator.ts       # Response validation
│   └── fallback.ts        # Template fallbacks
├── anomaly/
│   └── detector.ts        # Anomaly detection
└── rent/
    └── advisor.ts         # Rent adjustment advice
```
