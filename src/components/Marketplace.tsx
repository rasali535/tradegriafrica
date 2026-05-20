"use client";

import React, { useState } from 'react';
import { useApp, CommodityListing } from '@/context/AppContext';
import { 
  Search, Filter, Globe, ShieldCheck, MapPin, Calendar, Info, 
  ArrowRight, Lock, CheckCircle2, Bookmark, FileText, ShoppingCart,
  DollarSign, Sparkles, Scale, Heart, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

export const Marketplace: React.FC = () => {
  const { listings, currentUser, placeOrder, farms } = useApp();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [commodityFilter, setCommodityFilter] = useState('All');
  const [exportFilter, setExportFilter] = useState('All');
  const [selectedListing, setSelectedListing] = useState<CommodityListing | null>(null);
  const [purchaseQty, setPurchaseQty] = useState(5);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handlePurchase = (listingId: string, qty: number) => {
    if (!currentUser || currentUser.role !== 'buyer') {
      alert("Error: Escrow purchases are only available to registered SADC Buyers. Please select a Buyer persona from the top switch dropdown or register one in the Onboarding Portal.");
      return;
    }
    try {
      placeOrder(listingId, qty);
      alert(`Success! Escalated contract of ${qty} Tons to smart escrow tracking. Verify status under your Buyer Dashboard -> Active Purchases.`);
      setSelectedListing(null);
    } catch (err: any) {
      alert(err.message || "Failed to finalize escrow order.");
    }
  };

  // Filter listings
  const filteredListings = listings.filter(l => {
    const matchesSearch = 
      l.commodity.toLowerCase().includes(search.toLowerCase()) || 
      l.country_of_origin.toLowerCase().includes(search.toLowerCase()) ||
      l.storage_availability.toLowerCase().includes(search.toLowerCase());
      
    const matchesCountry = countryFilter === 'All' || l.country_of_origin === countryFilter;
    const matchesCommodity = commodityFilter === 'All' || l.commodity === commodityFilter;
    const matchesExport = 
      exportFilter === 'All' || 
      (exportFilter === 'ready' && l.export_ready) || 
      (exportFilter === 'local' && !l.export_ready);

    return matchesSearch && matchesCountry && matchesCommodity && matchesExport;
  });

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            SADC Produce Marketplace
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Sovereign agricultural commodity exchange. Lock trades in bilateral smart contract escrows with automated phytosanitary compliance clearance.
          </p>
        </div>
        <div className="flex gap-2 z-10">
          <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-900">
            Active Listings: {listings.filter(l => l.status === 'available').length}
          </Badge>
          <Badge className="bg-amber-950/80 text-amber-400 border border-amber-900">
            Escrow Backed
          </Badge>
        </div>
      </div>

      {/* Advanced Filter Desk */}
      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900 focus-within:border-emerald-800/80 transition-all md:col-span-1">
          <Search className="h-4 w-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search crop, country, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-0 outline-none text-xs text-zinc-200 w-full focus:ring-0"
          />
        </div>

        <div>
          <select 
            value={commodityFilter} 
            onChange={e => setCommodityFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none"
          >
            <option value="All">All Commodities</option>
            <option value="Maize">Maize</option>
            <option value="Sorghum">Sorghum</option>
            <option value="Beef">Beef</option>
            <option value="Horticulture">Horticulture</option>
            <option value="Poultry feed products">Poultry feed products</option>
          </select>
        </div>

        <div>
          <select 
            value={countryFilter} 
            onChange={e => setCountryFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none"
          >
            <option value="All">All Countries of Origin</option>
            <option value="South Africa">South Africa</option>
            <option value="Botswana">Botswana</option>
            <option value="Zimbabwe">Zimbabwe</option>
            <option value="Zambia">Zambia</option>
            <option value="Namibia">Namibia</option>
          </select>
        </div>

        <div>
          <select 
            value={exportFilter} 
            onChange={e => setExportFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none"
          >
            <option value="All">All Trade Classifications</option>
            <option value="ready">SADC Export Clearance Ready</option>
            <option value="local">Domestic / Cooperative Pool</option>
          </select>
        </div>
      </div>

      {/* Listing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => {
          const farm = farms.find(f => f.id === listing.farm_id);
          const isFavorited = favorites.includes(listing.id);

          return (
            <div 
              key={listing.id}
              onClick={() => {
                setSelectedListing(listing);
                setPurchaseQty(Math.min(10, listing.quantity));
              }}
              className="group flex flex-col justify-between rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-emerald-900/60 hover:bg-zinc-950 transition-all duration-350 cursor-pointer p-4 relative overflow-hidden"
            >
              {/* Decorative light */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10"></div>
              
              <div className="space-y-3 z-10">
                {/* Top Badge Indicators */}
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-[10px] px-2 bg-zinc-900/60 text-zinc-300 border-zinc-800">
                    {listing.country_of_origin}
                  </Badge>
                  {listing.export_ready ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Export Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-500 bg-zinc-900/20 px-2 py-0.5 rounded">
                      Coop Reserve
                    </span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm group-hover:text-emerald-400 transition-colors">
                    {listing.commodity}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {farm ? farm.farm_name : 'Verified SADC Cooperative'}
                  </p>
                </div>

                {/* Storage & Harvest Details */}
                <div className="space-y-1.5 text-xs text-zinc-400 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate text-zinc-300">{listing.storage_availability}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span>Harvest Date: <strong className="text-zinc-300 font-medium">{listing.harvest_date}</strong></span>
                  </div>
                </div>

                {/* Price / Volume Section */}
                <div className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-lg flex justify-between items-center text-xs mt-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Tonnage</span>
                    <strong className="text-zinc-200">{listing.quantity} Tons</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Price per Ton</span>
                    <strong className="text-emerald-400 text-sm font-extrabold">${listing.price.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-900 z-10">
                <Button
                  variant="outline"
                  onClick={(e) => toggleFavorite(listing.id, e)}
                  className={`p-2 border-zinc-900 hover:bg-zinc-900 ${isFavorited ? 'text-red-500 bg-red-950/10 border-red-950' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Heart className="h-4 w-4" fill={isFavorited ? 'currentColor' : 'none'} />
                </Button>
                <Button
                  className="flex-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 h-8"
                >
                  Inspect & Escrow Trade
                </Button>
              </div>
            </div>
          );
        })}

        {filteredListings.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
            <Info className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-400">No active produce listings match your criteria.</p>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting filters or searching for another SADC nation.</p>
          </div>
        )}
      </div>

      {/* Detailed Inspection & Purchasing Dialog */}
      <Dialog open={selectedListing !== null} onOpenChange={(open) => !open && setSelectedListing(null)}>
        {selectedListing && (
          <DialogContent className="bg-zinc-950 border-zinc-900 text-zinc-200 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-zinc-100 flex items-center justify-between text-base font-bold">
                <span>Contract Inspector: {selectedListing.commodity}</span>
                <Badge className={selectedListing.export_ready ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-zinc-900 text-zinc-400'}>
                  {selectedListing.export_ready ? 'SADC Corridor Verified' : 'Coop Stock'}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs">
                Inspect regulatory border clearance checks, biosecurity status, and place an escrow trade order.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              {/* Product Profile */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Country of Origin</span>
                  <div className="text-zinc-200 font-semibold mt-0.5">{selectedListing.country_of_origin}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Storage Facility</span>
                  <div className="text-zinc-200 font-semibold mt-0.5 truncate">{selectedListing.storage_availability}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Available Volume</span>
                  <div className="text-zinc-200 font-semibold mt-0.5">{selectedListing.quantity} Tons</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Contract Unit Price</span>
                  <div className="text-emerald-400 font-bold mt-0.5">${selectedListing.price} / Ton</div>
                </div>
              </div>

              {/* Bilateral Biosecurity & Phytosanitary Compliance */}
              <div className="p-3 rounded-lg bg-zinc-900/20 border border-zinc-900 space-y-2.5">
                <h4 className="font-bold text-zinc-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-amber-500" />
                  SADC Regulatory Compliance Audit
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Phytosanitary Certification</span>
                    {selectedListing.export_ready ? (
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-mono text-[9px]">PASSED TIER 1</Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-500 border-zinc-800 text-[9px]">PENDING LAB AUDIT</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Aflatoxin Limit Validation</span>
                    <span className="text-emerald-400 font-medium">Compliant (&lt;10 ppb)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Escrow Security Tier</span>
                    <span className="text-zinc-300 flex items-center gap-1 font-semibold">
                      <Lock className="h-3.5 w-3.5 text-amber-500" /> Locked Escrow (Level 3)
                    </span>
                  </div>
                </div>
              </div>

              {/* Sandbox context warning for buyer purchase action */}
              {(!currentUser || currentUser.role !== 'buyer') && (
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[11px] block">Demo Notice: Buyer Action Required</span>
                    To purchase this produce, you must represent a registered Buyer. Please use the persona switcher at the top to select a buyer (like "SADC Food Distributors") or sign up one in the Onboarding Portal.
                  </div>
                </div>
              )}

              {/* Purchase Configurator */}
              {currentUser && currentUser.role === 'buyer' && (
                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Purchase Quantity</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={selectedListing.quantity}
                        value={purchaseQty}
                        onChange={e => setPurchaseQty(Math.max(1, Math.min(selectedListing.quantity, parseInt(e.target.value) || 1)))}
                        className="w-16 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded text-center text-xs font-bold py-1 outline-none focus:border-emerald-600"
                      />
                      <span className="text-zinc-500 text-xs">Tons</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                    <span className="text-zinc-400">Total Escrow Allocation</span>
                    <strong className="text-base text-emerald-400">${(purchaseQty * selectedListing.price).toLocaleString()}</strong>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 gap-2">
              <DialogClose render={
                <Button variant="outline" className="border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-900">
                  Cancel
                </Button>
              } />
              
              {currentUser && currentUser.role === 'buyer' && (
                <Button
                  onClick={() => handlePurchase(selectedListing.id, purchaseQty)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs font-semibold px-4 flex items-center gap-2"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Initiate Escrow Trade
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
