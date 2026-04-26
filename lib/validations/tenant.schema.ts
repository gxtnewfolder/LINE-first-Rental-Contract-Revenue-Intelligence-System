import { z } from 'zod';

export const CreateTenantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(9).max(20),
  email: z.string().email().optional(),
  idCard: z.string().max(20).optional(),
  lineUserId: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
});

export const UpdateTenantSchema = CreateTenantSchema.partial();

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;
