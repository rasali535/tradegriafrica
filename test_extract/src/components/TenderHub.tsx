import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, BellRing, Target } from 'lucide-react';

export function TenderHub() {
  const tenders = [
    { id: 'TND-2026-041', title: 'Supply of Heavy Construction Machinery', buyer: 'Govt Infrastructure Dept', budget: '$500k - $1M', deadline: '2026-07-15', match: 98 },
    { id: 'TND-2026-042', title: 'Bulk IT Infrastructure for Regional Offices', buyer: 'SADC Corporate Solutions', budget: '$250k - $500k', deadline: '2026-07-01', match: 85 },
    { id: 'TND-2026-043', title: 'Copper Wire Manufacturing Raw Materials', buyer: 'ZimTech Industries', budget: '$1M+', deadline: '2026-06-30', match: 72 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Tender Hub</h2>
          <p className="text-sm text-zinc-400">Discover and bid on public and private enterprise tenders.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-2">
          <BellRing className="w-3.5 h-3.5" /> Set Alerts
        </Button>
      </div>

      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 focus-within:border-emerald-800 transition-all">
          <Search className="h-4 w-4 text-zinc-500 shrink-0" />
          <input type="text" placeholder="Search tenders by keyword or reference..." className="bg-transparent border-0 outline-none text-sm text-zinc-200 w-full focus:ring-0" />
        </div>
        <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs">
          <Filter className="w-3.5 h-3.5 mr-2" /> Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tenders.map((tender) => (
          <Card key={tender.id} className="bg-zinc-900/50 border-zinc-800 hover:border-emerald-900/50 transition-all">
            <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-zinc-950 text-zinc-400 border-zinc-800 text-[10px]">{tender.id}</Badge>
                  {tender.match >= 90 && <Badge className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 text-[10px] flex items-center gap-1"><Target className="w-3 h-3" /> Strong Match</Badge>}
                </div>
                <h3 className="font-bold text-zinc-100 text-lg">{tender.title}</h3>
                <div className="text-xs text-zinc-400">Buyer: <span className="text-zinc-300">{tender.buyer}</span> • Est. Budget: <span className="text-zinc-300">{tender.budget}</span></div>
              </div>
              <div className="text-right flex flex-col md:items-end gap-3 w-full md:w-auto">
                <div className="text-xs font-semibold text-amber-500">Closes: {tender.deadline}</div>
                <Button className="w-full md:w-auto bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-900/60 text-xs transition-colors">
                  View Details & Bid
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
