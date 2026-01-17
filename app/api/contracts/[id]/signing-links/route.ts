// Generate signing links for contract - POST
import { NextResponse } from 'next/server';
import { contractService } from '@/services/contract.service';
import { generateSigningUrl } from '@/lib/signing-token';

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id: contractId } = await params;
    
    // Verify contract exists and is signable
    const contract = await contractService.findById(contractId);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    if (!['PENDING_SIGNATURE'].includes(contract.status)) {
      return NextResponse.json(
        { error: 'Contract is not ready for signing' },
        { status: 400 }
      );
    }
    
    // Generate signing URLs
    const ownerUrl = generateSigningUrl(contractId, 'OWNER');
    const tenantUrl = generateSigningUrl(contractId, 'TENANT');
    
    return NextResponse.json({
      success: true,
      links: {
        owner: ownerUrl,
        tenant: tenantUrl,
      },
      expiresIn: '72 hours',
      message: 'Share these links with the respective parties to sign',
    });
  } catch (error) {
    console.error('POST /api/contracts/[id]/signing-links error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signing links' },
      { status: 500 }
    );
  }
}
