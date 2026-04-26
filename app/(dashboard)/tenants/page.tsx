import React from 'react';
import { tenantService } from '@/services';
import { getSession } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { AddTenantDialog } from '@/components/add-tenant-dialog';
import { InviteLINEButton } from '@/components/invite-line-button';

export default async function TenantsPage() {
  const session = await getSession();
  const tenants = await tenantService.findAll(session?.ownerId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">ผู้เช่า</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ผู้เช่าทั้งหมด {tenants.length} คน</p>
        </div>
        <AddTenantDialog />
      </div>

      {tenants.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-base font-medium">ยังไม่มีผู้เช่า</p>
          <p className="text-sm mt-1">กดปุ่ม "เพิ่มผู้เช่า" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tenants.map((tenant: any) => (
            <div key={tenant.id} className="surface rounded-xl p-5 space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-black text-primary text-base">{tenant.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground font-mono uppercase mt-0.5">#{tenant.id.slice(-6)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {tenant.lineUserId ? (
                    <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                      <MessageSquare className="w-2.5 h-2.5" />
                      LINE ✓
                    </Badge>
                  ) : (
                    <InviteLINEButton tenantId={tenant.id} tenantName={tenant.name} />
                  )}
                  <AddTenantDialog initialData={{
                    id: tenant.id,
                    name: tenant.name,
                    phone: tenant.phone,
                    email: tenant.email,
                    idCard: tenant.idCard,
                    address: tenant.address,
                  }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 bg-secondary/40 rounded-lg px-3 py-2.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm tabnum font-medium">{tenant.phone}</span>
                </div>
                {tenant.email && (
                  <div className="flex items-center gap-2.5 bg-secondary/40 rounded-lg px-3 py-2.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{tenant.email}</span>
                  </div>
                )}
                {tenant.idCard && (
                  <div className="bg-secondary/40 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">บัตรประชาชน</p>
                    <p className="text-sm font-medium tabnum">{tenant.idCard}</p>
                  </div>
                )}
                {tenant.address && (
                  <div className="bg-secondary/40 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">ที่อยู่</p>
                    <p className="text-sm font-medium line-clamp-2">{tenant.address}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
