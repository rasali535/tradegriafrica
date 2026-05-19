"use client";

import React, { useState } from 'react';
import { useApp, Shipment } from '@/context/AppContext';
import { 
  Truck, MapPin, Navigation, DollarSign, Clock, CheckCircle2, 
  Map, Award, ArrowRight, ShieldCheck, UserCheck, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CorridorMap } from './MapboxMap';

export const TransporterDashboard: React.FC = () => {
  const { currentUser, shipments, orders, listings, assignTransporter, updateShipmentStatus } = useApp();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | undefined>(
    shipments.find(s => s.transporter_id === currentUser?.id || !s.transporter_id)
  );

  // Filter transporter shipments
  const myShipments = shipments.filter(s => s.transporter_id === currentUser?.id);
  const availableShipments = shipments.filter(s => !s.transporter_id);

  // Calculate logistics metrics
  const activeJobs = myShipments.filter(s => s.status === 'transit').length;
  const completedJobs = myShipments.filter(s => s.status === 'delivered').length;
  const totalEarnings = myShipments
    .filter(s => s.status === 'delivered')
    .reduce((sum, s) => {
      // Lookup order amount for payout reference
      const order = orders.find(o => o.id === s.order_id);
      return sum + (order ? order.amount * 0.08 : 450); // 8% logistics fee or flat 450
    }, 0);

  const handleAcceptJob = (shipmentId: string) => {
    if (!currentUser) return;
    assignTransporter(shipmentId, currentUser.id);
    const updated = shipments.find(s => s.id === shipmentId);
    if (updated) {
      setSelectedShipment(updated);
    }
  };

  const handleStatusUpdate = (shipmentId: string, status: 'transit' | 'delivered') => {
    updateShipmentStatus(shipmentId, status);
    const updated = shipments.find(s => s.id === shipmentId);
    if (updated) {
      setSelectedShipment(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* SADC Transit Passport bar */}
      <div className="p-6 rounded-2xl glass-card border-emerald-900/30 flex flex-col lg:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/40 text-amber-500 border border-amber-900/50 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100 text-base">SADC Border Digital Passport Active</h3>
            <p className="text-xs text-zinc-400">
              Customs clearances are auto-assigned via QR codes at Pioneer Gate, Plumtree, and Beitbridge.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900">Border Pass: Active</Badge>
          <Badge className="bg-amber-950 text-amber-400 border border-amber-900">Green Corridor Tier 1</Badge>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeJobs}</div>
            <p className="text-xs text-zinc-400 mt-1">Cargo currently in transit</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Logistics Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-emerald-400 font-semibold mt-1">8% corridor fee payout</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Deliveries Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{completedJobs}</div>
            <p className="text-xs text-zinc-400 mt-1">Proof of Delivery (POD) uploaded</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Queue Time Savings</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">14 hrs</div>
            <p className="text-xs text-blue-400 mt-1">Saved per transit corridor trip</p>
          </CardContent>
        </Card>
      </div>

      {/* SADC Map Tracking Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CorridorMap activeShipment={selectedShipment} />
        </div>

        {/* Selected shipment details card */}
        <Card className="glass-card border-zinc-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-bold text-zinc-100 text-sm">Shipment Inspector</h3>
              {selectedShipment && (
                <Badge className={
                  selectedShipment.status === 'transit' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                  selectedShipment.status === 'delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                  'bg-zinc-950 text-zinc-400 border border-zinc-800'
                }>
                  {selectedShipment.status}
                </Badge>
              )}
            </div>

            {selectedShipment ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Route Corridor</label>
                  <div className="flex items-center gap-1.5 text-zinc-200 mt-0.5 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {selectedShipment.route_from}
                    <ArrowRight className="h-3 w-3 text-zinc-600" />
                    <MapPin className="h-3.5 w-3.5 text-amber-500" /> {selectedShipment.route_to}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Transport Mode</label>
                    <div className="text-zinc-200 font-medium mt-0.5">{selectedShipment.transport_mode}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Customs Gate</label>
                    <div className="text-zinc-200 font-medium mt-0.5">Plumtree Border</div>
                  </div>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-900 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Logistics Passport ID</span>
                    <span className="font-mono text-zinc-300">PASS-{selectedShipment.id.substring(0, 6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Customs Clearance</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Approved
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800">
                  {selectedShipment.status === 'pending' && (
                    <Button 
                      onClick={() => handleStatusUpdate(selectedShipment.id, 'transit')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs border border-emerald-500"
                    >
                      Start Transit Corridor Route
                    </Button>
                  )}
                  {selectedShipment.status === 'transit' && (
                    <Button 
                      onClick={() => handleStatusUpdate(selectedShipment.id, 'delivered')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs border border-emerald-500"
                    >
                      Log Proof of Delivery (POD)
                    </Button>
                  )}
                  {selectedShipment.status === 'delivered' && (
                    <span className="text-center py-2 bg-zinc-950 border border-zinc-800/80 rounded-lg text-emerald-400 font-medium text-xs flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Delivery Verified
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-zinc-500 text-xs">No active shipment inspected. Click a row below to inspect.</div>
            )}
          </div>
          <div className="text-[10px] text-zinc-500 text-center mt-4">
            GPS feeds are encrypted & anchored to the SADC Trade Registry.
          </div>
        </Card>
      </div>

      {/* Jobs Marketplace */}
      <Tabs defaultValue="my-jobs" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-0.5 text-zinc-400">
          <TabsTrigger value="my-jobs" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            My Active Shipments ({myShipments.length})
          </TabsTrigger>
          <TabsTrigger value="available-jobs" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            SADC Logistics Marketplace ({availableShipments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-jobs" className="mt-4">
          <Card className="glass-card border-zinc-900">
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                    <th className="p-3">Shipment ID</th>
                    <th className="p-3">Route From</th>
                    <th className="p-3">Route To</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myShipments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-zinc-500">No active shipments assigned yet. Browse marketplace below.</td>
                    </tr>
                  ) : (
                    myShipments.map(s => (
                      <tr 
                        key={s.id} 
                        onClick={() => setSelectedShipment(s)}
                        className={`border-b border-zinc-800/60 hover:bg-zinc-900/20 text-zinc-300 cursor-pointer ${
                          selectedShipment?.id === s.id ? 'bg-zinc-900/40 border-l-2 border-l-emerald-600' : ''
                        }`}
                      >
                        <td className="p-3 font-mono">{s.id.substring(0, 8)}...</td>
                        <td className="p-3 font-medium text-zinc-200">{s.route_from}</td>
                        <td className="p-3 font-medium text-zinc-200">{s.route_to}</td>
                        <td className="p-3">{s.transport_mode}</td>
                        <td className="p-3">
                          <Badge className={
                            s.status === 'transit' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                            s.status === 'delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                            'bg-zinc-950 text-zinc-400 border border-zinc-800'
                          }>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-emerald-400">
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available-jobs" className="mt-4">
          <Card className="glass-card border-zinc-900">
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                    <th className="p-3">Cargo ID</th>
                    <th className="p-3">Route From</th>
                    <th className="p-3">Route To</th>
                    <th className="p-3">Transport Mode</th>
                    <th className="p-3 text-right font-semibold text-emerald-400">Est Fee</th>
                    <th className="p-3 text-right">Contract Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableShipments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-zinc-500">No available shipments found. All cargo has active bookings.</td>
                    </tr>
                  ) : (
                    availableShipments.map(s => {
                      const order = orders.find(o => o.id === s.order_id);
                      const fee = order ? order.amount * 0.08 : 450;
                      return (
                        <tr key={s.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/10 text-zinc-300">
                          <td className="p-3 font-mono">{s.id.substring(0, 8)}...</td>
                          <td className="p-3 font-medium text-zinc-200">{s.route_from}</td>
                          <td className="p-3 font-medium text-zinc-200">{s.route_to}</td>
                          <td className="p-3">{s.transport_mode}</td>
                          <td className="p-3 text-right text-emerald-400 font-bold">${fee.toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <Button 
                              onClick={() => handleAcceptJob(s.id)}
                              size="sm" 
                              className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium border border-emerald-500"
                            >
                              Accept Job
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
