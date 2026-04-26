'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Building2, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Owner {
  id: string;
  lineUserId: string;
  displayName: string | null;
  plan: 'LITE' | 'PRO';
  createdAt: string;
  _count: { buildings: number; tenants: number };
}

export function AdminOwnersClient({ owners }: { owners: Owner[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [changingId, setChangingId] = useState<string | null>(null);

  async function togglePlan(owner: Owner) {
    const newPlan = owner.plan === 'LITE' ? 'PRO' : 'LITE';
    setChangingId(owner.id);
    try {
      await fetch(`/api/admin/owners/${owner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      startTransition(() => router.refresh());
    } finally {
      setChangingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">จัดการ Owner accounts และ plan</p>
        </div>
      </div>

      <div className="surface rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Owners ({owners.length})
          </p>
          <p className="text-xs text-muted-foreground">
            Pro: {owners.filter(o => o.plan === 'PRO').length} · Lite: {owners.filter(o => o.plan === 'LITE').length}
          </p>
        </div>

        {owners.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            ยังไม่มี owner เข้าสู่ระบบ
          </div>
        ) : (
          <div className="divide-y divide-border">
            {owners.map((owner) => (
              <div key={owner.id} className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">
                    {(owner.displayName ?? '?')[0].toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{owner.displayName ?? '—'}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{owner.lineUserId}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" /> {owner._count.buildings} ตึก
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" /> {owner._count.tenants} ผู้เช่า
                    </span>
                    <span className="text-xs text-muted-foreground">
                      เข้าใช้ {new Date(owner.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>

                {/* Plan badge */}
                <span className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full border',
                  owner.plan === 'PRO'
                    ? 'bg-primary/8 text-primary border-primary/20'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                )}>
                  {owner.plan === 'PRO' ? <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Pro</span> : 'Lite'}
                </span>

                {/* Toggle */}
                <Button
                  size="sm"
                  variant={owner.plan === 'LITE' ? 'default' : 'outline'}
                  onClick={() => togglePlan(owner)}
                  disabled={pending || changingId === owner.id}
                  className="shrink-0 min-w-[90px]"
                >
                  {changingId === owner.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : owner.plan === 'LITE' ? '⬆ อัพ Pro' : '⬇ ลด Lite'
                  }
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="surface rounded-xl p-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Plan Limits</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <p className="text-xs font-bold text-amber-700">HaTy Lite (ฟรี)</p>
            <p className="text-xs text-amber-600 mt-0.5">1 ตึก · 5 ห้อง · LINE bot ทุกฟีเจอร์</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2.5">
            <p className="text-xs font-bold text-primary flex items-center gap-1"><Zap className="w-3 h-3" />HaTy Pro</p>
            <p className="text-xs text-primary/70 mt-0.5">ไม่จำกัดตึก · ไม่จำกัดห้อง · AI Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
