"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ShieldCheck, MapPin, Star, Building2 } from 'lucide-react';

export function Marketplace() {
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');

  const suppliers = [
    { id: 'SUP-001', name: 'Kalahari Mining Support', industry: 'Industrial Equipment', country: 'Botswana', rating: 4.8, trustScore: 98, certifications: ['ISO 9001', 'SADC Approved'] },
    { id: 'SUP-002', name: 'Orapa Equipment Solutions', industry: 'Heavy Machinery', country: 'Botswana', rating: 4.5, trustScore: 85, certifications: ['BBS Certified'] },
    { id: 'SUP-003', name: 'TransKalahari Logistics', industry: 'Logistics', country: 'Namibia', rating: 4.9, trustScore: 95, certifications: ['ISO 14001', 'Cross-Border Permit'] },
    { id: 'SUP-004', name: 'SADC Steel Works', industry: 'Construction', country: 'South Africa', rating: 4.6, trustScore: 92, certifications: ['ISO 9001'] },
    { id: 'SUP-005', name: 'Gaborone Tech Supply', industry: 'IT Infrastructure', country: 'Botswana', rating: 4.2, trustScore: 78, certifications: [] }
  ];

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.industry.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industryFilter === 'All' || s.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Supplier Network</h2>
          <p className="text-sm text-zinc-400">Find and evaluate verified B2B suppliers across the African continent.</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 focus-within:border-emerald-800 transition-all">
          <Search className="h-4 w-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search suppliers by name or capability..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-0 outline-none text-sm text-zinc-200 w-full focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select 
            value={industryFilter} 
            onChange={e => setIndustryFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-sm p-2 text-zinc-300 focus:border-emerald-800 outline-none"
          >
            <option value="All">All Industries</option>
            <option value="Industrial Equipment">Industrial Equipment</option>
            <option value="Heavy Machinery">Heavy Machinery</option>
            <option value="Logistics">Logistics</option>
            <option value="Construction">Construction</option>
            <option value="IT Infrastructure">IT Infrastructure</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="bg-zinc-900/60 border-zinc-800/80 hover:border-emerald-900/60 transition-all flex flex-col">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-zinc-950 text-zinc-300 border-zinc-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400" /> {supplier.country}
                </Badge>
                {supplier.trustScore >= 90 && (
                  <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Premium Verified
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-500" />
                {supplier.name}
              </CardTitle>
              <div className="text-sm text-zinc-400 font-medium mt-1">{supplier.industry}</div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Trust Score</div>
                  <div className={`text-lg font-bold ${supplier.trustScore >= 90 ? 'text-emerald-400' : supplier.trustScore >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                    {supplier.trustScore}/100
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Rating</div>
                  <div className="text-lg font-bold text-zinc-200 flex items-center gap-1">
                    {supplier.rating} <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Certifications</div>
                <div className="flex flex-wrap gap-2">
                  {supplier.certifications.length > 0 ? supplier.certifications.map(cert => (
                    <Badge key={cert} variant="outline" className="border-zinc-700 text-zinc-300 text-[10px]">{cert}</Badge>
                  )) : <span className="text-xs text-zinc-500">No certifications listed</span>}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs h-8">View Profile</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">Invite to RFQ</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
