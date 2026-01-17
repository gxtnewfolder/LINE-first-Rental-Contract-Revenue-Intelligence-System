import React from 'react';
import { tenantService } from '@/services';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, User, Plus, MoveRight, MessageSquare, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function TenantsPage() {
  const tenants = await tenantService.findAll();

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-gradient">Tenants Registry</h1>
          <p className="text-muted-foreground text-lg italic">Maintain resident records and contact information.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg shadow-primary/20 group">
          <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" />
          Add Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tenants.map((tenant: any) => (
          <Card key={tenant.id} className="glass border-none group hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-8">
              <Avatar className="h-16 w-16 border-2 border-primary/20 p-1 group-hover:border-primary transition-all">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-black text-xl">
                  {tenant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-xl font-black truncate">{tenant.name}</h3>
                <span className="text-[10px] font-mono font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                  ID: {tenant.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </CardHeader>

            <CardContent className="px-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">Phone</span>
                  </div>
                  <span className="text-sm font-black italic">{tenant.phone}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-muted-foreground">Email</span>
                  </div>
                  <span className="text-sm font-black italic truncate max-w-[150px]">{tenant.email || 'N/A'}</span>
                </div>
              </div>

               <div className="flex items-center gap-2">
                {tenant.lineUserId ? (
                  <Badge className="bg-emerald-400 text-emerald-950 font-black px-3 py-1 text-[10px] rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-400/20">
                    <MessageSquare className="w-3 h-3 fill-current" />
                    LINE Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-white/10 font-bold px-3 py-1 text-[10px] rounded-full">
                    No Social Linked
                  </Badge>
                )}
               </div>
            </CardContent>

            <CardFooter className="px-8 pt-4 pb-8">
              <Button variant="secondary" className="w-full h-12 rounded-xl font-black bg-white/5 hover:bg-primary hover:text-white transition-all group/btn border border-white/5">
                View Intelligence Profile
                <MoveRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
