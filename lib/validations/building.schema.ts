import { z } from 'zod';

export const CreateBuildingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().max(500).optional(),
});

export const UpdateBuildingSchema = CreateBuildingSchema.partial();

export type CreateBuildingInput = z.infer<typeof CreateBuildingSchema>;
export type UpdateBuildingInput = z.infer<typeof UpdateBuildingSchema>;
