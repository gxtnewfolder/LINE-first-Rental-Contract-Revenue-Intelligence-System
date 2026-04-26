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
          <h1 className="text-2xl font-black tracking-tight">รายงาน</h1>
          <p className="text-sm text-muted-foreground mt-0.5">รายได้ การเติบโต และการคาดการณ์</p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">12 เดือนที่ผ่านมา</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="surface rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold">ประวัติรายได้</h2>
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
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold bg-white border border-border px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover/bar:opacity-100 transition-opacity tabnum">
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
          <h2 className="text-sm font-bold mb-5">การใช้งานห้องพัก</h2>

          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-secondary" />
                <circle
                  cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10"
                  className="text-primary"
                  strokeDasharray={`${2 * Math.PI * 40 * occupancy.occupancyRate / 100} ${2 * Math.PI * 40}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tabnum">{occupancy.occupancyRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">มีผู้เช่า</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center justify-between bg-secondary/40 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground font-medium">มีผู้เช่า</span>
                </div>
                <span className="font-black tabnum text-sm">{occupancy.occupiedRooms} ห้อง</span>
              </div>
              <div className="flex items-center justify-between bg-secondary/40 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground font-medium">ว่าง</span>
                </div>
                <span className="font-black tabnum text-sm">{occupancy.vacantRooms} ห้อง</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="surface rounded-xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold">คำแนะนำจาก AI</h2>
            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold">
              Revenue Intelligence
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">ปรับค่าเช่าตามเงินเฟ้อ</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  อาคาร A ค่าเช่า<span className="font-semibold">ต่ำกว่า CPI 12%</span> ควรพิจารณาเพิ่ม ฿500 สำหรับ 3 ห้องที่กำลังต่อสัญญา
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">อัตราเก็บเงินดีมาก</p>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  เดือนนี้เก็บได้<span className="font-semibold">สูงกว่าค่าเฉลี่ย 4.2%</span> โปรแกรมชำระก่อนกำหนดได้ผลดี
                </p>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-sky-800">ห้องว่างนาน</p>
                <p className="text-xs text-sky-700 mt-1 leading-relaxed">
                  ห้อง 402 ว่างมา<span className="font-semibold">45 วันแล้ว</span> ลดราคา 5% อาจหาผู้เช่าได้ภายใน 7 วัน
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
