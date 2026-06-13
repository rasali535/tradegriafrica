"use client";

import React, { useState, useEffect } from 'react';
import { useApp, User, Rfq } from '@/context/AppContext';
import { 
  ShieldAlert, ShieldCheck, Users, ShoppingBag, Truck, DollarSign,
  AlertTriangle, CheckCircle2, XCircle, Search, RefreshCw, Star, Layers, Activity,
  Terminal, Key, Link, MessageSquare, Send, Wifi, WifiOff, FileCode,
  Sprout, Briefcase, UserCheck, UserX, FileText, Eye, Globe, Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export const AdminPanel: React.FC = () => {
  const { 
    users, rfqs, bids, shipments, exports, payments, updateRfqStatus,
    webhooks, apiKeys, eventLogs, generateApiKey, revokeApiKey, 
    registerWebhook, deleteWebhook, addCompany, createRfq, triggerEvent,
    updateUserKycStatus
  } = useApp();
  
  const [selectedListing, setSelectedListing] = useState<Rfq | null>(null);

  // Onboarding & KYC states
  const [kycRoleFilter, setKycRoleFilter] = useState<string>('all');
  const [kycStatusFilter, setKycStatusFilter] = useState<string>('all');
  const [kycSearchQuery, setKycSearchQuery] = useState<string>('');
  const [selectedKycUser, setSelectedKycUser] = useState<User | null>(null);
  const [auditChecklist, setAuditChecklist] = useState<Record<string, boolean>>({
    registry: true,
    biosecurity: true,
    finance: true,
    compliance: true
  });

  // Developer API Console states
  const [apiEndpoint, setApiEndpoint] = useState<string>('GET /rfqs');
  const [apiResponse, setApiResponse] = useState<string>('{\n  "message": "Click Send Sandbox Request to run execution"\n}');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeyRole, setNewKeyRole] = useState<string>('supplier');
  const [newWebhookUrl, setNewWebhookUrl] = useState<string>('');

  // NDA & Access Logs states
  const [ndaList, setNdaList] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [loadingNda, setLoadingNda] = useState<boolean>(true);

  const fetchNdaLogs = async () => {
    try {
      setLoadingNda(true);
      const res = await fetch('/api/nda/status');
      const data = await res.json();
      if (data.success) {
        setNdaList(data.ndas);
        setAccessLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load NDAs/logs", err);
    } finally {
      setLoadingNda(false);
    }
  };

  useEffect(() => {
    fetchNdaLogs();
  }, []);

  // GTM & Field Operations states
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'TradeGridAfrica GTM WhatsApp Agent online.\nType "help" to view quick registration or listing templates.' }
  ]);

  // Compute platform-wide metrics
  const totalVolumeTraded = bids
    .filter(o => o.status === 'accepted')
    .reduce((sum, o) => sum + o.total_price, 0);

  const totalValueTraded = bids
    .filter(o => o.status === 'accepted')
    .reduce((sum, o) => sum + o.total_price, 0);

  interface FraudAlert {
    id: string;
    severity: 'high' | 'medium' | 'low';
    type: string;
    message: string;
    targetId: string;
  }
  
  const fraudAlerts: FraudAlert[] = [];
  
  // Rule 1: High unit price check (> $1000/ton for Maize/Sorghum)
  rfqs.forEach(l => {
    if ((l.industry === 'Maize' || l.industry === 'Sorghum') && 100 > 600) {
      fraudAlerts.push({
        id: `alert-1-${l.id}`,
        severity: 'high',
        type: 'Price Anomaly',
        message: `High unit price of $${100}/Ton detected on crop listing in ${l.delivery_location}. Market standard is $250-$350.`,
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
  rfqs.forEach(l => {
    if ((l.status === 'awarded')) {
      const order = bids.find(o => o.rfq_id === l.id);
      const expCert = order ? exports.find(e => e.bid_id === order.id) : null;
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
    updateRfqStatus(id, 'open');
    alert("Listing verified successfully!");
  };

  const handleDeclineProduce = (id: string) => {
    updateRfqStatus(id, 'closed');
    alert("Listing flagged and moved to Draft status.");
  };

  // REST API playground handler
  const handleSendApiRequest = () => {
    setApiLoading(true);
    setTimeout(() => {
      let data: any = {};
      switch (apiEndpoint) {
        case 'GET /rfqs':
          data = rfqs.slice(0, 4);
          break;
        case 'POST /rfqs':
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
        case 'GET /bids':
          data = bids.slice(0, 4);
          break;
        case 'GET /shipments':
          data = shipments.slice(0, 4);
          break;
        case 'GET /procurement/bids':
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
      events: ['trade.created', 'bid.submitted', 'shipment.status_updated'],
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
        reply = '👉 Enrollment template:\nREGISTER supplier=Chobe Industrials, size=180, industry=Mining\n\n👉 Procurement listing template:\nLIST industry=Steel, quantity=40, price=450';
      } else if (lowerText.startsWith('register')) {
        const farmMatch = userMsg.match(/supplier=([^,]+)/i);
        const sizeMatch = userMsg.match(/size=(\d+)/i);
        const cropMatch = userMsg.match(/industry=([^,]+)/i);

        if (farmMatch && sizeMatch && cropMatch) {
          const farmName = farmMatch[1].trim();
          const size = Number(sizeMatch[1]);
          const crop = cropMatch[1].trim() as 'Mining' | 'Construction' | 'Manufacturing' | 'Heavy Machinery' | 'Logistics';

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
            addCompany(farmData as any);
            reply = `✅ Pula Trade Africa WhatsApp enrollment SUCCESS!\nCompany: ${farmName}\nSize: ${size} Units\nStatus: Certified\nRef: co100000-${Math.random().toString(16).substring(2,6).toUpperCase()}`;
          } else {
            setOfflineQueue(prev => [...prev, { type: 'register_company', data: farmData }]);
            reply = `💾 [OFFLINE QUEUED] Enrollment stored in local device sync queue. Will sync automatically when connection restores.`;
          }
        } else {
          reply = '❌ Formatting mismatch. Use:\nREGISTER supplier=Name, size=Units, industry=IndustryType';
        }
      } else if (lowerText.startsWith('list')) {
        const cropMatch = userMsg.match(/industry=([^,]+)/i);
        const qtyMatch = userMsg.match(/quantity=(\d+)/i);
        const priceMatch = userMsg.match(/price=(\d+)/i);

        if (cropMatch && qtyMatch && priceMatch) {
          const crop = cropMatch[1].trim() as 'Mining' | 'Construction' | 'Manufacturing' | 'Heavy Machinery' | 'Logistics';
          const qty = Number(qtyMatch[1]);
          const price = Number(priceMatch[1]);

          const rfqData: Omit<Rfq, 'id' | 'created_at'> = {
            buyer_company_id: 'co100000-0000-0000-0000-000000000001',
            title: crop,
            industry: 'Agriculture',
            description: `Procurement Request for ${crop}`,
            required_quantity: qty,
            unit: 'Tons',
            delivery_location: 'Botswana',
            deadline: new Date().toISOString().split('T')[0],
            status: 'open' as const
          };

          if (isOnline) {
            createRfq(rfqData);
            reply = `✅ TradeGridAfrica Crop Published via SMS!\nCommodity: ${crop}\nQuantity: ${qty} Tons\nPrice: $${price}/Ton\nRef: l0000001-${Math.random().toString(16).substring(2,6).toUpperCase()}`;
          } else {
            setOfflineQueue(prev => [...prev, { type: 'add_listing', data: rfqData }]);
            reply = `💾 [OFFLINE QUEUED] Listing stored in local device sync queue. Will sync automatically when connection restores.`;
          }
        } else {
          reply = '❌ Formatting mismatch. Use:\nLIST crop=CropName, quantity=Tons, price=USD';
        }
      } else {
        reply = '🤖 TradeGridAfrica Bot: Request not recognized. Type "help" to view quick registration or listing templates.';
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 550);
  };

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState && offlineQueue.length > 0) {
      offlineQueue.forEach(item => {
        if (item.type === 'register_company') {
          addCompany(item.data);
        } else if (item.type === 'add_listing') {
          createRfq(item.data);
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
            TradeGridAfrica Operations Control Center
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
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Platform rfqs</CardTitle>
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{rfqs.length} Active</div>
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
          <TabsTrigger value="rfqs" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Verify rfqs
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Onboarding & KYC
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Developer API Console
          </TabsTrigger>
          <TabsTrigger value="gtm" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            GTM & Field Ops
          </TabsTrigger>
          <TabsTrigger value="nda" className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> NDA & Security Logs
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
                Powered by TradeGridAfrica Distributed Compliance Registry.
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* rfqs Moderation Tab */}
        <TabsContent value="rfqs" className="mt-4">
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
                  {rfqs.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/10 text-zinc-300">
                      <td className="p-3 font-mono text-[11px]">{l.id.substring(0, 8)}...</td>
                      <td className="p-3 font-medium text-zinc-200">{l.delivery_location}</td>
                      <td className="p-3 font-medium text-zinc-200">{l.industry}</td>
                      <td className="p-3">{l.required_quantity} Tons</td>
                      <td className="p-3 text-emerald-400 font-bold">${100} / Ton</td>
                      <td className="p-3">
                        <Badge className={
                          l.status === 'open' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px]' :
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
        <TabsContent value="users" className="mt-4 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card border-zinc-900 p-4">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Awaiting Verification</div>
              <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center justify-between">
                <span>{users.filter(u => u.kyc_status === 'pending').length} Profiles</span>
                <span className="p-1 bg-amber-950/50 rounded-lg text-amber-400 border border-amber-900/60"><AlertTriangle className="h-4 w-4" /></span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">Action required for border authorization</p>
            </Card>
            <Card className="glass-card border-zinc-900 p-4">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verified SADC Suppliers</div>
              <div className="text-2xl font-bold text-emerald-500 mt-1 flex items-center justify-between">
                <span>{users.filter(u => u.role === 'supplier' && u.kyc_status === 'approved').length} Active</span>
                <span className="p-1 bg-emerald-950/50 rounded-lg text-emerald-400 border border-emerald-900/60"><Briefcase className="h-4 w-4" /></span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">Eligible for trade & financing</p>
            </Card>
            <Card className="glass-card border-zinc-900 p-4">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verified Corporate Buyers</div>
              <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center justify-between">
                <span>{users.filter(u => u.role === 'buyer' && u.kyc_status === 'approved').length} Active</span>
                <span className="p-1 bg-zinc-900 rounded-lg text-amber-500 border border-zinc-800"><Briefcase className="h-4 w-4" /></span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">Active procurement purchase power</p>
            </Card>
            <Card className="glass-card border-zinc-900 p-4">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verified Carrier Fleets</div>
              <div className="text-2xl font-bold text-blue-500 mt-1 flex items-center justify-between">
                <span>{users.filter(u => u.role === 'transporter' && u.kyc_status === 'approved').length} Trucks</span>
                <span className="p-1 bg-blue-950/50 rounded-lg text-blue-400 border border-blue-900/60"><Truck className="h-4 w-4" /></span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">Multi-corridor transit authorization</p>
            </Card>
          </div>

          {/* Filters and List */}
          <Card className="glass-card border-zinc-900 p-5">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">Regional Onboarding Ledger</h3>
                <p className="text-xs text-zinc-500">Monitor and approve legal identities across enterprise trade corridors</p>
              </div>
              
              {/* Filter controls */}
              <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Search by name, ref..."
                    value={kycSearchQuery}
                    onChange={e => setKycSearchQuery(e.target.value)}
                    className="pl-8 bg-zinc-950 border-zinc-900 text-zinc-200 text-xs h-9 w-full md:w-48 focus:border-emerald-800"
                  />
                </div>
                
                <select
                  value={kycRoleFilter}
                  onChange={e => setKycRoleFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2.5 h-9 text-zinc-300 outline-none focus:border-emerald-800"
                >
                  <option value="all">All Roles</option>
                  <option value="supplier">Suppliers</option>
                  <option value="buyer">Buyers</option>
                  <option value="transporter">Logistics</option>
                  <option value="exporter">Exporters</option>
                </select>

                <select
                  value={kycStatusFilter}
                  onChange={e => setKycStatusFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2.5 h-9 text-zinc-300 outline-none focus:border-emerald-800"
                >
                  <option value="all">All KYC Statuses</option>
                  <option value="pending">Pending Audit</option>
                  <option value="approved">Approved / Active</option>
                  <option value="rejected">Rejected / Hold</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/30 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
                    <th className="p-3">Participant Identity</th>
                    <th className="p-3">SADC Trade Corridor Role</th>
                    <th className="p-3">Onboarding Verification Document</th>
                    <th className="p-3 text-center">KYC Status</th>
                    <th className="p-3 text-right">Verification Decisions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => {
                    if (kycRoleFilter !== 'all' && u.role !== kycRoleFilter) return false;
                    if (kycStatusFilter !== 'all') {
                      if (kycStatusFilter === 'pending' && u.kyc_status !== 'pending') return false;
                      if (kycStatusFilter === 'approved' && u.kyc_status !== 'approved') return false;
                      if (kycStatusFilter === 'rejected' && u.kyc_status !== 'rejected') return false;
                    }
                    if (kycSearchQuery) {
                      const q = kycSearchQuery.toLowerCase();
                      return u.name.toLowerCase().includes(q) || 
                             u.email.toLowerCase().includes(q) ||
                             (u.document_ref && u.document_ref.toLowerCase().includes(q)) ||
                             u.country.toLowerCase().includes(q);
                    }
                    return true;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500">
                        No onboarding applications match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    users.filter(u => {
                      if (kycRoleFilter !== 'all' && u.role !== kycRoleFilter) return false;
                      if (kycStatusFilter !== 'all') {
                        if (kycStatusFilter === 'pending' && u.kyc_status !== 'pending') return false;
                        if (kycStatusFilter === 'approved' && u.kyc_status !== 'approved') return false;
                        if (kycStatusFilter === 'rejected' && u.kyc_status !== 'rejected') return false;
                      }
                      if (kycSearchQuery) {
                        const q = kycSearchQuery.toLowerCase();
                        return u.name.toLowerCase().includes(q) || 
                               u.email.toLowerCase().includes(q) ||
                               (u.document_ref && u.document_ref.toLowerCase().includes(q)) ||
                               u.country.toLowerCase().includes(q);
                      }
                      return true;
                    }).map(u => (
                      <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/20 text-zinc-300 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            <Badge className="bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-normal px-1.5 py-0">
                              {u.country}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{u.email} • {u.phone}</div>
                        </td>
                        
                        <td className="p-3">
                          {u.role === 'supplier' && (
                            <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-900/60 text-[10px] gap-1 px-2 py-0.5">
                              <Briefcase className="h-3 w-3" /> Supplier
                            </Badge>
                          )}
                          {u.role === 'buyer' && (
                            <Badge className="bg-amber-950/80 text-amber-400 border border-amber-900/60 text-[10px] gap-1 px-2 py-0.5">
                              <Briefcase className="h-3 w-3" /> Buyer
                            </Badge>
                          )}
                          {u.role === 'transporter' && (
                            <Badge className="bg-blue-950/80 text-blue-400 border border-blue-900/60 text-[10px] gap-1 px-2 py-0.5">
                              <Truck className="h-3 w-3" /> Logistics Carrier
                            </Badge>
                          )}
                          {u.role === 'exporter' && (
                            <Badge className="bg-violet-950/80 text-violet-400 border border-violet-900/60 text-[10px] gap-1 px-2 py-0.5">
                              <Layers className="h-3 w-3" /> Exporter
                            </Badge>
                          )}
                          {u.role !== 'supplier' && u.role !== 'buyer' && u.role !== 'transporter' && u.role !== 'exporter' && (
                            <Badge className="bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] px-2 py-0.5">
                              {u.role.toUpperCase()}
                            </Badge>
                          )}
                        </td>

                        <td className="p-3">
                          {u.document_name ? (
                            <div className="space-y-1">
                              <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-zinc-500" />
                                <span>{u.document_name}</span>
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                Ref: <span className="font-mono text-zinc-400">{u.document_ref}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-500 italic">No document submitted</span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {u.kyc_status === 'approved' ? (
                            <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">
                              Approved
                            </Badge>
                          ) : u.kyc_status === 'rejected' ? (
                            <Badge className="bg-red-950 text-red-400 border border-red-900 text-[10px]">
                              Rejected
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-950 text-amber-400 border border-amber-900 text-[10px] animate-pulse">
                              Pending Review
                            </Badge>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            {/* Action Buttons */}
                            {u.kyc_status === 'pending' || !u.kyc_status ? (
                              <>
                                <Button
                                  onClick={() => {
                                    setSelectedKycUser(u);
                                    setAuditChecklist({
                                      registry: true,
                                      biosecurity: true,
                                      finance: true,
                                      compliance: true
                                    });
                                  }}
                                  variant="outline"
                                  className="h-7 text-[10px] border-zinc-800 text-zinc-300 hover:bg-zinc-900 px-2 flex items-center gap-1"
                                >
                                  <Eye className="h-3.5 w-3.5 text-emerald-400" /> Audit & Verify
                                </Button>
                                <Button
                                  onClick={() => updateUserKycStatus(u.id, 'approved')}
                                  className="h-7 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 hover:bg-emerald-900/20 px-2"
                                >
                                  Quick Approve
                                </Button>
                              </>
                            ) : u.kyc_status === 'approved' ? (
                              <>
                                <Button
                                  onClick={() => setSelectedKycUser(u)}
                                  variant="outline"
                                  className="h-7 text-[10px] border-zinc-800 text-zinc-400 hover:bg-zinc-900 px-2 flex items-center gap-1"
                                >
                                  <Eye className="h-3.5 w-3.5 text-zinc-400" /> Review Audit
                                </Button>
                                <Button
                                  onClick={() => updateUserKycStatus(u.id, 'rejected')}
                                  className="h-7 text-[10px] bg-red-950 text-red-400 border border-red-900/60 hover:bg-red-900/20 px-2"
                                >
                                  Revoke
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  onClick={() => updateUserKycStatus(u.id, 'approved')}
                                  className="h-7 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 hover:bg-emerald-900/20 px-2"
                                >
                                  Re-Verify
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                      <option value="GET /rfqs">GET /rfqs</option>
                      <option value="POST /rfqs">POST /rfqs (Sorghum batch)</option>
                      <option value="GET /bids">GET /bids</option>
                      <option value="GET /shipments">GET /shipments</option>
                      <option value="GET /procurement/bids">GET /procurement/bids</option>
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
                API Base URL: <span className="text-zinc-400">https://api.tradegridafrica.com/v1</span>
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
                      <option value="supplier">Supplier Account</option>
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
                    <p className="text-[9px] text-zinc-500">Test supplier onboarding under weak cellular coverage</p>
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
                    onClick={() => setChatInput('REGISTER supplier=Orapa Industrials, size=300, industry=Mining')}
                    className="text-[9px] font-mono text-zinc-400 hover:text-emerald-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded"
                  >
                    Enroll Supplier
                  </button>
                  <button 
                    onClick={() => setChatInput('LIST industry=Steel, quantity=75, price=295')}
                    className="text-[9px] font-mono text-zinc-400 hover:text-emerald-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded"
                  >
                    List Steel Inventory
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

        {/* NDA & Security Logs Tab Content */}
        <TabsContent value="nda" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 glass-card border-zinc-900">
              <CardHeader className="p-4 border-b border-zinc-850 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-300">Signed Agreements Registry</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Cryptographically signed platform Terms and Mutual Non-Disclosure agreements database</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={fetchNdaLogs} 
                  className="h-7 text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-350 hover:bg-zinc-800/50"
                  disabled={loadingNda}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${loadingNda ? 'animate-spin' : ''}`} /> Refresh
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {loadingNda ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">Loading signed agreements...</div>
                ) : ndaList.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">No signed agreements registered.</div>
                ) : (
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">
                        <th className="p-3">Signee Identity</th>
                        <th className="p-3">Agreement Type</th>
                        <th className="p-3">Entity & Purpose</th>
                        <th className="p-3">Audit Details</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ndaList.map((nda: any) => {
                        const isTerms = nda.agreement_type === "terms";
                        return (
                          <tr key={nda.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/10 text-zinc-300">
                            <td className="p-3">
                              <div className="font-semibold text-zinc-200">{nda.full_name}</div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">{nda.email}</div>
                            </td>
                            <td className="p-3">
                              <Badge className={`text-[8.5px] font-mono px-2 py-0.5 ${
                                isTerms 
                                  ? "bg-blue-950/80 text-blue-400 border border-blue-900" 
                                  : "bg-amber-950/80 text-amber-400 border border-amber-900"
                              }`}>
                                {isTerms ? "Terms & Privacy" : "Mutual NDA"}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="text-zinc-200">{nda.company_name} ({nda.role})</div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">{nda.purpose}</div>
                            </td>
                            <td className="p-3">
                              <div>IP: <span className="font-mono text-zinc-400">{nda.ip_address}</span></div>
                              <div className="text-[9px] text-zinc-550 mt-0.5">Signed: {new Date(nda.signed_at).toLocaleString()}</div>
                            </td>
                            <td className="p-3 text-right">
                              {nda.pdf_url && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = nda.pdf_url;
                                    const prefix = isTerms ? "Signed_Terms_Of_Service" : "Signed_NDA";
                                    link.download = `${prefix}_TradeGridAfrica_${nda.full_name.replace(/\s+/g, "_")}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="h-6 text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 hover:bg-emerald-900/25 flex items-center gap-1 ml-auto"
                                >
                                  <Download className="h-3 w-3" /> Download PDF
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Access Logs (1 col) */}
            <Card className="glass-card border-zinc-900">
              <CardHeader className="p-4 border-b border-zinc-850">
                <CardTitle className="text-sm font-bold text-zinc-300">Access & Security Logs</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Real-time gate traffic audit records</CardDescription>
              </CardHeader>
              <CardContent className="p-3 max-h-[400px] overflow-y-auto space-y-2.5">
                {loadingNda ? (
                  <div className="text-center py-6 text-zinc-500 text-xs">Loading logs...</div>
                ) : accessLogs.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs font-mono">No access events recorded.</div>
                ) : (
                  accessLogs.map((log: any) => (
                    <div key={log.id} className="p-2.5 rounded border border-zinc-900 bg-zinc-950/40 text-[10px] space-y-1.5 font-sans leading-normal">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-300 truncate max-w-[130px]">{log.user_email}</span>
                        <Badge className={`text-[8px] font-mono font-normal ${
                          log.action === 'NDA_SIGNED' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/50' : 
                          log.action === 'PLATFORM_ACCESS_BLOCKED' ? 'bg-red-950/20 text-red-400 border-red-900/50' : 
                          'bg-zinc-900 text-zinc-400 border-zinc-850'
                        }`}>
                          {log.action}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-zinc-500 text-[9px]">
                        <span>IP: {log.ip_address}</span>
                        <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Onboarding & KYC Cryptographic Document Verification Modal */}
      {selectedKycUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative">
            <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="p-6 border-b border-zinc-900 flex justify-between items-start">
              <div>
                <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] mb-2 uppercase font-semibold">
                  {selectedKycUser.role} Registry Audit
                </Badge>
                <h3 className="text-base font-bold text-zinc-100">{selectedKycUser.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{selectedKycUser.email} • {selectedKycUser.phone}</p>
              </div>
              <button 
                onClick={() => setSelectedKycUser(null)} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Submitted Document</h4>
                <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-emerald-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">{selectedKycUser.document_name || "Regional Trade Registry Document"}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Ref: <span className="font-mono text-zinc-400">{selectedKycUser.document_ref || "N/A"}</span></div>
                      </div>
                    </div>
                    <Badge className={`text-[10px] border uppercase font-semibold ${
                      selectedKycUser.kyc_status === 'approved' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900' :
                      selectedKycUser.kyc_status === 'rejected' ? 'bg-red-950/80 text-red-400 border-red-900' :
                      'bg-amber-950/80 text-amber-400 border-amber-900'
                    }`}>
                      {selectedKycUser.kyc_status || 'pending'}
                    </Badge>
                  </div>
                  
                  {selectedKycUser.document_url && (
                    <div className="text-[10px] bg-zinc-950 border border-zinc-900 rounded p-2 text-zinc-400 flex items-center justify-between">
                      <span className="font-mono truncate mr-2">{selectedKycUser.document_url}</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 shrink-0 select-none">
                        <Eye className="h-3 w-3" /> Digital Copy Attached
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Audit Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Compliance Checklist</h4>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={auditChecklist.registry} 
                      onChange={e => setAuditChecklist({...auditChecklist, registry: e.target.checked})} 
                      className="rounded border-zinc-800 bg-zinc-950 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <div className="text-xs">
                      <span className="text-zinc-200 font-medium block">SADC Trade Registry Match</span>
                      <span className="text-[10px] text-zinc-500">Legal entity registration matches SADC database</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={auditChecklist.biosecurity} 
                      onChange={e => setAuditChecklist({...auditChecklist, biosecurity: e.target.checked})} 
                      className="rounded border-zinc-800 bg-zinc-950 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <div className="text-xs">
                      <span className="text-zinc-200 font-medium block">Biosecurity & Phytosanitary Checks</span>
                      <span className="text-[10px] text-zinc-500">No active cross-border disease flags or hold records</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={auditChecklist.finance} 
                      onChange={e => setAuditChecklist({...auditChecklist, finance: e.target.checked})} 
                      className="rounded border-zinc-800 bg-zinc-950 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <div className="text-xs">
                      <span className="text-zinc-200 font-medium block">Trade Finance & B2B Verification</span>
                      <span className="text-[10px] text-zinc-500">Structured bank account matches SADC financial protocols</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={auditChecklist.compliance} 
                      onChange={e => setAuditChecklist({...auditChecklist, compliance: e.target.checked})} 
                      className="rounded border-zinc-800 bg-zinc-950 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <div className="text-xs">
                      <span className="text-zinc-200 font-medium block">Cross-Border Compliance Verification</span>
                      <span className="text-[10px] text-zinc-500">Customs and tariff exemption criteria satisfied</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* On-chain Cryptographic Stamp Simulation */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-xl flex items-center justify-between text-xs relative overflow-hidden">
                <div className="absolute right-3 top-[-10px] text-emerald-500/5 font-extrabold text-3xl rotate-12">SADC APPROVED</div>
                <div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> Secure Crypto Stamp Ready
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Simulated Hash: <span className="font-mono text-emerald-500/80">SHA-256: 0x9a8f...e8b1</span></div>
                </div>
                <div className="border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-mono text-emerald-400 font-bold uppercase select-none">
                  VALIDATED
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-900/50 border-t border-zinc-900 flex justify-between gap-3">
              <Button 
                onClick={() => setSelectedKycUser(null)} 
                variant="outline" 
                className="border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs px-4 h-9"
              >
                Close Audit
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    updateUserKycStatus(selectedKycUser.id, 'rejected');
                    setSelectedKycUser(null);
                  }}
                  className="bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/20 text-xs px-4 h-9 font-semibold"
                >
                  <UserX className="h-4 w-4 mr-1.5" /> Reject ID
                </Button>
                <Button 
                  onClick={() => {
                    updateUserKycStatus(selectedKycUser.id, 'approved');
                    setSelectedKycUser(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs px-4 h-9 font-semibold"
                  disabled={!auditChecklist.registry || !auditChecklist.biosecurity || !auditChecklist.finance || !auditChecklist.compliance}
                >
                  <UserCheck className="h-4 w-4 mr-1.5" /> Approve & Verify ID
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



