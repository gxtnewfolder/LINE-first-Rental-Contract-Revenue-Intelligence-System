// PDF generation service
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import {
  renderTemplate,
  defaultContractTemplate,
  numberToThaiText,
  type ContractTemplateData,
} from './templates/rental-contract';

// Owner info (would come from config in production)
const OWNER_INFO = {
  name: 'เจ้าของตึก', // Replace with actual owner name
  address: 'กรุงเทพมหานคร',
  idCard: 'X-XXXX-XXXXX-XX-X',
};

/**
 * Format date to Thai format
 */
function formatThaiDate(date: Date): string {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Buddhist year
  
  return `${day} ${month} ${year}`;
}

/**
 * Calculate months between two dates
 */
function getMonthsDiff(start: Date, end: Date): number {
  const months = (end.getFullYear() - start.getFullYear()) * 12;
  return months + end.getMonth() - start.getMonth();
}

/**
 * Generate contract HTML from database
 */
export async function generateContractHtml(contractId: string): Promise<string> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      room: {
        include: { building: true },
      },
      tenant: true,
    },
  });

  if (!contract) {
    throw new Error('Contract not found');
  }

  const templateData: ContractTemplateData = {
    contractId: contract.id.slice(-8).toUpperCase(),
    contractVersion: contract.version,
    contractDate: formatThaiDate(new Date()),
    
    buildingName: contract.room.building.name,
    roomNumber: contract.room.roomNumber,
    roomSizeSqm: contract.room.sizeSqm,
    roomAddress: contract.room.building.address || 'กรุงเทพมหานคร',
    
    ownerName: OWNER_INFO.name,
    ownerAddress: OWNER_INFO.address,
    ownerIdCard: OWNER_INFO.idCard,
    
    tenantName: contract.tenant.name,
    tenantPhone: contract.tenant.phone,
    tenantIdCard: contract.tenant.idCard || 'X-XXXX-XXXXX-XX-X',
    tenantAddress: contract.tenant.address || 'ไม่ระบุ',
    
    startDate: formatThaiDate(contract.startDate),
    endDate: formatThaiDate(contract.endDate),
    durationMonths: getMonthsDiff(contract.startDate, contract.endDate),
    rentAmountTHB: contract.rentAmountTHB,
    rentAmountText: numberToThaiText(contract.rentAmountTHB),
    depositTHB: contract.depositTHB,
    depositText: numberToThaiText(contract.depositTHB),
    paymentDueDay: 5,
  };

  return renderTemplate(defaultContractTemplate, templateData);
}

/**
 * Save HTML to file system
 */
export async function saveContractHtml(
  contractId: string,
  html: string,
  isDraft: boolean = true
): Promise<string> {
  const folder = isDraft ? 'drafts' : 'signed';
  const dir = path.join(process.cwd(), 'public', 'contracts', folder);
  
  // Ensure directory exists
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  
  const filename = `${contractId}.html`;
  const filepath = path.join(dir, filename);
  
  await writeFile(filepath, html, 'utf-8');
  
  return `/contracts/${folder}/${filename}`;
}

/**
 * Generate and save contract document
 */
export async function generateContract(contractId: string): Promise<{
  html: string;
  url: string;
}> {
  // Generate HTML
  const html = await generateContractHtml(contractId);
  
  // Save to file system
  const url = await saveContractHtml(contractId, html, true);
  
  // Update contract with PDF URL
  await prisma.contract.update({
    where: { id: contractId },
    data: { pdfUrl: url },
  });
  
  return { html, url };
}

/**
 * Get storage path for contract
 */
export function getContractStoragePath(contractId: string, version: number, isSigned: boolean): string {
  const folder = isSigned ? 'signed' : 'drafts';
  return `/contracts/${folder}/${contractId}_v${version}.html`;
}
