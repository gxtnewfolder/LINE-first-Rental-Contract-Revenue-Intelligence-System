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
  { href: '/buildings', label: 'อาคาร', icon: Building2 },
  { href: '/rooms', label: 'ห้องพัก', icon: Key },
  { href: '/tenants', label: 'ผู้เช่า', icon: Users },
  { href: '/contracts', label: 'สัญญา', icon: FileText },
  { href: '/analytics', label: 'รายงาน', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find(i => i.href === pathname)?.label ?? '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-white shadow-sm">
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
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-border bg-white shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">VARA</span>
            <span className="text-border mx-1">/</span>
            <span className="font-bold text-foreground">{currentPage}</span>
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
