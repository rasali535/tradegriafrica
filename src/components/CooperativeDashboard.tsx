"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, Layers, DollarSign, TrendingUp, HelpCircle, 
  MapPin, CheckCircle, PlusCircle, ShoppingBag, ArrowUpRight, Award, UserPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const CooperativeDashboard: React.FC = () => {
  const { currentUser, farms, listings, orders, addFarm } = useApp();
  const [farmName, setFarmName] = useState('');
  const [region, setRegion] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [commodityFocus, setCommodityFocus] = useState<'Beef' | 'Maize' | 'Sorghum' | 'Horticulture' | 'Poultry feed products'>('Maize');
  const [capacity, setCapacity] = useState('');
  const [open, setOpen] = useState(false);

  const coopCountry = currentUser?.country || 'Botswana';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !region || !farmSize || !capacity) {
      alert('Please fill out all fields');
      return;
    }
    addFarm({
      owner_id: `f1000000-0000-0000-0000-${Math.random().toString().substring(2, 10)}`,
      farm_name: farmName,
      farm_size: Number(farmSize),
      country: coopCountry,
      region,
      commodity_focus: [commodityFocus],
      production_capacity: Number(capacity),
      certification_status: 'Certified'
    });
    alert('Farmer Member successfully added to SADC Cooperative Pool!');
    setFarmName('');
    setRegion('');
    setFarmSize('');
    setCapacity('');
    setOpen(false);
  };

  // Aggregate stats across cooperative members
  // We mock cooperative members as farmers registered under the same country
  const coopFarms = farms.filter(f => f.country === coopCountry);
  const coopFarmIds = coopFarms.map(f => f.id);
  const coopListings = listings.filter(l => coopFarmIds.includes(l.farm_id));
  const coopListingIds = coopListings.map(l => l.id);
  const coopOrders = orders.filter(o => coopListingIds.includes(o.listing_id));
  
  const totalVolume = coopListings.reduce((sum, l) => sum + l.quantity, 0);
  const soldVolume = coopListings.filter(l => l.status === 'sold').reduce((sum, l) => sum + l.quantity, 0);
  
  const coopRevenue = coopOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);

  // Cooperative production yield summary for charts
  const coopCropYield = [
    { commodity: 'Maize', tons: 450 },
    { commodity: 'Sorghum', tons: 230 },
    { commodity: 'Beef', tons: 180 },
    { commodity: 'Horticulture', tons: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Co-op header */}
      <div className="p-6 rounded-2xl glass-card border-emerald-900/30 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            SADC Agritech Cooperative Desk
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            You are managing the <strong className="text-zinc-200">{coopCountry} Agricultural Cooperative</strong>. Coordinate bulk storage, aggregate yields, and trade collectively.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900">Member Status: Certified</Badge>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 gap-1 text-xs">
                <UserPlus className="h-3.5 w-3.5" /> Add Farmer Member
              </Button>
            } />
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200 max-w-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-zinc-100 font-bold text-sm">Add Cooperative Farmer</DialogTitle>
                  <DialogDescription className="text-zinc-400 text-xs">
                    Register a local farmer under this cooperative pool.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Farm / Farmer Name</label>
                    <Input 
                      placeholder="e.g. Kgale Grain Farms" 
                      value={farmName} 
                      onChange={e => setFarmName(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">District / Region</label>
                    <Input 
                      placeholder="e.g. Southern District" 
                      value={region} 
                      onChange={e => setRegion(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Size (Hectares)</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 150" 
                        value={farmSize} 
                        onChange={e => setFarmSize(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Capacity (Tons)</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 450" 
                        value={capacity} 
                        onChange={e => setCapacity(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Primary Commodity Focus</label>
                    <Select 
                      value={commodityFocus} 
                      onValueChange={(val: any) => setCommodityFocus(val)}
                    >
                      <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                        <SelectValue placeholder="Select commodity" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="Maize">Maize</SelectItem>
                        <SelectItem value="Sorghum">Sorghum</SelectItem>
                        <SelectItem value="Beef">Beef</SelectItem>
                        <SelectItem value="Horticulture">Horticulture</SelectItem>
                        <SelectItem value="Poultry feed products">Poultry feed products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-400 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                    Confirm Registration
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Registered Members</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{coopFarms.length} Farms</div>
            <p className="text-xs text-zinc-400 mt-1">Cooperative members in SADC registry</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Aggregated Yield</CardTitle>
            <Layers className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{totalVolume.toLocaleString()} Tons</div>
            <p className="text-xs text-zinc-400 mt-1">Bulk grain & livestock capacity</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Bulk Coop Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">${coopRevenue.toLocaleString()}</div>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Released from secure escrow</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Aggregated Sold Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {totalVolume > 0 ? Math.round((soldVolume / totalVolume) * 100) : 0}%
            </div>
            <p className="text-xs text-blue-400 mt-1">Of aggregated pool sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">Cooperative Yield Aggregates</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Breakdown of active stock pools per commodity type</CardDescription>
          </CardHeader>
          <CardContent className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coopCropYield} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="commodity" stroke="#555" fontSize={10} />
                <YAxis stroke="#555" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                <Bar dataKey="tons" fill="#0B5D3B" name="Tons Pool" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Storage silo metrics */}
        <Card className="glass-card border-zinc-900/60 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-zinc-100 text-sm mb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-500" />
              SADC Bulk Storage Facilities
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Cooperative storage silos and cold storage validation levels for regional beef and sorghum.
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Dry Grain Silo A (Maize)</span>
                  <strong>68% Full</strong>
                </div>
                <Progress value={68} className="h-2 bg-zinc-950 [&>div]:bg-emerald-600" />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Cold Room B (Beef)</span>
                  <strong>42% Full</strong>
                </div>
                <Progress value={42} className="h-2 bg-zinc-950 [&>div]:bg-emerald-600" />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Silo C (Sorghum & Feeds)</span>
                  <strong>85% Full</strong>
                </div>
                <Progress value={85} className="h-2 bg-zinc-950 [&>div]:bg-amber-500" />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 text-center mt-4">
            Customs verified logistics paths map straight to cooperative hubs.
          </div>
        </Card>
      </div>

      {/* Cooperative Members table */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-0.5 text-zinc-400">
          <TabsTrigger value="members" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Cooperative Member Farms ({coopFarms.length})
          </TabsTrigger>
          <TabsTrigger value="bulk-listings" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Cooperative Yield Pool ({coopListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card className="glass-card border-zinc-900">
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                    <th className="p-3">Farm Name</th>
                    <th className="p-3">Region</th>
                    <th className="p-3">Farm Size</th>
                    <th className="p-3">Production Focus</th>
                    <th className="p-3">Compliance Certificate</th>
                    <th className="p-3 text-right">Inspect Farm</th>
                  </tr>
                </thead>
                <tbody>
                  {coopFarms.map(f => (
                    <tr key={f.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/20 text-zinc-300">
                      <td className="p-3 font-semibold text-zinc-100">{f.farm_name}</td>
                      <td className="p-3">{f.region}</td>
                      <td className="p-3">{f.farm_size} Hectares</td>
                      <td className="p-3">{f.commodity_focus.join(', ')}</td>
                      <td className="p-3">
                        <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900/60 text-[10px]">
                          {f.certification_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] text-emerald-400 hover:underline cursor-pointer flex items-center justify-end gap-0.5">
                          View details <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-listings" className="mt-4">
          <Card className="glass-card border-zinc-900">
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                    <th className="p-3">Listing ID</th>
                    <th className="p-3">Farm Origin</th>
                    <th className="p-3">Commodity</th>
                    <th className="p-3">Available Pool</th>
                    <th className="p-3 font-semibold text-emerald-400">Pricing</th>
                    <th className="p-3">Export Ready</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coopListings.map(cl => {
                    const farmOrigin = coopFarms.find(f => f.id === cl.farm_id);
                    return (
                      <tr key={cl.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/10 text-zinc-300">
                        <td className="p-3 font-mono text-[11px]">{cl.id.substring(0, 8)}...</td>
                        <td className="p-3 font-semibold text-zinc-200">{farmOrigin?.farm_name}</td>
                        <td className="p-3">{cl.commodity}</td>
                        <td className="p-3">{cl.quantity} Tons</td>
                        <td className="p-3 text-emerald-400 font-bold">${cl.price} / Ton</td>
                        <td className="p-3">
                          {cl.export_ready ? (
                            <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">Ready</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-850">Local Only</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge className={
                            cl.status === 'available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]' :
                            'bg-zinc-950 text-zinc-400 border border-zinc-800 text-[9px]'
                          }>
                            {cl.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
