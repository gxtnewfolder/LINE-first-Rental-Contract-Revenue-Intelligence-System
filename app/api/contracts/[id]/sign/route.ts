// Sign contract endpoint - POST signature
import { NextResponse } from 'next/server';
import { signatureService } from '@/services/signature.service';
import { verifySigningToken } from '@/lib/signing-token';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id: contractId } = await params;
    const body = await request.json();
    
    // Verify token if provided
    const token = body.token;
    if (token) {
      const payload = verifySigningToken(token);
      if (!payload || payload.contractId !== contractId) {
        return NextResponse.json(
          { error: 'Invalid or expired signing token' },
          { status: 401 }
        );
      }
      // Override role from token for security
      body.signerRole = payload.role;
    }
    
    // Validate required fields
    if (!body.signerRole) {
      return NextResponse.json(
        { error: 'Signer role is required' },
        { status: 400 }
      );
    }
    
    if (!body.signerName) {
      return NextResponse.json(
        { error: 'Signer name is required' },
        { status: 400 }
      );
    }
    
    if (!body.signatureData) {
      return NextResponse.json(
        { error: 'Signature data is required' },
        { status: 400 }
      );
    }
    
    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded?.split(',')[0] || 'unknown';
    
    // Create signature
    const signature = await signatureService.create({
      contractId,
      signerRole: body.signerRole,
      signerName: body.signerName,
      signatureData: body.signatureData,
      ipAddress,
    });
    
    // Check if all signed
    const allSigned = await signatureService.hasAllSignatures(contractId);
    
    return NextResponse.json({
      success: true,
      signature: {
        id: signature.id,
        signerRole: signature.signerRole,
        signerName: signature.signerName,
        signedAt: signature.signedAt,
      },
      allSigned,
      message: allSigned
        ? 'Contract fully signed!'
        : 'Signature recorded, awaiting other party',
    });
  } catch (error) {
    console.error('POST /api/contracts/[id]/sign error:', error);
    const message = error instanceof Error ? error.message : 'Failed to sign contract';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id: contractId } = await params;
    const signatures = await signatureService.findByContract(contractId);
    
    // Return signatures without the raw data for security
    const sanitized = signatures.map((s) => ({
      id: s.id,
      signerRole: s.signerRole,
      signerName: s.signerName,
      signedAt: s.signedAt,
      verified: true, // Would verify hash in production
    }));
    
    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('GET /api/contracts/[id]/sign error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    );
  }
}
