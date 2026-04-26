'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  onError: (msg: string) => void;
  onLoading: (loading: boolean) => void;
};

export function LiffAuth({ onError, onLoading }: Props) {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId || initialized) return;

    setInitialized(true);
    onLoading(true);

    import('@line/liff').then(({ default: liff }) => {
      liff.init({ liffId })
        .then(() => {
          if (!liff.isLoggedIn()) {
            // Not logged in inside LINE app — fall back to OAuth button
            onLoading(false);
            return;
          }

          const idToken = liff.getIDToken();
          if (!idToken) {
            onLoading(false);
            return;
          }

          // Send ID token to server for verification
          return fetch('/api/auth/liff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }).then(async (res) => {
            if (res.ok) {
              router.replace('/');
            } else {
              const data = await res.json();
              onError(
                data.error === 'unauthorized'
                  ? 'LINE account นี้ไม่มีสิทธิ์เข้าใช้งาน'
                  : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
              );
              onLoading(false);
            }
          });
        })
        .catch((err) => {
          console.error('[LIFF] Init error:', err);
          onLoading(false);
        });
    });
  }, [initialized, onError, onLoading, router]);

  return null;
}
