"use client";

import React, { useState } from 'react';
import { useApp, CommodityListing } from '@/context/AppContext';
import { 
  Search, Filter, Globe, ShieldCheck, MapPin, Calendar, Info, 
  ArrowRight, Lock, CheckCircle2, Bookmark, FileText, ShoppingCart,
  DollarSign, Sparkles, Scale, Heart, AlertTriangle, TrendingUp, TrendingDown,
  Layers, ChevronRight, Award, Zap, HelpCircle, ShieldAlert, SlidersHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Live SADC Pricing Index mock data
const SPOT_PRICES = [
  { commodity: 'White Maize (Non-GMO)', price: 320, change: '+1.8%', trend: 'up' },
  { commodity: 'Red Sorghum Grain', price: 295, change: '-0.4%', trend: 'down' },
  { commodity: 'Premium Beef (Halal)', price: 4750, change: '+3.2%', trend: 'up' },
  { commodity: 'Horticulture (Fresh)', price: 750, change: '+0.5%', trend: 'up' },
  { commodity: 'Poultry feed products', price: 395, change: '-1.1%', trend: 'down' },
];

export const Marketplace: React.FC = () => {
  const { listings, currentUser, placeOrder, farms } = useApp();
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [commodityFilter, setCommodityFilter] = useState('All');
  const [exportFilter, setExportFilter] = useState('All');
  const [selectedListing, setSelectedListing] = useState<CommodityListing | null>(null);
  
  // Purchase/Bidding states
  const [purchaseQty, setPurchaseQty] = useState(5);
  const [bidPrice, setBidPrice] = useState(0);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [customBids, setCustomBids] = useState<Array<{
    id: string;
    commodity: string;
    listingId: string;
    qty: number;
    price: number;
    status: 'Pending Farmer Review' | 'Accepted' | 'Declined';
    timestamp: string;
  }>>([]);
  
  // Tab/Categorization state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<'All' | 'Maize' | 'Sorghum' | 'Beef' | 'Horticulture' | 'Poultry feed products'>('All');

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handlePurchase = (listingId: string, qty: number) => {
    if (!currentUser || currentUser.role !== 'buyer') {
      alert("Error: Escrow purchases are only available to registered SADC Buyers. Please select a Buyer persona from the top switcher or register in the Onboarding Portal.");
      return;
    }
    try {
      placeOrder(listingId, qty);
      alert(`Success! Finalized smart escrow contract of ${qty} Tons. Track status under Buyer Dashboard -> Active Purchases.`);
      setSelectedListing(null);
    } catch (err: any) {
      alert(err.message || "Failed to finalize escrow order.");
    }
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !currentUser) return;
    
    if (currentUser.role !== 'buyer') {
      alert("Error: Only registered SADC Buyers can place counter-offer bids. Please switch personas.");
      return;
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      commodity: selectedListing.commodity,
      listingId: selectedListing.id,
      qty: purchaseQty,
      price: bidPrice,
      status: 'Pending Farmer Review' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCustomBids([newBid, ...customBids]);
    alert(`Success! Counter-offer bid of $${bidPrice}/Ton for ${purchaseQty} Tons has been dispatched to the Cooperative Farmer via smart contract negotiation node.`);
    setSelectedListing(null);
    setIsPlacingBid(false);
  };

  // Filter listings based on search, category selection, country, export status
  const filteredListings = listings.filter(l => {
    const matchesSearch = 
      l.commodity.toLowerCase().includes(search.toLowerCase()) || 
      l.country_of_origin.toLowerCase().includes(search.toLowerCase()) ||
      l.storage_availability.toLowerCase().includes(search.toLowerCase());
      
    const matchesCountry = countryFilter === 'All' || l.country_of_origin === countryFilter;
    const matchesCommodity = 
      (currentCategory === 'All' && commodityFilter === 'All') ||
      (currentCategory !== 'All' && l.commodity === currentCategory) ||
      (currentCategory === 'All' && commodityFilter !== 'All' && l.commodity === commodityFilter);
      
    const matchesExport = 
      exportFilter === 'All' || 
      (exportFilter === 'ready' && l.export_ready) || 
      (exportFilter === 'local' && !l.export_ready);

    return matchesSearch && matchesCountry && matchesCommodity && matchesExport;
  });

  return (
    <div className="space-y-6">
      {/* SADC Commodity Ticker */}
      <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden py-2.5 px-4 flex items-center gap-6 text-[11px] font-mono">
        <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1.5 uppercase">
          <Zap className="h-3 w-3" /> SADC Spot Market Index:
        </span>
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none animate-marquee whitespace-nowrap w-full">
          {SPOT_PRICES.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/80 px-2.5 py-1 rounded">
              <span className="text-zinc-300 font-semibold">{p.commodity}</span>
              <span className="text-zinc-100 font-bold">${p.price}/Ton</span>
              <span className={`flex items-center gap-0.5 font-bold ${p.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {p.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {p.change}
              </span>
            </div>
          ))}
        </div>
      </div>

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

      {/* Visual Category Quick-Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { name: 'All', label: 'All Crops', count: listings.length, color: 'border-zinc-800 text-zinc-300' },
          { name: 'Maize', label: 'White Maize', count: listings.filter(l => l.commodity === 'Maize').length, color: 'border-amber-900/60 text-amber-400 bg-amber-950/10' },
          { name: 'Sorghum', label: 'Red Sorghum', count: listings.filter(l => l.commodity === 'Sorghum').length, color: 'border-yellow-900/60 text-yellow-500 bg-yellow-950/10' },
          { name: 'Beef', label: 'SADC Beef', count: listings.filter(l => l.commodity === 'Beef').length, color: 'border-red-900/60 text-red-400 bg-red-950/10' },
          { name: 'Horticulture', label: 'Fresh Veggies', count: listings.filter(l => l.commodity === 'Horticulture').length, color: 'border-emerald-900/60 text-emerald-400 bg-emerald-950/10' },
          { name: 'Poultry feed products', label: 'Poultry Feed', count: listings.filter(l => l.commodity === 'Poultry feed products').length, color: 'border-blue-900/60 text-blue-400 bg-blue-950/10' }
        ].map((cat) => (
          <button
            key={cat.name}
            onClick={() => setCurrentCategory(cat.name as any)}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-350 relative overflow-hidden group cursor-pointer ${cat.color} ${
              currentCategory === cat.name 
                ? 'ring-2 ring-emerald-500/80 border-transparent shadow-lg shadow-emerald-950/20' 
                : 'hover:scale-[1.02] hover:bg-zinc-900/40'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-xs font-bold tracking-tight">{cat.label}</span>
              <span className="text-[10px] bg-zinc-950/60 border border-zinc-800/80 px-1.5 py-0.5 rounded font-mono font-bold">
                {cat.count}
              </span>
            </div>
            <span className="text-[9px] text-zinc-550 mt-4 group-hover:text-zinc-300 transition-colors">
              Filter exchange →
            </span>
          </button>
        ))}
      </div>

      {/* Advanced Filter Deck */}
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
            disabled={currentCategory !== 'All'}
            onChange={e => setCommodityFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none disabled:opacity-50"
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

      {/* Main Content: Split into Listings Grid & Negotiation Desk */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Listings column */}
        <div className="xl:col-span-3 space-y-4">
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
                    setBidPrice(listing.price - 15); // Default counter-bid suggestion
                    setIsPlacingBid(false);
                  }}
                  className="group flex flex-col justify-between rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-emerald-905/60 hover:bg-zinc-950 transition-all duration-300 cursor-pointer p-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10"></div>
                  
                  <div className="space-y-3 z-10">
                    {/* Produce Card Header Image preview */}
                    <div className="w-full h-32 rounded-lg bg-zinc-900 border border-zinc-800/80 overflow-hidden relative">
                      <img 
                        src={listing.photos[0] || 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80'} 
                        alt={listing.commodity} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className="bg-zinc-950/80 border border-zinc-800 text-[10px] text-zinc-300">
                          {listing.country_of_origin}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        {listing.export_ready ? (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-900/60 px-2 py-0.5 rounded flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> SADC Ready
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
                            Coop Reserv
                          </span>
                        )}
                      </div>
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

                    {/* Quality Specifications */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-zinc-400 bg-zinc-900/20 p-2 rounded border border-zinc-900">
                      <div>Grade: <strong className="text-zinc-300">A1 Premium</strong></div>
                      <div>Moisture: <strong className="text-zinc-300">12.5% Compliant</strong></div>
                      <div className="col-span-2 truncate">Storage: <strong className="text-zinc-300">{listing.storage_availability}</strong></div>
                    </div>

                    {/* Price / Volume Section */}
                    <div className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Total Stock</span>
                        <strong className="text-zinc-200">{listing.quantity} Tons</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Price Per Ton</span>
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
                      Inspect & Trade
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredListings.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
                <Info className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
                <p className="text-sm font-semibold text-zinc-400">No active produce listings match your filters.</p>
                <p className="text-xs text-zinc-500 mt-1">Try adjusting category selections or searching for another crop type.</p>
              </div>
            )}
          </div>
        </div>

        {/* Counter-offer Bidding / Negotiation Desk Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="glass-card border-zinc-900 bg-zinc-950/40">
            <CardHeader className="p-4">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" /> SADC Bid Desk
              </CardTitle>
              <CardDescription className="text-[11px] text-zinc-500">Submit price negotiations directly to SADC farmers</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 text-xs">
              
              {customBids.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/40 text-zinc-500">
                  <FileText className="h-6 w-6 mx-auto mb-1 text-zinc-700" />
                  <span>No active bid offers submitted yet.</span>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {customBids.map((bid) => (
                    <div key={bid.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-1.5 hover:border-zinc-800 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-zinc-205">{bid.commodity}</span>
                        <span className="text-[8px] font-mono text-zinc-500">{bid.timestamp}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Quantity: <strong>{bid.qty} Tons</strong></span>
                        <span>Price: <strong className="text-emerald-400">${bid.price}/T</strong></span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-zinc-900">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Status</span>
                        <Badge className="bg-amber-950/60 text-amber-400 border border-amber-900/60 font-semibold text-[8px] py-0 px-1.5">
                          {bid.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/50 bg-zinc-950/20">
            <CardContent className="p-4 text-xs space-y-3 text-zinc-400">
              <h4 className="font-bold text-zinc-300 text-[11px] uppercase tracking-wider">Trading Sandbox Rules</h4>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <p>1. <strong>Strict Sovereign Escrow</strong>: Every trade creates an immutable smart record that triggers cross-border phytosanitary compliance validation.</p>
                <p>2. <strong>Bilateral Settlement</strong>: Transporter details are automatically queried from the logistics passport once the seller approves.</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Redesigned Commodity Inspector & Trade Dialogue */}
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
              
              {/* Product Profile Tabs/Details */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Country of Origin</span>
                  <div className="text-zinc-200 font-semibold mt-0.5 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-zinc-400" />
                    {selectedListing.country_of_origin}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Storage Facility</span>
                  <div className="text-zinc-200 font-semibold mt-0.5 truncate">{selectedListing.storage_availability}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Available Volume</span>
                  <div className="text-zinc-200 font-semibold mt-0.5">{selectedListing.quantity} Tons</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Contract Unit Price</span>
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
                    <span className="text-zinc-350 flex items-center gap-1 font-semibold">
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
                    To purchase or negotiate this produce, you must represent a registered Buyer. Please use the persona switcher at the top to select a buyer (like "SADC Food Distributors").
                  </div>
                </div>
              )}

              {/* Purchase Configurator / Bidding forms */}
              {currentUser && currentUser.role === 'buyer' && (
                <div className="space-y-3">
                  
                  {/* Bidding vs Direct buy toggles */}
                  <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-[11px] font-semibold">
                    <button 
                      type="button"
                      onClick={() => setIsPlacingBid(false)}
                      className={`flex-1 py-1 rounded-md transition-all ${!isPlacingBid ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' : 'text-zinc-500'}`}
                    >
                      Instant Escrow Buy
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsPlacingBid(true)}
                      className={`flex-1 py-1 rounded-md transition-all ${isPlacingBid ? 'bg-amber-950 text-amber-400 border border-amber-900/60' : 'text-zinc-500'}`}
                    >
                      Negotiate Counter-Offer
                    </button>
                  </div>

                  {!isPlacingBid ? (
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-3 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Purchase Quantity</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={selectedListing.quantity}
                            value={purchaseQty}
                            onChange={e => setPurchaseQty(Math.max(1, Math.min(selectedListing.quantity, parseInt(e.target.value) || 1)))}
                            className="w-16 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded text-center text-xs font-bold py-1 outline-none focus:border-emerald-600"
                          />
                          <span className="text-zinc-500">Tons</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-xs">
                        <span className="text-zinc-400">Total Escrow Allocation</span>
                        <strong className="text-sm text-emerald-400">${(purchaseQty * selectedListing.price).toLocaleString()}</strong>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePlaceBid} className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-3 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Negotiated Quantity</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={selectedListing.quantity}
                            value={purchaseQty}
                            onChange={e => setPurchaseQty(Math.max(1, Math.min(selectedListing.quantity, parseInt(e.target.value) || 1)))}
                            className="w-16 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded text-center text-xs font-bold py-1 outline-none focus:border-amber-600"
                          />
                          <span className="text-zinc-500">Tons</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Proposed Bid Price ($/Ton)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={bidPrice}
                            onChange={e => setBidPrice(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded text-center text-xs font-bold py-1 outline-none focus:border-amber-600"
                          />
                          <span className="text-zinc-500">USD</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-xs">
                        <span className="text-zinc-400">Proposed Total Value</span>
                        <strong className="text-sm text-amber-400">${(purchaseQty * bidPrice).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsPlacingBid(false)}
                          className="border-zinc-800 text-zinc-400 text-xs h-8"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-amber-600 hover:bg-amber-700 text-white border border-amber-500 text-xs font-bold h-8"
                        >
                          Submit Counter-Offer
                        </Button>
                      </div>
                    </form>
                  )}

                </div>
              )}
            </div>

            <DialogFooter className="mt-4 gap-2">
              <DialogClose render={
                <Button variant="outline" className="border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-900">
                  Cancel
                </Button>
              } />
              
              {currentUser && currentUser.role === 'buyer' && !isPlacingBid && (
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
