"use client";

import React, { useState } from 'react';
import { useApp, CommodityListing } from '@/context/AppContext';
import { 
  Heart, ShoppingCart, History, ShieldAlert, Award, ArrowUpRight, 
  Search, Filter, Globe, Star, FileText, CheckCircle2, TrendingUp, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export const BuyerDashboard: React.FC = () => {
  const { currentUser, listings, orders, placeOrder } = useApp();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [commodityFilter, setCommodityFilter] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Filter listings based on criteria
  const availableListings = listings.filter(l => l.status === 'available');
  
  const filteredListings = availableListings.filter(l => {
    const matchesSearch = l.commodity.toLowerCase().includes(search.toLowerCase()) || 
                          l.country_of_origin.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === 'All' || l.country_of_origin === countryFilter;
    const matchesCommodity = commodityFilter === 'All' || l.commodity === commodityFilter;
    return matchesSearch && matchesCountry && matchesCommodity;
  });

  // Buyer orders
  const myOrders = orders.filter(o => o.buyer_id === currentUser?.id);

  // Recommendations based on buyer's country and SADC compliance
  const recommendedListings = availableListings
    .filter(l => l.export_ready && l.country_of_origin !== currentUser?.country)
    .slice(0, 3);

  // Insights Charts
  const priceTrends = [
    { month: 'Jan', Maize: 270, Beef: 4500, Sorghum: 310 },
    { month: 'Feb', Maize: 275, Beef: 4600, Sorghum: 315 },
    { month: 'Mar', Maize: 285, Beef: 4700, Sorghum: 318 },
    { month: 'Apr', Maize: 290, Beef: 4750, Sorghum: 320 },
    { month: 'May', Maize: 295, Beef: 4800, Sorghum: 325 },
  ];

  const tradeMetrics = [
    { subject: 'Logistics Cost', A: 80, fullMark: 100 },
    { subject: 'Tariff Ease', A: 90, fullMark: 100 },
    { subject: 'Quality Standard', A: 95, fullMark: 100 },
    { subject: 'Cert Clearance', A: 70, fullMark: 100 },
    { subject: 'Supply Density', A: 85, fullMark: 100 },
  ];

  const handlePurchase = (id: string, qty: number) => {
    try {
      placeOrder(id, qty);
      alert("Order placed successfully! Redirecting to trade tracking...");
    } catch (e: any) {
      alert(e.message || "Failed to place order");
    }
  };

  return (
    <div className="space-y-6">
      {/* SADC Trade corridors banner */}
      <div className="p-6 rounded-2xl glass-card border-emerald-900/30 flex flex-col lg:flex-row justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-zinc-100">SADC Agriculture Corridor Trading</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            You are authenticated as <strong className="text-zinc-200">{currentUser?.name}</strong>. Enjoy reduced border tariff clearance times and automated phytosanitary standards processing for regional grains, beef, and feed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900">Customs Automated</Badge>
          <Badge className="bg-amber-950 text-amber-400 border border-amber-900">SADC Tariff Exempt</Badge>
          <Badge className="bg-blue-950 text-blue-400 border border-blue-900">Smart Escrow Active</Badge>
        </div>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{myOrders.filter(o => o.status !== 'completed').length}</div>
            <p className="text-xs text-zinc-400 mt-1">Orders in logistics transit</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total SADC Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              ${myOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-emerald-500 font-semibold mt-1">Cross-Border Tariffs Waived</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Escrow Locked</CardTitle>
            <History className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              ${myOrders.filter(o => o.status === 'approved' || o.status === 'pending').reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Awaiting delivery verification</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">SADC Compliance</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">100%</div>
            <p className="text-xs text-blue-400 mt-1">Grade A Import Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier recommendations & charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price trends line chart */}
        <Card className="lg:col-span-2 glass-card border-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">SADC Commodities Price Trends</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Historical regional prices per ton in USD</CardDescription>
          </CardHeader>
          <CardContent className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" stroke="#555" fontSize={10} />
                <YAxis stroke="#555" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                <Line type="monotone" dataKey="Maize" stroke="#0B5D3B" strokeWidth={2} name="Maize" />
                <Line type="monotone" dataKey="Sorghum" stroke="#D4AF37" strokeWidth={2} name="Sorghum" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Radar ease chart */}
        <Card className="glass-card border-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">Corridor Import Ease Index</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Regional transit score metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-[230px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={tradeMetrics}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" stroke="#888" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#444" fontSize={8} />
                <Radar name="Corridor index" dataKey="A" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main interactive tables: Marketplace filter & active purchases */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-0.5 text-zinc-400">
          <TabsTrigger value="browse" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            SADC Crop & Beef Marketplace
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Active Purchases ({myOrders.length})
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Import Readiness & Tariffs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4 space-y-4">
          {/* Marketplace filters */}
          <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-900/40">
            <div className="flex-1 flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 focus-within:border-emerald-800 transition-all">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search maize Botswana, beef Namibia..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-0 outline-none text-zinc-200 text-xs w-full focus:ring-0"
              />
            </div>
            <div className="flex gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Filter className="h-3.5 w-3.5" />
                Filter:
              </div>
              <Select value={countryFilter} onValueChange={(val) => setCountryFilter(val || 'All')}>
                <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectItem value="All">All Countries</SelectItem>
                  <SelectItem value="Botswana">Botswana</SelectItem>
                  <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                  <SelectItem value="Zambia">Zambia</SelectItem>
                  <SelectItem value="Namibia">Namibia</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={commodityFilter} onValueChange={(val) => setCommodityFilter(val || 'All')}>
                <SelectTrigger className="w-[150px] bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="Commodity" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectItem value="All">All Commodities</SelectItem>
                  <SelectItem value="Maize">Maize</SelectItem>
                  <SelectItem value="Sorghum">Sorghum</SelectItem>
                  <SelectItem value="Beef">Beef</SelectItem>
                  <SelectItem value="Horticulture">Horticulture</SelectItem>
                  <SelectItem value="Poultry feed products">Poultry feed products</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Commodity Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredListings.slice(0, 9).map((listing) => (
              <Card key={listing.id} className="bg-zinc-900/60 border-zinc-800/80 hover:border-emerald-950 flex flex-col justify-between">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-950/30 border border-amber-900/60 px-2 py-0.5 rounded">
                      {listing.country_of_origin}
                    </span>
                    {listing.export_ready ? (
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">
                        Export Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-800">
                        Local Only
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-zinc-100">{listing.commodity}</CardTitle>
                  <CardDescription className="text-xs text-zinc-400">Available: {listing.quantity} Tons</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-3">
                  <div className="flex justify-between items-end border-b border-zinc-800/60 pb-2">
                    <span className="text-xs text-zinc-500">Unit Price</span>
                    <strong className="text-base text-emerald-400">${listing.price} <span className="text-[10px] text-zinc-500 font-normal">/ Ton</span></strong>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Storage Location</span>
                    <span className="text-zinc-300 max-w-[150px] truncate">{listing.storage_availability}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => toggleFavorite(listing.id)}
                      className={`p-2 border-zinc-800 hover:bg-zinc-900 transition-colors ${favorites.includes(listing.id) ? 'text-red-500 hover:text-red-600 bg-red-950/20' : 'text-zinc-400 hover:text-red-400'}`}
                    >
                      <Heart className="h-4 w-4" fill={favorites.includes(listing.id) ? 'currentColor' : 'none'} />
                    </Button>
                    <Button 
                      onClick={() => handlePurchase(listing.id, Math.min(10, listing.quantity))}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg border border-emerald-500"
                    >
                      Purchase Contract
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="mt-4">
          <Card className="glass-card border-zinc-900">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                      <th className="p-3">Contract ID</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Origin</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Clearance Tracker</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-6 text-zinc-500">No purchase contracts registered for your account.</td>
                      </tr>
                    ) : (
                      myOrders.map(order => {
                        const listing = listings.find(l => l.id === order.listing_id);
                        return (
                          <tr key={order.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/20 text-zinc-300">
                            <td className="p-3 font-mono text-[11px]">{order.id.substring(0, 8)}...</td>
                            <td className="p-3 font-semibold text-zinc-100">{listing?.commodity}</td>
                            <td className="p-3">{order.quantity} Tons</td>
                            <td className="p-3 text-emerald-400 font-bold">${order.amount.toLocaleString()}</td>
                            <td className="p-3">{listing?.country_of_origin}</td>
                            <td className="p-3">
                              <Badge className={
                                order.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                                order.status === 'approved' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                                order.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-900' :
                                'bg-amber-950 text-amber-400 border border-amber-900'
                              }>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center justify-end gap-1">
                                View Timeline <ArrowUpRight className="h-3 w-3" />
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-zinc-900/60 p-5">
              <h3 className="font-bold text-zinc-200 text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                SADC Import Regulations Summary
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                To import Maize or Sorghum from Zambia/Zimbabwe into South Africa/Botswana, you must register a certified import permit. All phytosanitary compliance scores must exceed 80.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-zinc-800/60 pb-1">
                  <span className="text-zinc-500">Phytosanitary Audit</span>
                  <span className="text-emerald-400">Compliant (Grade A)</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/60 pb-1">
                  <span className="text-zinc-500">Smart Escrow Guarantee</span>
                  <span className="text-emerald-400">Active</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/60 pb-1">
                  <span className="text-zinc-500">Bilateral Tariff Rate</span>
                  <span className="text-amber-500">0.00% (SADC Preferential)</span>
                </div>
              </div>
            </Card>

            <Card className="glass-card border-zinc-900/60 p-5">
              <h3 className="font-bold text-zinc-200 text-sm mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
                Customs Compliance Advisor
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                The Gaborone - Harare route is experiencing border clearance queue times of ~4 hours. Prefer Francistown - Lusaka for faster logistics clearance under standard customs validation.
              </p>
              <Dialog>
                <DialogTrigger render={
                  <Button size="sm" className="bg-amber-950/40 hover:bg-amber-900/30 text-amber-400 border border-amber-900/50 text-xs">
                    Check Real-time Border Queues
                  </Button>
                } />
                <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-100 flex items-center gap-2 font-bold text-sm">
                      <Globe className="h-4.5 w-4.5 text-emerald-400" />
                      SADC Border Queue Monitor
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-xs">
                      Live queue updates for commercial cargo check gates.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 my-4">
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">Pioneer Gate (SA ⇆ Botswana)</div>
                        <div className="text-[10px] text-zinc-500">Commercial cargo trucks</div>
                      </div>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">1.5h delay</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">Beitbridge (SA ⇆ Zimbabwe)</div>
                        <div className="text-[10px] text-zinc-500">Phytosanitary check slowdown</div>
                      </div>
                      <Badge className="bg-amber-950 text-amber-400 border border-amber-900 text-[10px]">5.2h delay</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">Kazungula Bridge (Zambia ⇆ Botswana)</div>
                        <div className="text-[10px] text-zinc-500">One-Stop Border Post active</div>
                      </div>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">0.8h delay</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">Plumtree (Botswana ⇆ Zimbabwe)</div>
                        <div className="text-[10px] text-zinc-500">General customs lanes open</div>
                      </div>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">2.1h delay</Badge>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose render={
                      <Button variant="outline" className="border-zinc-800 text-zinc-300 text-xs">Dismiss</Button>
                    } />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
