import React from 'react';
import { buildingService } from '@/services';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin } from 'lucide-react';
import { AddBuildingDialog } from '@/components/add-building-dialog';

export default async function BuildingsPage() {
  const buildings = await buildingService.findAll();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">อาคาร</h1>
          <p className="text-sm text-muted-foreground mt-0.5">อาคารทั้งหมด {buildings.length} อาคาร</p>
        </div>
        <AddBuildingDialog />
      </div>

      {buildings.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-base font-medium">ยังไม่มีอาคาร</p>
          <p className="text-sm mt-1">กดปุ่ม "เพิ่มอาคาร" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {buildings.map((building: any) => {
            const totalRooms    = building.rooms?.length ?? 0;
            const occupiedRooms = building.rooms?.filter((r: any) => r.status === 'OCCUPIED').length ?? 0;
            const avgRent = totalRooms > 0
              ? Math.round((building.rooms ?? []).reduce((s: number, r: any) => s + r.baseRentTHB, 0) / totalRooms)
              : 0;

            return (
              <div key={building.id} className="surface rounded-xl overflow-hidden hover:border-primary/40 transition-colors">
                <div className="h-24 bg-secondary/40 flex items-center justify-center border-b border-border">
                  <Building2 className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-base">{building.name}</h2>
                      {building.address && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{building.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">ใช้งาน</Badge>
                      <AddBuildingDialog initialData={{ id: building.id, name: building.name, address: building.address }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-secondary/40 rounded-lg px-3 py-2.5">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ทั้งหมด</p>
                      <p className="font-black tabnum text-sm mt-0.5">{totalRooms}</p>
                    </div>
                    <div className="text-center border-x border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">มีผู้เช่า</p>
                      <p className="font-black tabnum text-sm mt-0.5 text-primary">{occupiedRooms}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ว่าง</p>
                      <p className="font-black tabnum text-sm mt-0.5 text-emerald-600">{totalRooms - occupiedRooms}</p>
                    </div>
                  </div>

                  {avgRent > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ค่าเช่าเฉลี่ย/เดือน</span>
                      <span className="font-black tabnum">฿{avgRent.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
