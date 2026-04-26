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
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/',          label: 'ภาพรวม',  icon: LayoutDashboard },
  { href: '/rooms',     label: 'ห้อง',     icon: Key },
  { href: '/contracts', label: 'สัญญา',   icon: FileText },
  { href: '/tenants',   label: 'ผู้เช่า',  icon: Users },
  { href: '/analytics', label: 'รายงาน',  icon: BarChart3 },
];

const SIDEBAR_ITEMS = [
  { href: '/',               label: 'ภาพรวม',   icon: LayoutDashboard },
  { href: '/buildings',      label: 'อาคาร',     icon: Building2 },
  { href: '/rooms',          label: 'ห้องพัก',   icon: Key },
  { href: '/tenants',        label: 'ผู้เช่า',   icon: Users },
  { href: '/contracts',      label: 'สัญญา',     icon: FileText },
  { href: '/analytics',      label: 'รายงาน',    icon: BarChart3 },
  { href: '/settings/line',  label: 'LINE OA',   icon: MessageSquare },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar — desktop only ──────────────────────────────── */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card">

        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-base font-black text-white tracking-tight">u</span>
          </div>
          <div className="leading-none">
            <p className="text-base font-black text-foreground tracking-tight">
              u<span className="text-primary">Sabai</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">อยู่สบาย ง่ายแค่ปลายนิ้ว</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-border">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/6 transition-all duration-150"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5">
            <div className="lg:hidden w-7 h-7 rounded-lg brand-gradient flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-white">u</span>
            </div>
            <span className="font-black text-sm text-foreground">
              u<span className="text-primary">Sabai</span>
            </span>
          </div>

          {/* Mobile: sign out */}
          <form action="/api/auth/logout" method="POST" className="lg:hidden">
            <button type="submit" className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* ── Bottom nav — mobile only ─────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-50 safe-area-pb">
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className={cn(
                  'w-8 h-6 flex items-center justify-center rounded-full transition-all',
                  active && 'bg-primary/10'
                )}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
