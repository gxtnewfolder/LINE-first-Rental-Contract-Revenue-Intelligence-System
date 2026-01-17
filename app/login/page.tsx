import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020202]">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="glass border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="pt-12 pb-8 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
              <Home className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-4xl font-black tracking-tight text-white uppercase italic">RentalAI</CardTitle>
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
                Revenue Intelligence System
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-10 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="text" 
                    placeholder="admin@rentalai.com" 
                    defaultValue="admin"
                    className="h-14 pl-12 rounded-2xl bg-white/[0.03] border-white/10 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>
              
              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    defaultValue="password"
                    className="h-14 pl-12 rounded-2xl bg-white/[0.03] border-white/10 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0 transition-colors" />
                <span className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors">Remember Session</span>
              </label>
              <a href="#" className="text-xs font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                Forgot Access?
              </a>
            </div>
            
            <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3">
              <LogIn className="w-6 h-6" />
              Sign In To Dashboard
            </Button>
          </CardContent>
          
          <CardFooter className="pb-10 pt-0 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
               <ShieldCheck className="w-4 h-4 text-emerald-400" />
               <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                 Secured by RentalAI Cloud Protocol
               </span>
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
