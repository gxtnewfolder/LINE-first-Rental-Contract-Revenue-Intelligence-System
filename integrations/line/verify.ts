// LINE webhook verification utilities
import { verifySignature } from './client';

export { verifySignature };

/**
 * Validate webhook request
 */
export function validateWebhookRequest(
  body: string,
  signature: string | null
): { valid: boolean; error?: string } {
  if (!signature) {
    return { valid: false, error: 'Missing X-Line-Signature header' };
  }

  if (!verifySignature(body, signature)) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true };
}
