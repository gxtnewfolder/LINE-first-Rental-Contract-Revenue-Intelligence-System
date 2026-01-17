import React from 'react';
import { buildingService } from '@/services';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, DoorOpen, Settings, Plus, ArrowRight } from 'lucide-react';

export default async function BuildingsPage() {
  const buildings = await buildingService.findAll();

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Buildings</h1>
          <p className="text-muted-foreground text-lg italic">Manage your properties and locations.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 group">
          <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" />
          Add Building
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {buildings.map((building: any) => (
          <Card key={building.id} className="glass border-none group overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <div className="h-48 bg-white/5 flex items-center justify-center relative group-hover:bg-white/10 transition-colors">
              <Building2 className="w-20 h-20 text-primary opacity-20 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 right-4">
                 <Badge className="bg-emerald-400/20 text-emerald-400 border-emerald-400/20 px-3 py-1 font-bold">
                    Active
                 </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-black">{building.name}</CardTitle>
              <div className="flex items-center text-muted-foreground text-sm gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate">{building.address || 'No address provided'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Rooms</span>
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-primary" />
                    <span className="text-lg font-black">{building.rooms?.length || 0}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Avg. Rent</span>
                   <span className="text-lg font-black">฿5,500</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-3 pt-2 pb-6">
              <Button variant="secondary" className="flex-1 h-12 rounded-xl font-bold bg-white/5 hover:bg-white/10 group/btn">
                View Rooms
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white/5">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
