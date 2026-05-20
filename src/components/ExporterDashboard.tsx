"use client";

import React, { useState } from 'react';
import { useApp, Export, TradeAgreement, TradeCorridor } from '@/context/AppContext';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertTriangle, ArrowUpRight, 
  BarChart3, RefreshCw, Layers, CheckSquare, Scale, Building2,
  Clock, Activity, MapPin, ShieldAlert, Sparkles, Sliders, FileBadge2, Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Requirements schema by Country and Commodity
const REGULATORY_CHECKLISTS: Record<string, Record<string, string[]>> = {
  'South Africa': {
    'Beef': ['DAFF Veterinary Health Cert', 'SADC Certificate of Origin', 'SPS Import Clearance permit', 'Meat Board registration'],
    'Maize': ['Phytosanitary Audit report', 'SADC Preferential Tariff Form', 'GMO Status Declaration', 'Aflatoxin Testing cert'],
    'Sorghum': ['Phytosanitary Audit report', 'SADC Certificate of Origin', 'Weed-free Certificate'],
    'Horticulture': ['Cold-chain Log report', 'Veterinary Phytosanitary Permit', 'EuroGap Compliance Certificate'],
    'Poultry feed products': ['DAFF Import registration', 'Feed Ingredient Analysis', 'SADC Certificate of Origin']
  },
  'Botswana': {
    'Beef': ['DVS Cattle Brand Registration', 'LITS Ear Tag Audit', 'Phytosanitary Certificate', 'SADC Certificate of Origin'],
    'Maize': ['Import/Export Permit', 'Ministry of Agriculture phytosanitary', 'Fumigation Certificate'],
    'Sorghum': ['Seed Control Certificate', 'SADC Origin Verification', 'Phytosanitary clearance'],
    'Horticulture': ['Phytosanitary Permit', 'Local Sourcing Levy waiver'],
    'Poultry feed products': ['Product Registration', 'SADC Origin Form']
  },
  'Zimbabwe': {
    'Beef': ['DVS Health Certificate', 'Exchange Control CD1 Form', 'Veterinary Import Permit'],
    'Maize': ['GMB Quota Allocation', 'Phytosanitary Certificate', 'CD1 Export Declaration', 'SADC Certificate of Origin'],
    'Sorghum': ['CD1 Form Clearance', 'Agricultural Marketing Authority Permit'],
    'Horticulture': ['Customs Export Bill', 'SADC Certificate of Origin'],
    'Poultry feed products': ['Stockfeed Manufacturing Cert', 'CD1 Form']
  },
  'Zambia': {
    'Beef': ['DVS Health Certificate', 'SADC Certificate of Origin'],
    'Maize': ['Food Reserve Agency Quota', 'Phytosanitary Audit', 'ZRA Border Declaration', 'SADC Certificate of Origin'],
    'Sorghum': ['ZRA Customs Manifest', 'Ministry of Agric permit'],
    'Horticulture': ['Border Health Cert', 'Fumigation cert'],
    'Poultry feed products': ['Feed Standards Certificate', 'Customs Bonded clearance']
  },
  'Namibia': {
    'Beef': ['Namibia Meat Board Permit', 'DVS Slaughterhouses Certificate', 'Eartag Verification LITS', 'SADC Certificate of Origin'],
    'Maize': ['Agronomic Board Import Permit', 'Phytosanitary Certificate'],
    'Sorghum': ['Agronomic Board Permit', 'SADC Certificate of Origin'],
    'Horticulture': ['Phytosanitary Permit', 'Namibian Agronomic Board levy clearance'],
    'Poultry feed products': ['Stockfeed Import permit', 'Origin declaration']
  }
};

