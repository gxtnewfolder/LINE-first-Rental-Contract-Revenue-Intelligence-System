// Signing token utilities - JWT-based secure signing links
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';
import type { SignerRole } from '@/app/generated/prisma/client';

const SECRET = config.security.signingSecret || 'dev-signing-secret';

export interface SigningTokenPayload {
  contractId: string;
  role: SignerRole;
  exp: number;
}

/**
 * Generate a signing token for a contract
 */
export function generateSigningToken(
  contractId: string,
  role: SignerRole,
  expiresInHours: number = 72
): string {
  const payload: SigningTokenPayload = {
    contractId,
    role,
    exp: Math.floor(Date.now() / 1000) + expiresInHours * 60 * 60,
  };

  return jwt.sign(payload, SECRET);
}

/**
 * Verify and decode a signing token
 */
export function verifySigningToken(token: string): SigningTokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as SigningTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Generate a full signing URL
 */
export function generateSigningUrl(
  contractId: string,
  role: SignerRole
): string {
  const token = generateSigningToken(contractId, role);
  return `${config.app.url}/sign/${contractId}?token=${token}`;
}
