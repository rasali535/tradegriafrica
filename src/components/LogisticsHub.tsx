"use client";

import React, { useState } from 'react';
import { useApp, User, Shipment } from '@/context/AppContext';
import { 
  Truck, ShieldCheck, MapPin, Star, Phone, Mail, Award, Clock,
  Filter, Search, CheckCircle2, Navigation, Compass, BarChart, 
  ExternalLink, Calendar, PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

export const LogisticsHub: React.FC = () => {
  const { users, shipments, bids, assignTransporter, formatCurrency } = useApp();
  const [search, setSearch] = useState('');
  const [corridorFilter, setCorridorFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [selectedTransporter, setSelectedTransporter] = useState<User | null>(null);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('');

  // Transporters list
  const transporters = users.filter(u => u.role === 'transporter');

  // Hardcode some mock data for transporter companies to make it premium
  const companyRegistry: Record<string, {
    companyName: string;
    fleetSize: number;
    rating: number;
    completedTrips: number;
    modes: ('Road' | 'Rail' | 'Air')[];
    corridors: string[];
    certification: string;
    tier: string;
  }> = {
    't3000000-0000-0000-0000-000000000001': {
      companyName: 'Kalahari Express Logistics',
      fleetSize: 120,
      rating: 4.9,
      completedTrips: 1840,
      modes: ['Road', 'Rail'],
      corridors: ['Trans-Kalahari', 'North-South Corridor'],
      certification: 'SADC Trusted Trader',
      tier: 'Green Corridor Tier 1'
    },
    't3000000-0000-0000-0000-000000000002': {
      companyName: 'Limpopo Corridor Freighters',
      fleetSize: 85,
      rating: 4.7,
      completedTrips: 1220,
      modes: ['Road'],
      corridors: ['Beitbridge Corridor', 'Maputo Development Corridor'],
      certification: 'SA Customs Border Certified',
      tier: 'Green Corridor Tier 2'
    },
    't3000000-0000-0000-0000-000000000003': {
      companyName: 'Trans-Kalahari Logistics',
      fleetSize: 65,
      rating: 4.8,
      completedTrips: 940,
      modes: ['Road', 'Air'],
      corridors: ['Trans-Kalahari', 'Walvis Bay Corridor'],
      certification: 'NamPort Authorized Freight',
      tier: 'Green Corridor Tier 1'
    }
  };

  const borderPosts = [
    { name: 'Kazungula (Botswana/Zambia)', delayHours: 4 },
    { name: 'Pioneer Gate (Botswana/SA)', delayHours: 2 },
    { name: 'Kopfontein (Botswana/SA)', delayHours: 3 },
    { name: 'Beitbridge (SA/Zimbabwe)', delayHours: 12 },
    { name: 'Plumtree (Botswana/Zimbabwe)', delayHours: 5 },
  ];

  // Fallback details for new dynamic onboarding transporters
  const getTransporterDetails = (userId: string, name: string) => {
    return companyRegistry[userId] || {
      companyName: name.includes('Logistics') || name.includes('Freight') ? name : `${name} Logistics`,
      fleetSize: 15,
      rating: 5.0,
      completedTrips: 0,
      modes: ['Road'] as ('Road' | 'Rail' | 'Air')[],
      corridors: ['North-South Corridor'],
      certification: 'Self-Certified sandbox',
      tier: 'Tier 3 Provisional'
    };
  };

  // Shipments that are pending assignment
  const unassignedShipments = shipments.filter(s => !s.transporter_id);

  // Filter transporters
  const filteredTransporters = transporters.filter(t => {
    const details = getTransporterDetails(t.id, t.name);
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      details.companyName.toLowerCase().includes(search.toLowerCase()) ||
      t.country.toLowerCase().includes(search.toLowerCase());

    const matchesCorridor = corridorFilter === 'All' || details.corridors.some(c => c.includes(corridorFilter));
    const matchesMode = modeFilter === 'All' || details.modes.includes(modeFilter as any);

    return matchesSearch && matchesCorridor && matchesMode;
  });

  const handleBookTransport = (transporterId: string) => {
    if (!selectedShipmentId) {
      alert("Please select a shipment to assign.");
      return;
    }
    assignTransporter(selectedShipmentId, transporterId);
    alert("Logistics operator booked! The cargo shipment is now marked as in transit.");
    setSelectedTransporter(null);
    setSelectedShipmentId('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-400" />
            SADC Logistics Registry
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Book verified regional logistics operators. Interlock transit shipments directly with border queues clearance passports and real-time custom manifests.
          </p>
        </div>
        <div className="flex gap-2 z-10">
          <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-900">
            Verified Transporters: {transporters.length}
          </Badge>
          <Badge className="bg-blue-950/80 text-blue-400 border border-blue-900">
            Digital Border Pass Active
          </Badge>
        </div>
      </div>

      {/* Filter Desk */}
      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900 focus-within:border-emerald-800/80 transition-all">
          <Search className="h-4 w-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search company, country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-0 outline-none text-xs text-zinc-200 w-full focus:ring-0"
          />
        </div>

        <div>
          <select 
            value={corridorFilter} 
            onChange={e => setCorridorFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none"
          >
            <option value="All">All Transport Corridors</option>
            <option value="Trans-Kalahari">Trans-Kalahari Corridor</option>
            <option value="Beitbridge">Beitbridge Corridor</option>
            <option value="Maputo">Maputo Development Corridor</option>
            <option value="Walvis Bay">Walvis Bay Corridor</option>
            <option value="North-South">North-South Corridor</option>
          </select>
        </div>

        <div>
          <select 
            value={modeFilter} 
            onChange={e => setModeFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none"
          >
            <option value="All">All Freight Modes</option>
            <option value="Road">Road Carrier</option>
            <option value="Rail">Rail Cargo</option>
            <option value="Air">Air Freight</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTransporters.map((operator) => {
          const details = getTransporterDetails(operator.id, operator.name);

          return (
            <div 
              key={operator.id}
              onClick={() => {
                setSelectedTransporter(operator);
                if (unassignedShipments.length > 0) {
                  setSelectedShipmentId(unassignedShipments[0].id);
                }
              }}
              className="group flex flex-col justify-between rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-emerald-900/60 hover:bg-zinc-950 transition-all duration-350 cursor-pointer p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10"></div>
              
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-sm group-hover:text-emerald-400 transition-colors">
                      {details.companyName}
                    </h3>
                    <p className="text-[11px] text-zinc-500">Contact: {operator.name}</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-950/40 text-emerald-400 border-emerald-900/60 font-mono text-[9px] px-2">
                    {details.tier}
                  </Badge>
                </div>

                {/* Rating & completed */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-zinc-200">{details.rating}</span>
                  </div>
                  <div className="text-zinc-500">
                    Completed Runs: <strong className="text-zinc-300 font-medium">{details.completedTrips}</strong>
                  </div>
                </div>

                {/* Corridor Tags */}
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Primary Corridors</label>
                  <div className="flex flex-wrap gap-1">
                    {details.corridors.map((c, i) => (
                      <span key={i} className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Modes & Fleet size */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-zinc-900">
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Active Fleet</span>
                    <strong className="text-zinc-200">{details.fleetSize} Heavy Cargo</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Freight Modes</span>
                    <div className="text-zinc-300 flex flex-wrap gap-1 font-medium">{details.modes.join(', ')}</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-xs">
                <span className="text-zinc-500">Country: <strong className="text-zinc-300 font-medium">{operator.country}</strong></span>
                <Button className="h-7 text-[10px] bg-emerald-950/60 hover:bg-emerald-600 border border-emerald-900/60 text-emerald-400 hover:text-white font-semibold">
                  Book Corridor Operator
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Transporter Modal */}
      <Dialog open={selectedTransporter !== null} onOpenChange={(open) => !open && setSelectedTransporter(null)}>
        {selectedTransporter && (() => {
          const details = getTransporterDetails(selectedTransporter.id, selectedTransporter.name);
          return (
            <DialogContent className="bg-zinc-950 border-zinc-900 text-zinc-200 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-zinc-100 flex items-center gap-2 font-bold text-sm">
                  <Award className="h-4.5 w-4.5 text-emerald-400" />
                  Operator Profile: {details.companyName}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Review certifications and book transport for unassigned trade shipments.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2 text-xs">
                {/* Specs */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Primary Country</span>
                    <div className="text-zinc-200 font-semibold mt-0.5">{selectedTransporter.country}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Border Pass Status</span>
                    <div className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Pass
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Fleet Operator</span>
                    <div className="text-zinc-200 font-semibold mt-0.5">{selectedTransporter.name}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Registrar Rating</span>
                    <div className="text-zinc-200 font-semibold mt-0.5 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {details.rating} / 5.0
                    </div>
                  </div>
                </div>

                {/* SADC border clearance certificate info */}
                <div className="p-3 rounded-lg bg-zinc-900/20 border border-zinc-900 space-y-1.5">
                  <h4 className="font-bold text-zinc-300 text-[10px] uppercase tracking-wider">
                    SADC Bilateral Corridor Approvals
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Clearance Class: <strong className="text-zinc-200">{details.certification}</strong>. 
                    Authorized to pass phytosanitary customs gates at Pioneer Gate, Plumtree, Beitbridge, Kopfontein, and Kazungula Bridge.
                  </p>
                  <div className="mt-2 space-y-1">
                    <h5 className="font-bold text-zinc-500 text-[9px] uppercase">Live Border Delays (AI Estimated)</h5>
                    <div className="grid grid-cols-2 gap-1">
                      {borderPosts.slice(0, 4).map(bp => (
                        <div key={bp.name} className="flex justify-between items-center bg-zinc-900/50 p-1 rounded text-[10px]">
                          <span className="text-zinc-400 truncate pr-1">{bp.name}</span>
                          <span className={bp.delayHours > 5 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>{bp.delayHours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking form */}
                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-3">
                  <h4 className="font-bold text-zinc-300 text-[11px] uppercase tracking-wider">Book Cargo Transport</h4>
                  {unassignedShipments.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 text-center py-2">
                      No cargo shipments are currently awaiting transporter booking. Use the Produce Marketplace to buy commodities first.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
                          Select Unassigned Shipment
                        </label>
                        <select
                          value={selectedShipmentId}
                          onChange={e => setSelectedShipmentId(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded p-1.5 text-xs outline-none"
                        >
                          {unassignedShipments.map(s => {
                            const order = bids.find(o => o.id === s.bid_id);
                            return (
                              <option key={s.id} value={s.id}>
                                Shipment {s.id.substring(0, 6)} ({s.route_from} ➔ {s.route_to}) - Fee: {formatCurrency(order ? order.total_price * 0.08 : 450)}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                        <span className="text-zinc-400">Est. Logistics Fee (8% SADC Waived)</span>
                        <strong className="text-emerald-400 text-sm">
                          {(() => {
                            const ship = shipments.find(s => s.id === selectedShipmentId);
                            const order = ship ? bids.find(o => o.id === ship.bid_id) : null;
                            return formatCurrency(order ? order.total_price * 0.08 : 450);
                          })()}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-4 gap-2">
                <DialogClose render={
                  <Button variant="outline" className="border-zinc-800 text-zinc-300 text-xs">Close</Button>
                } />
                
                {unassignedShipments.length > 0 && (
                  <Button
                    onClick={() => handleBookTransport(selectedTransporter.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs font-semibold px-4 flex items-center gap-1.5"
                  >
                    Confirm Booking <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
};



