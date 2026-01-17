// Contract template - Thai rental agreement
// Uses Mustache-style placeholders for variable substitution

export interface ContractTemplateData {
  // Contract info
  contractId: string;
  contractVersion: number;
  contractDate: string;
  
  // Property info
  buildingName: string;
  roomNumber: string;
  roomSizeSqm: number | null;
  roomAddress: string;
  
  // Owner info
  ownerName: string;
  ownerAddress: string;
  ownerIdCard: string;
  
  // Tenant info
  tenantName: string;
  tenantPhone: string;
  tenantIdCard: string;
  tenantAddress: string;
  
  // Contract terms
  startDate: string;
  endDate: string;
  durationMonths: number;
  rentAmountTHB: number;
  rentAmountText: string;
  depositTHB: number;
  depositText: string;
  paymentDueDay: number;
}

/**
 * Thai number to text converter (simplified)
 */
export function numberToThaiText(num: number): string {
  const units = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  
  if (num === 0) return 'ศูนย์';
  if (num < 10) return units[num];
  
  let result = '';
  const str = num.toString();
  const len = str.length;
  
  for (let i = 0; i < len; i++) {
    const digit = parseInt(str[i]);
    const pos = len - i - 1;
    
    if (digit === 0) continue;
    
    if (pos === 1 && digit === 1) {
      result += 'สิบ';
    } else if (pos === 1 && digit === 2) {
      result += 'ยี่สิบ';
    } else if (pos === 0 && digit === 1 && len > 1) {
      result += 'เอ็ด';
    } else {
      result += units[digit] + positions[pos];
    }
  }
  
  return result + 'บาท';
}

/**
 * Default contract template (Thai)
 */
export const defaultContractTemplate = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;
      font-size: 14px;
      line-height: 1.8;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      font-size: 20px;
      margin-bottom: 30px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .parties {
      margin-bottom: 30px;
    }
    .party {
      margin-bottom: 15px;
      padding-left: 20px;
    }
    .terms {
      margin-bottom: 30px;
    }
    .term {
      margin-bottom: 10px;
      padding-left: 20px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
    }
    .signature {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 60px;
      padding-top: 10px;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>สัญญาเช่าห้องพัก</h1>
    <p>เลขที่สัญญา: {{contractId}} (ฉบับที่ {{contractVersion}})</p>
    <p>วันที่ทำสัญญา: {{contractDate}}</p>
  </div>

  <div class="parties">
    <div class="section-title">คู่สัญญา</div>
    
    <div class="party">
      <strong>ผู้ให้เช่า:</strong> {{ownerName}}<br>
      ที่อยู่: {{ownerAddress}}<br>
      เลขบัตรประชาชน: {{ownerIdCard}}<br>
      ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้ให้เช่า"</strong>
    </div>
    
    <div class="party">
      <strong>ผู้เช่า:</strong> {{tenantName}}<br>
      ที่อยู่: {{tenantAddress}}<br>
      เลขบัตรประชาชน: {{tenantIdCard}}<br>
      โทรศัพท์: {{tenantPhone}}<br>
      ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้เช่า"</strong>
    </div>
  </div>

  <div class="section">
    <div class="section-title">ทรัพย์สินที่เช่า</div>
    <p>
      ห้องพักเลขที่ <strong>{{roomNumber}}</strong> 
      อาคาร <strong>{{buildingName}}</strong>
      {{#roomSizeSqm}}ขนาด {{roomSizeSqm}} ตารางเมตร{{/roomSizeSqm}}
      <br>ตั้งอยู่ที่ {{roomAddress}}
    </p>
  </div>

  <div class="terms">
    <div class="section-title">ข้อตกลง</div>
    
    <div class="term">
      <strong>1. ระยะเวลาเช่า:</strong> 
      {{durationMonths}} เดือน 
      ตั้งแต่วันที่ {{startDate}} ถึงวันที่ {{endDate}}
    </div>
    
    <div class="term">
      <strong>2. ค่าเช่า:</strong> 
      เดือนละ {{rentAmountTHB}} บาท ({{rentAmountText}})
      ชำระภายในวันที่ {{paymentDueDay}} ของทุกเดือน
    </div>
    
    <div class="term">
      <strong>3. เงินประกัน:</strong> 
      {{depositTHB}} บาท ({{depositText}})
      จ่ายในวันทำสัญญา
    </div>
    
    <div class="term">
      <strong>4. การใช้ทรัพย์สิน:</strong> 
      ผู้เช่าจะใช้ทรัพย์สินเพื่อเป็นที่พักอาศัยเท่านั้น 
      ห้ามนำไปใช้ประกอบกิจการหรือกระทำการอื่นใดที่ผิดกฎหมาย
    </div>
    
    <div class="term">
      <strong>5. การดูแลรักษา:</strong> 
      ผู้เช่าจะดูแลรักษาทรัพย์สินที่เช่าให้อยู่ในสภาพดี 
      หากเกิดความเสียหาย ผู้เช่าจะเป็นผู้รับผิดชอบค่าซ่อมแซม
    </div>
    
    <div class="term">
      <strong>6. การเลิกสัญญา:</strong> 
      หากฝ่ายใดต้องการเลิกสัญญา ต้องแจ้งให้อีกฝ่ายทราบล่วงหน้า 
      ไม่น้อยกว่า 30 วัน
    </div>
  </div>

  <div class="signatures">
    <div class="signature">
      <div class="signature-line">
        ลงชื่อ _________________________ ผู้ให้เช่า<br>
        ({{ownerName}})
      </div>
    </div>
    <div class="signature">
      <div class="signature-line">
        ลงชื่อ _________________________ ผู้เช่า<br>
        ({{tenantName}})
      </div>
    </div>
  </div>

  <div class="footer">
    เอกสารนี้สร้างโดยระบบจัดการการเช่า | รหัส: {{contractId}}
  </div>
</body>
</html>
`;

/**
 * Render template with data
 */
export function renderTemplate(
  template: string,
  data: ContractTemplateData
): string {
  let result = template;
  
  // Simple Mustache-style replacement
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  
  // Handle optional sections {{#key}}...{{/key}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    const value = data[key as keyof ContractTemplateData];
    return value ? content : '';
  });
  
  return result;
}
