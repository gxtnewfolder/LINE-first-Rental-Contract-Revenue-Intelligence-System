import React from 'react';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { DashboardShell } from './dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const plan = (session?.plan ?? 'LITE') as 'LITE' | 'PRO';
  const isAdmin = session ? config.line.ownerLineIds.includes(session.lineUserId) : false;

  return (
    <DashboardShell plan={plan} displayName={session?.displayName} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  );
}
