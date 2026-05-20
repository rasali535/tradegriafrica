"use client";

import React, { useState } from 'react';
import { useApp, CommodityListing } from '@/context/AppContext';
import { 
  Plus, CheckCircle, Clock, AlertTriangle, TrendingUp, DollarSign, 
  ShoppingBag, HelpCircle, FileText, ArrowRight, Truck, PlusCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

const getOriginHub = (country: string) => {
  switch (country) {
    case 'Botswana': return 'Gaborone Hub';
    case 'Zimbabwe': return 'Harare Hub';
    case 'Zambia': return 'Lusaka Hub';
    case 'Namibia': return 'Windhoek Hub';
    case 'South Africa': return 'Johannesburg Hub';
    default: return 'Gaborone Hub';
  }
};

export const FarmerDashboard: React.FC = () => {
  const { currentUser, farms, listings, orders, addListing, updateListing, updateOrderStatus } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [commodity, setCommodity] = useState<'Beef' | 'Maize' | 'Sorghum' | 'Horticulture' | 'Poultry feed products'>('Maize');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [harvestDate, setHarvestDate] = useState('2026-05-20');
  const [storage, setStorage] = useState('');
  const [exportReady, setExportReady] = useState(true);

  // Get active farm for the logged in farmer
  const farm = farms.find(f => f.owner_id === currentUser?.id);
  
  // Get listings belonging to this farm
  const farmerListings = listings.filter(l => l.farm_id === farm?.id);

  // Calculate stats
  const activeListings = farmerListings.filter(l => l.status === 'available').length;
  const soldListings = farmerListings.filter(l => l.status === 'sold');
  
  // Calculate total farm revenue (completed orders from farmer's listings)
  const myListingIds = farmerListings.map(l => l.id);
  const farmOrders = orders.filter(o => myListingIds.includes(o.listing_id));
  const completedOrders = farmOrders.filter(o => o.status === 'completed');
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingRevenue = farmOrders.filter(o => o.status === 'approved' || o.status === 'pending').reduce((sum, o) => sum + o.amount, 0);

  // Recharts Chart datasets
  const revenueData = [
    { name: 'Jan', revenue: totalRevenue * 0.15, orders: 2 },
    { name: 'Feb', revenue: totalRevenue * 0.25, orders: 4 },
    { name: 'Mar', revenue: totalRevenue * 0.45, orders: 6 },
    { name: 'Apr', revenue: totalRevenue * 0.70, orders: 8 },
    { name: 'May', revenue: totalRevenue, orders: farmOrders.length },
  ];

  const demandData = [
    { commodity: 'Maize', demand: 920, supply: 600 },
    { commodity: 'Sorghum', demand: 450, supply: 300 },
    { commodity: 'Beef', demand: 780, supply: 550 },
    { commodity: 'Horticulture', demand: 310, supply: 290 },
    { commodity: 'Poultry feed', demand: 850, supply: 480 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;

    addListing({
      farm_id: farm.id,
      commodity,
      quantity: Number(quantity),
      price: Number(price),
      status: 'available',
      export_ready: exportReady,
      harvest_date: harvestDate,
      photos: [
        commodity === 'Beef' ? '/beef.png' :
        commodity === 'Maize' ? '/maize.png' :
        commodity === 'Sorghum' ? '/sorghum.png' :
        commodity === 'Horticulture' ? '/horticulture.png' :
        '/poultry_feed.png'
      ],
      storage_availability: storage || 'Standard Barn Storage',
      country_of_origin: currentUser?.country || 'Botswana'
    });

    // Reset Form
    setQuantity('');
    setPrice('');
    setStorage('');
    setShowAddForm(false);
  };

  const handleStatusChange = (id: string, status: CommodityListing['status']) => {
    updateListing(id, { status });
  };

  return (
    <div className="space-y-6">
      {/* Farm Profile Header */}
      {farm && (
        <div className="p-6 rounded-2xl glass-card border-emerald-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-100">{farm.farm_name}</span>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 text-xs font-semibold">
                {farm.certification_status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs text-zinc-400 mt-3">
              <div>Region: <strong className="text-zinc-200">{farm.region}, {farm.country}</strong></div>
              <div>Size: <strong className="text-zinc-200">{farm.farm_size} Hectares</strong></div>
              <div>Focus: <strong className="text-zinc-200">{farm.commodity_focus.join(', ')}</strong></div>
              <div>Capacity: <strong className="text-zinc-200">{farm.production_capacity} Tons / yr</strong></div>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 border border-emerald-500 shadow-lg shadow-emerald-950/40 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Produce Listing
          </Button>
        </div>
      )}

      {/* Add Produce Form Modal overlay */}
      {showAddForm && (
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-xl space-y-4">
          <h3 className="font-bold text-zinc-100 text-lg flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-emerald-500" />
            Create Commodity Listing
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="commodity" className="text-zinc-300">Commodity</Label>
              <Select 
                value={commodity} 
                onValueChange={(val: any) => setCommodity(val)}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectItem value="Maize">Maize (White/Yellow)</SelectItem>
                  <SelectItem value="Sorghum">Sorghum</SelectItem>
                  <SelectItem value="Beef">Premium Beef</SelectItem>
                  <SelectItem value="Horticulture">Horticulture Products</SelectItem>
                  <SelectItem value="Poultry feed products">Poultry feed products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-zinc-300">Quantity (Tons)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g. 50"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-zinc-300">Price (USD per Ton)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 290"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="harvestDate" className="text-zinc-300">Harvest Date</Label>
              <Input
                id="harvestDate"
                type="date"
                required
                value={harvestDate}
                onChange={e => setHarvestDate(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storage" className="text-zinc-300">Storage Availability</Label>
              <Input
                id="storage"
                placeholder="e.g. Dry Silo B, Pandamatenga"
                required
                value={storage}
                onChange={e => setStorage(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-300"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 text-zinc-300 text-sm cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={exportReady}
                  onChange={e => setExportReady(e.target.checked)}
                  className="accent-emerald-600 rounded bg-zinc-950 border-zinc-800 h-4 w-4"
                />
                Certified Export Ready
              </label>
            </div>

            <div className="col-span-1 md:col-span-3 flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="border-zinc-800 text-zinc-300">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500">
                Submit Listing
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Farm Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-semibold">
              <TrendingUp className="h-3 w-3" /> +12.3% from last cycle
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Escrow Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">${pendingRevenue.toLocaleString()}</div>
            <p className="text-xs text-zinc-400 mt-1">Funds locked in SADC Digital Escrows</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Listings</CardTitle>
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeListings}</div>
            <p className="text-xs text-zinc-400 mt-1">Available on SADC Marketplace</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Export Clearance</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">92%</div>
            <p className="text-xs text-blue-400 mt-1">Average Readiness Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 glass-card border-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">Revenue & Trade Growth</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Overview of completed trades in 2026</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B5D3B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0B5D3B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={10} />
                <YAxis stroke="#555" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0B5D3B" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Corridor Supply/Demand */}
        <Card className="glass-card border-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">Regional SADC Demand</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Demand vs Supply metrics (K Tons)</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="commodity" stroke="#555" fontSize={8} />
                <YAxis stroke="#555" fontSize={8} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="demand" fill="#D4AF37" name="Buyer Demand" radius={[2, 2, 0, 0]} />
                <Bar dataKey="supply" fill="#0B5D3B" name="Local Supply" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs list: My Listings & Quick actions */}
      <Tabs defaultValue="my-listings" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-0.5 text-zinc-400">
          <TabsTrigger value="my-listings" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            My Crop & Beef Listings
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Incoming Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="quick-actions" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Export & Logistics Desk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-listings" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {farmerListings.map((listing) => (
              <Card key={listing.id} className="bg-zinc-900/60 border-zinc-800/80 hover:border-emerald-900/40 transition-all flex flex-col justify-between">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={
                      listing.status === 'available' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/60' :
                      listing.status === 'reserved' ? 'bg-amber-950/80 text-amber-400 border border-amber-900/60' :
                      'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }>
                      {listing.status}
                    </Badge>
                    {listing.export_ready && (
                      <Badge variant="outline" className="text-[10px] border-blue-900/60 text-blue-400">
                        Export Certified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-zinc-100">{listing.commodity}</CardTitle>
                  <CardDescription className="text-xs font-mono text-zinc-500">ID: {listing.id.substring(0, 8)}...</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-3">
                  <div className="flex justify-between text-xs border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500">Quantity</span>
                    <strong className="text-zinc-200">{listing.quantity} Tons</strong>
                  </div>
                  <div className="flex justify-between text-xs border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500">Price (USD)</span>
                    <strong className="text-emerald-400 font-bold">${listing.price} / Ton</strong>
                  </div>
                  <div className="flex justify-between text-xs border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500">Storage</span>
                    <span className="text-zinc-300 truncate max-w-[140px]">{listing.storage_availability}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {listing.status === 'available' && (
                      <>
                        <Button 
                          onClick={() => handleStatusChange(listing.id, 'reserved')}
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs border-zinc-800 text-zinc-400 hover:text-amber-400 hover:bg-amber-950/20"
                        >
                          Reserve
                        </Button>
                        <Button 
                          onClick={() => handleStatusChange(listing.id, 'sold')}
                          size="sm" 
                          className="flex-1 text-xs bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-900"
                        >
                          Mark Sold
                        </Button>
                      </>
                    )}
                    {listing.status === 'reserved' && (
                      <Button 
                        onClick={() => handleStatusChange(listing.id, 'available')}
                        size="sm" 
                        variant="outline" 
                        className="w-full text-xs border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      >
                        Make Available
                      </Button>
                    )}
                    {listing.status === 'sold' && (
                      <span className="w-full text-center text-xs text-zinc-500 py-1.5 bg-zinc-950 rounded border border-zinc-800/40">
                        Trading Closed
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card className="glass-card border-zinc-900">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold text-zinc-300">Incoming Bids & Purchase Orders</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Purchase contracts registered for your commodities</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Total Value</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-6 text-zinc-500">No active orders found for your farm.</td>
                      </tr>
                    ) : (
                      farmOrders.map(order => {
                        const listing = listings.find(l => l.id === order.listing_id);
                        return (
                          <tr key={order.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/20 text-zinc-300">
                            <td className="p-3 font-mono text-[11px]">{order.id.substring(0, 8)}...</td>
                            <td className="p-3 font-semibold text-zinc-100">{listing?.commodity}</td>
                            <td className="p-3">{order.quantity} Tons</td>
                            <td className="p-3 text-emerald-400 font-bold">${order.amount.toLocaleString()}</td>
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
                              {order.status === 'pending' && (
                                <div className="flex justify-end gap-1.5">
                                  <Button 
                                    onClick={() => updateOrderStatus(order.id, 'rejected')}
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-[10px] border-red-900 text-red-400 hover:bg-red-950/20"
                                  >
                                    Reject
                                  </Button>
                                  <Button 
                                    onClick={() => updateOrderStatus(order.id, 'approved')}
                                    size="sm" 
                                    className="h-7 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    Approve
                                  </Button>
                                </div>
                              )}
                              {order.status === 'approved' && (
                                <span className="text-[10px] text-blue-400 flex items-center justify-end gap-1 font-medium">
                                  <Truck className="h-3 w-3" /> Awaiting Transport
                                </span>
                              )}
                              {order.status === 'rejected' && (
                                <span className="text-[10px] text-red-400 font-medium">Rejected</span>
                              )}
                              {order.status === 'completed' && (
                                <span className="text-[10px] text-emerald-400 font-bold">Payment Released</span>
                              )}
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

        <TabsContent value="quick-actions" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog>
              <Card className="glass-card border-zinc-900/60 p-4 flex flex-col justify-between h-full">
                <div>
                  <h4 className="font-bold text-zinc-200 text-sm mb-1">Export Readiness Certificate</h4>
                  <p className="text-xs text-zinc-400 mb-3">Check certificate compliance scores, phytosanitary audit statuses, and export approval requests.</p>
                </div>
                <DialogTrigger render={
                  <Button size="sm" className="w-full bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-900 text-xs gap-1">
                    <FileText className="h-3.5 w-3.5" /> View Compliance Portal
                  </Button>
                } />
              </Card>
              <DialogContent className="bg-zinc-950 border border-zinc-900 max-w-md p-6 rounded-2xl text-zinc-300">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-zinc-100 flex items-center gap-2">
                    <CheckCircle className="text-emerald-500 h-5 w-5" /> SADC Border Compliance Registry
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500">Bilateral phytosanitary & biosecurity checkpoints for {currentUser?.country || 'Botswana'}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 my-4 text-xs">
                  <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <span>Phytosanitary Clearance Certificate</span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">Validated</Badge>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <span>Export Customs Entry Declaration</span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">Active</Badge>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <span>Corridor Transit Permit (e-SADC)</span>
                    <Badge className="bg-amber-950 text-amber-400 border border-amber-900 text-[10px]">Awaiting Dispatch</Badge>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <span>Veterinary Inspection Record (Beef)</span>
                    <Badge className="bg-zinc-950 text-zinc-500 border border-zinc-900 text-[10px]">Not Required</Badge>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose render={<Button variant="outline" className="border-zinc-800 text-zinc-300">Close Registry</Button>} />
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <Card className="glass-card border-zinc-900/60 p-4 flex flex-col justify-between h-full">
                <div>
                  <h4 className="font-bold text-zinc-200 text-sm mb-1">Regional Logistics Desk</h4>
                  <p className="text-xs text-zinc-400 mb-3">Book kalahari express, track customs clearance times, and view transport container rates.</p>
                </div>
                <DialogTrigger render={
                  <Button size="sm" className="w-full bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-900 text-xs gap-1">
                    <Truck className="h-3.5 w-3.5" /> Request Freight Quote
                  </Button>
                } />
              </Card>
              <DialogContent className="bg-zinc-950 border border-zinc-900 max-w-md p-6 rounded-2xl text-zinc-300">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-zinc-100 flex items-center gap-2">
                    <Truck className="text-emerald-500 h-5 w-5" /> Corridor Freight Estimator
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500">Calculate shipping costs across SADC transport routes</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 my-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-zinc-400 mb-1 block">Origin Route</Label>
                      <Input readOnly value={getOriginHub(currentUser?.country || 'Botswana')} className="bg-zinc-900 border-zinc-800 text-zinc-300" />
                    </div>
                    <div>
                      <Label className="text-zinc-400 mb-1 block">Destination Hub</Label>
                      <Input readOnly value="Johannesburg Dry Port" className="bg-zinc-900 border-zinc-800 text-zinc-300" />
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Estimated Cargo Weight</span>
                      <strong className="text-zinc-200">50 Tons (Bulk)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Transporter Base Fare</span>
                      <strong className="text-zinc-200">$1,850.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Customs Levy & Tolls</span>
                      <strong className="text-zinc-200">$240.00</strong>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm">
                      <span className="text-zinc-400 font-semibold">Total Transit Estimate</span>
                      <strong className="text-emerald-400 font-bold">$2,090.00</strong>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose render={<Button variant="outline" className="border-zinc-800 text-zinc-300">Close</Button>} />
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500" onClick={() => alert('Freight request dispatched to registered SADC Transporters.')}>
                    Request Bookings
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <Card className="glass-card border-zinc-900/60 p-4 flex flex-col justify-between h-full">
                <div>
                  <h4 className="font-bold text-zinc-200 text-sm mb-1">Cooperative Pool</h4>
                  <p className="text-xs text-zinc-400 mb-3">Aggregate your yield with neighborhood farms to unlock higher buyer volume tiers.</p>
                </div>
                <DialogTrigger render={
                  <Button size="sm" className="w-full bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-900 text-xs gap-1">
                    <PlusCircle className="h-3.5 w-3.5" /> Aggregate Produce
                  </Button>
                } />
              </Card>
              <DialogContent className="bg-zinc-950 border border-zinc-900 max-w-md p-6 rounded-2xl text-zinc-300">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-zinc-100 flex items-center gap-2">
                    <PlusCircle className="text-emerald-500 h-5 w-5" /> Cooperative Aggregation Pool
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500">Aggregate your produce to command premium bulk contract rates</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 my-4 text-xs">
                  <p className="text-zinc-400 leading-relaxed">
                    By listing collectively under the local agricultural cooperative registry, smallholders gain access to global export contracts requiring 200+ tons.
                  </p>
                  <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Your Current Yield</span>
                      <strong className="text-zinc-200">50 Tons</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Coop Aggregated Pool</span>
                      <strong className="text-zinc-200">380 Tons</strong>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm">
                      <span className="text-zinc-400 font-semibold">Bulk Price Premium</span>
                      <strong className="text-emerald-400 font-bold">+12% Premium / Ton</strong>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose render={<Button variant="outline" className="border-zinc-800 text-zinc-300">Cancel</Button>} />
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500" onClick={() => alert('Your listing has been submitted for cooperative pooling validation.')}>
                    Join Pool
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
