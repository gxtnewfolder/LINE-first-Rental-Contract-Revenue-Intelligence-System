'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, ChevronLeft } from 'lucide-react';

interface VacantRoom {
  id: string;
  roomNumber: string;
  floor: number;
  baseRentTHB: number;
  building: { name: string };
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
}

interface Props {
  vacantRooms: VacantRoom[];
  tenants: Tenant[];
}

export function CreateContractForm({ vacantRooms, tenants }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [roomId, setRoomId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentAmountTHB, setRentAmountTHB] = useState('');
  const [depositTHB, setDepositTHB] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill rent when room is selected
  function onRoomChange(id: string) {
    setRoomId(id);
    const room = vacantRooms.find(r => r.id === id);
    if (room) {
      setRentAmountTHB(String(room.baseRentTHB));
      setDepositTHB(String(room.baseRentTHB * 2));
    }
  }

  // Auto-set end date to 1 year from start
  function onStartDateChange(val: string) {
    setStartDate(val);
    if (val) {
      const d = new Date(val);
      d.setFullYear(d.getFullYear() + 1);
      setEndDate(d.toISOString().split('T')[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          tenantId,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          rentAmountTHB: Number(rentAmountTHB),
          depositTHB: Number(depositTHB),
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data.error === 'object'
          ? Object.values(data.error).flat().join(', ')
          : data.error;
        setError(msg || 'เกิดข้อผิดพลาด');
        return;
      }

      router.push('/contracts');
      router.refresh();
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-accent"
          onClick={() => router.back()}
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-black tracking-tight">สร้างสัญญาใหม่</h1>
          <p className="text-xs text-muted-foreground mt-0.5">กรอกข้อมูลให้ครบก่อนสร้างสัญญา</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        {/* Room */}
        <div className="surface rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ห้องพัก</p>
          <select
            required
            value={roomId}
            onChange={e => onRoomChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">— เลือกห้อง —</option>
            {vacantRooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.building.name} · ห้อง {r.roomNumber} (ชั้น {r.floor}) — ฿{r.baseRentTHB.toLocaleString()}/เดือน
              </option>
            ))}
          </select>
          {vacantRooms.length === 0 && (
            <p className="text-xs text-amber-600">ไม่มีห้องว่างในขณะนี้</p>
          )}
        </div>

        {/* Tenant */}
        <div className="surface rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ผู้เช่า</p>
          <select
            required
            value={tenantId}
            onChange={e => setTenantId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">— เลือกผู้เช่า —</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="surface rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ระยะเวลาสัญญา</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">วันเริ่ม</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => onStartDateChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">วันสิ้นสุด</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="surface rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ค่าเช่าและเงินประกัน</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">ค่าเช่า/เดือน (บาท)</label>
              <input
                type="number"
                required
                min={1}
                value={rentAmountTHB}
                onChange={e => setRentAmountTHB(e.target.value)}
                placeholder="5500"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium tabnum focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">เงินประกัน (บาท)</label>
              <input
                type="number"
                required
                min={0}
                value={depositTHB}
                onChange={e => setDepositTHB(e.target.value)}
                placeholder="11000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium tabnum focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          {rentAmountTHB && (
            <p className="text-xs text-muted-foreground">
              เงินประกันปกติ = 2 เดือน = ฿{(Number(rentAmountTHB) * 2).toLocaleString()}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="surface rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">หมายเหตุ (ถ้ามี)</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="เช่น เงื่อนไขพิเศษ..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-bold text-sm shadow-sm disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />กำลังสร้างสัญญา...</>
          ) : (
            <><FileText className="w-4 h-4 mr-2" />สร้างสัญญา</>
          )}
        </Button>
      </form>
    </div>
  );
}
