'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, Plus, Pencil } from 'lucide-react';

interface TenantData {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  idCard?: string | null;
  address?: string | null;
}

interface Props {
  initialData?: TenantData;
  trigger?: React.ReactNode;
}

export function AddTenantDialog({ initialData, trigger }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name:    initialData?.name    ?? '',
    phone:   initialData?.phone   ?? '',
    email:   initialData?.email   ?? '',
    idCard:  initialData?.idCard  ?? '',
    address: initialData?.address ?? '',
  });

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleOpen() {
    if (isEdit) {
      setForm({
        name:    initialData.name,
        phone:   initialData.phone,
        email:   initialData.email   ?? '',
        idCard:  initialData.idCard  ?? '',
        address: initialData.address ?? '',
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
      const body: Record<string, string> = { name: form.name, phone: form.phone };
      if (form.email)   body.email   = form.email;
      if (form.idCard)  body.idCard  = form.idCard;
      if (form.address) body.address = form.address;

      const url    = isEdit ? `/api/tenants/${initialData.id}` : '/api/tenants';
      const method = isEdit ? 'PATCH' : 'POST';

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));

      setOpen(false);
      if (!isEdit) setForm({ name: '', phone: '', email: '', idCard: '', address: '' });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  const defaultTrigger = isEdit ? (
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
      เพิ่มผู้เช่า
    </Button>
  );

  return (
    <>
      {trigger ? <span onClick={handleOpen}>{trigger}</span> : defaultTrigger}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">{isEdit ? 'แก้ไขผู้เช่า' : 'เพิ่มผู้เช่าใหม่'}</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">ชื่อ-นามสกุล <span className="text-destructive">*</span></label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="เช่น สมชาย ใจดี" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">เบอร์โทรศัพท์ <span className="text-destructive">*</span></label>
                <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="เช่น 0812345678" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-muted-foreground">อีเมล</label>
                  <Input value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" type="email" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-muted-foreground">บัตรประชาชน</label>
                  <Input value={form.idCard} onChange={e => update('idCard', e.target.value)} placeholder="1-xxxx-xxxxx-xx-x" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground">ที่อยู่</label>
                <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="ที่อยู่ตามทะเบียนบ้าน" />
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
