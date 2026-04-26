// Transition contract status - POST
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { contractService } from '@/services/contract.service';
import { ContractTransitionSchema } from '@/lib/validations/contract.schema';
import { generateSigningUrl } from '@/lib/signing-token';
import { pushMessage, textMessage } from '@/integrations/line/client';
import prisma from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = ContractTransitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const contract = await contractService.transitionStatus(
      id,
      parsed.data.status,
      parsed.data.reason,
      'api'
    );

    // Auto-push signing link to tenant when contract is sent for signature
    if (parsed.data.status === 'PENDING_SIGNATURE') {
      const full = await prisma.contract.findUnique({
        where: { id },
        include: {
          tenant: true,
          room: { include: { building: true } },
        },
      });

      if (full?.tenant.lineUserId) {
        const signingUrl = generateSigningUrl(id, 'TENANT');
        const msg = textMessage(
          `📄 สัญญาเช่ารอลายเซ็นของคุณ\n\n` +
            `ห้อง ${full.room.building.name} ${full.room.roomNumber}\n` +
            `ค่าเช่า ฿${full.rentAmountTHB.toLocaleString()}/เดือน\n\n` +
            `กดลิงก์เพื่อดูสัญญาและลงลายเซ็น:\n` +
            `${signingUrl}\n\n` +
            `⏰ ลิงก์หมดอายุใน 72 ชั่วโมง`
        );
        await pushMessage(full.tenant.lineUserId, [msg]);
      }
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('POST /api/contracts/[id]/transition error:', error);
    const message = error instanceof Error ? error.message : 'Failed to transition contract';
    const statusCode = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
