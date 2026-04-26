import { contractService, type ContractWithRelations } from '@/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  Download,
  Send,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContractStatus } from '@/app/generated/prisma/client';

const STATUS_STYLE: Partial<Record<ContractStatus, string>> = {
  ACTIVE: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  EXPIRING: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  PENDING_SIGNATURE: 'bg-primary/10 text-primary border-primary/20',
  DRAFT: 'bg-muted/10 text-muted-foreground border-border',
  TERMINATED: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
};

export default async function ContractsPage() {
  const contracts = await contractService.findAll();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">สัญญาเช่าและลายเซ็นดิจิทัล</p>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-1.5">
          <Plus className="w-4 h-4" />
          New Contract
        </Button>
      </div>

      <div className="space-y-3">
        {contracts.map((contract: ContractWithRelations) => {
          const badgeClass = STATUS_STYLE[contract.status] ?? 'bg-muted/10 text-muted-foreground border-border';

          return (
            <div key={contract.id} className="surface rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 group hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>Room {contract.room.roomNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <span className="truncate">{contract.tenant.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span className="tabnum">
                    {contract.startDate.toLocaleDateString('th-TH')} — {contract.endDate.toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly</p>
                  <p className="font-black tabnum">฿{contract.rentAmountTHB.toLocaleString()}</p>
                </div>

                <Badge className={cn('text-[10px] font-bold whitespace-nowrap', badgeClass)}>
                  {contract.status.replace('_', ' ')}
                </Badge>

                <div className="flex items-center gap-1.5 ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  {contract.status === 'PENDING_SIGNATURE' && (
                    <Button size="sm" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-1.5 text-xs">
                      <Send className="w-3 h-3" />
                      Send
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
