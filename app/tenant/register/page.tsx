'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type State = 'loading' | 'ready' | 'registering' | 'success' | 'error';

function RegisterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>('loading');
  const [tenantName, setTenantName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!token) {
      setErrorMsg('ลิงก์ไม่ถูกต้อง — ขอลิงก์ใหม่จากเจ้าของห้อง');
      setState('error');
      return;
    }

    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      setErrorMsg('ระบบยังไม่ได้ตั้งค่า LIFF — กรุณาติดต่อผู้ดูแลระบบ');
      setState('error');
      return;
    }

    import('@line/liff').then(({ default: liff }) => {
      liff.init({ liffId }).then(async () => {
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        setState('registering');
        try {
          const profile = await liff.getProfile();
          const res = await fetch('/api/tenant/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              lineUserId: profile.userId,
              displayName: profile.displayName,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setTenantName(data.tenantName);
          setState('success');
          // Close LIFF window after 2s if opened in LINE
          if (liff.isInClient()) {
            setTimeout(() => liff.closeWindow(), 2500);
          }
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
          setState('error');
        }
      }).catch(() => {
        setErrorMsg('ไม่สามารถเชื่อมต่อ LINE ได้ — กรุณาเปิดลิงก์ในแอป LINE');
        setState('error');
      });
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06C755]/5 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-5">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#06C755] flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-white">H</span>
          </div>
          <p className="text-xl font-black tracking-tight">
            Ha<span className="text-[#06C755]">Ty</span>
          </p>
          <p className="text-sm text-gray-500">ระบบจัดการเช่าที่พัก</p>
        </div>

        {state === 'loading' && (
          <div className="space-y-3">
            <div className="w-10 h-10 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 font-medium">กำลังเชื่อมต่อ LINE...</p>
          </div>
        )}

        {state === 'registering' && (
          <div className="space-y-3">
            <div className="w-10 h-10 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 font-medium">กำลังลงทะเบียน...</p>
          </div>
        )}

        {state === 'success' && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-7 space-y-4">
            <div className="text-5xl">✅</div>
            <div>
              <p className="text-lg font-black text-gray-800">ลงทะเบียนสำเร็จ!</p>
              {tenantName && (
                <p className="text-sm text-gray-500 mt-1">สวัสดีคุณ {tenantName}</p>
              )}
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700">
              คุณจะได้รับการแจ้งเตือนผ่าน LINE เมื่อมีสัญญา, ค่าเช่า หรือข้อความสำคัญ
            </div>
            <p className="text-xs text-gray-400">หน้าต่างจะปิดอัตโนมัติ...</p>
          </div>
        )}

        {state === 'error' && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-7 space-y-4">
            <div className="text-5xl">⚠️</div>
            <div>
              <p className="text-lg font-black text-gray-800">เกิดข้อผิดพลาด</p>
              <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
            </div>
            <p className="text-xs text-gray-400">
              หากมีปัญหา กรุณาติดต่อเจ้าของห้องเพื่อขอลิงก์ใหม่
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TenantRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
