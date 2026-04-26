import { contractService } from '@/services';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ContractActions } from '@/components/contract-actions';
import {
  ChevronLeft, FileText, User, Key, Building2,
  Calendar, DollarSign, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContractStatus } from '@/app/generated/prisma/client';

const STATUS_STYLE: Partial<Record<ContractStatus, string>> = {
  ACTIVE:            'bg-emerald-50 text-emerald-700 border-emerald-200',
  EXPIRING:          'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_SIGNATURE: 'bg-primary/10 text-primary border-primary/30',
  DRAFT:             'bg-secondary text-muted-foreground border-border',
  TERMINATED:        'bg-rose-50 text-rose-600 border-rose-200',
  SIGNED:            'bg-sky-50 text-sky-700 border-sky-200',
  RENEWED:           'bg-purple-50 text-purple-700 border-purple-200',
};

const STATUS_LABEL: Partial<Record<ContractStatus, string>> = {
  ACTIVE:            'ใช้งาน',
  EXPIRING:          'ใกล้หมดอายุ',
  PENDING_SIGNATURE: 'รอเซ็น',
  DRAFT:             'แบบร่าง',
  TERMINATED:        'สิ้นสุด',
  SIGNED:            'เซ็นแล้ว',
  RENEWED:           'ต่อสัญญาแล้ว',
};

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await contractService.findById(id);

  if (!contract) notFound();

  const badgeClass = STATUS_STYLE[contract.status] ?? 'bg-secondary text-muted-foreground border-border';
  const badgeLabel = STATUS_LABEL[contract.status] ?? contract.status;

  const durationMs = contract.endDate.getTime() - contract.startDate.getTime();
  const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24));
  const durationMonths = Math.round(durationDays / 30);

  const daysLeft = Math.ceil((contract.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link
          href="/contracts"
          className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black tracking-tight">
              ห้อง {contract.room.roomNumber}
            </h1>
            <Badge className={cn('text-xs font-semibold', badgeClass)}>{badgeLabel}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {contract.room.building.name} · #{contract.id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: details */}
        <div className="space-y-4">
          {/* Parties */}
          <div className="surface rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">คู่สัญญา</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">อาคาร / ห้อง</p>
                <p className="text-sm font-semibold">{contract.room.building.name} · {contract.room.roomNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ผู้เช่า</p>
                <p className="text-sm font-semibold">{contract.tenant.name}</p>
                <p className="text-xs text-muted-foreground">{contract.tenant.phone}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="surface rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ระยะเวลาสัญญา</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">วันเริ่ม</p>
                <p className="text-sm font-semibold tabnum">{contract.startDate.toLocaleDateString('th-TH')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">วันสิ้นสุด</p>
                <p className="text-sm font-semibold tabnum">{contract.endDate.toLocaleDateString('th-TH')}</p>
              </div>
            </div>
            <div className="bg-secondary/40 rounded-lg px-3 py-2 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                {durationMonths} เดือน ({durationDays} วัน)
              </span>
              {daysLeft > 0 && daysLeft <= 90 && (
                <span className="ml-auto text-xs font-semibold text-amber-600">
                  เหลือ {daysLeft} วัน
                </span>
              )}
              {daysLeft <= 0 && (
                <span className="ml-auto text-xs font-semibold text-rose-600">หมดอายุแล้ว</span>
              )}
            </div>
          </div>

          {/* Financials */}
          <div className="surface rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">การเงิน</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/40 rounded-lg px-3 py-2.5">
                <p className="text-xs text-muted-foreground">ค่าเช่า/เดือน</p>
                <p className="text-base font-black tabnum">฿{contract.rentAmountTHB.toLocaleString()}</p>
              </div>
              <div className="bg-secondary/40 rounded-lg px-3 py-2.5">
                <p className="text-xs text-muted-foreground">เงินประกัน</p>
                <p className="text-base font-black tabnum">฿{contract.depositTHB.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Recent payments */}
          {contract.payments.length > 0 && (
            <div className="surface rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">การชำระเงินล่าสุด</p>
              <div className="space-y-2">
                {contract.payments.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    {p.status === 'PAID' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground flex-1">
                      {p.periodMonth}/{p.periodYear}
                    </span>
                    <span className="text-xs font-semibold tabnum">
                      ฿{p.amountTHB.toLocaleString()}
                    </span>
                    <Badge className={cn(
                      'text-[10px]',
                      p.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    )}>
                      {p.status === 'PAID' ? 'จ่ายแล้ว' : 'ค้างจ่าย'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {contract.transitions.length > 0 && (
            <div className="surface rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ประวัติสัญญา</p>
              <div className="space-y-2">
                {contract.transitions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-start gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">
                        {STATUS_LABEL[t.toState as ContractStatus] ?? t.toState}
                      </p>
                      {t.reason && <p className="text-[10px] text-muted-foreground truncate">{t.reason}</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground tabnum whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div>
          <ContractActions
            contractId={contract.id}
            status={contract.status}
            pdfUrl={contract.pdfUrl}
          />
        </div>
      </div>
    </div>
  );
}
