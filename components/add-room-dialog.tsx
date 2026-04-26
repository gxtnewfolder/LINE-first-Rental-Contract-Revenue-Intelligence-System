'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, Plus, Pencil } from 'lucide-react';

interface Building { id: string; name: string; }

interface RoomData {
  id: string;
  buildingId: string;
  roomNumber: string;
  floor?: number | null;
  sizeSqm?: number | null;
  baseRentTHB: number;
  status: string;
}

interface Props {
  buildings: Building[];
  initialData?: RoomData;
}

export function AddRoomDialog({ buildings, initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    buildingId:  initialData?.buildingId           ?? buildings[0]?.id ?? '',
    roomNumber:  initialData?.roomNumber           ?? '',
    floor:       initialData?.floor?.toString()    ?? '',
    sizeSqm:     initialData?.sizeSqm?.toString()  ?? '',
    baseRentTHB: initialData?.baseRentTHB?.toString() ?? '',
    status:      initialData?.status              ?? 'VACANT',
  });

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleOpen() {
    if (isEdit) {
      setForm({
        buildingId:  initialData.buildingId,
        roomNumber:  initialData.roomNumber,
        floor:       initialData.floor?.toString()    ?? '',
        sizeSqm:     initialData.sizeSqm?.toString()  ?? '',
        baseRentTHB: initialData.baseRentTHB.toString(),
        status:      initialData.status,
      });
    }
    setError('');
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        buildingId:  form.buildingId,
        roomNumber:  form.roomNumber,
        baseRentTHB: Number(form.baseRentTHB),
        status:      form.status,
      };
      if (form.floor)   body.floor   = Number(form.floor);
      if (form.sizeSqm) body.sizeSqm = Number(form.sizeSqm);

      const url    = isEdit ? `/api/rooms/${initialData.id}` : '/api/rooms';
      const method = isEdit ? 'PATCH' : 'POST';

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));

      setOpen(false);
      if (!isEdit) setForm({ buildingId: buildings[0]?.id ?? '', roomNumber: '', floor: '', sizeSqm: '', baseRentTHB: '', status: 'VACANT' });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {isEdit ? (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
          title="แก้ไข"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      ) : (
        <Button size="sm" className="bg-primary text-white hover:bg-primary/90 font-bold gap-1.5 shadow-sm" onClick={handleOpen}>
          <Plus className="w-4 h-4" />
          เพิ่มห้อง
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">{isEdit ? 'แก้ไขห้องพัก' : 'เพิ่มห้องใหม่'}</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">อาคาร <span className="text-destructive">*</span></label>
                <select
                  value={form.buildingId}
                  onChange={e => update('buildingId', e.target.value)}
                  required
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">เลขห้อง <span className="text-destructive">*</span></label>
                  <Input value={form.roomNumber} onChange={e => update('roomNumber', e.target.value)} placeholder="เช่น 101, A-01" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-muted-foreground">ชั้น</label>
                  <Input value={form.floor} onChange={e => update('floor', e.target.value)} placeholder="เช่น 1" type="number" min="1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-muted-foreground">ขนาด (ตร.ม.)</label>
                  <Input value={form.sizeSqm} onChange={e => update('sizeSqm', e.target.value)} placeholder="เช่น 28" type="number" min="1" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">ค่าเช่า/เดือน (บาท) <span className="text-destructive">*</span></label>
                  <Input value={form.baseRentTHB} onChange={e => update('baseRentTHB', e.target.value)} placeholder="เช่น 5000" type="number" min="1" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground">สถานะ</label>
                <select
                  value={form.status}
                  onChange={e => update('status', e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="VACANT">ว่าง</option>
                  <option value="OCCUPIED">มีผู้เช่า</option>
                  <option value="MAINTENANCE">ซ่อมแซม</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>ยกเลิก</Button>
                <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90 font-bold" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEdit ? 'บันทึกการแก้ไข' : 'บันทึก'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
