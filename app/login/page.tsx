'use client';

import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ShieldCheck, Loader2 } from 'lucide-react';
import { LiffAuth } from '@/components/liff-auth';

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: 'การเข้าสู่ระบบถูกยกเลิก',
  unauthorized: 'LINE account นี้ไม่มีสิทธิ์เข้าใช้งาน',
  invalid_state: 'Session หมดอายุ กรุณาลองใหม่',
  invalid_request: 'คำขอไม่ถูกต้อง กรุณาลองใหม่',
  server_error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
};

const LINE_GREEN = '#06C755';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get('error');
  const [error, setError] = useState(
    errorKey ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.server_error) : ''
  );
  const [liffLoading, setLiffLoading] = useState(true);

  const handleLiffError = useCallback((msg: string) => setError(msg), []);
  const handleLiffLoading = useCallback((v: boolean) => setLiffLoading(v), []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020202]">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-700" />

      {/* LIFF auto-login (runs silently in background) */}
      <LiffAuth onError={handleLiffError} onLoading={handleLiffLoading} />

      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="glass border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="pt-12 pb-8 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
              <Home className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-4xl font-black tracking-tight text-white uppercase italic">RentalAI</CardTitle>
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
                Revenue Intelligence System
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-10 space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-sm font-bold text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-3 text-center">
              {liffLoading ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">กำลังเชื่อมต่อ LINE...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">เข้าสู่ระบบด้วย LINE account ของคุณ</p>
                  <Button
                    asChild
                    className="w-full h-14 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-white"
                    style={{ backgroundColor: LINE_GREEN }}
                  >
                    <a href="/api/auth/line">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19.365 9.89c.50 0 .866.37.866.87s-.366.87-.866.87H17.35v1.2h2.015c.5 0 .866.37.866.87s-.366.87-.866.87H16.48a.87.87 0 0 1-.866-.87V8.15c0-.5.366-.87.866-.87h2.885c.5 0 .866.37.866.87s-.366.87-.866.87H17.35v.87zM14.3 12.69a.87.87 0 0 1-.55.82.84.84 0 0 1-.34.07.88.88 0 0 1-.69-.34l-2.66-3.63v3.1a.87.87 0 0 1-1.73 0V8.15a.87.87 0 0 1 .55-.82.84.84 0 0 1 .34-.07c.26 0 .51.11.69.34l2.66 3.63V8.15a.87.87 0 0 1 1.73 0zM7.27 12.69a.87.87 0 0 1-1.73 0V8.15a.87.87 0 0 1 1.73 0zM4.49 12.69a.87.87 0 0 1-.866.87H1.74a.87.87 0 0 1-.866-.87V8.15c0-.5.366-.87.866-.87s.866.37.866.87v3.67h1.02c.5 0 .866.37.866.87zM24 10.31C24 4.62 18.63 0 12 0S0 4.62 0 10.31c0 5.1 4.52 9.37 10.63 10.18.41.09.98.28 1.12.63.13.32.08.83.04 1.16l-.18 1.1c-.05.32-.25 1.27 1.11.69 1.36-.58 7.32-4.31 9.99-7.38C23.33 14.86 24 12.67 24 10.31z"/>
                      </svg>
                      เข้าสู่ระบบด้วย LINE
                    </a>
                  </Button>
                </>
              )}
            </div>
          </CardContent>

          <CardFooter className="pb-10 pt-0 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                เฉพาะเจ้าของตึกที่ได้รับอนุญาตเท่านั้น
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
