import React from 'react';
import { analyticsService } from '@/services/analytics.service';
import { aiService } from '@/ai';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Home,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const snapshot = await analyticsService.getSnapshot(year, month);
  const aiSummary = await aiService.generateMonthlySummary(year, month);
  const trend = await analyticsService.getIncomeTrend(6);

  const stats = [
    {
      label: 'Monthly Revenue',
      value: `฿${snapshot.income.total.toLocaleString()}`,
      change: '+12.5%',
      up: true,
      icon: DollarSign,
      accent: 'text-primary',
    },
    {
      label: 'Occupancy',
      value: `${snapshot.occupancy.current}%`,
      change: 'Stable',
      up: null,
      icon: Home,
      accent: 'text-emerald-400',
    },
    {
      label: 'Collection Rate',
      value: `${snapshot.collection.rate}%`,
      change: '-2.1%',
      up: false,
      icon: TrendingUp,
      accent: 'text-sky-400',
    },
    {
      label: 'Expiring Soon',
      value: String(snapshot.contracts.expiringSoon.length),
      change: 'Next 30 days',
      up: null,
      icon: Calendar,
      accent: 'text-amber-400',
    },
  ];

  const maxTrend = Math.max(...trend.map(t => t.total), 1);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {now.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="surface rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Icon className={cn('w-4 h-4', s.accent)} />
                <span className={cn(
                  'flex items-center gap-0.5 text-xs font-semibold',
                  s.up === true && 'text-emerald-400',
                  s.up === false && 'text-rose-400',
                  s.up === null && 'text-muted-foreground',
                )}>
                  {s.up === true && <ArrowUpRight className="w-3 h-3" />}
                  {s.up === false && <ArrowDownRight className="w-3 h-3" />}
                  {s.change}
                </span>
              </div>
              <div>
                <div className="text-2xl font-black tabnum">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle row: Chart + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue trend */}
        <div className="surface rounded-xl p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold">Revenue Trend</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-36">
            {trend.map((t, i) => {
              const h = Math.max((t.total / maxTrend) * 100, 4);
              const isLast = i === trend.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all',
                      isLast ? 'bg-primary' : 'bg-primary/25 group-hover:bg-primary/40'
                    )}
                    style={{ height: `${h}%` }}
                    title={`฿${t.total.toLocaleString()}`}
                  />
                  <span className="text-[10px] text-muted-foreground tabnum">
                    {t.month}/{String(t.year).slice(-2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Summary */}
        <div className="surface rounded-xl p-5 lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold">AI Summary</span>
            <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 font-semibold">
              {now.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })}
            </Badge>
          </div>

          <div className="flex-1 surface-raised rounded-lg p-4 text-sm text-muted-foreground leading-relaxed space-y-2 min-h-[120px]">
            {aiSummary.content.split('\n').filter(Boolean).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Overdue + Expiring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Overdue */}
        <div className="surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Overdue Payments</h2>
            <Badge variant="outline" className="text-rose-400 border-rose-400/20 text-[10px]">
              {snapshot.collection.overdue.length} pending
            </Badge>
          </div>

          {snapshot.collection.overdue.length > 0 ? (
            <div className="space-y-2">
              {snapshot.collection.overdue.map((p, i) => (
                <div key={i} className="flex items-center gap-3 surface-raised rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Room {p.room}</p>
                    <p className="text-xs text-muted-foreground tabnum">฿{p.amount.toLocaleString()} · {p.daysPastDue}d overdue</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-rose-400 hover:bg-rose-400/10 hover:text-rose-400 h-7 px-2">
                    Remind
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/50" />
              <p className="text-sm">All payments collected</p>
            </div>
          )}
        </div>

        {/* Expiring contracts */}
        <div className="surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Expiring Soon</h2>
            <Badge variant="outline" className="text-amber-400 border-amber-400/20 text-[10px]">
              {snapshot.contracts.expiringSoon.length} contracts
            </Badge>
          </div>

          {snapshot.contracts.expiringSoon.length > 0 ? (
            <div className="space-y-2">
              {snapshot.contracts.expiringSoon.map((c, i) => (
                <div key={i} className="flex items-center gap-3 surface-raised rounded-lg px-3 py-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Room {c.room}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.tenant} · {c.daysRemaining}d left</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-amber-400 hover:bg-amber-400/10 hover:text-amber-400 h-7 px-2">
                    Renew
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/50" />
              <p className="text-sm">No contracts expiring soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}
