import { contractService, type ContractWithRelations } from '@/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Download, 
  Send, 
  MoreVertical, 
  Plus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContractStatus } from '@/app/generated/prisma/client';

export default async function ContractsPage() {
  const contracts = await contractService.findAll();

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Digital Contracts</h1>
          <p className="text-muted-foreground text-lg italic">Lifecycle management and e-signatures.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg shadow-primary/20 group">
          <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" />
          New Contract
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {contracts.map((contract: ContractWithRelations) => {
          const statusColors: Partial<Record<ContractStatus, string>> = {
            ACTIVE: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            EXPIRING: "bg-amber-400/10 text-amber-400 border-amber-400/20",
            PENDING_SIGNATURE: "bg-primary/10 text-primary border-primary/20",
          };
          
          const badgeClass = statusColors[contract.status] || "bg-muted/10 text-muted border-muted/20";

          return (
            <Card key={contract.id} className="glass border-none group hover:translate-x-1 transition-all duration-300 overflow-hidden">
               <CardContent className="p-0">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-8 p-6 xl:p-8">
                    {/* Contract Icon & Basic Info */}
                    <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-xl flex items-center gap-2">
                          Room {contract.room.roomNumber}
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-20" />
                          {contract.tenant.name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                           <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {contract.startDate.toLocaleDateString()} — {contract.endDate.toLocaleDateString()}
                           </div>
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Verified
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-12 text-center xl:text-left">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black opacity-50">Monthly Rent</span>
                          <div className="flex items-center gap-1.5 justify-center xl:justify-start">
                             <DollarSign className="w-4 h-4 text-emerald-400" />
                             <span className="font-black text-xl italic tracking-tight">฿{contract.rentAmountTHB.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>

                    {/* Status Badge */}
                    <div className="xl:min-w-[150px] flex justify-center xl:justify-start">
                       <Badge className={cn("px-4 py-1.5 rounded-xl font-black text-[10px] uppercase border tracking-widest", badgeClass)}>
                          {contract.status.replace('_', ' ')}
                       </Badge>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-3 ml-auto">
                       <Button variant="ghost" className="h-12 bg-white/5 rounded-xl font-bold gap-2 hover:bg-white/10">
                          <Download className="w-4 h-4" />
                          <span className="hidden md:inline">Download PDF</span>
                       </Button>
                       {contract.status === 'PENDING_SIGNATURE' && (
                         <Button className="h-12 bg-primary rounded-xl font-bold px-6 shadow-lg shadow-primary/20 group/send">
                            <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Resend Links
                         </Button>
                       )}
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10">
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                       </Button>
                    </div>
                  </div>
               </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
