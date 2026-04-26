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
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/rooms', label: 'ห้อง', icon: Key },
  { href: '/contracts', label: 'สัญญา', icon: FileText },
  { href: '/tenants', label: 'ผู้เช่า', icon: Users },
  { href: '/analytics', label: 'รายงาน', icon: BarChart3 },
];

const SIDEBAR_ITEMS = [
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/buildings', label: 'อาคาร', icon: Building2 },
  { href: '/rooms', label: 'ห้องพัก', icon: Key },
  { href: '/tenants', label: 'ผู้เช่า', icon: Users },
  { href: '/contracts', label: 'สัญญา', icon: FileText },
  { href: '/analytics', label: 'รายงาน', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPage = SIDEBAR_ITEMS.find(i => i.href === pathname)?.label ?? '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-white shadow-sm">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-black text-white">V</span>
          </div>
          <div>
            <p className="text-sm font-black tracking-widest text-foreground uppercase leading-none">VARA</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Property Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-4 py-5 border-t border-border">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 lg:h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-white shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            {/* Mobile: show VARA logo */}
            <div className="lg:hidden w-7 h-7 rounded-lg bg-primary flex items-center justify-center mr-1">
              <span className="text-xs font-black text-white">V</span>
            </div>
            <span className="text-muted-foreground hidden lg:inline">VARA</span>
            <span className="text-border mx-1 hidden lg:inline">/</span>
            <span className="font-bold text-foreground">{currentPage || 'VARA'}</span>
          </div>

          {/* Mobile: sign out button */}
          <form action="/api/auth/logout" method="POST" className="lg:hidden">
            <button type="submit" className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </header>

        {/* Scrollable content — add bottom padding on mobile for the nav bar */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border z-50">
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'text-primary')} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
