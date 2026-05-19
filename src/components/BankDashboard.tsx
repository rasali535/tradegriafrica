"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  DollarSign, ShieldCheck, TrendingUp, Landmark, FileSpreadsheet, 
  UserCheck, AlertTriangle, ArrowUpRight, Scale, Calculator, Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const BankDashboard: React.FC = () => {
  const { currentUser, financingRequests, updateFinancingRequest, payments, triggerEvent } = useApp();
  const [calcFarmSize, setCalcFarmSize] = useState<string>('');
  const [calcCapacity, setCalcCapacity] = useState<string>('');
  const [calcHistory, setCalcHistory] = useState<'high' | 'medium' | 'low'>('medium');
  const [riskResult, setRiskResult] = useState<number | null>(null);

  const bankName = currentUser?.name || 'Standard Bank SADC Trade';

  // Calculate stats
  const pendingRequests = financingRequests.filter(r => r.status === 'pending');
  const activeFinancingPool = financingRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalEscrowedFunds = payments
    .reduce((sum, p) => sum + p.amount, 0);

  const handleApprove = (id: string) => {
    updateFinancingRequest(id, 'approved');
    alert('Structured trade financing request approved and capital released!');
  };

  const handleDecline = (id: string) => {
    updateFinancingRequest(id, 'rejected');
    alert('Financing request declined due to SADC risk index constraints.');
  };

  const calculateRiskScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcFarmSize || !calcCapacity) {
      alert('Please fill out risk model inputs');
      return;
    }
    
    // Simple algorithmic SADC Agricultural Risk Assessment
    const size = Number(calcFarmSize);
    const capacity = Number(calcCapacity);
    
    let baseScore = 50;
    if (size > 500) baseScore -= 15;
    else if (size < 100) baseScore += 10;

    if (capacity > 1000) baseScore -= 15;
    else if (capacity < 200) baseScore += 10;

    if (calcHistory === 'high') baseScore -= 20;
    if (calcHistory === 'low') baseScore += 20;

    // Bound between 1 and 99
    const score = Math.max(1, Math.min(99, baseScore));
    setRiskResult(score);
    
    triggerEvent('bank.risk_calculated', { size, capacity, history: calcHistory, score });
  };

  return (
    <div className="space-y-6">
      {/* SADC Bank Header */}
      <div className="p-6 rounded-2xl glass-card border-emerald-900/30 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-500" />
            {bankName} Trade Finance Desk
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Underwrite SADC agricultural trade contracts, review smallholder farmer financing requests, verify buyer escrow deposits, and analyze agronomic credit scores.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900">
            SADC Clearing Bank Node
          </Badge>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Escrow Assets</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">${totalEscrowedFunds.toLocaleString()}</div>
            <p className="text-xs text-emerald-400 mt-1">Guaranteed SADC buyer deposits</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Financing Capital Deployed</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">${activeFinancingPool.toLocaleString()}</div>
            <p className="text-xs text-zinc-400 mt-1">Active micro-loans & credit lines</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pending Underwriting</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{pendingRequests.length} Applications</div>
            <p className="text-xs text-amber-400 font-semibold mt-1">Requires credit committee audit</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Portfolio NPL Ratio</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">0.0%</div>
            <p className="text-xs text-emerald-400 mt-1">Escrow security locks out defaults</p>
          </CardContent>
        </Card>
      </div>

      {/* Main split underwriting content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Requests List */}
        <Card className="lg:col-span-2 glass-card border-zinc-900/60 p-5">
          <div className="border-b border-zinc-800 pb-3 mb-4">
            <h3 className="font-bold text-zinc-100 text-sm">Credit Underwriting Pipeline</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Review structured invoice and harvest financing requests from SADC farms</p>
          </div>

          <div className="space-y-4">
            {financingRequests.map((req) => (
              <div 
                key={req.id} 
                className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-900 hover:border-zinc-850 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono text-[10px] text-zinc-500">REQ-{req.id.substring(0, 8)}</span>
                    <h4 className="font-semibold text-zinc-200 text-xs mt-0.5">{req.purpose}</h4>
                  </div>
                  <Badge className={
                    req.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/80 text-[10px]' :
                    req.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-900/80 text-[10px]' :
                    'bg-amber-950 text-amber-400 border border-amber-900/80 text-[10px]'
                  }>
                    {req.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs mt-3 pt-3 border-t border-zinc-900">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Capital Requested</span>
                    <div className="text-emerald-400 font-bold mt-0.5">${req.amount.toLocaleString()} USD</div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Agronomic Risk Index</span>
                    <div className={`font-bold mt-0.5 ${req.risk_score < 25 ? 'text-emerald-400' : req.risk_score < 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {req.risk_score}% Risk
                    </div>
                  </div>
                  <div className="flex justify-end items-center">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleDecline(req.id)}
                          size="sm" 
                          className="h-7 text-[10px] bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/20"
                        >
                          Decline
                        </Button>
                        <Button 
                          onClick={() => handleApprove(req.id)}
                          size="sm" 
                          className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500"
                        >
                          Approve Funding
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Credit Risk Calculator Tool */}
        <Card className="glass-card border-zinc-900/60 p-4">
          <div className="border-b border-zinc-800 pb-2 mb-3">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-emerald-500" />
              Agronomic Risk Calculator
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Underwrite smallholder risk models algorithmically</p>
          </div>

          <form onSubmit={calculateRiskScore} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Farm Size (Hectares)</label>
              <Input 
                type="number" 
                placeholder="e.g. 350" 
                value={calcFarmSize} 
                onChange={e => setCalcFarmSize(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Annual Production (Tons)</label>
              <Input 
                type="number" 
                placeholder="e.g. 1200" 
                value={calcCapacity} 
                onChange={e => setCalcCapacity(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Historical Default Risk</label>
              <select 
                value={calcHistory} 
                onChange={e => setCalcHistory(e.target.value as any)}
                className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 text-xs focus:ring-emerald-700"
              >
                <option value="high">High Default Risk</option>
                <option value="medium">Average SADC Performance</option>
                <option value="low">Perfect Repayment History</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              Compute Agronomic Score
            </Button>

            {riskResult !== null && (
              <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Risk Assessment Rating</span>
                <div className={`text-2xl font-bold mt-1 ${riskResult < 30 ? 'text-emerald-400' : riskResult < 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {riskResult}%
                </div>
                <p className="text-[9px] text-zinc-400 mt-1">
                  {riskResult < 30 ? 'Low risk. Recommended for immediate low-interest trade finance.' :
                   riskResult < 60 ? 'Moderate risk. SADC joint-guarantee co-signer required.' :
                   'High risk. Unsecured financing not recommended.'}
                </p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};
