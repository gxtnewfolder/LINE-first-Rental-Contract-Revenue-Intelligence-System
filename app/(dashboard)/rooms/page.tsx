import React from 'react';
import { roomService } from '@/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Building2, Plus, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function RoomsPage() {
  const rooms = await roomService.findAll();

  const statusStyle: Record<string, string> = {
    OCCUPIED: 'bg-primary/10 text-primary border-primary/20',
    VACANT: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    MAINTENANCE: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Rooms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">จัดการห้องพักทั้งหมด</p>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-1.5">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      <div className="surface rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Building</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Floor</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rent / mo</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-accent/40 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Key className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-black tabnum">{room.roomNumber}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">{room.building.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-sm tabnum text-muted-foreground">{room.floor}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-black tabnum">฿{room.baseRentTHB.toLocaleString()}</span>
                </td>
                <td className="px-5 py-4">
                  <Badge className={cn('text-[10px] font-bold', statusStyle[room.status] ?? 'bg-muted/10 text-muted border-muted/20')}>
                    {room.status}
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
