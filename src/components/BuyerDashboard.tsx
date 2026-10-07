"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, FileText, PlusCircle, History, Filter, Search, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RfqEvaluationScreen } from './RfqEvaluationScreen';

export function BuyerDashboard() {
  const { currentUser, rfqs, bids, createRfq, formatCurrency, currency, setCurrency } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [evaluatingRfqId, setEvaluatingRfqId] = useState<string | null>(null);
  const [newRfqForm, setNewRfqForm] = useState({ title: '', industry: 'Mining', required_quantity: 0, unit: 'Tons', delivery_location: '', deadline: '' });
  const [dashboardNow] = useState(() => Date.now());
  
  const myRfqs = rfqs.filter(r => r.buyer_company_id === 'co100000-0000-0000-0000-000000000001');
  const myActiveRfqs = myRfqs.filter(r => r.status === 'open');
  const myBids = bids.filter(b => myRfqs.some(r => r.id === b.rfq_id));
  const pendingBidsList = myBids.filter(b => b.status === 'pending');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRfq({
      buyer_company_id: 'co100000-0000-0000-0000-000000000001',
      title: newRfqForm.title,
      description: 'Procurement requirement generated from dashboard.',
      industry: newRfqForm.industry,
      required_quantity: Number(newRfqForm.required_quantity),
      unit: newRfqForm.unit,
      delivery_location: newRfqForm.delivery_location,
      deadline: newRfqForm.deadline,
      status: 'open'
    });
    setShowCreateModal(false);
  };

  if (evaluatingRfqId) {
    return <RfqEvaluationScreen rfqId={evaluatingRfqId} onBack={() => setEvaluatingRfqId(null)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Procurement Workspace</h2>
          <p className="text-sm text-zinc-400">Manage your active RFQs, track pipeline spend, and discover supplier recommendations.</p>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1.5 outline-none hover:border-zinc-700 focus:border-emerald-500"
          >
            <option value="USD">USD</option>
            <option value="ZAR">ZAR</option>
            <option value="BWP">BWP</option>
            <option value="ZMW">ZMW</option>
            <option value="NAD">NAD</option>
          </select>
          <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-md">
            <PlusCircle className="h-4 w-4" />
            Create RFQ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
              Active RFQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{myActiveRfqs.length}</div>
            <p className="text-xs text-emerald-400 mt-1">{myActiveRfqs.filter(r => new Date(r.deadline).getTime() < dashboardNow + 7*24*3600*1000).length} closing this week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              Bids Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{pendingBidsList.length}</div>
            <p className="text-xs text-zinc-400 mt-1">Across all open tenders</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <History className="h-4 w-4 text-blue-500" />
              Total Spend (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{formatCurrency(myBids.filter(b => b.status === 'accepted').reduce((sum, b) => sum + b.total_price, 0))}</div>
            <p className="text-xs text-emerald-400 mt-1">~12% below market average (AI optimized)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100 text-lg">My Tenders & RFQs</CardTitle>
              <CardDescription className="text-zinc-400">Manage your active request for quotations.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 border-zinc-800 text-zinc-300 hover:bg-zinc-800">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs">RFQ Title</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Deadline</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Bids</TableHead>
                  <TableHead className="text-zinc-400 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRfqs.map((rfq) => (
                  <TableRow key={rfq.id} className="border-zinc-800 hover:bg-zinc-800/20">
                    <TableCell className="font-medium text-zinc-300 text-xs">
                      <div>{rfq.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{rfq.id}</div>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-xs">{rfq.deadline}</TableCell>
                    <TableCell>
                      <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 text-[10px]">{bids.filter(b => b.rfq_id === rfq.id).length}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-8 w-8 ml-auto items-center justify-center rounded-md p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs">
                          <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">Edit RFQ</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEvaluatingRfqId(rfq.id)} className="hover:bg-zinc-800 cursor-pointer text-emerald-400">Evaluate Bids</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-zinc-800 cursor-pointer">Close RFQ</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg">Pending Bids for Review</CardTitle>
            <CardDescription className="text-zinc-400">Evaluate proposals submitted by verified suppliers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBidsList.map((bid) => (
                <div key={bid.id} className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200 text-sm">Supplier {bid.supplier_company_id.substring(0,8)}</span>
                      <Badge variant="outline" className="bg-emerald-950/30 text-emerald-400 border-emerald-900/50 text-[10px] px-1.5 py-0">Trust: 95</Badge>
                    </div>
                    <div className="text-xs text-zinc-400">For RFQ: <span className="font-mono">{bid.rfq_id}</span></div>
                    <div className="text-sm font-medium text-emerald-400">{formatCurrency(bid.total_price)}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800">Reject</Button>
                    <Button onClick={() => setEvaluatingRfqId(bid.rfq_id)} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white">Evaluate</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create RFQ Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-zinc-950 border-zinc-800 shadow-xl">
            <CardHeader className="border-b border-zinc-900">
              <CardTitle className="text-zinc-100">Create New RFQ</CardTitle>
              <CardDescription className="text-zinc-400">Broadcast your procurement requirements to verified suppliers.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">RFQ Title</label>
                  <input required value={newRfqForm.title} onChange={e => setNewRfqForm({...newRfqForm, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500" placeholder="e.g. 50 Tons Construction Steel" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400">Industry</label>
                    <select value={newRfqForm.industry} onChange={e => setNewRfqForm({...newRfqForm, industry: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500">
                      <option value="Mining">Mining</option>
                      <option value="Construction">Construction</option>
                      <option value="Mining">Mining</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400">Delivery Location</label>
                    <input required value={newRfqForm.delivery_location} onChange={e => setNewRfqForm({...newRfqForm, delivery_location: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500" placeholder="e.g. Gaborone" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400">Required Quantity</label>
                    <input required type="number" value={newRfqForm.required_quantity} onChange={e => setNewRfqForm({...newRfqForm, required_quantity: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400">Unit (e.g. Tons, Units)</label>
                    <input required value={newRfqForm.unit} onChange={e => setNewRfqForm({...newRfqForm, unit: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500" placeholder="Tons" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">Submission Deadline</label>
                  <input required type="date" value={newRfqForm.deadline} onChange={e => setNewRfqForm({...newRfqForm, deadline: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-100 outline-none focus:border-emerald-500" />
                </div>
              </CardContent>
              <div className="p-4 border-t border-zinc-900 flex justify-end gap-3 bg-zinc-900/30 rounded-b-xl">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Broadcast RFQ</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
