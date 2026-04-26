import React from 'react';
import { roomService, buildingService } from '@/services';
import { getSession } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Key, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddRoomDialog } from '@/components/add-room-dialog';

export default async function RoomsPage() {
  const session = await getSession();
  const [rooms, buildings] = await Promise.all([
    roomService.findAll({ ownerId: session?.ownerId }),
    buildingService.findAll(session?.ownerId),
  ]);

  const statusStyle: Record<string, string> = {
    OCCUPIED:    'bg-primary/10 text-primary border-primary/30',
    VACANT:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const statusLabel: Record<string, string> = {
    OCCUPIED:    'มีผู้เช่า',
    VACANT:      'ว่าง',
    MAINTENANCE: 'ซ่อมแซม',
  };

  const buildingList = buildings.map((b: any) => ({ id: b.id, name: b.name }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">ห้องพัก</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ห้องทั้งหมด {rooms.length} ห้อง</p>
        </div>
        <AddRoomDialog buildings={buildingList} />
      </div>

      {rooms.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-base font-medium">ยังไม่มีห้องพัก</p>
          <p className="text-sm mt-1">กดปุ่ม "เพิ่มห้อง" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="surface rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">ห้อง</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">อาคาร</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground text-center">ชั้น</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground text-center hidden sm:table-cell">ขนาด</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">ค่าเช่า/เดือน</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">สถานะ</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-muted-foreground text-right">แก้ไข</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rooms.map((room: any) => (
                <tr key={room.id} className="hover:bg-accent/50 transition-colors">
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
                    <span className="text-sm tabnum text-muted-foreground font-medium">{room.floor ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4 text-center hidden sm:table-cell">
                    <span className="text-sm tabnum text-muted-foreground font-medium">
                      {room.sizeSqm ? `${room.sizeSqm} ตร.ม.` : '—'}
                    </span>
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
                    <AddRoomDialog
                      buildings={buildingList}
                      initialData={{
                        id:          room.id,
                        buildingId:  room.buildingId,
                        roomNumber:  room.roomNumber,
                        floor:       room.floor,
                        sizeSqm:     room.sizeSqm,
                        baseRentTHB: room.baseRentTHB,
                        status:      room.status,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
