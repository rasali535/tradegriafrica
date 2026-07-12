import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat, Tractor, Truck, Pickaxe, Factory, Monitor, ShieldPlus, Landmark } from 'lucide-react';

export function IndustryDirectory() {
  const industries = [
    { name: 'Agriculture', icon: <Tractor className="w-8 h-8 text-emerald-500" />, suppliers: 124, activeRfqs: 45 },
    { name: 'Mining', icon: <Pickaxe className="w-8 h-8 text-amber-500" />, suppliers: 89, activeRfqs: 62 },
    { name: 'Construction', icon: <HardHat className="w-8 h-8 text-blue-500" />, suppliers: 210, activeRfqs: 112 },
    { name: 'Logistics', icon: <Truck className="w-8 h-8 text-purple-500" />, suppliers: 340, activeRfqs: 88 },
    { name: 'Manufacturing', icon: <Factory className="w-8 h-8 text-rose-500" />, suppliers: 156, activeRfqs: 34 },
    { name: 'ICT & Technology', icon: <Monitor className="w-8 h-8 text-cyan-500" />, suppliers: 405, activeRfqs: 150 },
    { name: 'Healthcare', icon: <ShieldPlus className="w-8 h-8 text-red-500" />, suppliers: 78, activeRfqs: 22 },
    { name: 'Government', icon: <Landmark className="w-8 h-8 text-zinc-400" />, suppliers: 0, activeRfqs: 310 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Industry Directory</h2>
        <p className="text-sm text-zinc-400">Explore TradeGrid Africa's verified network across 8 core enterprise sectors.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {industries.map((ind) => (
          <Card key={ind.name} className="bg-zinc-900/50 border-zinc-800 hover:border-emerald-900/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-zinc-950 group-hover:scale-110 transition-transform">
                {ind.icon}
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">{ind.name}</h3>
                <div className="text-xs text-zinc-500 mt-1">{ind.suppliers} Suppliers • {ind.activeRfqs} Live RFQs</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
