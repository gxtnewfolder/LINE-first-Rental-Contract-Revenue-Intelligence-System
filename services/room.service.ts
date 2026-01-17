// Room service - CRUD operations for rooms
import prisma from '@/lib/db';
import type { Room, RoomStatus } from '@/app/generated/prisma/client';

export type CreateRoomInput = {
  buildingId: string;
  roomNumber: string;
  floor?: number;
  sizeSqm?: number;
  baseRentTHB: number;
  status?: RoomStatus;
  description?: string;
};

export type UpdateRoomInput = Partial<Omit<CreateRoomInput, 'buildingId'>>;

export type RoomWithBuilding = Room & {
  building: { id: string; name: string };
};

export const roomService = {
  /**
   * Get all rooms with building info
   */
  async findAll(filters?: { buildingId?: string; status?: RoomStatus }): Promise<RoomWithBuilding[]> {
    return prisma.room.findMany({
      where: {
        ...(filters?.buildingId && { buildingId: filters.buildingId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        building: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { building: { name: 'asc' } },
        { floor: 'asc' },
        { roomNumber: 'asc' },
      ],
    });
  },

  /**
   * Get vacant rooms only
   */
  async findVacant(): Promise<RoomWithBuilding[]> {
    return this.findAll({ status: 'VACANT' });
  },

  /**
   * Get a single room by ID with contracts
   */
  async findById(id: string) {
    return prisma.room.findUnique({
      where: { id },
      include: {
        building: true,
        contracts: {
          where: {
            status: { in: ['ACTIVE', 'EXPIRING', 'SIGNED'] },
          },
          include: {
            tenant: true,
          },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });
  },

  /**
   * Create a new room
   */
  async create(data: CreateRoomInput): Promise<Room> {
    // Validate building exists
    const building = await prisma.building.findUnique({
      where: { id: data.buildingId },
    });
    if (!building) {
      throw new Error('Building not found');
    }

    // Validate room number
    if (!data.roomNumber?.trim()) {
      throw new Error('Room number is required');
    }

    // Validate rent
    if (!data.baseRentTHB || data.baseRentTHB <= 0) {
      throw new Error('Base rent must be greater than 0');
    }

    // Check for duplicate room number in building
    const existing = await prisma.room.findFirst({
      where: {
        buildingId: data.buildingId,
        roomNumber: data.roomNumber.trim(),
      },
    });
    if (existing) {
      throw new Error('Room number already exists in this building');
    }

    return prisma.room.create({
      data: {
        buildingId: data.buildingId,
        roomNumber: data.roomNumber.trim(),
        floor: data.floor ?? 1,
        sizeSqm: data.sizeSqm ?? null,
        baseRentTHB: data.baseRentTHB,
        status: data.status ?? 'VACANT',
        description: data.description?.trim() || null,
      },
    });
  },

  /**
   * Update a room
   */
  async update(id: string, data: UpdateRoomInput): Promise<Room> {
    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Room not found');
    }

    // Validate rent if provided
    if (data.baseRentTHB !== undefined && data.baseRentTHB <= 0) {
      throw new Error('Base rent must be greater than 0');
    }

    return prisma.room.update({
      where: { id },
      data: {
        ...(data.roomNumber && { roomNumber: data.roomNumber.trim() }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.sizeSqm !== undefined && { sizeSqm: data.sizeSqm }),
        ...(data.baseRentTHB !== undefined && { baseRentTHB: data.baseRentTHB }),
        ...(data.status && { status: data.status }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
      },
    });
  },

  /**
   * Update room status
   */
  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Room not found');
    }

    return prisma.room.update({
      where: { id },
      data: { status },
    });
  },

  /**
   * Delete a room (only if no active contracts)
   */
  async delete(id: string): Promise<void> {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        contracts: {
          where: {
            status: { in: ['ACTIVE', 'EXPIRING', 'PENDING_SIGNATURE', 'SIGNED'] },
          },
        },
      },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    if (room.contracts.length > 0) {
      throw new Error('Cannot delete room with active contracts');
    }

    await prisma.room.delete({ where: { id } });
  },
};