export const ExporterDashboard: React.FC = () => {
  const { 
    currentUser, 
    exports, 
    listings, 
    orders, 
    updateExportStatus, 
    tradeAgreements, 
    tradeCorridors, 
    updateTradeCorridor 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'filings' | 'corridors'>('filings');
  const [selectedExport, setSelectedExport] = useState<Export | undefined>(exports[0]);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string | null>(tradeCorridors[0]?.id || null);

  // Compute stats
  const totalExports = exports.length;
  const approvedExports = exports.filter(e => e.status === 'approved').length;
  const pendingExports = exports.filter(e => e.status === 'pending_approval').length;
  const activeAlerts = tradeCorridors.filter(c => c.biosecurity_status === 'Alert').length;

  const handleApproveExport = (id: string) => {
    updateExportStatus(id, 'approved');
    const updated = exports.find(e => e.id === id);
    if (updated) {
      setSelectedExport(updated);
    }
  };

  const handleRequestReAudit = (id: string) => {
    updateExportStatus(id, 'pending_approval', 90);
    const updated = exports.find(e => e.id === id);
    if (updated) {
      setSelectedExport({ ...updated, status: 'pending_approval', readiness_score: 90 });
    }
    alert('Phytosanitary Re-Audit request dispatched successfully to border inspectors!');
  };

  // Find selected corridor
  const selectedCorridor = tradeCorridors.find(c => c.id === selectedCorridorId) || tradeCorridors[0];

  // Find trade agreement matching selected corridor
  const matchingAgreementForCorridor = tradeAgreements.find(
    ta => (ta.origin_country === selectedCorridor?.origin && ta.destination_country === selectedCorridor?.destination) ||
          (ta.origin_country === selectedCorridor?.destination && ta.destination_country === selectedCorridor?.origin)
  );

  // Get checklist for selected export item
  const selectedOrder = selectedExport ? orders.find(o => o.id === selectedExport.order_id) : null;
  const selectedListing = selectedOrder ? listings.find(l => l.id === selectedOrder.listing_id) : null;
  const originCountry = selectedListing?.country_of_origin || 'Botswana';
  const destinationCountry = selectedExport?.country || 'South Africa';
  const selectedCommodity = selectedListing?.commodity || 'Maize';
  
  const checklist = REGULATORY_CHECKLISTS[originCountry]?.[selectedCommodity] || [
    'SADC Certificate of Origin',
    'Customs Clearance Form',
    'Phytosanitary Audit'
  ];

  // Find governing treaty for selected export
  const governingTreaty = tradeAgreements.find(
    ta => (ta.origin_country === originCountry && ta.destination_country === destinationCountry) ||
          (ta.origin_country === destinationCountry && ta.destination_country === originCountry)
  );

  // Delay simulation actions
  const simulateDelayChange = (corridorId: string, hours: number) => {
    const corridor = tradeCorridors.find(c => c.id === corridorId);
    if (corridor) {
      const newDelay = Math.max(0.5, parseFloat((corridor.queue_delay_hours + hours).toFixed(1)));
      // inverse relation with efficiency
      const efficiencyDelta = hours > 0 ? -Math.min(corridor.transit_efficiency - 40, hours * 3) : Math.min(100 - corridor.transit_efficiency, Math.abs(hours) * 3);
      const newEfficiency = Math.round(corridor.transit_efficiency + efficiencyDelta);
      
      updateTradeCorridor(corridorId, { 
        queue_delay_hours: newDelay,
        transit_efficiency: newEfficiency
      });
    }
  };

  const setBiosecurity = (corridorId: string, status: 'Active' | 'Standard' | 'Alert') => {
    updateTradeCorridor(corridorId, { biosecurity_status: status });
  };

  return (
    <div className="space-y-6">
      {/* Premium SADC Banner */}
      <div className="p-6 rounded-2xl glass-card border-emerald-900/30 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-500" />
            SADC Cross-Border Compliance & Corridor Desk
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Simulate and audit export permits, track real-time queue delays, verify local content rules, and coordinate treaty frameworks across regional trade corridors.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs px-2.5 py-1">
            Regional Trade Protocol Active
          </Badge>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Active Filings</CardTitle>
            <Layers className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{totalExports}</div>
            <p className="text-xs text-zinc-400 mt-1">Cross-Border filings tracked</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Customs Verified</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{approvedExports}</div>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Certificates issued</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Awaiting Inspection</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{pendingExports}</div>
            <p className="text-xs text-zinc-400 mt-1">Pending customs audit</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Biosecurity Alerts</CardTitle>
            <ShieldAlert className={`h-4 w-4 ${activeAlerts > 0 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeAlerts}</div>
            <p className="text-xs text-zinc-400 mt-1">Active border health warnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-800 gap-4">
        <button
          onClick={() => setActiveTab('filings')}
          className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'filings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          Customs Filings Audit
        </button>
        <button
          onClick={() => setActiveTab('corridors')}
          className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'corridors'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="h-4 w-4" />
          SADC Corridor Health & Delay Monitor
        </button>
      </div>

      {/* Tab 1: Customs Filings Audit */}
      {activeTab === 'filings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Document Details & Checklists */}
          <Card className="lg:col-span-2 glass-card border-zinc-900/60 p-5 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">Regulatory Compliance & Verification</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Bilateral trade rule audits</p>
                </div>
                {selectedExport && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">Permit Readiness:</span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-bold font-mono">
                      {selectedExport.readiness_score}%
                    </Badge>
                  </div>
                )}
              </div>

              {selectedExport && selectedListing ? (
                <div className="space-y-4 text-xs">
                  {/* Origin-Destination and Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950/60 p-3 rounded-lg border border-zinc-900">
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-mono">Commodity Type</span>
                      <div className="text-zinc-200 font-medium mt-0.5">{selectedListing.commodity}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-mono">Route</span>
                      <div className="text-zinc-200 font-medium mt-0.5 flex items-center gap-1">
                        <span>{originCountry}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{destinationCountry}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-mono">Volume Ordered</span>
                      <div className="text-zinc-200 font-medium mt-0.5 font-mono">{selectedOrder?.quantity} tons</div>
                    </div>
                  </div>

                  {/* Governing Treaty framework */}
                  {governingTreaty ? (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <Scale className="h-3.5 w-3.5" />
                          Governing Framework: {governingTreaty.agreement_name}
                        </span>
                        <Badge className="bg-emerald-900/80 text-emerald-300 text-[9px] border border-emerald-800 font-mono">
                          {governingTreaty.tariff_type}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        {governingTreaty.customs_notes}
                      </p>
                      {governingTreaty.local_content_min_pct && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-medium bg-amber-950/30 border border-amber-900/30 p-1.5 rounded mt-1">
                          <Check className="h-3 w-3" />
                          Requires minimum {governingTreaty.local_content_min_pct}% local value contribution (Origin Form 61 validated).
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-400 text-[10px]">
                      No custom bilateral treaty found. Operating under standard SADC trade rules.
                    </div>
                  )}

                  {/* Required checks */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                      <CheckSquare className="h-4 w-4 text-emerald-500" />
                      Required SADC Biosecurity & Customs Clearances
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {checklist.map((doc, idx) => {
                        const isMissing = selectedExport.missing_requirements.includes(doc);
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center gap-2 p-2.5 rounded border transition-all ${
                              isMissing 
                                ? 'bg-amber-950/10 border-amber-900/30 text-zinc-300'
                                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-200'
                            }`}
                          >
                            <CheckCircle2 className={`h-4 w-4 shrink-0 ${isMissing ? 'text-amber-600' : 'text-emerald-500'}`} />
                            <span className="truncate">{doc}</span>
                            <Badge 
                              variant="outline" 
                              className={`ml-auto text-[9px] font-mono ${
                                isMissing 
                                  ? 'bg-amber-950/30 text-amber-400 border-amber-900/40' 
                                  : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40'
                              }`}
                            >
                              {isMissing ? 'Pending Verification' : 'Verified'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  <FileText className="h-12 w-12 mx-auto text-zinc-700 stroke-1 mb-2" />
                  No export certification selected. Click a listing on the right to load.
                </div>
              )}
            </div>

            {selectedExport && selectedExport.status === 'pending_approval' && (
              <div className="pt-4 border-t border-zinc-800 mt-6 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleRequestReAudit(selectedExport.id)}
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs"
                >
                  Request Phytosanitary Re-Audit
                </Button>
                <Button 
                  onClick={() => handleApproveExport(selectedExport.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs shadow-md"
                >
                  Issue SADC Customs Permit
                </Button>
              </div>
            )}
          </Card>

          {/* Filings List */}
          <Card className="glass-card border-zinc-900/60 p-4 flex flex-col">
            <div className="border-b border-zinc-800 pb-2 mb-3">
              <h3 className="font-bold text-zinc-100 text-sm">Regulatory Filings Desk</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Click a shipment folder to load credentials checklist</p>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
              {exports.map((e) => {
                const order = orders.find(o => o.id === e.order_id);
                const l = order ? listings.find(list => list.id === order.listing_id) : null;
                const isSelected = selectedExport?.id === e.id;
                return (
                  <div 
                    key={e.id}
                    onClick={() => setSelectedExport(e)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected ? 'bg-zinc-900/90 border-emerald-900/60 shadow-lg' : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-mono text-[9px] text-zinc-500 font-bold">REF-{e.id.substring(8, 14).toUpperCase()}</span>
                      <Badge className={
                        e.status === 'approved' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/50 text-[9px] font-mono' :
                        e.status === 'pending_approval' ? 'bg-amber-950/80 text-amber-400 border border-amber-900/50 text-[9px] font-mono' :
                        'bg-zinc-950/80 text-zinc-400 border border-zinc-800 text-[9px] font-mono'
                      }>
                        {e.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="font-semibold text-zinc-200">{l?.commodity || 'Agricultural Produce'}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 flex justify-between">
                      <span>Dest: {e.country}</span>
                      <span className="font-mono text-zinc-400 font-bold">{e.readiness_score}% score</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: SADC Corridor Health & Delay Monitor */}
      {activeTab === 'corridors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Corridor Selection List */}
          <Card className="glass-card border-zinc-900/60 p-4">
            <div className="border-b border-zinc-800 pb-2 mb-3">
              <h3 className="font-bold text-zinc-100 text-sm">SADC Trade Corridor Channels</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Select a border routing to simulate or update logistics delays</p>
            </div>

            <div className="space-y-2.5">
              {tradeCorridors.map((c) => {
                const isSelected = selectedCorridorId === c.id;
                const efficiencyColor = c.transit_efficiency > 85 ? 'text-emerald-400' : c.transit_efficiency > 70 ? 'text-amber-400' : 'text-red-400';
                
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCorridorId(c.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected ? 'bg-zinc-900/90 border-emerald-900/60 shadow-lg' : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                        {c.name}
                      </span>
                      <Badge className={
                        c.biosecurity_status === 'Active' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/60 text-[9px] font-mono' :
                        c.biosecurity_status === 'Alert' ? 'bg-red-950/85 text-red-400 border border-red-900/60 text-[9px] font-mono animate-pulse' :
                        'bg-zinc-950/80 text-zinc-400 border border-zinc-800 text-[9px] font-mono'
                      }>
                        {c.biosecurity_status} Bio
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/50">
                      <div>
                        <span className="text-zinc-500 text-[9px] font-mono block">Border Post</span>
                        <span className="text-zinc-300 font-medium truncate block">{c.border_checkpoint}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 text-[9px] font-mono block">Delay / Efficiency</span>
                        <span className="text-zinc-300 font-medium block">
                          <span className="text-amber-400 font-mono font-bold">{c.queue_delay_hours}h</span>
                          <span className="text-zinc-500 mx-1">/</span>
                          <span className={`${efficiencyColor} font-mono font-bold`}>{c.transit_efficiency}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Interactive Simulation & Configuration */}
          <Card className="lg:col-span-2 glass-card border-zinc-900/60 p-5 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">Interactive Border Controller</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Real-time SADC biosecurity & queue tuning</p>
                </div>
                <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-mono text-[10px]">
                  CORRIDOR CONFIG
                </Badge>
              </div>

              {selectedCorridor ? (
                <div className="space-y-6">
                  {/* Current corridor stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-950/60 border border-zinc-900 rounded-lg">
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[9px] font-mono block uppercase">Border Gate</span>
                      <strong className="text-zinc-100 text-sm">{selectedCorridor.border_checkpoint}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[9px] font-mono block uppercase">Queue Delay</span>
                      <strong className="text-amber-400 text-sm font-mono flex items-center gap-1">
                        <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                        {selectedCorridor.queue_delay_hours} hrs
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[9px] font-mono block uppercase">Transit Efficiency</span>
                      <strong className="text-emerald-400 text-sm font-mono flex items-center gap-1">
                        <Activity className="h-4 w-4 shrink-0 text-emerald-400" />
                        {selectedCorridor.transit_efficiency}%
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[9px] font-mono block uppercase">Active Freight Lines</span>
                      <strong className="text-zinc-200 text-sm font-mono">{selectedCorridor.active_transport_lines} trucks</strong>
                    </div>
                  </div>

                  {/* Slider simulation */}
                  <div className="space-y-3 p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-emerald-500" />
                        Adjust Border Delay Hours (Simulation)
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedCorridor.queue_delay_hours} hrs</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Drag the slider to mock border bottlenecks or clearance speedups. Changes propagate immediately to all active cargo routing estimators.
                    </p>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0.5" 
                        max="36" 
                        step="0.5"
                        value={selectedCorridor.queue_delay_hours}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const delta = val - selectedCorridor.queue_delay_hours;
                          simulateDelayChange(selectedCorridor.id, delta);
                        }}
                        className="flex-1 accent-emerald-500 h-1.5 bg-zinc-850 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2 justify-between text-[9px] font-mono text-zinc-500">
                      <span>0.5h (Fast Check)</span>
                      <span>12h (Heavy Queue)</span>
                      <span>24h (Customs Backlog)</span>
                      <span>36h (Critical Delay)</span>
                    </div>
                  </div>

                  {/* Status Toggle & Custom Simulation Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Biosecurity levels */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg space-y-3">
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-emerald-500" />
                        Configure Biosecurity Mode
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Standard', 'Active', 'Alert'] as const).map((status) => {
                          const isActive = selectedCorridor.biosecurity_status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => setBiosecurity(selectedCorridor.id, status)}
                              className={`py-1.5 text-[10px] font-mono font-bold rounded border transition-all ${
                                isActive 
                                  ? status === 'Alert' ? 'bg-red-950 text-red-400 border-red-900' :
                                    status === 'Active' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' :
                                    'bg-zinc-800 text-zinc-100 border-zinc-700'
                                  : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-500'
                              }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal">
                        Switching to <strong className="text-red-400">Alert</strong> simulates a pest or health outbreak, enforcing strict phytosanitary audits at all checkpoints.
                      </p>
                    </div>

                    {/* Simulation Presets */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg space-y-3">
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        Quick Macro Presets
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => simulateDelayChange(selectedCorridor.id, 6.0)}
                          className="py-1.5 text-[9px] font-bold rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-amber-400 transition-all text-center"
                        >
                          Report Strike (+6h)
                        </button>
                        <button
                          onClick={() => simulateDelayChange(selectedCorridor.id, -4.5)}
                          className="py-1.5 text-[9px] font-bold rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-emerald-400 transition-all text-center"
                        >
                          Fast-Track Lane (-4.5h)
                        </button>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal">
                        Trigger sudden corridor events. Fast-track simulates digital escrow priority processing.
                      </p>
                    </div>
                  </div>

                  {/* Governing Treaty on this corridor */}
                  {matchingAgreementForCorridor && (
                    <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-lg space-y-2 text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                        <FileBadge2 className="h-4 w-4" />
                        Bilateral Customs Treaty: {matchingAgreementForCorridor.agreement_name}
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        {matchingAgreementForCorridor.customs_notes}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {matchingAgreementForCorridor.documents_required.map((doc, i) => (
                          <Badge key={i} variant="outline" className="text-[8px] bg-zinc-900 text-zinc-400 border-zinc-800 font-mono">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  Select a corridor on the left to start auditing delay metrics.
                </div>
              )}
            </div>

            <div className="border-t border-zinc-900 pt-3 text-[10px] text-zinc-500 flex justify-between mt-6">
              <span>SADC Border Control System v2.6.4</span>
              <span className="font-mono">STATUS: SIMULATION LINK STANDBY</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
