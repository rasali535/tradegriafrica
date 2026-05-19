"use client";

import React, { useState } from 'react';
import { useApp, User, CommodityListing } from '@/context/AppContext';
import { 
  ShieldAlert, ShieldCheck, Users, ShoppingBag, Truck, DollarSign,
  AlertTriangle, CheckCircle2, XCircle, Search, RefreshCw, Star, Layers, Activity,
  Terminal, Key, Link, MessageSquare, Send, Wifi, WifiOff, FileCode
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export const AdminPanel: React.FC = () => {
  const { 
    users, listings, orders, shipments, exports, payments, updateListing,
    webhooks, apiKeys, eventLogs, generateApiKey, revokeApiKey, 
    registerWebhook, deleteWebhook, addFarm, addListing, triggerEvent
  } = useApp();
  
  const [selectedListing, setSelectedListing] = useState<CommodityListing | null>(null);

  // Developer API Console states
  const [apiEndpoint, setApiEndpoint] = useState<string>('GET /listings');
  const [apiResponse, setApiResponse] = useState<string>('{\n  "message": "Click Send Sandbox Request to run execution"\n}');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeyRole, setNewKeyRole] = useState<string>('farmer');
  const [newWebhookUrl, setNewWebhookUrl] = useState<string>('');

  // GTM & Field Operations states
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'PulaTrade GTM WhatsApp Agent online.\nType "help" to view quick registration or listing templates.' }
  ]);

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

  // REST API playground handler
  const handleSendApiRequest = () => {
    setApiLoading(true);
    setTimeout(() => {
      let data: any = {};
      switch (apiEndpoint) {
        case 'GET /listings':
          data = listings.slice(0, 4);
          break;
        case 'POST /listings':
          data = {
            success: true,
            message: "Listing created in SADC distributed ledger",
            data: {
              id: `l0000001-${Math.random().toString(16).substring(2, 10)}`,
              commodity: "Sorghum",
              quantity: 120,
              price: 340,
              country_of_origin: "Botswana",
              status: "available",
              created_at: new Date().toISOString()
            }
          };
          break;
        case 'GET /orders':
          data = orders.slice(0, 4);
          break;
        case 'GET /shipments':
          data = shipments.slice(0, 4);
          break;
        case 'GET /payments/escrow':
          data = payments.slice(0, 4);
          break;
        default:
          data = { error: "Unknown API endpoint" };
      }
      setApiResponse(JSON.stringify(data, null, 2));
      setApiLoading(false);
    }, 450);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      alert('Please specify a developer/entity label');
      return;
    }
    generateApiKey(newKeyName, newKeyRole);
    setNewKeyName('');
    alert(`Sandbox API credentials created for label: ${newKeyName}`);
  };

  const handleRegisterWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) {
      alert('Please enter a valid HTTP web receiver URL');
      return;
    }
    registerWebhook({
      url: newWebhookUrl,
      events: ['trade.created', 'payment.escrowed', 'shipment.status_updated'],
      active: true
    });
    setNewWebhookUrl('');
    alert(`Webhook endpoint registered for real-time corridor events`);
  };

  // SMS/WhatsApp chatbot processor
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = '';
      const lowerText = userMsg.toLowerCase();

      if (lowerText === 'help') {
        reply = '👉 Enrollment template:\nREGISTER farm=Nswazwi Orchards, size=180, crop=Sorghum\n\n👉 Crop listing template:\nLIST crop=Beans, quantity=40, price=450';
      } else if (lowerText.startsWith('register')) {
        const farmMatch = userMsg.match(/farm=([^,]+)/i);
        const sizeMatch = userMsg.match(/size=(\d+)/i);
        const cropMatch = userMsg.match(/crop=([^,]+)/i);

        if (farmMatch && sizeMatch && cropMatch) {
          const farmName = farmMatch[1].trim();
          const size = Number(sizeMatch[1]);
          const crop = cropMatch[1].trim() as 'Beef' | 'Maize' | 'Sorghum' | 'Horticulture' | 'Poultry feed products';

          const farmData = {
            owner_id: 'f1000000-0000-0000-0000-000000000001',
            farm_name: farmName,
            farm_size: size,
            country: 'Botswana',
            region: 'North-East District',
            commodity_focus: [crop],
            production_capacity: size * 2.5,
            certification_status: 'Certified' as const
          };

          if (isOnline) {
            addFarm(farmData);
            reply = `✅ PulaTrade WhatsApp enrollment SUCCESS!\nFarm: ${farmName}\nSize: ${size} Hectares\nStatus: Certified\nRef: fa100000-${Math.random().toString(16).substring(2,6).toUpperCase()}`;
          } else {
            setOfflineQueue(prev => [...prev, { type: 'register_farm', data: farmData }]);
            reply = `💾 [OFFLINE QUEUED] Enrollment stored in local device sync queue. Will sync automatically when connection restores.`;
          }
        } else {
          reply = '❌ Formatting mismatch. Use:\nREGISTER farm=Name, size=Hectares, crop=CropType';
        }
      } else if (lowerText.startsWith('list')) {
        const cropMatch = userMsg.match(/crop=([^,]+)/i);
        const qtyMatch = userMsg.match(/quantity=(\d+)/i);
        const priceMatch = userMsg.match(/price=(\d+)/i);

        if (cropMatch && qtyMatch && priceMatch) {
          const crop = cropMatch[1].trim() as 'Beef' | 'Maize' | 'Sorghum' | 'Horticulture' | 'Poultry feed products';
          const qty = Number(qtyMatch[1]);
          const price = Number(priceMatch[1]);

          const listingData = {
            farm_id: 'fa100000-0000-0000-0000-000000000001',
            commodity: crop,
            quantity: qty,
            price: price,
            status: 'available' as const,
            export_ready: true,
            harvest_date: new Date().toISOString().split('T')[0],
            photos: [],
            storage_availability: 'Local depot aggregator storage',
            country_of_origin: 'Botswana'
          };

          if (isOnline) {
            addListing(listingData);
            reply = `✅ PulaTrade Crop Published via SMS!\nCommodity: ${crop}\nQuantity: ${qty} Tons\nPrice: $${price}/Ton\nRef: l0000001-${Math.random().toString(16).substring(2,6).toUpperCase()}`;
          } else {
            setOfflineQueue(prev => [...prev, { type: 'add_listing', data: listingData }]);
            reply = `💾 [OFFLINE QUEUED] Listing stored in local device sync queue. Will sync automatically when connection restores.`;
          }
        } else {
          reply = '❌ Formatting mismatch. Use:\nLIST crop=CropName, quantity=Tons, price=USD';
        }
      } else {
        reply = '🤖 PulaTrade Bot: Request not recognized. Type "help" to view quick registration or listing templates.';
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 550);
  };

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState && offlineQueue.length > 0) {
      offlineQueue.forEach(item => {
        if (item.type === 'register_farm') {
          addFarm(item.data);
        } else if (item.type === 'add_listing') {
          addListing(item.data);
        }
      });
      alert(`Synchronized ${offlineQueue.length} pending local outbox tasks to SADC blockchain ledger.`);
      setOfflineQueue([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="p-6 rounded-2xl glass-card border-zinc-800/80 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500 animate-spin-slow" />
            PulaTrade Operations Control Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Platform administration, bilateral compliance checks, biosecurity controls, offline GTM field sync, and developer sandbox credentials.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-mono">Platform Version: 2.1.0</Badge>
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
        <TabsList className="bg-zinc-900 border border-zinc-800 p-0.5 text-zinc-400 w-full flex overflow-x-auto justify-start">
          <TabsTrigger value="fraud" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Fraud Alerts ({fraudAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="listings" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Verify Listings
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Users Pool
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Developer API Console
          </TabsTrigger>
          <TabsTrigger value="gtm" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            GTM & Field Ops
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
                  {fraudAlerts.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 text-xs">No active compliance or fraud alerts found.</div>
                  ) : (
                    fraudAlerts.map(alert => (
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
                    ))
                  )}
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

        {/* Developer API Console Tab */}
        <TabsContent value="api" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Interactive API Playground */}
            <Card className="lg:col-span-2 glass-card border-zinc-900 p-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-emerald-500" />
                    Bilateral Open API Sandbox Playground
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Simulate SADC regional cross-border system connections</p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <select 
                      value={apiEndpoint} 
                      onChange={e => setApiEndpoint(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-2.5 h-9 focus:ring-emerald-700 outline-none"
                    >
                      <option value="GET /listings">GET /listings</option>
                      <option value="POST /listings">POST /listings (Sorghum batch)</option>
                      <option value="GET /orders">GET /orders</option>
                      <option value="GET /shipments">GET /shipments</option>
                      <option value="GET /payments/escrow">GET /payments/escrow</option>
                    </select>

                    <Button 
                      onClick={handleSendApiRequest}
                      disabled={apiLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 flex items-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {apiLoading ? 'Executing...' : 'Send Sandbox Request'}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-mono text-zinc-500 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-900">
                      <FileCode className="h-3 w-3" /> JSON Response
                    </div>
                    <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 font-mono text-[10px] text-emerald-500 max-h-[220px] overflow-y-auto whitespace-pre-wrap">
                      {apiResponse}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-zinc-500 mt-4 border-t border-zinc-800/60 pt-2 font-mono">
                API Base URL: <span className="text-zinc-400">https://api.pulatrade.com/v1</span>
              </div>
            </Card>

            {/* API Keys and Webhooks Generator */}
            <div className="space-y-4">
              {/* API Keys */}
              <Card className="glass-card border-zinc-900 p-4">
                <h4 className="font-bold text-zinc-200 text-xs flex items-center gap-1.5 border-b border-zinc-800 pb-2 mb-3">
                  <Key className="h-4 w-4 text-emerald-500" />
                  API Keys Manager
                </h4>
                <form onSubmit={handleCreateKey} className="space-y-2 mb-4">
                  <Input 
                    placeholder="e.g. Botswana Agrichain Sync" 
                    value={newKeyName} 
                    onChange={e => setNewKeyName(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-8"
                  />
                  <div className="flex gap-2">
                    <select 
                      value={newKeyRole} 
                      onChange={e => setNewKeyRole(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-2.5 h-8 flex-1 outline-none"
                    >
                      <option value="farmer">Farmer Account</option>
                      <option value="buyer">Buyer System</option>
                      <option value="transporter">Transporter Dispatch</option>
                      <option value="government">Government Regulator</option>
                    </select>
                    <Button type="submit" size="sm" className="h-8 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700">
                      Create
                    </Button>
                  </div>
                </form>

                <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {apiKeys.map(k => (
                    <div key={k.id} className="p-2 rounded bg-zinc-950/60 border border-zinc-900 flex justify-between items-center text-[10px]">
                      <div className="truncate pr-2">
                        <div className="font-semibold text-zinc-300 truncate">{k.name}</div>
                        <div className="font-mono text-zinc-500 text-[9px] truncate">{k.key}</div>
                      </div>
                      <Button 
                        onClick={() => { revokeApiKey(k.id); alert('Key revoked'); }}
                        size="sm" 
                        className="h-6 px-2 text-[9px] bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/20"
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Webhooks */}
              <Card className="glass-card border-zinc-900 p-4">
                <h4 className="font-bold text-zinc-200 text-xs flex items-center gap-1.5 border-b border-zinc-800 pb-2 mb-3">
                  <Link className="h-4 w-4 text-emerald-500" />
                  Webhooks Dispatcher
                </h4>
                <form onSubmit={handleRegisterWebhook} className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://your-server.com/webhook" 
                      value={newWebhookUrl} 
                      onChange={e => setNewWebhookUrl(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-8 flex-1"
                    />
                    <Button type="submit" size="sm" className="h-8 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700">
                      Add Url
                    </Button>
                  </div>
                </form>

                <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {webhooks.map(w => (
                    <div key={w.id} className="p-2 rounded bg-zinc-950/60 border border-zinc-900 flex justify-between items-center text-[10px]">
                      <div className="truncate pr-2">
                        <div className="font-mono text-zinc-300 truncate">{w.url}</div>
                        <div className="text-[8px] text-zinc-500 mt-0.5">Active triggers: {w.events.join(', ')}</div>
                      </div>
                      <Button 
                        onClick={() => { deleteWebhook(w.id); alert('Webhook deleted'); }}
                        size="sm" 
                        className="h-6 px-2 text-[9px] bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/20"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* GTM & Field Operations Tab */}
        <TabsContent value="gtm" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* WhatsApp/SMS Simulator Phone Emulator */}
            <Card className="glass-card border-zinc-900 p-5 flex flex-col justify-between h-[450px]">
              <div>
                <div className="border-b border-zinc-800 pb-2 mb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-xs flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                      Offline USSD/SMS Agent Simulator
                    </h3>
                    <p className="text-[9px] text-zinc-500">Test crop onboarding under weak cellular coverage</p>
                  </div>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 font-mono text-[9px]">
                    +267 79 100 001
                  </Badge>
                </div>

                {/* Messages feed */}
                <div className="space-y-2 h-[280px] overflow-y-auto pr-1 flex flex-col pt-1">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`max-w-[85%] rounded-lg p-2.5 text-[10px] leading-normal font-mono ${
                        msg.sender === 'user' 
                          ? 'self-end bg-emerald-600 text-white rounded-tr-none' 
                          : 'self-start bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat quick templates and inputs */}
              <div className="space-y-2 border-t border-zinc-900 pt-3">
                <div className="flex gap-1.5 flex-wrap">
                  <button 
                    onClick={() => setChatInput('REGISTER farm=Orapa Greenfields, size=300, crop=Maize')}
                    className="text-[9px] font-mono text-zinc-400 hover:text-emerald-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded"
                  >
                    Enroll Farm
                  </button>
                  <button 
                    onClick={() => setChatInput('LIST crop=Maize, quantity=75, price=295')}
                    className="text-[9px] font-mono text-zinc-400 hover:text-emerald-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded"
                  >
                    List Maize Crop
                  </button>
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2">
                  <Input 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type SMS or template command..."
                    className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-8 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                    Send
                  </Button>
                </form>
              </div>
            </Card>

            {/* Offline sync monitor and network controller */}
            <Card className="glass-card border-zinc-900 p-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-zinc-800 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-xs">Offline Sync Ledger Engine</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Guarantees data retention during rural connectivity drops</p>
                  </div>
                  <Button 
                    onClick={handleToggleOnline}
                    size="sm" 
                    className={`h-7 px-3 text-[10px] font-bold ${
                      isOnline 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                        : 'bg-red-950 text-red-400 border border-red-900'
                    }`}
                  >
                    {isOnline ? (
                      <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> Online</span>
                    ) : (
                      <span className="flex items-center gap-1"><WifiOff className="h-3 w-3" /> Offline Mode</span>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-900 text-xs text-zinc-400">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Sync Outbox Queue Status</span>
                    <div className="text-xl font-bold mt-1 text-zinc-200">
                      {offlineQueue.length} Pending Actions
                    </div>
                    <p className="text-[9px] text-zinc-500 mt-1">
                      {offlineQueue.length > 0 
                        ? 'Actions are locally cached and waiting to sync.' 
                        : 'Outbox clear. All device transactions fully synchronized.'}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs max-h-[160px] overflow-y-auto pr-1">
                    {offlineQueue.map((item, i) => (
                      <div key={i} className="p-2 bg-zinc-900 border border-zinc-800/80 rounded flex justify-between items-center">
                        <div>
                          <Badge className="bg-zinc-950 text-zinc-400 border border-zinc-800 text-[8px] font-mono">
                            {item.type}
                          </Badge>
                          <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                            {JSON.stringify(item.data).substring(0, 40)}...
                          </div>
                        </div>
                        <Badge className="bg-amber-950 text-amber-400 border border-amber-900 text-[8px]">Pending Sync</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-zinc-500 mt-4 border-t border-zinc-800/60 pt-2 text-center font-mono">
                Local Database Sync Driver: <span className="text-zinc-400">Supabase offline-sqlite-sync v1.2</span>
              </div>
            </Card>

            {/* SADC Regional Corridor Pilot Status */}
            <Card className="glass-card border-zinc-900 p-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="font-bold text-zinc-100 text-xs">SADC Expansion Corridor Pilot Hubs</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Pilot statistics across primary agricultural transport lanes</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-900 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-zinc-200">Gaborone Center Hub</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">14 active cooperatives • 1,250 tons aggregated</div>
                    </div>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]">Botswana Pilot</Badge>
                  </div>

                  <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-900 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-zinc-200">Plumtree Corridor</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">38 active transport lines • 4.1h border queues</div>
                    </div>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]">Zimbabwe Exit</Badge>
                  </div>

                  <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-900 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-zinc-200">Kazungula Crossing</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">Biosecurity checkpoint active • 82% transit efficiency</div>
                    </div>
                    <Badge className="bg-blue-950 text-blue-400 border border-blue-900 text-[9px]">Zambia Connector</Badge>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 mt-4 border-t border-zinc-800/60 pt-2 text-center">
                Expanding to South Africa demand hubs in Q3 2026.
              </div>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
