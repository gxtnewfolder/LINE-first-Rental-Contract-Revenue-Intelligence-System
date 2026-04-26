'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type State = 'loading' | 'phone-form' | 'submitting' | 'success' | 'error';

function RegisterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>('loading');
  const [tenantName, setTenantName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [phone, setPhone] = useState('');
  const initialized = useRef(false);
  const liffRef = useRef<typeof import('@line/liff')['default'] | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      setErrorMsg('ระบบยังไม่ได้ตั้งค่า LIFF — กรุณาติดต่อผู้ดูแลระบบ');
      setState('error');
      return;
    }

    import('@line/liff').then(({ default: liff }) => {
      liffRef.current = liff;
      liff.init({ liffId }).then(() => {
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        if (token) {
          // Invite-token flow: auto-register immediately
          autoRegisterWithToken(liff, token);
        } else {
          // Self-registration flow: show phone form
          setState('phone-form');
        }
      }).catch(() => {
        setErrorMsg('ไม่สามารถเชื่อมต่อ LINE ได้ — กรุณาเปิดลิงก์ในแอป LINE');
        setState('error');
      });
    });
  }, [token]);

  async function autoRegisterWithToken(liff: NonNullable<typeof liffRef.current>, inviteToken: string) {
    setState('submitting');
    try {
      const profile = await liff.getProfile();
      const res = await fetch('/api/tenant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: inviteToken, lineUserId: profile.userId, displayName: profile.displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTenantName(data.tenantName);
      setState('success');
      if (liff.isInClient()) setTimeout(() => liff.closeWindow(), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setState('error');
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    const liff = liffRef.current;
    if (!liff) return;

    const cleaned = phone.replace(/[-\s]/g, '');
    if (!cleaned.match(/^0\d{8,9}$/)) {
      setErrorMsg('กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 0812345678');
      return;
    }
    setErrorMsg('');
    setState('submitting');

    try {
      const profile = await liff.getProfile();
      const res = await fetch('/api/tenant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned, lineUserId: profile.userId, displayName: profile.displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTenantName(data.tenantName);
      setState('success');
      if (liff.isInClient()) setTimeout(() => liff.closeWindow(), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setState('phone-form');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06C755]/8 to-white flex items-center justify-center p-5">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-[#06C755] flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-white">H</span>
          </div>
          <p className="text-xl font-black tracking-tight">Ha<span className="text-[#06C755]">Ty</span></p>
          <p className="text-sm text-gray-400">ระบบจัดการเช่าที่พัก</p>
        </div>

        {/* Loading */}
        {(state === 'loading' || state === 'submitting') && (
          <div className="text-center space-y-3 py-4">
            <div className="w-10 h-10 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 font-medium">
              {state === 'loading' ? 'กำลังเชื่อมต่อ LINE...' : 'กำลังลงทะเบียน...'}
            </p>
          </div>
        )}

        {/* Phone form */}
        {state === 'phone-form' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="text-center space-y-1">
              <p className="text-base font-black text-gray-800">ลงทะเบียนดูข้อมูลของคุณ</p>
              <p className="text-sm text-gray-500">กรอกเบอร์โทรที่ให้ไว้กับเจ้าของห้อง</p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0812345678"
                  inputMode="numeric"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#06C755]/40 focus:border-[#06C755] transition-all"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#06C755] text-white font-bold rounded-xl hover:bg-[#05b34b] active:scale-[0.98] transition-all text-base"
              >
                ลงทะเบียน
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              ระบบจะเชื่อม LINE ของคุณกับข้อมูลผู้เช่า<br />
              เพื่อรับแจ้งเตือนสัญญาและค่าเช่า
            </p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-7 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <div>
              <p className="text-lg font-black text-gray-800">ลงทะเบียนสำเร็จ!</p>
              {tenantName && <p className="text-sm text-gray-500 mt-1">ยินดีต้อนรับ คุณ{tenantName}</p>}
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 text-left space-y-1">
              <p className="font-bold">ตอนนี้คุณสามารถ:</p>
              <p>💰 เช็คยอดค่าเช่า</p>
              <p>📄 ดูรายละเอียดสัญญา</p>
              <p>📊 ดูประวัติการชำระ</p>
            </div>
            <p className="text-xs text-gray-400">กลับไปที่ LINE เพื่อเริ่มใช้งาน</p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-7 text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <div>
              <p className="text-lg font-black text-gray-800">เกิดข้อผิดพลาด</p>
              <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
            </div>
            <p className="text-xs text-gray-400">
              หากมีปัญหา กรุณาติดต่อเจ้าของห้อง
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
