import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { AdminOwnersClient } from './client';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || !config.line.ownerLineIds.includes(session.lineUserId)) {
    redirect('/');
  }

  const owners = await prisma.owner.findMany({
    include: { _count: { select: { buildings: true, tenants: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <AdminOwnersClient
      owners={owners.map(o => ({ ...o, createdAt: o.createdAt.toISOString() }))}
    />
  );
}
