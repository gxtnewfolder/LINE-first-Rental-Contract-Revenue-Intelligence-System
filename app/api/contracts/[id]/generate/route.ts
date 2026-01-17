// Generate contract PDF/HTML - POST
import { NextResponse } from 'next/server';
import { generateContract } from '@/integrations/pdf';
import { contractService } from '@/services/contract.service';

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    // Verify contract exists
    const contract = await contractService.findById(id);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Generate document
    const result = await generateContract(id);
    
    // Transition to PENDING_SIGNATURE if in DRAFT
    if (contract.status === 'DRAFT') {
      await contractService.transitionStatus(
        id,
        'PENDING_SIGNATURE',
        'Document generated, ready for signatures'
      );
    }
    
    return NextResponse.json({
      success: true,
      url: result.url,
      message: 'Contract document generated',
    });
  } catch (error) {
    console.error('POST /api/contracts/[id]/generate error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate contract';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
