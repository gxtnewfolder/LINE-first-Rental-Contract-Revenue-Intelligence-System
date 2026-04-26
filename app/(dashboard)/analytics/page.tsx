import React from 'react';
import { analyticsService } from '@/services';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AnalyticsPage() {
  const trend = await analyticsService.getIncomeTrend(12);
  const occupancy = await analyticsService.getOccupancy();

  const maxTrend = Math.max(...trend.map(t => t.total), 1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">รายได้ การเติบโต และการคาดการณ์</p>
        </div>
        <Badge variant="outline" className="text-[10px] font-semibold">Last 12 months</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="surface rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold">Revenue History</h2>
          </div>
          <div className="flex items-end gap-1 h-48">
            {trend.map((t, i) => {
              const h = Math.max((t.total / maxTrend) * 100, 3);
              const isLast = i === trend.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all relative',
                      isLast ? 'bg-primary' : 'bg-primary/25 group-hover/bar:bg-primary/50'
                    )}
                    style={{ height: `${h}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold bg-card border border-border px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity tabnum">
                      ฿{Math.round(t.total / 1000)}k
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground tabnum -rotate-45 origin-center">
                    {t.month}/{String(t.year).slice(-2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy */}
        <div className="surface rounded-xl p-5 flex flex-col">
          <h2 className="text-sm font-bold mb-5">Unit Utilization</h2>

          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-accent" />
                <circle
                  cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10"
                  className="text-primary"
                  strokeDasharray={`${2 * Math.PI * 40 * occupancy.occupancyRate / 100} ${2 * Math.PI * 40}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tabnum">{occupancy.occupancyRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Occupied</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center justify-between surface-raised rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Occupied</span>
                </div>
                <span className="font-black tabnum text-sm">{occupancy.occupiedRooms}</span>
              </div>
              <div className="flex items-center justify-between surface-raised rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground">Vacant</span>
                </div>
                <span className="font-black tabnum text-sm">{occupancy.vacantRooms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="surface rounded-xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold">Revenue Intelligence</h2>
            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold">
              AI Recommendations
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="surface-raised rounded-xl p-4 space-y-3 border border-amber-400/10">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-400">Inflation Adjustment</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Building A is <span className="text-foreground font-semibold">12% below CPI parity</span>. Consider ฿500 adjustment on 3 expiring contracts.
                </p>
              </div>
            </div>

            <div className="surface-raised rounded-xl p-4 space-y-3 border border-emerald-400/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-400">High Collection Rate</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Collection rate is <span className="text-foreground font-semibold">4.2% above average</span>. Early payment incentives are effective.
                </p>
              </div>
            </div>

            <div className="surface-raised rounded-xl p-4 space-y-3 border border-sky-400/10">
              <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-sky-400">Vacancy Warning</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Room 402 vacant <span className="text-foreground font-semibold">45 days</span>. A 5% price reduction may close within 7 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
