export interface ContractTemplateData {
  contractId: string;
  contractVersion: number;
  contractDate: string;    // "1 มกราคม 2568"
  contractDay: string;     // "1"
  contractMonth: string;   // "มกราคม"
  contractYear: string;    // "2568"
  contractPlace: string;   // ชื่ออาคาร

  buildingName: string;
  roomNumber: string;
  roomSizeSqm: number | null;
  roomAddress: string;

  ownerName: string;
  ownerAddress: string;
  ownerIdCard: string;

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
  tenantAddress: string;

  startDate: string;
  endDate: string;
  startDay: string;
  startMonth: string;
  startYear: string;
  endDay: string;
  endMonth: string;
  endYear: string;
  durationMonths: number;

  rentAmountTHB: number;
  rentAmountText: string;
  depositTHB: number;
  depositText: string;
  paymentDueDay: number;

  electricityRate: string;
  waterRate: string;
  penaltyPerDay: number;
}

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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet">
<style>

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html {
    background: #b0b0b0;
  }

  body {
    font-family: 'Sarabun', 'TH SarabunNew', 'Noto Sans Thai', sans-serif;
    font-size: 12pt;
    line-height: 1.65;
    color: #000;
    background: #b0b0b0;
    padding: 20px 0 40px;
  }

  .page {
    width: 21.59cm;
    min-height: 27.94cm;
    margin: 0 auto 20px;
    padding: 2cm 1.5cm 2cm 2cm;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
    position: relative;
  }

  h1 {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin-bottom: 0.2em;
    letter-spacing: 0.02em;
  }

  .place-date {
    text-align: right;
    margin-bottom: 0.5em;
    line-height: 1.8;
  }

  p {
    text-indent: 2.5em;
    margin-bottom: 0.3em;
  }

  p.no-indent {
    text-indent: 0;
  }

  .clause {
    margin-bottom: 0.3em;
    text-indent: 0;
  }

  .closing {
    text-indent: 2.5em;
    margin-top: 0.8em;
    margin-bottom: 1.5em;
  }

  .sig-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2em;
  }

  .sig-table td {
    width: 50%;
    text-align: center;
    padding: 0 0.5em;
    vertical-align: top;
    line-height: 2;
  }

  .sig-line {
    display: inline-block;
    border-bottom: 1px solid #000;
    width: 9em;
    margin-bottom: 0.2em;
  }

  .sig-name {
    border-bottom: 1px solid #000;
    min-width: 10em;
    display: inline-block;
    margin-bottom: 0.2em;
  }

  .witness-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1.5em;
  }

  .witness-table td {
    width: 50%;
    text-align: center;
    padding: 0 0.5em;
    vertical-align: top;
    line-height: 2;
  }

  .page-num {
    position: absolute;
    bottom: 1cm;
    right: 2cm;
    font-size: 9pt;
    color: #888;
  }

  .doc-ref {
    text-align: center;
    font-size: 9pt;
    color: #aaa;
    margin-top: 1.5em;
    border-top: 1px solid #e0e0e0;
    padding-top: 0.4em;
  }

  @media print {
    html, body { background: white; padding: 0; }
    .page {
      box-shadow: none;
      margin: 0;
      padding: 2cm 1.5cm 2cm 2cm;
      page-break-after: always;
      min-height: auto;
    }
    .page:last-child { page-break-after: auto; }
    .page-num { display: none; }
  }

  @page { size: letter; margin: 0; }
</style>
</head>
<body>

