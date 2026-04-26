// Building service - CRUD operations for buildings
import prisma from '@/lib/db';
import type { Building } from '@/app/generated/prisma/client';

export type CreateBuildingInput = {
  name: string;
  address?: string;
  ownerId?: string;
};

export type UpdateBuildingInput = Partial<Omit<CreateBuildingInput, 'ownerId'>>;

export const buildingService = {
  async findAll(ownerId?: string): Promise<(Building & { _count: { rooms: number } })[]> {
    return prisma.building.findMany({
      where: ownerId ? { ownerId } : {},
      include: { _count: { select: { rooms: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.building.findUnique({
      where: { id },
      include: { rooms: { orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }] } },
    });
  },

  async create(data: CreateBuildingInput): Promise<Building> {
    if (!data.name?.trim()) throw new Error('Building name is required');
    return prisma.building.create({
      data: {
        name: data.name.trim(),
        address: data.address?.trim() || null,
        ownerId: data.ownerId ?? null,
      },
    });
  },

  async update(id: string, data: UpdateBuildingInput): Promise<Building> {
    const existing = await prisma.building.findUnique({ where: { id } });
    if (!existing) throw new Error('Building not found');
    return prisma.building.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
      },
    });
  },

  async delete(id: string): Promise<void> {
    const building = await prisma.building.findUnique({
      where: { id },
      include: { _count: { select: { rooms: true } } },
    });
    if (!building) throw new Error('Building not found');
    if (building._count.rooms > 0) throw new Error('Cannot delete building with existing rooms');
    await prisma.building.delete({ where: { id } });
  },

  async countByOwner(ownerId: string): Promise<number> {
    return prisma.building.count({ where: { ownerId } });
  },
};
