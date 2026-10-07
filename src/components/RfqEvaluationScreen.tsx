"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, TrendingDown, Clock, Scale, ArrowRight, BrainCircuit, CheckCircle2 } from 'lucide-react';

import { useApp } from '@/context/AppContext';

export const RfqEvaluationScreen: React.FC<{ rfqId: string, onBack: () => void }> = ({ rfqId, onBack }) => {
  const { rfqs, bids, awardBidAndCreateShipment, formatCurrency } = useApp();
  
  const currentRfq = rfqs.find(r => r.id === rfqId);
  const activeBids = bids.filter(b => b.rfq_id === rfqId);
  
  const [selectedBidId, setSelectedBidId] = useState<string | null>(activeBids[0]?.id || null);

  const selectedBid = activeBids.find(b => b.id === selectedBidId);

  const handleAwardContract = () => {
    if (!selectedBid) return;
    const shipment = awardBidAndCreateShipment(selectedBid.id);
    if (!shipment) {
      alert('TradeGrid could not create the shipment execution record for this award.');
      return;
    }
    alert(`Contract awarded. Shipment ${shipment.id.slice(0, 8)} is ready for transporter assignment and GridAi monitoring.`);
    onBack();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-[600px]">
      {/* Left Column: Bid List */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-zinc-400 hover:text-zinc-200">
            ← Back
          </Button>
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Active Bids ({currentRfq?.title})</h3>
        </div>
        {activeBids.map(bid => (
          <div
            key={bid.id}
            onClick={() => setSelectedBidId(bid.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
              selectedBidId === bid.id 
                ? 'bg-emerald-950/20 border-emerald-500 shadow-md shadow-emerald-900/20' 
                : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-zinc-100">Supplier {bid.supplier_company_id.substring(0,8)}</h4>
                <p className="text-xs text-zinc-500">Regional Partner</p>
              </div>
              {bid.status === 'accepted' && (
                <Badge className="bg-emerald-900/50 text-emerald-400 border border-emerald-800 text-[10px]">
                  Awarded
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="bg-zinc-900/50 p-2 rounded">
                <span className="text-zinc-500 block mb-1">Price/Unit</span>
                <strong className="text-emerald-400">{formatCurrency(bid.price_per_unit)}</strong>
              </div>
              <div className="bg-zinc-900/50 p-2 rounded">
                <span className="text-zinc-500 block mb-1">Lead Time</span>
                <strong className="text-zinc-200">{bid.estimated_delivery_days} Days</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Split-View Evaluation Matrix */}
      <div className="w-full lg:w-2/3">
        {selectedBid ? (
          <Card className="glass-card border-zinc-900 h-full flex flex-col">
            <CardHeader className="border-b border-zinc-900 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    Supplier {selectedBid.supplier_company_id.substring(0,8)} Evaluation
                  </CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">
                    AI-driven procurement analysis and smart contract readiness
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-emerald-400">{formatCurrency(selectedBid.price_per_unit)}</div>
                  <div className="text-xs text-zinc-500">per {currentRfq?.unit || 'Unit'}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 space-y-6">
              
              {/* AI Insight Box */}
              <div className="p-4 rounded-xl border border-emerald-900/50 bg-emerald-950/10 flex items-start gap-4">
                <BrainCircuit className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-zinc-200 text-sm mb-1">Orchestrator AI Insight</h5>
                  <p className="text-sm text-zinc-400 leading-relaxed">Optimum balance of speed and compliance based on regional data.</p>
                </div>
              </div>

              {/* Comparison Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col items-center text-center space-y-2">
                  <TrendingDown className="h-5 w-5 text-zinc-400" />
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Cost</span>
                  <span className="text-xl font-bold text-zinc-200">{formatCurrency(selectedBid.total_price)}</span>
                  <span className="text-[10px] text-zinc-600">For {currentRfq?.required_quantity} {currentRfq?.unit}</span>
                </div>
                
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col items-center text-center space-y-2">
                  <Clock className="h-5 w-5 text-zinc-400" />
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Transit Time</span>
                  <span className="text-xl font-bold text-zinc-200">{selectedBid.estimated_delivery_days} Days</span>
                  <span className="text-[10px] text-zinc-600">Border Wait Included</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col items-center text-center space-y-2">
                  <Scale className="h-5 w-5 text-emerald-500" />
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Compliance</span>
                  <span className="text-xl font-bold text-emerald-400">95/100</span>
                  <span className="text-[10px] text-zinc-600">SADC Protocol Check</span>
                </div>
              </div>

              <div className="pt-6 mt-auto border-t border-zinc-900 flex justify-end gap-3">
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
                  Request Revision
                </Button>
                <Button onClick={handleAwardContract} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Award Contract & Lock
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
            <p className="text-zinc-500">Select a bid to view evaluation matrix</p>
          </div>
        )}
      </div>
    </div>
  );
};