<!-- หน้า 1 -->
<div class="page">
  <h1>หนังสือสัญญาเช่าห้องพัก</h1>

  <div class="place-date">
    ทำที่&nbsp;&nbsp;{{contractPlace}}<br>
    วันที่&nbsp;{{contractDay}}&nbsp;&nbsp;เดือน&nbsp;{{contractMonth}}&nbsp;&nbsp;พ.ศ.&nbsp;{{contractYear}}
  </div>

  <p>สัญญาฉบับนี้ทำขึ้นระหว่าง&nbsp;<u>{{ownerName}}</u>&nbsp;ที่อยู่&nbsp;{{ownerAddress}}&nbsp;บัตรประจำตัวประชาชนเลขที่&nbsp;<u>{{ownerIdCard}}</u>&nbsp;ซึ่งต่อไปในสัญญานี้เรียกว่า&nbsp;(ผู้ให้เช่า)&nbsp;ฝ่ายหนึ่ง</p>

  <p>กับ&nbsp;<u>{{tenantName}}</u>&nbsp;อยู่บ้านเลขที่&nbsp;{{tenantHouseNo}}&nbsp;หมู่ที่&nbsp;{{tenantMoo}}&nbsp;ซอย&nbsp;{{tenantSoi}}&nbsp;ถนน&nbsp;{{tenantRoad}}&nbsp;แขวง/ตำบล&nbsp;{{tenantSubDistrict}}&nbsp;เขต/อำเภอ&nbsp;{{tenantDistrict}}&nbsp;จังหวัด&nbsp;{{tenantProvince}}&nbsp;ถือบัตรประจำตัวประชาชนเลขที่&nbsp;<u>{{tenantIdCard}}</u>&nbsp;ออกโดย&nbsp;{{tenantIdCardIssuedBy}}&nbsp;ซึ่งต่อไปในสัญญานี้จะเรียกว่า&nbsp;(ผู้เช่า)&nbsp;ฝ่ายหนึ่ง</p>

  <p>คู่สัญญาทั้งสองฝ่ายตกลงทำสัญญากันโดยมีเงื่อนไขและรายละเอียดดังต่อไปนี้</p>

  <p class="clause">ข้อ&nbsp;1.&nbsp;ผู้ให้เช่าตกลงให้เช่าและผู้เช่าตกลงเช่า&nbsp;<u>ห้องพักเลขที่&nbsp;{{roomNumber}}&nbsp;อาคาร&nbsp;{{buildingName}}{{#roomSizeSqm}}&nbsp;ขนาด&nbsp;{{roomSizeSqm}}&nbsp;ตารางเมตร{{/roomSizeSqm}}</u>&nbsp;ตั้งอยู่ที่&nbsp;{{roomAddress}}&nbsp;ซึ่งเป็นกรรมสิทธิ์ของผู้ให้เช่า&nbsp;เพื่อประโยชน์ในการพักอาศัย</p>

  <p class="clause">ข้อ&nbsp;2.&nbsp;คู่สัญญาทั้งสองฝ่ายตกลงเช่าทรัพย์ตามข้อ&nbsp;1.&nbsp;มีกำหนด&nbsp;<u>{{durationMonths}}</u>&nbsp;เดือน&nbsp;นับแต่วันที่&nbsp;<u>{{startDay}}</u>&nbsp;เดือน&nbsp;<u>{{startMonth}}</u>&nbsp;พ.ศ.&nbsp;<u>{{startYear}}</u>&nbsp;ถึงวันที่&nbsp;<u>{{endDay}}</u>&nbsp;เดือน&nbsp;<u>{{endMonth}}</u>&nbsp;พ.ศ.&nbsp;<u>{{endYear}}</u></p>

  <p class="clause">ข้อ&nbsp;3.&nbsp;ผู้เช่าตกลงชำระค่าเช่าให้แก่ผู้ให้เช่าเป็นรายเดือนโดยจ่ายล่วงหน้า&nbsp;กำหนดชำระภายในวันที่&nbsp;<u>{{paymentDueDay}}</u>&nbsp;ของแต่ละเดือน&nbsp;ในอัตราเดือนละ&nbsp;<u>{{rentAmountTHB}}</u>&nbsp;บาท&nbsp;({{rentAmountText}})</p>

  <p class="clause">ข้อ&nbsp;4.&nbsp;ผู้เช่าต้องวางเงินประกันความเสียหายและการชำระค่าเช่ารวมทั้งค่าใช้จ่ายอื่นๆ&nbsp;ตามข้อ&nbsp;5&nbsp;วรรค&nbsp;2&nbsp;เป็นจำนวนเงิน&nbsp;<u>{{depositTHB}}</u>&nbsp;บาท&nbsp;({{depositText}})&nbsp;ในวันทำสัญญา&nbsp;โดยเงินจำนวนนี้ผู้ให้เช่ามีสิทธิหักได้ในกรณีที่ผู้เช่าค้างชำระค่าเช่าและความเสียหายอันเนื่องจากความผิดของผู้เช่า&nbsp;และผู้ให้เช่าจะคืนเงินดังกล่าวให้เมื่อผู้เช่ามิได้ผิดสัญญาและค้างชำระเงินต่างๆ&nbsp;ตามสัญญานี้</p>

  <p class="clause">ข้อ&nbsp;5.&nbsp;การชำระค่าเช่านั้น&nbsp;ผู้เช่าจะต้องนำเงินไปชำระ&nbsp;ณ&nbsp;ภูมิลำเนาของผู้ให้เช่าและในกรณีที่ผู้ให้เช่าหรือตัวแทนของผู้ให้เช่าไปเก็บเงินค่าเช่าเองย่อมไม่ลบล้างหน้าที่ผู้เช่าดังกล่าว</p>

  <p class="no-indent">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;สำหรับค่ากระแสไฟฟ้า&nbsp;ค่าน้ำประปา&nbsp;ผู้เช่าจะต้องเสียเองตามจำนวนที่แจ้งในเครื่องวัดในอัตรา&nbsp;<u>{{electricityRate}}</u>&nbsp;(ไฟฟ้า)&nbsp;และ&nbsp;<u>{{waterRate}}</u>&nbsp;(น้ำ)&nbsp;ในกรณีผู้เช่าค้างชำระเงินค่าดังกล่าวหากผู้ให้เช่าต้องชำระแทนไปแล้วย่อมมีสิทธิไล่เบี้ยเอากับผู้เช่าได้&nbsp;หรือจะใช้สิทธิในการบอกเลิกสัญญานี้ก็ได้</p>

  <p class="clause">ข้อ&nbsp;6.&nbsp;ในระหว่างการเช่าหากผู้เช่าประสงค์จะเปลี่ยนแปลงระบบหรือประเภทการใช้ไฟฟ้า&nbsp;น้ำประปา&nbsp;ผู้เช่าจะเป็นผู้เสียค่าใช้จ่ายเองและต้องแจ้งรายละเอียดแห่งความประสงค์นั้นต่อผู้ให้เช่าก่อนอย่างน้อย&nbsp;5&nbsp;วันก่อนการเปลี่ยนแปลง&nbsp;และต้องได้รับความยินยอมจากทางผู้ให้เช่าเป็นหนังสือก่อนจึงจะทำการเปลี่ยนแปลงได้</p>

  <p class="clause">ข้อ&nbsp;7.&nbsp;ผู้เช่าตกลงชำระค่าภาษีโรงเรือนและภาษีอื่นๆ&nbsp;แทนผู้ให้เช่า&nbsp;(ถ้ามี)</p>

  <p class="clause">ข้อ&nbsp;8.&nbsp;ในวันทำสัญญานี้ผู้ให้เช่าได้ส่งมอบทรัพย์สินที่เช่าตามข้อ&nbsp;1.&nbsp;ให้กับผู้เช่าแล้วและผู้เช่าได้ตรวจดูเรียบร้อยแล้ว</p>

  <p class="clause">ข้อ&nbsp;9.&nbsp;ทรัพย์ที่เช่าตามข้อ&nbsp;1.&nbsp;ผู้เช่าจะนำไปให้ผู้อื่นเช่าช่วงหรือยินยอมไม่ว่าโดยตรงหรือโดยปริยายให้ผู้อื่นใช้หรือได้รับประโยชน์&nbsp;หรือโอนสิทธิของตนที่มีอยู่ตามสัญญานี้ให้ผู้อื่นไม่ว่าทั้งหมดหรือแต่บางส่วนนั้นไม่ได้&nbsp;เว้นแต่จะได้รับความยินยอมจากผู้ให้เช่าเป็นหนังสือก่อน</p>

  <p class="clause">ข้อ&nbsp;10.&nbsp;ผู้เช่าจะต้องจัดการซ่อมแซมทรัพย์สินที่เช่าให้อยู่ในสภาพปกติตลอดไป&nbsp;บรรดาทรัพย์สินหรืออุปกรณ์เครื่องใช้ที่ผู้เช่าหรือบุคคลอื่นใดๆ&nbsp;นำมาติดตั้งตราตรึงกับทรัพย์สินที่เช่า&nbsp;ผู้เช่าจะรื้อถอนหรือยินยอมให้บุคคลอื่นใดทำการรื้อถอนโดยไม่ได้รับความยินยอมเป็นหนังสือจากผู้ให้เช่ามิได้</p>

  <div class="page-num">หน้า 1/2</div>
</div>

<!-- หน้า 2 -->
<div class="page">
  <p class="clause">ข้อ&nbsp;11.&nbsp;ผู้ให้เช่าหรือตัวแทนของผู้ให้เช่าจะเข้าตรวจตราดูทรัพย์สินที่เช่าเป็นครั้งคราวในเวลาและระยะเวลาอันสมควรก็ได้&nbsp;ถ้าผู้ให้เช่าหรือตัวแทนของผู้ให้เช่าเห็นทรัพย์สินที่เช่าหรืออุปกรณ์เครื่องใช้อยู่ในสภาพชำรุดทรุดโทรมหรือน่าจะเป็นอันตรายเสียหายผู้ให้เช่าหรือตัวแทนจะแจ้งให้ผู้เช่าทำการแก้ไขหรือซ่อมแซมด้วยทุนทรัพย์ของผู้เช่าเอง&nbsp;และผู้เช่าจะต้องรีบดำเนินการโดยพลัน&nbsp;หากละเลยหน้าที่ตามข้อนี้และเกิดความเสียหายขึ้นผู้เช่าจะต้องรับผิดชอบในผลนั้น</p>

  <p class="clause">ข้อ&nbsp;12.&nbsp;ถ้าทรัพย์สินที่เช่านั้นชำรุดบกพร่องหรืออยู่ในสภาพที่น่าจะเป็นอันตรายเสียหาย&nbsp;หรือมีเหตุอย่างหนึ่งอย่างใดที่เห็นว่าน่าจะต้องจัดการซ่อมแซมก็ดี&nbsp;หรือบุคคลภายนอกรุกล้ำเข้ามาในบริเวณทรัพย์สินที่เช่าก็ดี&nbsp;ผู้เช่ามีหน้าที่จะต้องแจ้งให้ผู้ให้เช่าทราบโดยพลัน&nbsp;เว้นแต่ผู้ให้เช่าจะได้ทราบเหตุดังกล่าวนี้ก่อนแล้ว</p>

  <p class="clause">ข้อ&nbsp;13.&nbsp;ผู้เช่าจะทำการดัดแปลงหรือต่อเติมรื้อถอนทรัพย์สินที่เช่าเพียงบางส่วนหรือทั้งหมดโดยมิได้รับอนุญาตเป็นหนังสือจากผู้ให้เช่ามิได้&nbsp;ถ้าผู้เช่าทำการเช่นว่านั้นโดยมิได้รับความยินยอม&nbsp;ผู้ให้เช่าจะเรียกให้ผู้เช่าทำทรัพย์สินที่เช่ากลับคืนสู่สภาพเดิมและผู้เช่ารับผิดชอบชดใช้ค่าเสียหายอันเกิดจากการสูญหายหรือบุบสลายอันเนื่องมาจากการดัดแปลงต่อเติมหรือรื้อถอนได้</p>

  <p class="clause">ข้อ&nbsp;14.&nbsp;ผู้เช่าจะต้องสงวนรักษาทรัพย์สินที่เช่าเสมือนด้วยทรัพย์สินของตนเองและต้องทำการรักษาความสะอาดตามปกติ&nbsp;เพื่อไม่ให้เป็นที่เดือดร้อนรำคาญแก่ผู้ใกล้เคียงอีกทั้งต้องไม่ทำการใดๆ&nbsp;อันจะเป็นเหตุให้เดือดร้อนรำคาญกับผู้ที่อยู่ข้างเคียง</p>

  <p class="clause">ข้อ&nbsp;15.&nbsp;ถ้าผู้เช่าผิดสัญญานี้แต่ข้อหนึ่งข้อใด&nbsp;ให้ถือว่าผิดสัญญาทั้งหมด&nbsp;และให้ถือว่าสัญญานี้เป็นอันระงับสิ้นไปโดยผู้ให้เช่าไม่จำเป็นต้องบอกกล่าวเป็นหนังสือไปยังผู้เช่า</p>

  <p class="clause">ข้อ&nbsp;16.&nbsp;ผู้เช่ายอมชดใช้ดอกเบี้ยในอัตราร้อยละ&nbsp;15&nbsp;ต่อปีของยอดเงินค่าเช่าที่ค้างชำระและให้รวมถึงค่าใช้จ่ายต่างๆ&nbsp;ที่ผู้ให้เช่าชำระแทนผู้เช่าตามข้อ&nbsp;5&nbsp;วรรคสอง&nbsp;แก่ผู้ให้เช่าด้วย</p>

  <p class="no-indent">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ในกรณีที่ผู้เช่าจะต้องเสียค่าเสียหายให้แก่ผู้ให้เช่า&nbsp;นอกจากจะชำระเต็มจำนวนแล้วผู้เช่ายังต้องชดใช้ดอกเบี้ยในอัตราร้อยละ&nbsp;15&nbsp;ต่อปีจากยอดเงินค่าเสียหายทั้งหมดนับแต่วันที่ต้องรับผิดจนกว่าจะชำระเสร็จสิ้นพร้อมค่าใช้จ่ายต่างๆ&nbsp;แก่ผู้ให้เช่า</p>

  <p class="clause">ข้อ&nbsp;17.&nbsp;ในกรณีสัญญาเลิกกันไม่ว่าเพราะเหตุใดๆ&nbsp;ผู้เช่าจะต้องขนย้ายทรัพย์สินและบริวารออกไปจากทรัพย์สินที่เช่าและต้องส่งมอบทรัพย์สินที่เช่าคืนให้แก่ผู้ให้เช่าในสภาพปกติที่ผู้ให้เช่าจะใช้ประโยชน์ได้ทันที&nbsp;หากผู้เช่าไม่ยอมขนย้ายทรัพย์สินและบริวาร&nbsp;ไม่ส่งมอบ&nbsp;หรือไม่สามารถส่งมอบทรัพย์สินที่เช่าคืนแก่ผู้ให้เช่าได้&nbsp;ไม่ว่าด้วยเหตุใดที่มิใช่ความผิดของผู้ให้เช่าแล้ว&nbsp;ผู้เช่าจะต้องรับผิดชอบชดใช้ค่าปรับให้แก่ผู้ให้เช่าในอัตราวันละ&nbsp;<u>{{penaltyPerDay}}</u>&nbsp;บาท&nbsp;จนกว่าจะจัดการส่งมอบทรัพย์สินที่เช่าคืนแก่ผู้ให้เช่าในสภาพปกติที่ผู้ให้เช่าจะใช้ประโยชน์ได้&nbsp;และนอกจากนี้แล้วผู้เช่ายังตกลงยินยอมให้ผู้ให้เช่าทำการขนย้ายทรัพย์สินของผู้เช่าและบริวารออกไปจากสถานที่เช่านี้ได้โดยไม่ถือว่าการกระทำดังกล่าวนั้นเป็นการก่อให้เกิดความเสียหายแก่ผู้เช่าหรือเป็นการบุกรุกแต่อย่างใด</p>

  <p class="clause">ข้อ&nbsp;18.&nbsp;ผู้เช่าตกลงยินยอมที่จะนำทรัพย์สินที่เช่าตามข้อ&nbsp;1.&nbsp;นี้ไปทำสัญญาประกันวินาศภัยไว้กับบริษัทประกันภัยเพื่อประกันวินาศภัยอันจะเกิดกับทรัพย์สินที่เช่าตามข้อ&nbsp;1.&nbsp;ตามที่ผู้ให้เช่าจัดหาให้&nbsp;โดยผู้เช่าเป็นผู้ที่จ่ายเบี้ยประกันภัยและระบุให้ผู้ให้เช่าเป็นผู้รับประโยชน์ตามสัญญาดังกล่าว&nbsp;ตลอดระยะเวลาการเช่า</p>

  <p class="clause">ข้อ&nbsp;19.&nbsp;ถ้าในระหว่างการเช่าผู้ให้เช่าตกลงขายทรัพย์สินที่เช่าดังกล่าวตามข้อ&nbsp;1.&nbsp;ก่อนครบกำหนดตามสัญญาเช่านี้&nbsp;ผู้ให้เช่ามีหน้าที่เพียงแจ้งให้ผู้เช่าทราบล่วงหน้า&nbsp;เพื่อให้ผู้เช่าเตรียมตัวออกจากทรัพย์สินที่เช่าเป็นเวลาไม่น้อยกว่า&nbsp;2&nbsp;เดือน&nbsp;และเมื่อผู้ให้เช่าได้ทำการขายทรัพย์สินที่เช่าไปแล้วผู้เช่าจะทำการเรียกร้องค่าเสียหายใดๆ&nbsp;จากผู้ให้เช่ามิได้</p>

  <p class="closing">สัญญานี้ทำขึ้นสองฉบับโดยมีข้อความถูกต้องตรงกันทั้งสองฉบับ&nbsp;และคู่สัญญาทั้งสองฝ่ายได้อ่านและเข้าใจข้อความแห่งสัญญานี้ทั้งหมดแล้ว&nbsp;และเห็นว่าถูกต้องตรงตามเจตนาแห่งตนแล้ว&nbsp;จึงได้ลงลายมือชื่อไว้เป็นหลักฐานต่อหน้าพยานเป็นสำคัญ&nbsp;และต่างฝ่ายต่างยึดถือไว้คนละฉบับ</p>

  <table class="sig-table">
    <tr>
      <td>
        ลงชื่อ&nbsp;<span class="sig-line"></span>&nbsp;ผู้ให้เช่า<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(<span class="sig-name">{{ownerName}}</span>)<br>
        วันที่&nbsp;.........../............./...............
      </td>
      <td>
        ลงชื่อ&nbsp;<span class="sig-line"></span>&nbsp;ผู้เช่า<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(<span class="sig-name">{{tenantName}}</span>)<br>
        วันที่&nbsp;.........../............./...............
      </td>
    </tr>
  </table>

  <table class="witness-table">
    <tr>
      <td>
        ลงชื่อ&nbsp;<span class="sig-line"></span>&nbsp;พยาน<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(<span class="sig-name">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>)
      </td>
      <td>
        ลงชื่อ&nbsp;<span class="sig-line"></span>&nbsp;พยาน<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(<span class="sig-name">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>)
      </td>
    </tr>
  </table>

  <div class="doc-ref">เลขที่สัญญา {{contractId}} ฉบับที่ {{contractVersion}} | สร้างโดยระบบ VARA</div>
  <div class="page-num">หน้า 2/2</div>
</div>

</body>
</html>`;

export function renderTemplate(template: string, data: ContractTemplateData): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    const value = data[key as keyof ContractTemplateData];
    return value ? content : '';
  });
  return result;
}
