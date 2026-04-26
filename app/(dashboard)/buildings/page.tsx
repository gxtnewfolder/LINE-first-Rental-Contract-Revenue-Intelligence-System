import React from 'react';
import { buildingService } from '@/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, DoorOpen, Plus, ArrowRight } from 'lucide-react';

export default async function BuildingsPage() {
  const buildings = await buildingService.findAll();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Buildings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">จัดการอาคารและทรัพย์สิน</p>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-1.5">
          <Plus className="w-4 h-4" />
          Add Building
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {buildings.map((building: any) => (
          <div key={building.id} className="surface rounded-xl overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="h-32 bg-accent flex items-center justify-center">
              <Building2 className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-base">{building.name}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{building.address || '—'}</span>
                  </div>
                </div>
                <Badge className="text-[10px] bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shrink-0">
                  Active
                </Badge>
              </div>

              <div className="flex items-center gap-4 surface-raised rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rooms</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <DoorOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="font-black tabnum">{building.rooms?.length ?? 0}</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-border" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Rent</p>
                  <p className="font-black tabnum mt-0.5">฿5,500</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent">
                View Rooms
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
