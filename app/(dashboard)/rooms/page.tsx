import React from 'react';
import { roomService } from '@/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  Building2, 
  Layers, 
  Key,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function RoomsPage() {
  const rooms = await roomService.findAll();

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Rooms Inventory</h1>
          <p className="text-muted-foreground text-lg italic">Inventory and booking status of all units.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" className="h-14 px-6 rounded-2xl bg-white/5 font-bold">
              <Filter className="w-5 h-5 mr-2" />
              Filter
           </Button>
           <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg shadow-primary/20 group transition-all active:scale-95">
              <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" />
              Add Room
           </Button>
        </div>
      </div>

      <Card className="glass border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Info</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Building</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Floor</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Rent</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rooms.map((room) => {
                  const statusColors = {
                    OCCUPIED: "bg-primary/20 text-primary border-primary/20",
                    VACANT: "bg-emerald-400/20 text-emerald-400 border-emerald-400/20",
                    MAINTENANCE: "bg-amber-400/20 text-amber-400 border-amber-400/20",
                  }[room.status] || "bg-muted/20 text-muted border-muted/20";

                  return (
                    <tr key={room.id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                             <Key className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                             <p className="font-black text-lg">{room.roomNumber}</p>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Standard Unit</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <Building2 className="w-4 h-4 text-muted-foreground" />
                           <span className="font-semibold text-sm">{room.building.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Badge variant="ghost" className="bg-white/5 text-foreground font-bold">
                           FL {room.floor}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-lg">฿{room.baseRentTHB.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={cn("px-3 py-1 font-bold rounded-lg border-none shadow-sm", statusColors)}>
                          {room.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary transition-all">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
