export interface ContractTemplateData {
  // Contract meta
  contractId: string;
  contractVersion: number;
  contractDate: string;       // Thai format e.g. "1 มกราคม 2568"
  contractPlace: string;      // e.g. ชื่ออาคาร/จังหวัด

  // Property
  buildingName: string;
  roomNumber: string;
  roomSizeSqm: number | null;
  roomAddress: string;        // full address string

  // Owner
  ownerName: string;
  ownerAddress: string;
  ownerIdCard: string;

  // Tenant
  tenantName: string;
  tenantHouseNo: string;
  tenantMoo: string;
  tenantSoi: string;
  tenantRoad: string;
  tenantSubDistrict: string;
  tenantDistrict: string;
  tenantProvince: string;
  tenantIdCard: string;
  tenantIdCardIssuedBy: string;
  tenantPhone: string;
  tenantAddress: string;      // full fallback address

  // Contract terms
  startDate: string;
  endDate: string;
  durationMonths: number;
  rentAmountTHB: number;
  rentAmountText: string;
  depositTHB: number;
  depositText: string;
  paymentDueDay: number;

  // Utility rates
  electricityRate: string;    // e.g. "7 บาทต่อหน่วย"
  waterRate: string;          // e.g. "18 บาทต่อหน่วย"

  // Penalty
  penaltyPerDay: number;      // บาท/วัน หากไม่ออกหลังสัญญาสิ้นสุด
}

/**
 * Thai number to text (บาทถ้วน)
 */
export function numberToThaiText(num: number): string {
  const units = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];

  if (num === 0) return 'ศูนย์บาทถ้วน';

  const str = Math.floor(num).toString();
  const len = str.length;
  let result = '';

  for (let i = 0; i < len; i++) {
    const digit = parseInt(str[i]);
    const pos = len - i - 1;
    if (digit === 0) continue;
    if (pos === 1 && digit === 1) result += 'สิบ';
    else if (pos === 1 && digit === 2) result += 'ยี่สิบ';
    else if (pos === 0 && digit === 1 && len > 1) result += 'เอ็ด';
    else result += units[digit] + (['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'][pos] ?? '');
  }

  return result + 'บาทถ้วน';
}

export const defaultContractTemplate = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Sarabun', 'TH SarabunNew', 'Noto Sans Thai', sans-serif;
      font-size: 15px;
      line-height: 2;
      color: #000;
      background: #fff;
      padding: 50px 60px;
      max-width: 820px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .doc-id {
      text-align: center;
      font-size: 13px;
      color: #555;
      margin-bottom: 20px;
    }

    .place-date {
      text-align: right;
      margin-bottom: 16px;
    }

    .intro {
      margin-bottom: 8px;
      text-indent: 2em;
    }

    .parties {
      margin-bottom: 16px;
    }

    .party-line {
      text-indent: 2em;
    }

    .agree-intro {
      text-indent: 2em;
      margin-bottom: 12px;
    }

    .clause {
      margin-bottom: 10px;
      text-indent: 0;
    }

    .clause-num {
      font-weight: 700;
    }

    .clause-body {
      display: inline;
    }

    .closing {
      margin-top: 20px;
      text-indent: 2em;
    }

    .signatures {
      display: flex;
      justify-content: space-around;
      margin-top: 56px;
      gap: 20px;
    }

    .sig-block {
      width: 45%;
      text-align: center;
    }

    .sig-line {
      border-top: 1px solid #000;
      padding-top: 6px;
      margin-top: 52px;
      font-size: 14px;
    }

    .witnesses {
      display: flex;
      justify-content: space-around;
      margin-top: 40px;
      gap: 20px;
    }

    .witness-block {
      width: 45%;
      text-align: center;
    }

    .witness-line {
      border-top: 1px solid #000;
      padding-top: 6px;
      margin-top: 52px;
      font-size: 13px;
      color: #333;
    }

    .footer {
      margin-top: 40px;
      border-top: 1px solid #ddd;
      padding-top: 10px;
      font-size: 11px;
      color: #888;
      text-align: center;
    }

    @media print {
      body { padding: 20px 30px; font-size: 14px; }
    }
  </style>
