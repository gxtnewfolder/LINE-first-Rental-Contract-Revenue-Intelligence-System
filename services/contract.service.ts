// Contract service - CRUD and lifecycle management
import prisma from '@/lib/db';
import type { Contract, ContractStatus } from '@/app/generated/prisma/client';
import { isValidTransition } from '@/domain/contract/types';

export type CreateContractInput = {
  roomId: string;
  tenantId: string;
  startDate: Date | string;
  endDate: Date | string;
  rentAmountTHB: number;
  depositTHB: number;
  notes?: string;
};

export type UpdateContractInput = Partial<Omit<CreateContractInput, 'roomId' | 'tenantId'>>;

export type ContractWithRelations = Contract & {
  room: { id: string; roomNumber: string; building: { id: string; name: string } };
  tenant: { id: string; name: string; phone: string };
};

export const contractService = {
  /**
   * Get all contracts with filters
   */
  async findAll(filters?: {
    status?: ContractStatus;
    roomId?: string;
    tenantId?: string;
  }): Promise<ContractWithRelations[]> {
    return prisma.contract.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.roomId && { roomId: filters.roomId }),
        ...(filters?.tenantId && { tenantId: filters.tenantId }),
      },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            building: { select: { id: true, name: true } },
          },
        },
        tenant: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get expiring contracts (within N days)
   */
  async findExpiring(daysAhead: number = 30): Promise<ContractWithRelations[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return prisma.contract.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING'] },
        endDate: { lte: futureDate, gte: now },
      },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            building: { select: { id: true, name: true } },
          },
        },
        tenant: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { endDate: 'asc' },
    });
  },

  /**
   * Get a single contract by ID with full details
   */
  async findById(id: string) {
    return prisma.contract.findUnique({
      where: { id },
      include: {
        room: {
          include: { building: true },
        },
        tenant: true,
        signatures: true,
        transitions: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
        },
        previous: true,
        renewals: true,
      },
    });
  },

  /**
   * Create a new contract (DRAFT status)
   */
  async create(data: CreateContractInput): Promise<Contract> {
    // Validate room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
      include: {
        contracts: {
          where: {
            status: { in: ['ACTIVE', 'EXPIRING', 'SIGNED', 'PENDING_SIGNATURE'] },
          },
        },
      },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    if (room.contracts.length > 0) {
      throw new Error('Room already has an active contract');
    }

    // Validate tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    // Validate amounts
    if (data.rentAmountTHB <= 0) {
      throw new Error('Rent amount must be greater than 0');
    }

    if (data.depositTHB < 0) {
      throw new Error('Deposit cannot be negative');
    }

    // Create contract with initial transition
    return prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          roomId: data.roomId,
          tenantId: data.tenantId,
          startDate,
          endDate,
          rentAmountTHB: data.rentAmountTHB,
          depositTHB: data.depositTHB,
          notes: data.notes?.trim() || null,
          status: 'DRAFT',
          version: 1,
        },
      });

      // Log initial state
      await tx.contractStateTransition.create({
        data: {
          contractId: contract.id,
          fromState: 'DRAFT',
          toState: 'DRAFT',
          reason: 'Contract created',
          triggeredBy: 'system',
        },
      });

      return contract;
    });
  },

  /**
   * Update contract (only in DRAFT status)
   */
  async update(id: string, data: UpdateContractInput): Promise<Contract> {
    const existing = await prisma.contract.findUnique({ where: { id } });

    if (!existing) {
      throw new Error('Contract not found');
    }

    if (existing.status !== 'DRAFT') {
      throw new Error('Only draft contracts can be edited');
    }

    // Validate dates if provided
    if (data.startDate || data.endDate) {
      const startDate = new Date(data.startDate || existing.startDate);
      const endDate = new Date(data.endDate || existing.endDate);

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    return prisma.contract.update({
      where: { id },
      data: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.rentAmountTHB !== undefined && { rentAmountTHB: data.rentAmountTHB }),
        ...(data.depositTHB !== undefined && { depositTHB: data.depositTHB }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      },
    });
  },

  /**
   * Transition contract to new status
   */
  async transitionStatus(
    id: string,
    newStatus: ContractStatus,
    reason?: string,
    triggeredBy: string = 'system'
  ): Promise<Contract> {
    const contract = await prisma.contract.findUnique({ where: { id } });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (!isValidTransition(contract.status, newStatus)) {
      throw new Error(`Invalid transition from ${contract.status} to ${newStatus}`);
    }

    return prisma.$transaction(async (tx) => {
      // Update contract status
      const updated = await tx.contract.update({
        where: { id },
        data: { status: newStatus },
      });

      // Log transition
      await tx.contractStateTransition.create({
        data: {
          contractId: id,
          fromState: contract.status,
          toState: newStatus,
          reason: reason || `Status changed to ${newStatus}`,
          triggeredBy,
        },
      });

      // Handle room status updates
      if (newStatus === 'ACTIVE') {
        await tx.room.update({
          where: { id: contract.roomId },
          data: { status: 'OCCUPIED' },
        });
      } else if (newStatus === 'TERMINATED') {
        await tx.room.update({
          where: { id: contract.roomId },
          data: { status: 'VACANT' },
        });
      }

      return updated;
    });
  },

  /**
   * Set PDF URL after generation
   */
  async setPdfUrl(id: string, pdfUrl: string): Promise<Contract> {
    return prisma.contract.update({
      where: { id },
      data: { pdfUrl },
    });
  },

  /**
   * Create renewal contract
   */
  async renew(
    previousId: string,
    data: Omit<CreateContractInput, 'roomId' | 'tenantId'>
  ): Promise<Contract> {
    const previous = await prisma.contract.findUnique({
      where: { id: previousId },
    });

    if (!previous) {
      throw new Error('Previous contract not found');
    }

    if (!['ACTIVE', 'EXPIRING'].includes(previous.status)) {
      throw new Error('Can only renew active or expiring contracts');
    }

    return prisma.$transaction(async (tx) => {
      // Mark previous as renewed
      await tx.contract.update({
        where: { id: previousId },
        data: { status: 'RENEWED' },
      });

      await tx.contractStateTransition.create({
        data: {
          contractId: previousId,
          fromState: previous.status,
          toState: 'RENEWED',
          reason: 'Contract renewed',
          triggeredBy: 'system',
        },
      });

      // Create new contract
      const newContract = await tx.contract.create({
        data: {
          roomId: previous.roomId,
          tenantId: previous.tenantId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          rentAmountTHB: data.rentAmountTHB,
          depositTHB: data.depositTHB,
          notes: data.notes?.trim() || null,
          status: 'DRAFT',
          version: previous.version + 1,
          previousId,
        },
      });

      await tx.contractStateTransition.create({
        data: {
          contractId: newContract.id,
          fromState: 'DRAFT',
          toState: 'DRAFT',
          reason: `Renewed from contract v${previous.version}`,
          triggeredBy: 'system',
        },
      });

      return newContract;
    });
  },

  /**
   * Delete contract (only DRAFT)
   */
  async delete(id: string): Promise<void> {
    const contract = await prisma.contract.findUnique({ where: { id } });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== 'DRAFT') {
      throw new Error('Only draft contracts can be deleted');
    }

    await prisma.$transaction(async (tx) => {
      await tx.contractStateTransition.deleteMany({ where: { contractId: id } });
      await tx.contract.delete({ where: { id } });
    });
  },
};
