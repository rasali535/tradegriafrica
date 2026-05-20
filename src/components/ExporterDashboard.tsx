"use client";

import React, { useState } from 'react';
import { useApp, Export } from '@/context/AppContext';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertTriangle, ArrowUpRight, 
  BarChart3, RefreshCw, Layers, CheckSquare, PlusCircle, Scale, Building2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { currentUser, exports, listings, orders, updateExportStatus } = useApp();
  const [selectedExport, setSelectedExport] = useState<Export | undefined>(exports[0]);

  // Compute stats
  const totalExports = exports.length;
  const approvedExports = exports.filter(e => e.status === 'approved').length;
  const pendingExports = exports.filter(e => e.status === 'pending_approval').length;

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

  // Get checklist for selected export item
  const selectedOrder = selectedExport ? orders.find(o => o.id === selectedExport.order_id) : null;
  const selectedListing = selectedOrder ? listings.find(l => l.id === selectedOrder.listing_id) : null;
  const originCountry = selectedListing?.country_of_origin || 'Botswana';
  const selectedCommodity = selectedListing?.commodity || 'Maize';
  const checklist = REGULATORY_CHECKLISTS[originCountry]?.[selectedCommodity] || [
    'SADC Certificate of Origin',
    'Customs Clearance Form',
    'Phytosanitary Audit'
  ];

  return (
    <div className="space-y-6">
      {/* SADC Trade corridors banner */}
      <div className="p-6 rounded-2xl glass-card border-emerald-900/30 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-500" />
            Regional SADC Export Authority Portal
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Audit export requests, issue Phytosanitary health checks, track bilateral origin declarations, and certify corridor border crossings.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900">Customs Clearance Authority</Badge>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Audit Filings</CardTitle>
            <Layers className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{totalExports}</div>
            <p className="text-xs text-zinc-400 mt-1">Cross-Border filings tracked</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Certificates Issued</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{approvedExports}</div>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Customs clearance validated</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pending Inspection</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{pendingExports}</div>
            <p className="text-xs text-zinc-400 mt-1">Cargo waiting in quarantine/audit</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Average Audit Time</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin-slow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">2.5 min</div>
            <p className="text-xs text-blue-400 mt-1">Under digital compliance registry rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Main split dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification and checklists */}
        <Card className="lg:col-span-2 glass-card border-zinc-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">Regulatory Compliance Checklist</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">SADC Corridor trade rules verification</p>
              </div>
              {selectedExport && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">Readiness:</span>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-bold">
                    {selectedExport.readiness_score}%
                  </Badge>
                </div>
              )}
            </div>

            {selectedExport && selectedListing ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950/60 p-3 rounded-lg border border-zinc-900">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Commodity Type</span>
                    <div className="text-zinc-200 font-medium mt-0.5">{selectedListing.commodity}</div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Origin Country</span>
                    <div className="text-zinc-200 font-medium mt-0.5">{selectedListing.country_of_origin}</div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Storage Facility</span>
                    <div className="text-zinc-200 font-medium mt-0.5 truncate">{selectedListing.storage_availability}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    Required Customs & Biosecurity Clearances
                  </h4>
                  <div className="space-y-2">
                    {checklist.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-zinc-200">{doc}</span>
                        <Badge variant="outline" className="ml-auto text-[9px] bg-emerald-950/20 text-emerald-400 border-emerald-900/40">
                          Auto-Validated
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-zinc-500">No export certification selected. Click a listing on the right to view.</div>
            )}
          </div>

          {selectedExport && selectedExport.status === 'pending_approval' && (
            <div className="pt-4 border-t border-zinc-800 mt-6 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleRequestReAudit(selectedExport.id)}
                className="border-zinc-800 text-zinc-300"
              >
                Request Phytosanitary Re-Audit
              </Button>
              <Button 
                onClick={() => handleApproveExport(selectedExport.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500"
              >
                Issue SADC Customs Permit
              </Button>
            </div>
          )}
        </Card>

        {/* Listings panel list */}
        <Card className="glass-card border-zinc-900/60 p-4">
          <div className="border-b border-zinc-800 pb-2 mb-3">
            <h3 className="font-bold text-zinc-100 text-sm">Regulatory Filings Desk</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Click a shipment folder to load credentials checklist</p>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {exports.map((e) => {
              const order = orders.find(o => o.id === e.order_id);
              const l = order ? listings.find(list => list.id === order.listing_id) : null;
              const isSelected = selectedExport?.id === e.id;
              return (
                <div 
                  key={e.id}
                  onClick={() => setSelectedExport(e)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected ? 'bg-zinc-900/90 border-emerald-900/60' : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-mono text-[10px] text-zinc-500">REF-{e.id.substring(0, 6)}</span>
                    <Badge className={
                      e.status === 'approved' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/50 text-[9px]' :
                      'bg-amber-950/80 text-amber-400 border border-amber-900/50 text-[9px]'
                    }>
                      {e.status}
                    </Badge>
                  </div>
                  <div className="font-semibold text-zinc-200">{l?.commodity}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Origin: {l?.country_of_origin}</div>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] border-t border-zinc-800/50 pt-2">
                    <span className="text-zinc-500">Readiness Score</span>
                    <strong className="text-emerald-400 font-bold">{e.readiness_score}%</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
