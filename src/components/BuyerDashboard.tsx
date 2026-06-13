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

export function BuyerDashboard() {
  const { currentUser } = useApp();
  
  const activeRFQs = [
    { id: 'RFQ-089', title: 'Heavy Machinery Maintenance', deadline: '2026-06-20', budget: '$50k-$100k', status: 'active', bids: 4 },
    { id: 'RFQ-092', title: 'Logistics Fleet Tracking', deadline: '2026-06-25', budget: '$20k-$50k', status: 'active', bids: 2 },
    { id: 'RFQ-095', title: 'Construction Steel Bulk', deadline: '2026-07-01', budget: '$100k+', status: 'draft', bids: 0 }
  ];

  const pendingBids = [
    { id: 'BID-014', rfq: 'RFQ-089', supplier: 'Kalahari Mining Support', trust: 98, amount: '$75,000' },
    { id: 'BID-015', rfq: 'RFQ-089', supplier: 'Orapa Equipment Solutions', trust: 85, amount: '$68,500' },
    { id: 'BID-016', rfq: 'RFQ-092', supplier: 'GPS Logistics Bots', trust: 92, amount: '$25,000' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Enterprise Procurement Portal</h2>
          <p className="text-sm text-zinc-400">Manage your RFQs, evaluate bids, and track procurement spend.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-md">
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
            <div className="text-3xl font-bold text-zinc-100">8</div>
            <p className="text-xs text-emerald-400 mt-1">2 closing this week</p>
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
            <div className="text-3xl font-bold text-zinc-100">14</div>
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
            <div className="text-3xl font-bold text-zinc-100">$2.4M</div>
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
                {activeRFQs.map((rfq) => (
                  <TableRow key={rfq.id} className="border-zinc-800 hover:bg-zinc-800/20">
                    <TableCell className="font-medium text-zinc-300 text-xs">
                      <div>{rfq.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{rfq.id}</div>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-xs">{rfq.deadline}</TableCell>
                    <TableCell>
                      <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 text-[10px]">{rfq.bids}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs">
                          <DropdownMenuItem className="hover:bg-zinc-800">Edit RFQ</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-zinc-800">View Bids</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-zinc-800">Cancel</DropdownMenuItem>
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
              {pendingBids.map((bid) => (
                <div key={bid.id} className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200 text-sm">{bid.supplier}</span>
                      <Badge variant="outline" className="bg-emerald-950/30 text-emerald-400 border-emerald-900/50 text-[10px] px-1.5 py-0">Trust: {bid.trust}</Badge>
                    </div>
                    <div className="text-xs text-zinc-400">For: <span className="font-mono">{bid.rfq}</span></div>
                    <div className="text-sm font-medium text-emerald-400">{bid.amount}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800">Reject</Button>
                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white">Evaluate</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
