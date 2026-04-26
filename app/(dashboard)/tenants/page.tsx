import React from 'react';
import { tenantService } from '@/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, Plus, ArrowRight } from 'lucide-react';

export default async function TenantsPage() {
  const tenants = await tenantService.findAll();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Tenants</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ข้อมูลผู้เช่าและการติดต่อ</p>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-1.5">
          <Plus className="w-4 h-4" />
          Add Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tenants.map((tenant: any) => (
          <div key={tenant.id} className="surface rounded-xl p-5 space-y-4 group hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-black text-primary text-sm">{tenant.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{tenant.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">{tenant.id.slice(-6)}</p>
              </div>
              {tenant.lineUserId ? (
                <Badge className="text-[10px] bg-emerald-400/10 text-emerald-400 border-emerald-400/20 gap-1 shrink-0">
                  <MessageSquare className="w-2.5 h-2.5" />
                  LINE
                </Badge>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 surface-raised rounded-lg px-3 py-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm tabnum font-medium">{tenant.phone}</span>
              </div>
              {tenant.email && (
                <div className="flex items-center gap-2 surface-raised rounded-lg px-3 py-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{tenant.email}</span>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent">
              View Profile
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
