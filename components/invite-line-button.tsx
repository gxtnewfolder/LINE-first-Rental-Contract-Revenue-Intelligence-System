'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Check, Copy, Loader2 } from 'lucide-react';

interface Props {
  tenantId: string;
  tenantName: string;
}

export function InviteLINEButton({ tenantId, tenantName }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied'>('idle');
  const [liffUrl, setLiffUrl] = useState<string | null>(null);

  async function handleInvite() {
    setState('loading');
    try {
      const res = await fetch(`/api/tenants/${tenantId}/invite`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLiffUrl(data.liffUrl);
      await navigator.clipboard.writeText(data.liffUrl);
      setState('copied');
      setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('idle');
    }
  }

  if (state === 'copied' && liffUrl) {
    return (
      <Button size="sm" variant="outline" className="gap-1.5 text-emerald-700 border-emerald-300 bg-emerald-50 shrink-0" disabled>
        <Check className="w-3.5 h-3.5" />
        คัดลอกแล้ว
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleInvite}
      disabled={state === 'loading'}
      className="gap-1.5 shrink-0"
      title={`ส่งลิงก์ลงทะเบียน LINE ให้ ${tenantName}`}
    >
      {state === 'loading'
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <><MessageSquare className="w-3.5 h-3.5" />ลิงก์ LINE</>
      }
    </Button>
  );
}
