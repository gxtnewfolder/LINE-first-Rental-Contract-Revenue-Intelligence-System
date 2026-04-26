'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, Send, CheckCircle, XCircle, RotateCcw, Loader2, ExternalLink } from 'lucide-react';
import type { ContractStatus } from '@/app/generated/prisma/client';

interface Props {
  contractId: string;
  status: ContractStatus;
  pdfUrl: string | null;
}

const NEXT_TRANSITIONS: Partial<Record<ContractStatus, { status: ContractStatus; label: string; variant: 'default' | 'outline' | 'destructive' }[]>> = {
  DRAFT: [
    { status: 'PENDING_SIGNATURE', label: 'ส่งให้เซ็น', variant: 'default' },
  ],
  PENDING_SIGNATURE: [
    { status: 'SIGNED', label: 'ทำเครื่องหมายว่าเซ็นแล้ว', variant: 'default' },
    { status: 'DRAFT', label: 'ถอยกลับแบบร่าง', variant: 'outline' },
  ],
  SIGNED: [
    { status: 'ACTIVE', label: 'เปิดใช้งานสัญญา', variant: 'default' },
  ],
  ACTIVE: [
    { status: 'TERMINATED', label: 'ยกเลิกสัญญา', variant: 'destructive' },
  ],
  EXPIRING: [
    { status: 'RENEWED', label: 'ต่อสัญญา', variant: 'default' },
    { status: 'TERMINATED', label: 'ยกเลิกสัญญา', variant: 'destructive' },
  ],
};

export function ContractActions({ contractId, status, pdfUrl }: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [transitioning, setTransitioning] = useState<ContractStatus | null>(null);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`/api/contracts/${contractId}/generate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สร้างเอกสารไม่สำเร็จ');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setGenerating(false);
    }
  }

  async function handleTransition(nextStatus: ContractStatus) {
    setTransitioning(nextStatus);
    setError('');
    try {
      const res = await fetch(`/api/contracts/${contractId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เปลี่ยนสถานะไม่สำเร็จ');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setTransitioning(null);
    }
  }

  const nextSteps = NEXT_TRANSITIONS[status] ?? [];

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Generate / view document */}
      <div className="surface rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">เอกสารสัญญา</p>

        {pdfUrl ? (
          <div className="flex flex-col gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              ดูสัญญา
            </a>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1.5" />}
              สร้างเอกสารใหม่
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-primary text-white hover:bg-primary/90 font-semibold"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            {generating ? 'กำลังสร้างเอกสาร...' : 'สร้างเอกสารสัญญา'}
          </Button>
        )}
      </div>

      {/* Status transitions */}
      {nextSteps.length > 0 && (
        <div className="surface rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">เปลี่ยนสถานะ</p>
          <div className="flex flex-col gap-2">
            {nextSteps.map(({ status: next, label, variant }) => (
              <Button
                key={next}
                variant={variant}
                size="sm"
                className="w-full font-semibold"
                onClick={() => handleTransition(next)}
                disabled={transitioning !== null}
              >
                {transitioning === next ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : variant === 'destructive' ? (
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                )}
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
