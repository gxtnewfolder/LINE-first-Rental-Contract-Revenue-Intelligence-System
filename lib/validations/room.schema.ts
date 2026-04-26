import { z } from 'zod';

const RoomStatusEnum = z.enum(['VACANT', 'OCCUPIED', 'MAINTENANCE']);

export const CreateRoomSchema = z.object({
  buildingId: z.string().min(1, 'Building ID is required'),
  roomNumber: z.string().min(1, 'Room number is required').max(20),
  floor: z.number().int().min(1).optional(),
  sizeSqm: z.number().positive().optional(),
  baseRentTHB: z.number().positive('Base rent must be positive'),
  status: RoomStatusEnum.default('VACANT'),
  description: z.string().max(500).optional(),
});

export const UpdateRoomSchema = CreateRoomSchema.partial();

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;
