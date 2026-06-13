import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingDown, TrendingUp, Users, DollarSign } from 'lucide-react';

export function ProcurementAnalytics() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Procurement Analytics</h2>
        <p className="text-sm text-zinc-400">Monitor your enterprise spend, supplier performance, and sourcing KPIs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardContent className="p-6 space-y-2">
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex justify-between">Total Spend YTD <DollarSign className="w-4 h-4 text-emerald-500"/></div>
            <div className="text-3xl font-extrabold text-zinc-100">$2.4M</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> 12% below budget</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardContent className="p-6 space-y-2">
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex justify-between">Active Suppliers <Users className="w-4 h-4 text-blue-500"/></div>
            <div className="text-3xl font-extrabold text-zinc-100">42</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5 this month</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardContent className="p-6 space-y-2">
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex justify-between">Avg AI Discount <BarChart3 className="w-4 h-4 text-amber-500"/></div>
            <div className="text-3xl font-extrabold text-zinc-100">8.5%</div>
            <div className="text-xs text-amber-500">Saved via smart matching</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardContent className="p-6 space-y-2">
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Top Category</div>
            <div className="text-xl font-extrabold text-zinc-100">Heavy Machinery</div>
            <div className="text-xs text-zinc-400">Accounts for 45% of spend</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-zinc-100">Spend by Category</CardTitle>
            <CardDescription className="text-zinc-400">Distribution of procurement budget across industries.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-zinc-500 text-sm">Chart visualization would render here...</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800 min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-zinc-100">Supplier Performance Rankings</CardTitle>
            <CardDescription className="text-zinc-400">Top vendors by reliability and delivery speed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
               <span className="text-sm text-zinc-200">1. Kalahari Mining Support</span>
               <span className="text-sm font-bold text-emerald-400">99.8% SLA</span>
             </div>
             <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
               <span className="text-sm text-zinc-200">2. TransKalahari Logistics</span>
               <span className="text-sm font-bold text-emerald-400">98.5% SLA</span>
             </div>
             <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
               <span className="text-sm text-zinc-200">3. SADC Steel Works</span>
               <span className="text-sm font-bold text-amber-400">95.0% SLA</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
