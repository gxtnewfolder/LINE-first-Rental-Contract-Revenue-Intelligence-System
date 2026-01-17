// Signature service - manage contract signatures
import prisma from '@/lib/db';
import { createHash } from 'crypto';
import type { ContractSignature, SignerRole } from '@/app/generated/prisma/client';
import { contractService } from './contract.service';

export type CreateSignatureInput = {
  contractId: string;
  signerRole: SignerRole;
  signerName: string;
  signatureData: string; // Base64 image data
  ipAddress?: string;
};

export const signatureService = {
  /**
   * Get all signatures for a contract
   */
  async findByContract(contractId: string): Promise<ContractSignature[]> {
    return prisma.contractSignature.findMany({
      where: { contractId },
      orderBy: { signedAt: 'asc' },
    });
  },

  /**
   * Check if contract has all required signatures
   */
  async hasAllSignatures(contractId: string): Promise<boolean> {
    const signatures = await this.findByContract(contractId);
    const roles = signatures.map((s) => s.signerRole);
    return roles.includes('OWNER') && roles.includes('TENANT');
  },

  /**
   * Create a signature
   */
  async create(data: CreateSignatureInput): Promise<ContractSignature> {
    // Validate contract exists and is in signable state
    const contract = await prisma.contract.findUnique({
      where: { id: data.contractId },
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (!['PENDING_SIGNATURE', 'SIGNED'].includes(contract.status)) {
      throw new Error('Contract is not in a signable state');
    }

    // Check if this role already signed
    const existingSignature = await prisma.contractSignature.findFirst({
      where: {
        contractId: data.contractId,
        signerRole: data.signerRole,
      },
    });

    if (existingSignature) {
      throw new Error(`${data.signerRole} has already signed this contract`);
    }

    // Validate signature data
    if (!data.signatureData?.startsWith('data:image/')) {
      throw new Error('Invalid signature data format');
    }

    // Generate hash for integrity verification
    const signatureHash = createHash('sha256')
      .update(data.signatureData)
      .digest('hex');

    // Create signature in transaction
    return prisma.$transaction(async (tx) => {
      const signature = await tx.contractSignature.create({
        data: {
          contractId: data.contractId,
          signerRole: data.signerRole,
          signerName: data.signerName.trim(),
          signatureData: data.signatureData,
          signatureHash,
          ipAddress: data.ipAddress || null,
          signedAt: new Date(),
        },
      });

      // Check if all parties have signed
      const allSigned = await this.checkAllSignedInTransaction(tx, data.contractId);

      if (allSigned && contract.status === 'PENDING_SIGNATURE') {
        // Transition to SIGNED status
        await tx.contract.update({
          where: { id: data.contractId },
          data: { status: 'SIGNED' },
        });

        await tx.contractStateTransition.create({
          data: {
            contractId: data.contractId,
            fromState: 'PENDING_SIGNATURE',
            toState: 'SIGNED',
            reason: 'All parties have signed',
            triggeredBy: 'signature_service',
          },
        });
      }

      return signature;
    });
  },

  /**
   * Check all signed within transaction
   */
  async checkAllSignedInTransaction(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    contractId: string
  ): Promise<boolean> {
    const signatures = await tx.contractSignature.findMany({
      where: { contractId },
    });
    const roles = signatures.map((s) => s.signerRole);
    return roles.includes('OWNER') && roles.includes('TENANT');
  },

  /**
   * Verify signature hash
   */
  async verifySignature(signatureId: string): Promise<boolean> {
    const signature = await prisma.contractSignature.findUnique({
      where: { id: signatureId },
    });

    if (!signature) {
      return false;
    }

    const computedHash = createHash('sha256')
      .update(signature.signatureData)
      .digest('hex');

    return computedHash === signature.signatureHash;
  },

  /**
   * Delete signature (only if contract is still signable)
   */
  async delete(signatureId: string): Promise<void> {
    const signature = await prisma.contractSignature.findUnique({
      where: { id: signatureId },
      include: { contract: true },
    });

    if (!signature) {
      throw new Error('Signature not found');
    }

    if (signature.contract.status === 'ACTIVE') {
      throw new Error('Cannot delete signature from active contract');
    }

    await prisma.contractSignature.delete({
      where: { id: signatureId },
    });
  },
};
