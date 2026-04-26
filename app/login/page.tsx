'use client';

import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { LiffAuth } from '@/components/liff-auth';
import { Loader2 } from 'lucide-react';

const LINE_GREEN = '#06C755';

const ERRORS: Record<string, string> = {
  cancelled: 'การเข้าสู่ระบบถูกยกเลิก',
  unauthorized: 'LINE account นี้ไม่มีสิทธิ์เข้าใช้งาน',
  invalid_state: 'Session หมดอายุ กรุณาลองใหม่',
  invalid_request: 'คำขอไม่ถูกต้อง กรุณาลองใหม่',
  server_error: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get('error');
  const [error, setError] = useState(errorKey ? (ERRORS[errorKey] ?? ERRORS.server_error) : '');
  const [loading, setLoading] = useState(true);

  const onError = useCallback((msg: string) => setError(msg), []);
  const onLoading = useCallback((v: boolean) => setLoading(v), []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <LiffAuth onError={onError} onLoading={onLoading} />

      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl brand-gradient shadow-md mb-1">
            <span className="text-2xl font-black text-white">H</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Ha<span className="text-primary">Ty</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">หาที่ง่าย จัดการได้</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-md space-y-6">
          {error && (
            <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">กำลังเชื่อมต่อ LINE...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                สมัครและเข้าสู่ระบบด้วย LINE<br />
                <span className="text-xs">ฟรีเริ่มต้น · ไม่ต้องใช้บัตรเครดิต</span>
              </p>
              <a
                href="/api/auth/line"
                className="flex items-center justify-center gap-3 w-full h-13 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 active:opacity-75 shadow-sm py-3.5"
                style={{ backgroundColor: LINE_GREEN }}
              >
                <LineIcon />
                เข้าสู่ระบบด้วย LINE
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          HaTy © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function LineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 10.31C24 4.62 18.63 0 12 0S0 4.62 0 10.31c0 5.1 4.52 9.37 10.63 10.18.41.09.98.28 1.12.63.13.32.08.83.04 1.16l-.18 1.1c-.05.32-.25 1.27 1.11.69 1.36-.58 7.32-4.31 9.99-7.38C23.33 14.86 24 12.67 24 10.31z" />
    </svg>
  );
}
