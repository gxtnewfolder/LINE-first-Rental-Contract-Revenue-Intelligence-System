// Tenant service - CRUD operations for tenants
import prisma from '@/lib/db';
import type { Tenant } from '@/app/generated/prisma/client';

export type CreateTenantInput = {
  name: string;
  phone: string;
  email?: string;
  idCard?: string;
  lineUserId?: string;
  address?: string;
};

export type UpdateTenantInput = Partial<CreateTenantInput>;

export type TenantWithContracts = Tenant & {
  _count: { contracts: number };
};

export const tenantService = {
  /**
   * Get all tenants with contract counts
   */
  async findAll(): Promise<TenantWithContracts[]> {
    return prisma.tenant.findMany({
      include: {
        _count: {
          select: { contracts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Get a single tenant by ID with contracts
   */
  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        contracts: {
          include: {
            room: {
              include: { building: true },
            },
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });
  },

  /**
   * Find tenant by LINE user ID
   */
  async findByLineUserId(lineUserId: string) {
    return prisma.tenant.findUnique({
      where: { lineUserId },
    });
  },

  /**
   * Find tenant by phone number
   */
  async findByPhone(phone: string) {
    return prisma.tenant.findFirst({
      where: { phone: phone.trim() },
    });
  },

  /**
   * Create a new tenant
   */
  async create(data: CreateTenantInput): Promise<Tenant> {
    // Validate required fields
    if (!data.name?.trim()) {
      throw new Error('Tenant name is required');
    }
    if (!data.phone?.trim()) {
      throw new Error('Phone number is required');
    }

    // Validate phone format (basic Thai format)
    const phoneRegex = /^[0-9]{3}[-]?[0-9]{3}[-]?[0-9]{4}$/;
    const cleanPhone = data.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      throw new Error('Invalid phone number format');
    }

    // Check for duplicate phone
    const existingPhone = await prisma.tenant.findFirst({
      where: { phone: data.phone.trim() },
    });
    if (existingPhone) {
      throw new Error('Phone number already registered');
    }

    // Check for duplicate LINE user ID
    if (data.lineUserId) {
      const existingLine = await prisma.tenant.findUnique({
        where: { lineUserId: data.lineUserId },
      });
      if (existingLine) {
        throw new Error('LINE user ID already registered');
      }
    }

    return prisma.tenant.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        idCard: data.idCard?.trim() || null,
        lineUserId: data.lineUserId || null,
        address: data.address?.trim() || null,
      },
    });
  },

  /**
   * Update a tenant
   */
  async update(id: string, data: UpdateTenantInput): Promise<Tenant> {
    const existing = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Tenant not found');
    }

    // Check for duplicate phone if changing
    if (data.phone && data.phone !== existing.phone) {
      const existingPhone = await prisma.tenant.findFirst({
        where: { phone: data.phone.trim(), id: { not: id } },
      });
      if (existingPhone) {
        throw new Error('Phone number already registered');
      }
    }

    // Check for duplicate LINE user ID if changing
    if (data.lineUserId && data.lineUserId !== existing.lineUserId) {
      const existingLine = await prisma.tenant.findFirst({
        where: { lineUserId: data.lineUserId, id: { not: id } },
      });
      if (existingLine) {
        throw new Error('LINE user ID already registered');
      }
    }

    return prisma.tenant.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.email !== undefined && { email: data.email?.trim() || null }),
        ...(data.idCard !== undefined && { idCard: data.idCard?.trim() || null }),
        ...(data.lineUserId !== undefined && { lineUserId: data.lineUserId || null }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
      },
    });
  },

  /**
   * Link LINE user ID to tenant
   */
  async linkLineUser(id: string, lineUserId: string): Promise<Tenant> {
    return this.update(id, { lineUserId });
  },

  /**
   * Delete a tenant (only if no active contracts)
   */
  async delete(id: string): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        contracts: {
          where: {
            status: { in: ['ACTIVE', 'EXPIRING', 'PENDING_SIGNATURE', 'SIGNED'] },
          },
        },
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (tenant.contracts.length > 0) {
      throw new Error('Cannot delete tenant with active contracts');
    }

    await prisma.tenant.delete({ where: { id } });
  },
};
