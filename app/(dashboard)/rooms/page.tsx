import React from 'react';
import { roomService } from '@/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Building2, Plus, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function RoomsPage() {
  const rooms = await roomService.findAll();

  const statusStyle: Record<string, string> = {
    OCCUPIED: 'bg-primary/10 text-primary border-primary/30',
    VACANT:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const statusLabel: Record<string, string> = {
    OCCUPIED: 'มีผู้เช่า',
    VACANT: 'ว่าง',
    MAINTENANCE: 'ซ่อมแซม',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">ห้องพัก</h1>
          <p className="text-sm text-muted-foreground mt-0.5">จัดการห้องพักทั้งหมด</p>
        </div>
        <Button size="sm" className="bg-primary text-white hover:bg-primary/90 font-bold gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          เพิ่มห้อง
        </Button>
      </div>

      <div className="surface rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">ห้อง</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">อาคาร</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground text-center">ชั้น</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">ค่าเช่า/เดือน</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">สถานะ</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground text-right">แก้ไข</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-accent/50 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Key className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-black tabnum text-sm">{room.roomNumber}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">{room.building.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-sm tabnum text-muted-foreground font-medium">{room.floor}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-black tabnum">฿{room.baseRentTHB.toLocaleString()}</span>
                </td>
                <td className="px-5 py-4">
                  <Badge className={cn('text-xs font-semibold', statusStyle[room.status] ?? 'bg-muted/20 text-muted-foreground border-border')}>
                    {statusLabel[room.status] ?? room.status}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary">
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
