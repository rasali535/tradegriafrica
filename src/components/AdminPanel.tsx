"use client";

import React, { useState } from 'react';
import { useApp, User, CommodityListing } from '@/context/AppContext';
import { 
  ShieldAlert, ShieldCheck, Users, ShoppingBag, Truck, DollarSign,
  AlertTriangle, CheckCircle2, XCircle, Search, RefreshCw, Star, Layers, Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminPanel: React.FC = () => {
  const { users, listings, orders, shipments, exports, updateListing } = useApp();
  const [selectedListing, setSelectedListing] = useState<CommodityListing | null>(null);

  // Compute platform-wide metrics
  const totalVolumeTraded = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.quantity, 0);

  const totalValueTraded = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  interface FraudAlert {
    id: string;
    severity: 'high' | 'medium' | 'low';
    type: string;
    message: string;
    targetId: string;
  }
  
  // Fraud Monitoring Rules (Mock warnings based on values)
  // Let's create an list of flagged alerts
  const fraudAlerts: FraudAlert[] = [];
  
  // Rule 1: High unit price check (> $1000/ton for Maize/Sorghum)
  listings.forEach(l => {
    if ((l.commodity === 'Maize' || l.commodity === 'Sorghum') && l.price > 600) {
      fraudAlerts.push({
        id: `alert-1-${l.id}`,
        severity: 'high',
        type: 'Price Anomaly',
        message: `High unit price of $${l.price}/Ton detected on crop listing in ${l.country_of_origin}. Market standard is $250-$350.`,
        targetId: l.id
      });
    }
  });

  // Rule 2: Unassigned transporter on transit shipments
  shipments.forEach(s => {
    if (s.status === 'transit' && !s.transporter_id) {
      fraudAlerts.push({
        id: `alert-2-${s.id}`,
        severity: 'medium',
        type: 'Logistics Link Broken',
        message: `Shipment from ${s.route_from} is set to Transit without an assigned Transporter driver.`,
        targetId: s.id
      });
    }
  });

  // Rule 3: Export ready without certification
  listings.forEach(l => {
    if (l.export_ready) {
      const order = orders.find(o => o.listing_id === l.id);
      const expCert = order ? exports.find(e => e.order_id === order.id) : null;
      if (expCert && expCert.readiness_score < 70) {
        fraudAlerts.push({
          id: `alert-3-${l.id}`,
          severity: 'high',
          type: 'Compliance Deficit',
          message: `Listing is marked Export Ready, but biosecurity audit score is only ${expCert.readiness_score}%.`,
          targetId: l.id
        });
      }
    }
  });

  const handleApproveProduce = (id: string) => {
    updateListing(id, { status: 'available' });
    alert("Listing verified successfully!");
  };

  const handleDeclineProduce = (id: string) => {
    updateListing(id, { status: 'draft' });
    alert("Listing flagged and moved to Draft status.");
  };

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="p-6 rounded-2xl glass-card border-zinc-800/80 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            PulaTrade Operations Control Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Platform administration, bilateral compliance checks, biosecurity controls, and fraud detection flags.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-mono">Platform Version: 1.0.0</Badge>
        </div>
      </div>

      {/* Admin metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{users.length} Registered</div>
            <p className="text-xs text-zinc-400 mt-1">Across 5 SADC Corridor nations</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Corridor Trade</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">${totalValueTraded.toLocaleString()}</div>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              {totalVolumeTraded.toLocaleString()} Tons agricultural products
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Platform Listings</CardTitle>
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{listings.length} Active</div>
            <p className="text-xs text-zinc-400 mt-1">Crops & Beef products in database</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Security Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{fraudAlerts.length} Flagged</div>
            <p className="text-xs text-amber-400 mt-1">Requiring compliance review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main split control panel content */}
      <Tabs defaultValue="fraud" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-0.5 text-zinc-400">
          <TabsTrigger value="fraud" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Fraud & Compliance Alerts ({fraudAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="listings" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Verify Crop Listings
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Registered Users Pool
          </TabsTrigger>
        </TabsList>

        {/* Fraud Monitoring Tab */}
        <TabsContent value="fraud" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 glass-card border-zinc-900">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-semibold text-zinc-300">Biosecurity & Price Fraud Logs</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Automated triggers flag potential rule infractions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3 p-4">
                  {fraudAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                        alert.severity === 'high' 
                          ? 'bg-red-950/20 border-red-900/40 text-zinc-300' 
                          : 'bg-amber-950/20 border-amber-900/40 text-zinc-300'
                      }`}
                    >
                      {alert.severity === 'high' ? (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <strong className="text-zinc-100">{alert.type}</strong>
                          <Badge className={alert.severity === 'high' ? 'bg-red-950 text-red-400 border border-red-900 text-[9px]' : 'bg-amber-950 text-amber-400 border border-amber-900 text-[9px]'}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">{alert.message}</p>
                        <div className="mt-2.5 flex gap-2">
                          <Button size="sm" className="h-6 text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                            Dismiss Alert
                          </Button>
                          <Button size="sm" className="h-6 text-[10px] bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/20">
                            Flag Entity
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-zinc-900/60 p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm mb-3 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                  Corridor Biosecurity Health
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Real-time biosecurity status logs for border check posts in the corridor.
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">Pioneer Gate (BOT/RSA)</span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]">Normal</Badge>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">Plumtree (ZIM/BOT)</span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]">Normal</Badge>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">Beitbridge (RSA/ZIM)</span>
                    <Badge className="bg-amber-950 text-amber-400 border border-amber-900 text-[9px]">Delayed Audit</Badge>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">Chundu (ZAM/ZIM)</span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]">Normal</Badge>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 text-center mt-4">
                Powered by PulaTrade Distributed Compliance Registry.
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Listings Moderation Tab */}
        <TabsContent value="listings" className="mt-4">
          <Card className="glass-card border-zinc-900">
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                    <th className="p-3">ID</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Commodity</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/10 text-zinc-300">
                      <td className="p-3 font-mono text-[11px]">{l.id.substring(0, 8)}...</td>
                      <td className="p-3 font-medium text-zinc-200">{l.country_of_origin}</td>
                      <td className="p-3 font-medium text-zinc-200">{l.commodity}</td>
                      <td className="p-3">{l.quantity} Tons</td>
                      <td className="p-3 text-emerald-400 font-bold">${l.price} / Ton</td>
                      <td className="p-3">
                        <Badge className={
                          l.status === 'available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]' :
                          'bg-zinc-950 text-zinc-400 border border-zinc-800 text-[9px]'
                        }>
                          {l.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button 
                            onClick={() => handleDeclineProduce(l.id)}
                            size="sm" 
                            className="h-6 text-[9px] bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/20"
                          >
                            Flag/Disable
                          </Button>
                          <Button 
                            onClick={() => handleApproveProduce(l.id)}
                            size="sm" 
                            className="h-6 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500"
                          >
                            Verify Listing
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registered Users Tab */}
        <TabsContent value="users" className="mt-4">
          <Card className="glass-card border-zinc-900">
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Account Role</th>
                    <th className="p-3 text-right">KYC Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/10 text-zinc-300">
                      <td className="p-3 font-semibold text-zinc-200">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.country}</td>
                      <td className="p-3 font-mono uppercase text-[10px] text-amber-500">{u.role}</td>
                      <td className="p-3 text-right text-emerald-400 font-semibold">
                        <span className="flex items-center justify-end gap-1 text-[10px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> KYC Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
