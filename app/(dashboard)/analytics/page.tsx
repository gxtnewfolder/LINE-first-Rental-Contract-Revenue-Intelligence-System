import React from 'react';
import { analyticsService } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Sparkles, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AnalyticsPage() {
  const trend = await analyticsService.getIncomeTrend(12);
  const occupancy = await analyticsService.getOccupancy();

  return (
    <div className="space-y-10 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Analytics Intelligence</h1>
          <p className="text-muted-foreground text-lg">Deep dive into revenue, growth, and forecasting.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 glass rounded-xl border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
           <Calendar className="w-5 h-5 text-primary" />
           <span className="font-semibold text-sm">Last 12 Months</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Chart Area */}
        <Card className="lg:col-span-2 glass border-none overflow-hidden group">
           <CardHeader className="flex flex-row items-center justify-between pb-8">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Revenue Growth History
              </CardTitle>
              <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  Finalized
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                  Projected
                </div>
              </div>
           </CardHeader>
           
           <CardContent className="h-[350px] relative pt-4">
              <div className="absolute inset-y-0 left-0 w-12 flex flex-col justify-between text-[11px] text-muted-foreground pb-12 pr-4 border-r border-white/5">
                <span>60k</span>
                <span>40k</span>
                <span>20k</span>
                <span>0</span>
              </div>
              <div className="ml-16 h-full flex items-end justify-around pb-10 group-hover:px-2 transition-all duration-500">
                {trend.map((t, i) => {
                  const max = 60000;
                  const height = (t.total / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group/bar max-w-[45px]">
                       <div 
                         className="w-full bg-gradient-to-t from-primary/60 via-primary to-cyan-400 rounded-lg relative transition-all duration-500 group-hover/bar:scale-110 group-hover/bar:brightness-125 group-hover/bar:shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
                         style={{ height: `${Math.max(height, 5)}%` }}
                       >
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold border border-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                            ฿{Math.round(t.total/1000)}k
                          </span>
                       </div>
                       <span className="text-[10px] text-muted-foreground mt-4 font-mono -rotate-45 origin-center">
                        {t.month}/{t.year % 100}
                       </span>
                    </div>
                  );
                })}
              </div>
           </CardContent>
        </Card>

        {/* Occupancy Radial Mockup */}
        <Card className="glass border-none group">
           <CardHeader>
              <CardTitle className="text-xl font-bold">Unit Utilization</CardTitle>
           </CardHeader>
           <CardContent className="flex flex-col items-center justify-center pt-4 pb-8 space-y-12">
              <div className="relative w-48 h-48 rounded-full flex items-center justify-center p-1 bg-white/5">
                 <div 
                   className="absolute inset-0 rounded-full transition-all duration-1000" 
                   style={{ 
                     background: `conic-gradient(var(--primary-color, #6366f1) ${occupancy.occupancyRate}%, transparent 0)`,
                   }}
                 />
                 <div className="relative w-40 h-40 bg-[#050505] rounded-full flex flex-col items-center justify-center shadow-inner group-hover:scale-95 transition-transform duration-500">
                    <span className="text-5xl font-black text-white">{occupancy.occupancyRate}%</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-bold">Occupied</span>
                 </div>
              </div>
              <div className="w-full space-y-4">
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full bg-primary" />
                       <span className="text-sm font-medium text-muted-foreground">Occupied</span>
                    </div>
                    <span className="text-lg font-bold">{occupancy.occupiedRooms} Units</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full bg-muted" />
                       <span className="text-sm font-medium text-muted-foreground">Vacant</span>
                    </div>
                    <span className="text-lg font-bold">{occupancy.vacantRooms} Units</span>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Intelligence Insights */}
        <Card className="lg:col-span-3 glass border-none overflow-hidden">
           <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Revenue Intelligence Insights
              </CardTitle>
              <Badge variant="outline" className="bg-amber-400/10 text-amber-400 border-amber-400/20 px-3 py-1 font-bold animate-pulse">
                AI Recommendations
              </Badge>
           </CardHeader>
           
           <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 rounded-3xl bg-amber-400/5 border border-amber-400/10 space-y-4 hover:bg-amber-400/10 transition-all duration-300 group">
                 <div className="p-3 bg-amber-400/20 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="font-bold text-amber-400 text-lg">Inflation Adjustment</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Current rent for Building A is <span className="text-white font-semibold">12% below parity</span> with Thai CPI (2025). Consider a ฿500 adjustment on 3 expiring contracts.
                    </p>
                 </div>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-400/5 border border-emerald-400/10 space-y-4 hover:bg-emerald-400/10 transition-all duration-300 group">
                 <div className="p-3 bg-emerald-400/20 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="font-bold text-emerald-400 text-lg">High Collection Rate</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This month's collection rate is <span className="text-white font-semibold">4.2% higher</span> than the average. Incentive programs for early payment are working effectively.
                    </p>
                 </div>
              </div>

              <div className="p-6 rounded-3xl bg-cyan-400/5 border border-cyan-400/10 space-y-4 hover:bg-cyan-400/10 transition-all duration-300 group">
                 <div className="p-3 bg-cyan-400/20 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-cyan-400" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="font-bold text-cyan-400 text-lg">Vacancy Warning</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Room 402 has been vacant for <span className="text-white font-semibold">45 days</span>. Market analysis suggests a 5% price reduction could lead to a booking within 7 days.
                    </p>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
