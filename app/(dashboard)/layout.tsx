'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Key,
  Users,
  FileText,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/buildings', label: 'Buildings', icon: Building2 },
  { href: '/rooms', label: 'Rooms', icon: Key },
  { href: '/tenants', label: 'Tenants', icon: Users },
  { href: '/contracts', label: 'Contracts', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find(i => i.href === pathname)?.label ?? 'Page';

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-border">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-primary-foreground tracking-tight">V</span>
          </div>
          <span className="text-sm font-black tracking-widest text-foreground uppercase">VARA</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary' : '')} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-border">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">VARA</span>
            <span className="text-border">/</span>
            <span className="font-semibold text-foreground">{currentPage}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
