// AI Prompt templates for Thai summaries
// See docs/ai-insights.md for design details

export const SYSTEM_PROMPT = `คุณเป็นผู้ช่วยวิเคราะห์ข้อมูลการเช่าอาคาร ให้ข้อมูลเป็นภาษาไทยที่เข้าใจง่าย
สั้นกระชับ เป็นมิตร และนำไปปฏิบัติได้จริง

กฎสำคัญ:
1. ตอบเฉพาะข้อมูลที่ได้รับ ห้ามคิดเองหรือสมมติตัวเลข
2. ถ้าข้อมูลไม่พอ ให้บอกว่าไม่มีข้อมูล
3. ใช้อีโมจิให้เหมาะสม
4. ตอบไม่เกิน 300 ตัวอักษร
5. ห้ามแนะนำการลงทุนหรือตัดสินใจแทน เป็นแค่ข้อมูลประกอบ`;

export const MONTHLY_SUMMARY_TEMPLATE = `สรุปรายได้เดือน {{month}} {{year}}

ข้อมูล:
- รายได้รวม: {{totalIncome}} บาท
- แยกตามตึก: {{buildingBreakdown}}
- อัตราเก็บเงิน: {{collectionRate}}%
- ค้างชำระ: {{overdueAmount}} บาท ({{overdueCount}} ราย)
- Occupancy: {{occupancyRate}}%
- ห้องว่าง: {{vacantCount}} ห้อง
- สัญญาใกล้หมด: {{expiringCount}} สัญญา

ช่วยสรุปเป็นข้อความสั้นๆ เป็นมิตร พร้อมข้อเสนอแนะ (ถ้ามี)`;

export const RENT_ADJUSTMENT_TEMPLATE = `วิเคราะห์การปรับค่าเช่าสำหรับห้อง {{room}} ตึก {{building}}

ข้อมูล:
- ผู้เช่า: {{tenantName}} (อยู่มา {{tenantYears}} ปี)
- ค่าเช่าปัจจุบัน: {{currentRent}} บาท
- ค่าเช่าเริ่มต้น: {{originalRent}} บาท
- เงินเฟ้อสะสม: {{inflationPct}}%
- ค่าเช่าเพิ่มขึ้น: {{rentGrowthPct}}%
- ช่องว่าง (Growth - Inflation): {{gap}}%
- ค่าเช่าแนะนำ: {{suggestedRent}} บาท

ช่วยอธิบายสถานการณ์และแนะนำแบบเป็นมิตร`;

export const ANOMALY_DETECTION_TEMPLATE = `ตรวจสอบความผิดปกติของรายได้

ข้อมูลย้อนหลัง 6 เดือน:
{{incomeTrend}}

เดือนปัจจุบัน: {{currentMonth}}
รายได้เดือนนี้: {{currentIncome}} บาท
ค่าเฉลี่ย: {{averageIncome}} บาท
ส่วนเบี่ยงเบน: {{deviation}}%

มีอะไรผิดปกติไหม? อธิบายสั้นๆ`;

export const EXPIRY_REMINDER_TEMPLATE = `สัญญาใกล้หมดอายุ

รายการ:
{{expiringContracts}}

ช่วยสรุปและแนะนำว่าควรดำเนินการอย่างไร`;

// Fill template with data
export function fillTemplate(
  template: string,
  data: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return result;
}
