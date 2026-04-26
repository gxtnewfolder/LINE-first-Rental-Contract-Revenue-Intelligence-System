'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Copy, Send, ExternalLink, MessageSquare, Loader2, Check, LayoutGrid, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Status {
  hasAccessToken: boolean;
  hasSecret: boolean;
  hasOwnerIds: boolean;
  ownerCount: number;
  webhookUrl: string;
  ready: boolean;
}

const STEPS = [
  {
    num: 1,
    title: 'สร้าง LINE OA (Messaging API)',
    detail: 'ไปที่ LINE Developers Console → Create a new provider → Create a Messaging API channel',
    link: 'https://developers.line.biz/console/',
    linkLabel: 'เปิด LINE Developers Console',
  },
  {
    num: 2,
    title: 'เปิดใช้งาน Webhook',
    detail: 'ใน Messaging API tab → Webhook settings → เปิด "Use webhook" แล้วใส่ Webhook URL ด้านล่าง',
    link: null,
    linkLabel: null,
  },
  {
    num: 3,
    title: 'คัดลอก Channel Access Token',
    detail: 'Messaging API tab → Channel access token → Issue → คัดลอกใส่ใน .env.local เป็น LINE_CHANNEL_ACCESS_TOKEN',
    link: null,
    linkLabel: null,
  },
  {
    num: 4,
    title: 'คัดลอก Channel Secret',
    detail: 'Basic settings tab → Channel secret → คัดลอกใส่ใน .env.local เป็น LINE_CHANNEL_SECRET',
    link: null,
    linkLabel: null,
  },
  {
    num: 5,
    title: 'ใส่ LINE User ID ของคุณ',
    detail: 'Basic settings tab → Your user ID (เริ่มต้นด้วย U) → ใส่ใน .env.local เป็น OWNER_LINE_IDS',
    link: null,
    linkLabel: null,
  },
  {
    num: 6,
    title: 'Restart server แล้วทดสอบ',
    detail: 'รัน `npm run dev` ใหม่ แล้วกดปุ่ม "ทดสอบการเชื่อมต่อ" ด้านล่าง',
    link: null,
    linkLabel: null,
  },
];

const RICH_MENU_BUTTONS = [
  { emoji: '💰', label: 'รายได้', sub: 'เดือนนี้',     bg: '#136960', x: 0,    y: 0,   w: 1250, h: 421 },
  { emoji: '🏠', label: 'ห้องว่าง', sub: 'ดูห้องพัก',  bg: '#158075', x: 1250, y: 0,   w: 1250, h: 421 },
  { emoji: '📊', label: 'สรุป AI', sub: 'วิเคราะห์',   bg: '#158075', x: 0,    y: 422, w: 1250, h: 421 },
  { emoji: '🤖', label: 'แนะนำ',   sub: 'AI ช่วยคิด', bg: '#136960', x: 1250, y: 422, w: 1250, h: 421 },
] as const;

function drawRichMenu(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  canvas.width  = 2500;
  canvas.height = 843;

  for (const btn of RICH_MENU_BUTTONS) {
    ctx.fillStyle = btn.bg;
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const cx = btn.x + btn.w / 2;
    const cy = btn.y + btn.h / 2;

    ctx.font = '130px serif';
    ctx.fillText(btn.emoji, cx, cy - 70);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 72px Sarabun, sans-serif';
    ctx.fillText(btn.label, cx, cy + 65);

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font      = '50px Sarabun, sans-serif';
    ctx.fillText(btn.sub, cx, cy + 140);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth   = 6;
  ctx.beginPath(); ctx.moveTo(1250, 0);    ctx.lineTo(1250, 843);  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,    421);  ctx.lineTo(2500, 421);  ctx.stroke();
}

