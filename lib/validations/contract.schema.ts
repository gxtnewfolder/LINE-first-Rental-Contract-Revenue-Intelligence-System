import { z } from 'zod';

export const CreateContractSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  startDate: z.string().datetime({ message: 'startDate must be ISO 8601' }),
  endDate: z.string().datetime({ message: 'endDate must be ISO 8601' }),
  rentAmountTHB: z.number().positive('Rent amount must be positive'),
  depositTHB: z.number().min(0),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'endDate must be after startDate', path: ['endDate'] }
);

export const UpdateContractSchema = z.object({
  notes: z.string().max(1000).optional(),
  rentAmountTHB: z.number().positive().optional(),
  depositTHB: z.number().min(0).optional(),
  endDate: z.string().datetime().optional(),
});

export const ContractTransitionSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'ACTIVE', 'EXPIRING', 'RENEWED', 'TERMINATED']),
  reason: z.string().max(500).optional(),
});

export type CreateContractInput = z.infer<typeof CreateContractSchema>;
export type UpdateContractInput = z.infer<typeof UpdateContractSchema>;
export type ContractTransitionInput = z.infer<typeof ContractTransitionSchema>;
