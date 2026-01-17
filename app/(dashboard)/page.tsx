import React from 'react';
import { analyticsService } from '@/services/analytics.service';
import { aiService } from '@/ai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Home, 
  Calendar, 
  DollarSign, 
  Bot, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Fetch data
  const snapshot = await analyticsService.getSnapshot(year, month);
  const aiSummary = await aiService.generateMonthlySummary(year, month);
  const trend = await analyticsService.getIncomeTrend(6);

  const stats = [
    { 
      title: 'Monthly Revenue', 
      value: `฿${snapshot.income.total.toLocaleString()}`, 
      change: '+12.5%', 
      icon: DollarSign, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      title: 'Occupancy Rate', 
      value: `${snapshot.occupancy.current}%`, 
      change: 'Stable', 
      icon: Home, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    { 
      title: 'Collection Rate', 
      value: `${snapshot.collection.rate}%`, 
      change: '-2.1%', 
      icon: TrendingUp, 
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10'
    },
    { 
      title: 'Expiring Soon', 
      value: snapshot.contracts.expiringSoon.length, 
      change: 'Next 30 days', 
      icon: Calendar, 
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-gradient">Good Evening, Admin</h1>
        <p className="text-muted-foreground text-lg italic">Here's what's happening with your properties today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isUp = stat.change.startsWith('+');
          const isDown = stat.change.startsWith('-');
          return (
            <Card key={i} className="glass border-none group hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300", stat.bg)}>
                    <Icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <Badge variant="ghost" className={cn(
                    "flex items-center gap-1 font-bold",
                    isUp && "text-emerald-400 bg-emerald-400/5",
                    isDown && "text-rose-400 bg-rose-400/5",
                    !isUp && !isDown && "text-muted-foreground bg-muted/5"
                  )}>
                    {isUp && <ArrowUpRight className="w-3 h-3" />}
                    {isDown && <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h2 className="text-3xl font-black">{stat.value}</h2>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Insight Card */}
        <Card className="lg:col-span-2 glass border-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Bot className="w-32 h-32 text-primary" />
          </div>
          <CardHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 px-3 py-1 font-bold">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Intelligence
              </Badge>
            </div>
            <CardTitle className="text-2xl font-black italic">Monthly Summary & Insights</CardTitle>
            <CardDescription className="text-muted-foreground">Generated analysis from real-time data</CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
             <div className="bg-white/[0.03] rounded-3xl p-8 border border-white/5 shadow-inner">
                {aiSummary.content.split('\n').map((line, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
                    {line}
                  </p>
                ))}
             </div>
             <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 group">
                Ask AI for personalized recommendations 
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Button>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="text-xl font-black">Revenue Trend</CardTitle>
            <CardDescription>Performance: Last 6 Months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-around gap-2 pt-10">
            {trend.map((t, i) => {
              const maxTotal = Math.max(...trend.map(x => x.total));
              const height = maxTotal > 0 ? (t.total / maxTotal) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group/trend max-w-[40px]">
                  <div 
                    className="w-full bg-gradient-to-t from-primary/30 via-primary to-primary rounded-t-xl relative transition-all duration-500 group-hover/trend:brightness-125"
                    style={{ height: `${Math.max(height, 10)}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border opacity-0 group-hover/trend:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold shadow-xl">
                      ฿{t.total.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-4 font-mono font-bold">
                    {t.month}/{t.year % 100}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card className="glass border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Overdue Payments</CardTitle>
            <Badge variant="outline" className="text-rose-400 border-rose-400/20 bg-rose-400/5">Critical</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.collection.overdue.length > 0 ? (
              snapshot.collection.overdue.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group">
                  <div className="p-3 bg-rose-400/10 rounded-xl group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm">Room {p.room}</p>
                    <p className="text-xs text-muted-foreground">฿{p.amount.toLocaleString()} • {p.daysPastDue} days late</p>
                  </div>
                  <Button variant="ghost" size="sm" className="font-bold text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-400/10">
                    Remind
                  </Button>
                </div>
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2 italic">
                <CheckCircle2 className="w-10 h-10 text-emerald-400/50 mb-2" />
                <p>All collections are up to date!</p>
              </div>
            )}
          </CardContent>
        </Card>

         {/* Expiring Contracts */}
         <Card className="glass border-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Expiring Soon</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary font-bold">View All</Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {snapshot.contracts.expiringSoon.length > 0 ? (
              snapshot.contracts.expiringSoon.map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group">
                  <div className="p-3 bg-amber-400/10 rounded-xl group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm">Room {c.room}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.tenant} ({c.daysRemaining} days left)</p>
                  </div>
                  <Button variant="secondary" size="sm" className="font-bold text-xs bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 border-none transition-all">
                    Renew
                  </Button>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center text-muted-foreground italic py-10">No expiring contracts this period.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
