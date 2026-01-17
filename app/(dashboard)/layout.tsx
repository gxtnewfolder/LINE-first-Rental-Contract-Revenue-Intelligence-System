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
  TrendingUp, 
  Bell, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/buildings', label: 'Buildings', icon: Building2 },
  { href: '/rooms', label: 'Rooms', icon: Key },
  { href: '/tenants', label: 'Tenants', icon: Users },
  { href: '/contracts', label: 'Contracts', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r flex flex-col p-8 transition-transform duration-300">
        <div className="flex items-center gap-4 mb-12 px-3">
          <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Home className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            RentalAI
          </span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="pt-8 mt-auto border-t">
          <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-secondary transition-all">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">Owner</p>
            </div>
            <Link href="/login" className="text-muted-foreground hover:text-destructive transition-colors p-2">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 px-10 flex items-center justify-between border-b bg-background/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground">
              {NAV_ITEMS.find(i => i.href === pathname)?.label || 'Page'}
            </span>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
               <Bell className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
               <Settings className="w-5 h-5" />
             </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