</head>
<body>

  <h1>หนังสือสัญญาเช่าห้องพัก</h1>
  <div class="doc-id">เลขที่สัญญา {{contractId}} &nbsp;|&nbsp; ฉบับที่ {{contractVersion}}</div>

  <div class="place-date">
    ทำที่ {{contractPlace}}<br>
    วันที่ {{contractDate}}
  </div>

  <div class="parties">
    <div class="intro">
      สัญญาฉบับนี้ทำขึ้นระหว่าง <strong>{{ownerName}}</strong>
      ที่อยู่ {{ownerAddress}} บัตรประจำตัวประชาชนเลขที่ {{ownerIdCard}}
      ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้ให้เช่า"</strong> ฝ่ายหนึ่ง
    </div>

    <div class="party-line">
      กับ <strong>{{tenantName}}</strong>
      อยู่บ้านเลขที่ {{tenantHouseNo}} หมู่ที่ {{tenantMoo}} ซอย {{tenantSoi}}
      ถนน {{tenantRoad}} แขวง/ตำบล {{tenantSubDistrict}}
      เขต/อำเภอ {{tenantDistrict}} จังหวัด {{tenantProvince}}
      ถือบัตรประจำตัวประชาชนเลขที่ {{tenantIdCard}} ออกโดย {{tenantIdCardIssuedBy}}
      ซึ่งต่อไปในสัญญานี้จะเรียกว่า <strong>"ผู้เช่า"</strong> ฝ่ายหนึ่ง
    </div>
  </div>

  <div class="agree-intro">
    คู่สัญญาทั้งสองฝ่ายตกลงทำสัญญากันโดยมีเงื่อนไขและรายละเอียดดังต่อไปนี้
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 1.</span>
    <span class="clause-body">
      ผู้ให้เช่าตกลงให้เช่าและผู้เช่าตกลงเช่า <strong>ห้องพักเลขที่ {{roomNumber}}</strong>
      อาคาร <strong>{{buildingName}}</strong>{{#roomSizeSqm}} ขนาด {{roomSizeSqm}} ตารางเมตร{{/roomSizeSqm}}
      ตั้งอยู่ที่ {{roomAddress}}
      ซึ่งเป็นกรรมสิทธิ์ของผู้ให้เช่า เพื่อประโยชน์ในการพักอาศัย
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 2.</span>
    <span class="clause-body">
      คู่สัญญาทั้งสองฝ่ายตกลงเช่าทรัพย์ตามข้อ 1 มีกำหนด {{durationMonths}} เดือน
      นับแต่วันที่ {{startDate}} ถึงวันที่ {{endDate}}
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 3.</span>
    <span class="clause-body">
      ผู้เช่าตกลงชำระค่าเช่าให้แก่ผู้ให้เช่าเป็นรายเดือนโดยจ่ายล่วงหน้า
      กำหนดชำระภายในวันที่ {{paymentDueDay}} ของแต่ละเดือน
      ในอัตราเดือนละ <strong>{{rentAmountTHB}} บาท ({{rentAmountText}})</strong>
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 4.</span>
    <span class="clause-body">
      ผู้เช่าต้องวางเงินประกันความเสียหายและการชำระค่าเช่ารวมทั้งค่าใช้จ่ายอื่นๆ
      ตามข้อ 5 วรรค 2 เป็นจำนวนเงิน <strong>{{depositTHB}} บาท ({{depositText}})</strong>
      ในวันทำสัญญา โดยเงินจำนวนนี้ผู้ให้เช่ามีสิทธิหักได้ในกรณีที่ผู้เช่าค้างชำระค่าเช่า
      และความเสียหายอันเนื่องจากความผิดของผู้เช่า และผู้ให้เช่าจะคืนเงินดังกล่าวให้
      เมื่อผู้เช่ามิได้ผิดสัญญาและค้างชำระเงินต่างๆ ตามสัญญานี้
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 5.</span>
    <span class="clause-body">
      การชำระค่าเช่านั้น ผู้เช่าจะต้องนำเงินไปชำระ ณ ภูมิลำเนาของผู้ให้เช่า
      และในกรณีที่ผู้ให้เช่าหรือตัวแทนของผู้ให้เช่าไปเก็บเงินค่าเช่าเองย่อมไม่ลบล้างหน้าที่ผู้เช่าดังกล่าว
      <br>
      สำหรับค่ากระแสไฟฟ้า ค่าน้ำประปา ผู้เช่าจะต้องเสียเองตามจำนวนที่แจ้งในเครื่องวัด
      ในอัตรา {{electricityRate}} (ไฟฟ้า) และ {{waterRate}} (น้ำ)
      ในกรณีผู้เช่าค้างชำระเงินค่าดังกล่าวหากผู้ให้เช่าต้องชำระแทนไปแล้วย่อมมีสิทธิไล่เบี้ยเอากับผู้เช่าได้
      หรือจะใช้สิทธิในการบอกเลิกสัญญานี้ก็ได้
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 6.</span>
    <span class="clause-body">
      ในระหว่างการเช่าหากผู้เช่าประสงค์จะเปลี่ยนแปลงระบบหรือประเภทการใช้ไฟฟ้า น้ำประปา
      ผู้เช่าจะเป็นผู้เสียค่าใช้จ่ายเอง และต้องแจ้งรายละเอียดแห่งความประสงค์นั้นต่อผู้ให้เช่า
      ก่อนอย่างน้อย 5 วัน และต้องได้รับความยินยอมจากผู้ให้เช่าเป็นหนังสือก่อนจึงจะทำการเปลี่ยนแปลงได้
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 7.</span>
    <span class="clause-body">
      ผู้เช่าตกลงชำระค่าภาษีโรงเรือนและภาษีอื่นๆ แทนผู้ให้เช่า (ถ้ามี)
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 8.</span>
    <span class="clause-body">
      ในวันทำสัญญานี้ผู้ให้เช่าได้ส่งมอบทรัพย์สินที่เช่าตามข้อ 1 ให้กับผู้เช่าแล้ว
      และผู้เช่าได้ตรวจดูเรียบร้อยแล้ว
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 9.</span>
    <span class="clause-body">
      ทรัพย์ที่เช่าตามข้อ 1 ผู้เช่าจะนำไปให้ผู้อื่นเช่าช่วงหรือยินยอมไม่ว่าโดยตรงหรือโดยปริยาย
      ให้ผู้อื่นใช้หรือได้รับประโยชน์ หรือโอนสิทธิของตนที่มีอยู่ตามสัญญานี้ให้ผู้อื่น
      ไม่ว่าทั้งหมดหรือแต่บางส่วนนั้นไม่ได้ เว้นแต่จะได้รับความยินยอมจากผู้ให้เช่าเป็นหนังสือก่อน
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 10.</span>
    <span class="clause-body">
      ผู้เช่าจะต้องจัดการซ่อมแซมทรัพย์สินที่เช่าให้อยู่ในสภาพปกติตลอดไป
      บรรดาทรัพย์สินหรืออุปกรณ์เครื่องใช้ที่ผู้เช่าหรือบุคคลอื่นใดๆ นำมาติดตั้งตราตรึงกับทรัพย์สินที่เช่า
      ผู้เช่าจะรื้อถอนหรือยินยอมให้บุคคลอื่นใดทำการรื้อถอนโดยไม่ได้รับความยินยอมเป็นหนังสือจากผู้ให้เช่ามิได้
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 11.</span>
    <span class="clause-body">
      ผู้ให้เช่าหรือตัวแทนของผู้ให้เช่าจะเข้าตรวจตราดูทรัพย์สินที่เช่าเป็นครั้งคราว
      ในเวลาและระยะเวลาอันสมควรก็ได้ ถ้าผู้ให้เช่าเห็นทรัพย์สินที่เช่าอยู่ในสภาพชำรุดทรุดโทรม
      ผู้ให้เช่าจะแจ้งให้ผู้เช่าทำการแก้ไขหรือซ่อมแซมด้วยทุนทรัพย์ของผู้เช่าเอง
      และผู้เช่าจะต้องรีบดำเนินการโดยพลัน หากละเลยหน้าที่ตามข้อนี้และเกิดความเสียหายขึ้น
      ผู้เช่าจะต้องรับผิดชอบในผลนั้น
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 12.</span>
    <span class="clause-body">
      ถ้าทรัพย์สินที่เช่าชำรุดบกพร่อง หรืออยู่ในสภาพที่น่าจะเป็นอันตราย
      หรือมีบุคคลภายนอกรุกล้ำเข้ามาในบริเวณทรัพย์สินที่เช่า
      ผู้เช่ามีหน้าที่จะต้องแจ้งให้ผู้ให้เช่าทราบโดยพลัน
      เว้นแต่ผู้ให้เช่าจะได้ทราบเหตุดังกล่าวนี้ก่อนแล้ว
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 13.</span>
    <span class="clause-body">
      ผู้เช่าจะทำการดัดแปลง หรือต่อเติมรื้อถอนทรัพย์สินที่เช่าเพียงบางส่วนหรือทั้งหมด
      โดยมิได้รับอนุญาตเป็นหนังสือจากผู้ให้เช่ามิได้
      ถ้าผู้เช่าทำการเช่นว่านั้นโดยมิได้รับความยินยอม ผู้ให้เช่าจะเรียกให้ผู้เช่า
      ทำทรัพย์สินที่เช่ากลับคืนสู่สภาพเดิม และผู้เช่ารับผิดชอบชดใช้ค่าเสียหายทั้งหมด
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 14.</span>
    <span class="clause-body">
      ผู้เช่าจะต้องสงวนรักษาทรัพย์สินที่เช่าเสมือนด้วยทรัพย์สินของตนเอง
      และต้องทำการรักษาความสะอาดตามปกติ เพื่อไม่ให้เป็นที่เดือดร้อนรำคาญแก่ผู้ใกล้เคียง
      อีกทั้งต้องไม่ทำการใดๆ อันจะเป็นเหตุให้เดือดร้อนรำคาญแก่ผู้ที่อยู่ข้างเคียง
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 15.</span>
    <span class="clause-body">
      ถ้าผู้เช่าผิดสัญญานี้แต่ข้อหนึ่งข้อใด ให้ถือว่าผิดสัญญาทั้งหมด
      และให้ถือว่าสัญญานี้เป็นอันระงับสิ้นไป โดยผู้ให้เช่าไม่จำเป็นต้องบอกกล่าวเป็นหนังสือไปยังผู้เช่า
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 16.</span>
    <span class="clause-body">
      ผู้เช่ายอมชดใช้ดอกเบี้ยในอัตราร้อยละ 15 ต่อปี ของยอดเงินค่าเช่าที่ค้างชำระ
      และให้รวมถึงค่าใช้จ่ายต่างๆ ที่ผู้ให้เช่าชำระแทนผู้เช่าตามข้อ 5 วรรคสอง แก่ผู้ให้เช่าด้วย
      ในกรณีที่ผู้เช่าจะต้องเสียค่าเสียหายให้แก่ผู้ให้เช่า นอกจากจะชำระเต็มจำนวนแล้ว
      ผู้เช่ายังต้องชดใช้ดอกเบี้ยในอัตราร้อยละ 15 ต่อปี จากยอดเงินค่าเสียหายทั้งหมด
      นับแต่วันที่ต้องรับผิดจนกว่าจะชำระเสร็จสิ้น
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 17.</span>
    <span class="clause-body">
      ในกรณีสัญญาเลิกกันไม่ว่าเพราะเหตุใดๆ ผู้เช่าจะต้องขนย้ายทรัพย์สินและบริวารออกไปจากทรัพย์สินที่เช่า
      และต้องส่งมอบทรัพย์สินที่เช่าคืนให้แก่ผู้ให้เช่าในสภาพปกติที่ผู้ให้เช่าจะใช้ประโยชน์ได้ทันที
      หากผู้เช่าไม่ยอมขนย้ายหรือไม่สามารถส่งมอบได้ไม่ว่าด้วยเหตุใดที่มิใช่ความผิดของผู้ให้เช่า
      ผู้เช่าจะต้องรับผิดชอบชดใช้ค่าปรับให้แก่ผู้ให้เช่าในอัตรา <strong>วันละ {{penaltyPerDay}} บาท</strong>
      จนกว่าจะจัดการส่งมอบทรัพย์สินที่เช่าคืนแก่ผู้ให้เช่าในสภาพปกติ
      และผู้เช่ายังตกลงยินยอมให้ผู้ให้เช่าทำการขนย้ายทรัพย์สินของผู้เช่าออกไปได้โดยไม่ถือว่าเป็นการบุกรุก
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 18.</span>
    <span class="clause-body">
      ผู้เช่าตกลงยินยอมที่จะนำทรัพย์สินที่เช่าตามข้อ 1 ไปทำสัญญาประกันวินาศภัยไว้กับบริษัทประกันภัย
      ตามที่ผู้ให้เช่าจัดหาให้ โดยผู้เช่าเป็นผู้จ่ายเบี้ยประกันภัยและระบุให้ผู้ให้เช่าเป็นผู้รับประโยชน์
      ตลอดระยะเวลาการเช่า
    </span>
  </div>

  <div class="clause">
    <span class="clause-num">ข้อ 19.</span>
    <span class="clause-body">
      ถ้าในระหว่างการเช่าผู้ให้เช่าตกลงขายทรัพย์สินที่เช่าดังกล่าวตามข้อ 1 ก่อนครบกำหนดตามสัญญาเช่านี้
      ผู้ให้เช่ามีหน้าที่เพียงแจ้งให้ผู้เช่าทราบล่วงหน้าไม่น้อยกว่า 2 เดือน
      และเมื่อผู้ให้เช่าได้ทำการขายทรัพย์สินที่เช่าไปแล้ว ผู้เช่าจะทำการเรียกร้องค่าเสียหายใดๆ จากผู้ให้เช่ามิได้
    </span>
  </div>

  <div class="closing">
    สัญญานี้ทำขึ้นสองฉบับ โดยมีข้อความถูกต้องตรงกันทั้งสองฉบับ
    และคู่สัญญาทั้งสองฝ่ายได้อ่านและเข้าใจข้อความแห่งสัญญานี้ทั้งหมดแล้ว
    และเห็นว่าถูกต้องตรงตามเจตนาแห่งตนแล้ว จึงได้ลงลายมือชื่อไว้เป็นหลักฐาน
    ต่อหน้าพยานเป็นสำคัญ และต่างฝ่ายต่างยึดถือไว้คนละฉบับ
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">
        ลงชื่อ ...................................... ผู้ให้เช่า<br>
        ({{ownerName}})
      </div>
      <div style="margin-top:8px; font-size:13px;">วันที่ ............................................</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">
        ลงชื่อ ...................................... ผู้เช่า<br>
        ({{tenantName}})
      </div>
      <div style="margin-top:8px; font-size:13px;">วันที่ ............................................</div>
    </div>
  </div>

  <div class="witnesses">
    <div class="witness-block">
      <div class="witness-line">
        ลงชื่อ ...................................... พยาน<br>
        (.............................................)
      </div>
    </div>
    <div class="witness-block">
      <div class="witness-line">
        ลงชื่อ ...................................... พยาน<br>
        (.............................................)
      </div>
    </div>
  </div>

  <div class="footer">
    สร้างโดยระบบ VARA Property Intelligence &nbsp;|&nbsp; เลขที่ {{contractId}} &nbsp;|&nbsp; {{contractDate}}
  </div>

</body>
</html>`;

export function renderTemplate(
  template: string,
  data: ContractTemplateData
): string {
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }

  // {{#key}}content{{/key}} — show only if truthy
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    const value = data[key as keyof ContractTemplateData];
    return value ? content : '';
  });

  return result;
}
