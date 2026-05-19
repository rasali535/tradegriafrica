"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Building2, Globe, ShieldCheck, ShieldAlert, BarChart3, TrendingUp, 
  Layers, Lock, Sliders, AlertTriangle, FileText, Ban, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const GovernmentDashboard: React.FC = () => {
  const { currentUser, listings, orders, exports, eventLogs, triggerEvent } = useApp();
  const [restrictedCommodities, setRestrictedCommodities] = useState<string[]>(['Maize']);
  const [tariffWaiver, setTariffWaiver] = useState<number>(85);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const govCountry = currentUser?.country || 'Botswana';

  // Compute statistics
  const totalCorridorVolume = orders.reduce((sum, o) => sum + o.quantity, 0);
  const activeQuarantineCases = exports.filter(e => e.status === 'incomplete' || e.status === 'rejected').length;
  
  const handleToggleRestriction = (commodity: string) => {
    let updated: string[];
    if (restrictedCommodities.includes(commodity)) {
      updated = restrictedCommodities.filter(c => c !== commodity);
      triggerEvent('government.policy_changed', { country: govCountry, restriction_removed: commodity });
      alert(`Export restriction removed for ${commodity}. Trade flows normalized.`);
    } else {
      updated = [...restrictedCommodities, commodity];
      triggerEvent('government.policy_changed', { country: govCountry, restriction_added: commodity });
      alert(`Emergency export restriction enacted on ${commodity} to protect domestic food reserve!`);
    }
    setRestrictedCommodities(updated);
  };

  return (
    <div className="space-y-6">
      {/* SADC Government Header */}
      <div className="p-6 rounded-2xl glass-card border-emerald-900/30 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Globe className="h-5 w-5 text-emerald-500 animate-spin-slow" />
            {govCountry} Ministry of Agricultural Trade & Policy
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            National sovereign control desk for SADC trade policy, domestic food reserves regulation, import/export restrictions, and biosecurity clearance verification.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900">
            Sovereign Authority: {govCountry}
          </Badge>
        </div>
      </div>

      {/* Policy and Food Security KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Food Security Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">Stable (84%)</div>
            <p className="text-xs text-emerald-400 mt-1">Domestic reserves above risk limit</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Corridor Export Flow</CardTitle>
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{totalCorridorVolume.toLocaleString()} Tons</div>
            <p className="text-xs text-zinc-400 mt-1">Total traded quantity through desk</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Biosecurity Holds</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeQuarantineCases} Quarantine</div>
            <p className="text-xs text-amber-400 font-semibold mt-1">Awaiting compliance verification</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Bilateral Tariffs</CardTitle>
            <Sliders className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">-{tariffWaiver}% Waiver</div>
            <p className="text-xs text-blue-400 mt-1">SADC Free Trade Area agreement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main split control panel content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Controls Section */}
        <Card className="lg:col-span-2 glass-card border-zinc-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">Emergency Market Interventions</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Toggle domestic food protection rules and regional tariff exemptions</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Emergency Export Ban Toggles */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-500" />
                  Domestic Reserve Grain & Meat Protection
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {['Maize', 'Sorghum', 'Beef', 'Horticulture'].map((commodity) => {
                    const isRestricted = restrictedCommodities.includes(commodity);
                    return (
                      <div 
                        key={commodity} 
                        className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                          isRestricted ? 'bg-red-950/20 border-red-900/40 text-red-200' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-zinc-200">{commodity} Export Controls</div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {isRestricted ? 'Emergency Export Hold Enacted' : 'Allowed SADC Open Market'}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleToggleRestriction(commodity)}
                          className={`h-7 px-3 text-[10px] font-bold ${
                            isRestricted 
                              ? 'bg-red-900 hover:bg-red-800 text-red-100 border border-red-700' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {isRestricted ? 'De-restrict' : 'Restrict'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tariff Adjuster Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Bilateral SADC Tariff Waiver Rate
                  </h4>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-mono">
                    {tariffWaiver}% Discount
                  </Badge>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-zinc-500">Protectionist (0%)</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={tariffWaiver} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTariffWaiver(val);
                        triggerEvent('government.tariff_adjusted', { country: govCountry, tariff_waiver: val });
                      }}
                      className="flex-1 accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer" 
                    />
                    <span className="text-[10px] font-bold text-zinc-500">Free Trade (100%)</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    Adjusts SADC Preferential Tariffs. Higher waiver boosts volume but reduces border customs revenue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-800 pt-3 mt-6">
            Liaising with Southern African Customs Union (SACU) guidelines. Action logging enforced by regional treaties.
          </div>
        </Card>

        {/* Ledger logs */}
        <Card className="glass-card border-zinc-900/60 p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-zinc-800 pb-2 mb-3">
              <h3 className="font-bold text-zinc-100 text-sm">National Trade Ledger</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Live audit trail of sovereign crop inspections and custom filings</p>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
              {eventLogs.map((log) => (
                <div 
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-2.5 rounded bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-900/60 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-zinc-950 text-emerald-400 border border-zinc-800/80 font-mono text-[9px]">
                      {log.event}
                    </Badge>
                    <span className="text-[9px] text-zinc-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-zinc-300 truncate font-mono text-[10px]">
                    {JSON.stringify(log.payload)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedLog && (
            <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 font-mono relative">
              <button 
                onClick={() => setSelectedLog(null)}
                className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 font-bold"
              >
                ✕
              </button>
              <div className="font-bold text-zinc-300 border-b border-zinc-900 pb-1 mb-1">Ledger Entry Audit</div>
              <div>Event: {selectedLog.event}</div>
              <div>Timestamp: {selectedLog.created_at}</div>
              <div className="mt-1 text-[9px] text-emerald-500 break-all">
                Signature: SADC_BLOCK_{Math.random().toString(16).substring(2, 10).toUpperCase()}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
