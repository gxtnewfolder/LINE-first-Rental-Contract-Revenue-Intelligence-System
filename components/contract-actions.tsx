'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FileText, Send, CheckCircle, XCircle, RotateCcw,
  Loader2, ExternalLink, Copy, Check, Share2,
} from 'lucide-react';
import type { ContractStatus } from '@/app/generated/prisma/client';

interface Props {
  contractId: string;
  status: ContractStatus;
  pdfUrl: string | null;
}

const NEXT_TRANSITIONS: Partial<Record<ContractStatus, { status: ContractStatus; label: string; variant: 'default' | 'outline' | 'destructive' }[]>> = {
  DRAFT: [
    { status: 'PENDING_SIGNATURE', label: 'ส่งรอลายเซ็น', variant: 'default' },
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

// Statuses where a signing link is relevant
const SIGNABLE: ContractStatus[] = ['DRAFT', 'PENDING_SIGNATURE', 'SIGNED'];

export function ContractActions({ contractId, status, pdfUrl }: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [transitioning, setTransitioning] = useState<ContractStatus | null>(null);
  const [error, setError] = useState('');

  // Signing link state
  const [signingLink, setSigningLink] = useState('');
  const [loadingLink, setLoadingLink] = useState(false);
  const [copied, setCopied] = useState(false);

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
      // After transitioning to PENDING_SIGNATURE, auto-load signing link
      if (nextStatus === 'PENDING_SIGNATURE') {
        await loadSigningLink();
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setTransitioning(null);
    }
  }

  async function loadSigningLink() {
    setLoadingLink(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/signing-links`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setSigningLink(data.links.tenant);
    } finally {
      setLoadingLink(false);
    }
  }

  async function copyLink() {
    if (!signingLink) return;
    await navigator.clipboard.writeText(signingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function shareViaLINE() {
    if (!signingLink) return;
    const msg = `📄 สัญญาเช่ารอลายเซ็นของคุณ\nกดลิงก์เพื่อดูและลงลายเซ็น:\n${signingLink}\n⏰ ลิงก์หมดอายุใน 72 ชั่วโมง`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msg)}`, '_blank');
  }

  const nextSteps = NEXT_TRANSITIONS[status] ?? [];
  const showSigningSection = SIGNABLE.includes(status);

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
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1.5" />}
              สร้างเอกสารใหม่
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            {generating ? 'กำลังสร้าง...' : 'สร้างเอกสารสัญญา'}
          </Button>
        )}
      </div>

      {/* Send to tenant for signing */}
      {showSigningSection && (
        <div className="surface rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ส่งให้ผู้เช่าเซ็น</p>

          {!signingLink ? (
            <Button
              variant="outline"
              className="w-full gap-2 font-semibold border-primary/40 text-primary hover:bg-primary/5"
              onClick={loadSigningLink}
              disabled={loadingLink}
            >
              {loadingLink
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
              {loadingLink ? 'กำลังสร้างลิงก์...' : 'สร้างลิงก์เซ็นสัญญา'}
            </Button>
          ) : (
            <div className="space-y-2">
              {/* Link display */}
              <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2.5">
                <span className="text-xs text-muted-foreground font-mono truncate flex-1 select-all">
                  {signingLink}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 font-semibold"
                  onClick={copyLink}
                >
                  {copied
                    ? <><Check className="w-3.5 h-3.5 text-emerald-600" /><span className="text-emerald-600">คัดลอกแล้ว</span></>
                    : <><Copy className="w-3.5 h-3.5" />คัดลอก</>}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 font-semibold bg-[#06C755] hover:bg-[#05b34b] text-white"
                  onClick={shareViaLINE}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  ส่งทาง LINE
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                ลิงก์หมดอายุใน 72 ชั่วโมง · ผู้เช่าไม่ต้องมี account ใดๆ
              </p>
            </div>
          )}
        </div>
      )}

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
                {transitioning === next
                  ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  : variant === 'destructive'
                    ? <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
