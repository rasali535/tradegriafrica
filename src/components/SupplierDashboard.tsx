"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, CheckCircle, Clock, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

export function SupplierDashboard() {
  const { currentUser, rfqs, bids, submitBid, formatCurrency } = useApp();
  
  const supplierId = 'su200000-0000-0000-0000-000000000001';
  
  const myBids = bids.filter(b => b.supplier_company_id === supplierId);
  
  // Matched RFQs are open RFQs that the supplier hasn't bid on yet
  const matchedRFQs = rfqs.filter(r => r.status === 'open' && !myBids.some(b => b.rfq_id === r.id));

  const [selectedRfqToBid, setSelectedRfqToBid] = useState<any>(null);
  const [bidForm, setBidForm] = useState({ price_per_unit: 0, estimated_delivery_days: 0, notes: '' });

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqToBid) return;
    submitBid({
      rfq_id: selectedRfqToBid.id,
      supplier_company_id: supplierId,
      price_per_unit: Number(bidForm.price_per_unit),
      total_price: Number(bidForm.price_per_unit) * selectedRfqToBid.required_quantity,
      estimated_delivery_days: Number(bidForm.estimated_delivery_days),
      status: 'pending',
      notes: bidForm.notes
    });
    setSelectedRfqToBid(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Supplier Dashboard</h2>
          <p className="text-sm text-zinc-400">Manage your profile, active bids, and discover matched RFQs.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-emerald-950/30 text-emerald-400 border-emerald-900/50 flex items-center gap-1.5 px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Supplier
          </Badge>
          <Badge variant="outline" className="bg-blue-950/30 text-blue-400 border-blue-900/50 flex items-center gap-1.5 px-3 py-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Trust Score: 98/100
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-emerald-500" />
              Active Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{myBids.length}</div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-400" />
              {myBids.filter(b => b.status === 'accepted').length} Accepted this month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Profile Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">85%</div>
            <p className="text-xs text-amber-400 mt-1">Upload latest tax clearance to reach 100%</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Recent AI Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{matchedRFQs.length}</div>
            <p className="text-xs text-zinc-400 mt-1">New matching RFQs in the last 48 hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended RFQs */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg">AI-Matched RFQs</CardTitle>
            <CardDescription className="text-zinc-400">High-probability tenders based on your capabilities.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
                {matchedRFQs.map((rfq) => (
                  <div key={rfq.id} className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-emerald-500 bg-emerald-950/30 px-2 py-0.5 rounded">{rfq.id}</span>
                        <span className="font-semibold text-zinc-200 text-sm">{rfq.title}</span>
                      </div>
                      <div className="text-xs text-zinc-400">Buyer Co: {rfq.buyer_company_id.substring(0,8)} • Industry: {rfq.industry}</div>
                      <div className="text-xs text-amber-400/80">Deadline: {rfq.deadline} • Quantity: {rfq.required_quantity} {rfq.unit}</div>
                    </div>
                    <Button onClick={() => setSelectedRfqToBid(rfq)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0">Submit Bid</Button>
                  </div>
                ))}
                {matchedRFQs.length === 0 && (
                  <div className="text-zinc-500 text-sm py-4 text-center">No new matched RFQs at the moment.</div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bids */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg">Bid Status Pipeline</CardTitle>
            <CardDescription className="text-zinc-400">Track your proposals and contract progression.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs">RFQ / Tender</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Amount</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBids.map((bid) => {
                  const rfq = rfqs.find(r => r.id === bid.rfq_id);
                  return (
                    <TableRow key={bid.id} className="border-zinc-800 hover:bg-zinc-800/20">
                      <TableCell className="font-medium text-zinc-300 text-xs">
                        <div>{rfq?.title || 'Unknown RFQ'}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{bid.id} • {rfq?.deadline}</div>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-xs">{formatCurrency(bid.total_price)}</TableCell>
                      <TableCell>
                        {bid.status === 'accepted' && <Badge className="bg-emerald-950/50 text-emerald-400 border-emerald-900/50 text-[10px]">Accepted</Badge>}
                        {bid.status === 'pending' && <Badge className="bg-amber-950/50 text-amber-400 border-amber-900/50 text-[10px]">Pending</Badge>}
                        {bid.status === 'rejected' && <Badge className="bg-red-950/50 text-red-400 border-red-900/50 text-[10px]">Rejected</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {myBids.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-zinc-500 text-xs py-4">No active bids.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Submit Bid Modal */}
      {selectedRfqToBid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-zinc-950 border-zinc-800 shadow-xl">
            <CardHeader className="border-b border-zinc-900">
              <CardTitle className="text-zinc-100">Submit Bid</CardTitle>
              <CardDescription className="text-zinc-400">Propose a bid for {selectedRfqToBid.title} ({selectedRfqToBid.required_quantity} {selectedRfqToBid.unit})</CardDescription>
            </CardHeader>
            <form onSubmit={handleBidSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400">Price per {selectedRfqToBid.unit}</label>
                    <input required type="number" value={bidForm.price_per_unit || ''} onChange={e => setBidForm({...bidForm, price_per_unit: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500" placeholder="e.g. 50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400">Total Bid Price</label>
                    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-2 text-sm text-emerald-400 font-medium">
                      {formatCurrency(bidForm.price_per_unit * selectedRfqToBid.required_quantity)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">Estimated Delivery Time (Days)</label>
                  <input required type="number" value={bidForm.estimated_delivery_days || ''} onChange={e => setBidForm({...bidForm, estimated_delivery_days: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500" placeholder="e.g. 14" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">Proposal Notes</label>
                  <textarea value={bidForm.notes} onChange={e => setBidForm({...bidForm, notes: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500 h-24" placeholder="Mention certifications, SADC waivers, etc." />
                </div>
              </CardContent>
              <div className="p-4 border-t border-zinc-900 flex justify-end gap-3 bg-zinc-900/30 rounded-b-xl">
                <Button type="button" variant="outline" onClick={() => setSelectedRfqToBid(null)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit Proposal</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
