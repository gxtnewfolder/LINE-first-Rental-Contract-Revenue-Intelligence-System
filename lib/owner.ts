import prisma from '@/lib/db';
import type { Owner } from '@/app/generated/prisma/client';

export async function upsertOwner(
  lineUserId: string,
  displayName: string,
  pictureUrl?: string,
): Promise<Owner> {
  return prisma.owner.upsert({
    where: { lineUserId },
    create: { lineUserId, displayName, pictureUrl: pictureUrl ?? null, plan: 'LITE' },
    update: { displayName, pictureUrl: pictureUrl ?? null },
  });
}

export async function getOwnerByLineUserId(lineUserId: string): Promise<Owner | null> {
  return prisma.owner.findUnique({ where: { lineUserId } });
}