export function LineSetupClient({ status }: { status: Status }) {
  const [copied, setCopied]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [testResult, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Rich Menu state
  const [richMenuId,   setRichMenuId]   = useState<string | null>(null);
  const [rmLoading,    setRmLoading]    = useState(false);
  const [rmResult,     setRmResult]     = useState<{ ok: boolean; msg: string } | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Draw preview canvas on mount
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    document.fonts.load('bold 72px Sarabun').then(() => {
      const preview = document.createElement('canvas');
      drawRichMenu(preview);
      // Scale down for preview (display at 500px wide)
      canvas.width  = 500;
      canvas.height = Math.round(500 * 843 / 2500);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(preview, 0, 0, canvas.width, canvas.height);
    });
  }, []);

  // Check current rich menu status
  useEffect(() => {
    if (!status.ready) return;
    fetch('/api/settings/line/richmenu')
      .then(r => r.json())
      .then(d => setRichMenuId(d.richMenuId ?? null))
      .catch(() => {});
  }, [status.ready]);

  const installRichMenu = useCallback(async () => {
    setRmLoading(true);
    setRmResult(null);
    try {
      await document.fonts.load('bold 72px Sarabun');
      const canvas = document.createElement('canvas');
      drawRichMenu(canvas);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas failed')), 'image/png')
      );
      const fd = new FormData();
      fd.append('image', blob, 'richmenu.png');
      const res  = await fetch('/api/settings/line/richmenu', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setRichMenuId(data.richMenuId);
        setRmResult({ ok: true, msg: 'ติดตั้ง Rich Menu สำเร็จ! เปิด LINE เพื่อดูผล' });
      } else {
        setRmResult({ ok: false, msg: data.error ?? 'เกิดข้อผิดพลาด' });
      }
    } catch {
      setRmResult({ ok: false, msg: 'ไม่สามารถสร้างรูปภาพ' });
    } finally {
      setRmLoading(false);
    }
  }, []);

  const removeRichMenu = useCallback(async () => {
    setRmLoading(true);
    setRmResult(null);
    try {
      const res  = await fetch('/api/settings/line/richmenu', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { setRichMenuId(null); setRmResult({ ok: true, msg: 'ลบ Rich Menu แล้ว' }); }
      else          setRmResult({ ok: false, msg: data.error ?? 'เกิดข้อผิดพลาด' });
    } catch {
      setRmResult({ ok: false, msg: 'ไม่สามารถเชื่อมต่อ server' });
    } finally {
      setRmLoading(false);
    }
  }, []);

  async function copyWebhook() {
    await navigator.clipboard.writeText(status.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendTest() {
    setTesting(true);
    setResult(null);
    try {
      const res  = await fetch('/api/settings/line', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setResult({ ok: true,  msg: 'ส่งข้อความทดสอบสำเร็จ! เช็ค LINE ของคุณ' });
      else        setResult({ ok: false, msg: data.error ?? 'เกิดข้อผิดพลาด' });
    } catch {
      setResult({ ok: false, msg: 'ไม่สามารถเชื่อมต่อ server' });
    } finally {
      setTesting(false);
    }
  }

  const checks = [
    { label: 'LINE_CHANNEL_ACCESS_TOKEN',  ok: status.hasAccessToken },
    { label: 'LINE_CHANNEL_SECRET',         ok: status.hasSecret },
    { label: `OWNER_LINE_IDS (${status.ownerCount} รายการ)`, ok: status.hasOwnerIds },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#06C755]/10 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 text-[#06C755]" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">ตั้งค่า LINE OA</h1>
          <p className="text-sm text-muted-foreground mt-0.5">เชื่อมต่อ LINE Official Account (Free Plan รองรับ)</p>
        </div>
      </div>

      {/* Status card */}
      <div className="surface rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">สถานะ Environment Variables</p>
          <span className={cn(
            'text-xs font-bold px-2.5 py-1 rounded-full',
            status.ready
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          )}>
            {status.ready ? '✅ พร้อมใช้งาน' : '⚠️ ยังไม่ครบ'}
          </span>
        </div>

        <div className="space-y-2">
          {checks.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-3 bg-secondary/40 rounded-lg px-3 py-2.5">
              {ok
                ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                : <XCircle      className="w-4 h-4 text-rose-500 shrink-0" />
              }
              <span className="text-sm font-mono font-medium">{label}</span>
              <span className={cn('ml-auto text-xs font-semibold', ok ? 'text-emerald-600' : 'text-rose-500')}>
                {ok ? 'ตั้งค่าแล้ว' : 'ยังไม่ได้ตั้งค่า'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook URL */}
      <div className="surface rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Webhook URL</p>
        <p className="text-xs text-muted-foreground">คัดลอก URL นี้ไปใส่ใน LINE Developers Console → Webhook URL</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary/40 rounded-lg px-3 py-2.5 font-mono text-sm truncate">
            {status.webhookUrl}
          </div>
          <Button variant="outline" size="sm" onClick={copyWebhook} className="shrink-0 gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
          </Button>
        </div>
        <p className="text-xs text-amber-600 font-medium">
          ⚠️ ต้องเป็น HTTPS — ถ้าพัฒนา local ใช้ ngrok หรือ cloudflare tunnel ก่อน
        </p>
      </div>

      {/* Steps */}
      <div className="surface rounded-xl p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ขั้นตอนการตั้งค่า</p>
        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {step.num}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-bold">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {step.linkLabel}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commands reference */}
      <div className="surface rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">คำสั่งที่ใช้ได้ (พิมพ์ใน LINE Chat)</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { cmd: 'รายได้เดือนนี้', desc: 'สรุปรายได้' },
            { cmd: 'ห้องว่าง',       desc: 'ห้องที่ว่างอยู่' },
            { cmd: 'สรุป',           desc: 'AI สรุปภาพรวม' },
            { cmd: 'แนะนำ',          desc: 'AI วิเคราะห์' },
          ].map(({ cmd, desc }) => (
            <div key={cmd} className="bg-secondary/40 rounded-lg px-3 py-2.5">
              <p className="text-sm font-bold">{cmd}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Test button */}
      <div className="surface rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ทดสอบการเชื่อมต่อ</p>
        <p className="text-xs text-muted-foreground">
          กดปุ่มด้านล่างเพื่อส่งข้อความทดสอบไปยัง LINE ของคุณ (ต้องตั้งค่า env vars ครบก่อน)
        </p>

        {testResult && (
          <div className={cn(
            'rounded-lg px-3 py-2.5 text-sm font-medium',
            testResult.ok
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          )}>
            {testResult.msg}
          </div>
        )}

        <Button
          onClick={sendTest}
          disabled={testing || !status.ready}
          className="w-full bg-[#06C755] text-white hover:bg-[#06C755]/90 font-bold gap-2"
        >
          {testing
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
          {testing ? 'กำลังส่ง...' : 'ทดสอบการเชื่อมต่อ'}
        </Button>

        {!status.ready && (
          <p className="text-xs text-center text-muted-foreground">ตั้งค่า environment variables ให้ครบก่อน</p>
        )}
      </div>

      {/* Rich Menu */}
      <div className="surface rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Rich Menu</p>
          <span className={cn(
            'text-xs font-bold px-2.5 py-1 rounded-full',
            richMenuId
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          )}>
            {richMenuId ? '✅ ติดตั้งแล้ว' : '⚠️ ยังไม่ได้ติดตั้ง'}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          แถบเมนูถาวรด้านล่างใน LINE chat — กดได้เลยโดยไม่ต้องพิมพ์
        </p>

        {/* Preview */}
        <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
          <canvas ref={previewRef} className="w-full block" />
        </div>

        {rmResult && (
          <div className={cn(
            'rounded-lg px-3 py-2.5 text-sm font-medium',
            rmResult.ok
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          )}>
            {rmResult.msg}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={installRichMenu}
            disabled={rmLoading || !status.ready}
            className="flex-1 gap-2"
          >
            {rmLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LayoutGrid className="w-4 h-4" />
            }
            {rmLoading ? 'กำลังติดตั้ง...' : richMenuId ? 'ติดตั้งใหม่' : 'ติดตั้ง Rich Menu'}
          </Button>

          {richMenuId && (
            <Button
              variant="outline"
              onClick={removeRichMenu}
              disabled={rmLoading}
              className="gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-600 border-rose-200"
            >
              <Trash2 className="w-4 h-4" />
              ลบ
            </Button>
          )}
        </div>

        {!status.ready && (
          <p className="text-xs text-center text-muted-foreground">ตั้งค่า environment variables ให้ครบก่อน</p>
        )}
      </div>
    </div>
  );
}
