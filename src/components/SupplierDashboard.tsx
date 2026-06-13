"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, CheckCircle, Clock, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

export function SupplierDashboard() {
  const { currentUser } = useApp();
  
  // Mock data for Supplier Dashboard
  const activeBids = [
    { id: 'BID-001', rfq: 'Mining Equipment Spare Parts', amount: '$45,000', status: 'pending', date: '2026-06-10' },
    { id: 'BID-002', rfq: 'Construction Steel Supply', amount: '$120,000', status: 'accepted', date: '2026-06-05' },
    { id: 'BID-003', rfq: 'Safety Gear Bulk Order', amount: '$15,000', status: 'rejected', date: '2026-06-01' }
  ];

  const matchedRFQs = [
    { id: 'RFQ-089', title: 'Heavy Machinery Maintenance', buyer: 'Orapa Diamond Corp', deadline: '2026-06-20', budget: '$50k-$100k' },
    { id: 'RFQ-092', title: 'Logistics Fleet Tracking', buyer: 'TransKalahari Co', deadline: '2026-06-25', budget: '$20k-$50k' }
  ];

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
            <div className="text-3xl font-bold text-zinc-100">12</div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-400" />
              3 Accepted this month
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
            <div className="text-3xl font-bold text-zinc-100">5</div>
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
                    <div className="text-xs text-zinc-400">Buyer: {rfq.buyer} • Budget: {rfq.budget}</div>
                    <div className="text-xs text-amber-400/80">Deadline: {rfq.deadline}</div>
                  </div>
                  <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-xs shrink-0">View Details</Button>
                </div>
              ))}
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
                {activeBids.map((bid) => (
                  <TableRow key={bid.id} className="border-zinc-800 hover:bg-zinc-800/20">
                    <TableCell className="font-medium text-zinc-300 text-xs">
                      <div>{bid.rfq}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{bid.id} • {bid.date}</div>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-xs">{bid.amount}</TableCell>
                    <TableCell>
                      {bid.status === 'accepted' && <Badge className="bg-emerald-950/50 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/50 text-[10px]">Accepted</Badge>}
                      {bid.status === 'pending' && <Badge className="bg-amber-950/50 text-amber-400 border-amber-900/50 hover:bg-amber-950/50 text-[10px]">Pending</Badge>}
                      {bid.status === 'rejected' && <Badge className="bg-red-950/50 text-red-400 border-red-900/50 hover:bg-red-950/50 text-[10px]">Rejected</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
