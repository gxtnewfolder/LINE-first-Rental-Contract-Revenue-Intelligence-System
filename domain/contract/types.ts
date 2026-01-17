// Contract domain types
// Business logic for contract lifecycle management

import type { ContractStatus } from '@/app/generated/prisma/client';

/**
 * Valid state transitions for contracts
 */
export const CONTRACT_STATE_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: ['PENDING_SIGNATURE'],
  PENDING_SIGNATURE: ['SIGNED', 'DRAFT'],
  SIGNED: ['ACTIVE'],
  ACTIVE: ['EXPIRING'],
  EXPIRING: ['RENEWED', 'TERMINATED'],
  RENEWED: [],
  TERMINATED: [],
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  from: ContractStatus,
  to: ContractStatus
): boolean {
  return CONTRACT_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}
