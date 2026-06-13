"use client";

import React, { useState } from 'react';
import { 
  Globe, Shield, TrendingUp, Truck, Users, ArrowRight, CheckCircle, 
  MapPin, ShoppingBag, BarChart3, Star, Compass, Award, ExternalLink,
  Sprout, Briefcase, Lock, Bot, FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LandingPageProps {
  onLaunchApp: (userId?: string, targetTab?: 'dashboard' | 'marketplace' | 'logistics' | 'onboarding' | 'ai_agents') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [activeHeroTab, setActiveHeroTab] = useState<'marketplace' | 'logistics' | 'agents'>('marketplace');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'BWP' | 'ZAR'>('USD');
  const [showApiResponse, setShowApiResponse] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const formatPrice = (usdVal: number) => {
    if (selectedCurrency === 'BWP') {
      return `P${(usdVal * 13.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    if (selectedCurrency === 'ZAR') {
      return `R${(usdVal * 18.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `$${usdVal.toLocaleString()}`;
  };

  return (
    <div className="relative text-zinc-300 min-h-screen">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline and Pitch */}
          <div className="lg:col-span-5 space-y-6 text-left relative z-10">
            <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold tracking-wide border-emerald-900/60 bg-emerald-950/20 text-emerald-400">
              🌍 SADC Cross-Border Procurement Infrastructure
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight">
              Unifying Enterprise Trade across <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-500">African Nations</span>
            </h1>
            
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-lg">
              Pula Trade Africa is an autonomous B2B enterprise workflow engine. Our specialized AI Agents automate regional SADC trade intelligence, compliance, routing, and digital deal closing.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a href="/onboarding">
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 border border-emerald-500 shadow-xl shadow-emerald-950/30 text-xs transition-all cursor-pointer"
                >
                  Start Onboarding
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Button 
                onClick={() => onLaunchApp()}
                variant="outline" 
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 px-5 py-2.5 text-xs transition-all cursor-pointer"
              >
                Launch Sandbox Console
              </Button>
              <Button 
                variant="outline" 
                className="border-amber-800/60 text-amber-500 bg-amber-950/20 hover:bg-amber-900/40 hover:text-amber-400 px-5 py-2.5 text-xs transition-all cursor-pointer"
              >
                Partner with Us
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900">
              <div className="space-y-1">
                <div className="text-xl font-bold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-200">5 SADC Countries</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Operational Target</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">Interactive</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">B2B Sandbox Model</div>
              </div>
            </div>
          </div>

          {/* Right Column: High Fidelity Interactive Mockup with the three requested pillars */}
          <div className="lg:col-span-7 w-full relative z-10">
            <div className="glass-card border-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative">
              {/* Background gradient glowing behind mockup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Mockup Header Toolbar */}
              <div className="border-b border-zinc-900 bg-zinc-950 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
                  <span className="text-[10px] text-zinc-500 font-mono ml-2 cursor-default">sandbox.tradegrid.africa</span>
                </div>
                
                {/* 3 tabs: Marketplace, Logistics, Buyers */}
                <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-[11px] font-semibold w-full sm:w-auto">
                  <button 
                    onClick={() => setActiveHeroTab('marketplace')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer w-full justify-center sm:w-auto ${
                      activeHeroTab === 'marketplace' 
                        ? 'bg-emerald-950/65 text-emerald-400 border border-emerald-900/60' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <ShoppingBag className="h-3 w-3" />
                    Marketplace
                  </button>
                  <button 
                    onClick={() => setActiveHeroTab('logistics')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer w-full justify-center sm:w-auto ${
                      activeHeroTab === 'logistics' 
                        ? 'bg-blue-950/65 text-blue-400 border border-blue-900/60' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Truck className="h-3 w-3" />
                    Logistics
                  </button>
                  <button 
                    onClick={() => setActiveHeroTab('agents')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer w-full justify-center sm:w-auto ${
                      activeHeroTab === 'agents' 
                        ? 'bg-amber-950/65 text-amber-400 border border-amber-900/60' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Bot className="h-3 w-3" />
                    AI Agents
                  </button>
                </div>
              </div>

              {/* Mockup Screen Content */}
              <div className="p-5 bg-zinc-950/40 text-left min-h-[300px] flex flex-col justify-between relative z-10">
                
                {/* MARKETPLACE TAB PREVIEW */}
                {activeHeroTab === 'marketplace' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Live Supplier Exchange</h3>
                        <p className="text-[10px] text-zinc-500">Real-time SADC B2B enterprise listings</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Currency Toggle */}
                        <div className="flex rounded bg-zinc-900 border border-zinc-800 p-0.5 text-[9px] gap-0.5">
                          {(['USD', 'BWP', 'ZAR'] as const).map(curr => (
                            <button
                              key={curr}
                              onClick={() => setSelectedCurrency(curr)}
                              className={`px-1.5 py-0.5 rounded transition-all font-semibold ${
                                selectedCurrency === curr 
                                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
                                  : 'text-zinc-550 hover:text-zinc-300'
                              }`}
                            >
                              {curr}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Exchange
                          </span>
                          <span className="text-[9px] text-zinc-500">Updated 2 mins ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Item 1 */}
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 flex justify-between items-center hover:border-emerald-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-center text-emerald-400 text-xs font-bold">
                            MZ
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-200">Industrial Steel (Grade A)</div>
                            <div className="text-[10px] text-zinc-500">Chobe Industrials • Botswana</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-400">{formatPrice(320)} / Ton</div>
                          <div className="text-[10px] text-zinc-400">50 Tons Left</div>
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 flex justify-between items-center hover:border-emerald-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-900/50 flex items-center justify-center text-amber-500 text-xs font-bold">
                            SG
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-200">Heavy Machinery Parts</div>
                            <div className="text-[10px] text-zinc-500">Beitbridge Manufacturing • Zimbabwe</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-400">{formatPrice(295)} / Ton</div>
                          <div className="text-[10px] text-zinc-400">20 Tons Left</div>
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 flex justify-between items-center hover:border-emerald-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-900/50 flex items-center justify-center text-blue-400 text-xs font-bold">
                            BF
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-200">Copper Wire Bulk</div>
                            <div className="text-[10px] text-zinc-500">Francistown Metals • Botswana</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-400">{formatPrice(4500)} / Ton</div>
                          <div className="text-[10px] text-zinc-400">15 Tons Left</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/50 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-550">SADC trade exemption pre-validated</span>
                      <Button 
                        onClick={() => onLaunchApp('b2000000-0000-0000-0000-000000000001', 'marketplace')}
                        className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-900/60 text-[10px] h-7 font-bold transition-all px-3 cursor-pointer"
                      >
                        Enter Marketplace Hub →
                      </Button>
                    </div>
                  </div>
                )}

                {/* LOGISTICS TAB PREVIEW */}
                {activeHeroTab === 'logistics' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Corridor Transit Passport</h3>
                        <p className="text-[10px] text-zinc-500">Real-time border congestion & corridor tracking</p>
                      </div>
                      <span className="text-[9px] bg-blue-950 text-blue-400 border border-blue-900/60 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Live Corridors
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Corridor 1 */}
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 space-y-2 hover:border-blue-900/40 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-zinc-200">Trans-Kalahari Corridor</span>
                          <span className="text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-1.5 py-0.5 rounded font-bold">FAST</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Border queue wait:</span>
                            <strong className="text-zinc-200">38 mins</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Active fleet:</span>
                            <strong className="text-zinc-200">14 Carriers</strong>
                          </div>
                        </div>
                      </div>

                      {/* Corridor 2 */}
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 space-y-2 hover:border-blue-900/40 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-zinc-200">North-South Corridor</span>
                          <span className="text-[9px] text-amber-500 bg-amber-950/60 border border-amber-900/40 px-1.5 py-0.5 rounded font-bold">MODERATE</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Border queue wait:</span>
                            <strong className="text-zinc-200">54 mins</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Active fleet:</span>
                            <strong className="text-zinc-200">8 Carriers</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Shipment Tracker */}
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="text-[10px] text-zinc-300">Truck #L-KGL-402 (Steel): <strong>Passing Kazungula Bridge</strong></span>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono">GPS: LOCK</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/50 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-555">SADC digital border passes integrated</span>
                      <Button 
                        onClick={() => onLaunchApp('t3000000-0000-0000-0000-000000000001', 'logistics')}
                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-900/60 text-[10px] h-7 font-bold transition-all px-3 cursor-pointer"
                      >
                        Enter Logistics Portal →
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI AGENTS TAB PREVIEW */}
                {activeHeroTab === 'agents' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Multi-Agent Orchestrator</h3>
                        <p className="text-[10px] text-zinc-500">Autonomous workflow executing cross-border trade tasks</p>
                      </div>
                      <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-900/60 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Bot className="h-2.5 w-2.5 text-amber-400 animate-pulse" /> ACTIVE
                      </span>
                    </div>

                    {/* Agent Pipeline Card */}
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-mono">Query: "Export 10T Steel BW → SA"</div>
                          <div className="text-xs font-bold text-zinc-200">Executing Sequential AI Workflow...</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-extrabold text-amber-400">98%</div>
                          <div className="text-[9px] text-zinc-500">Confidence</div>
                        </div>
                      </div>

                      {/* Agent Execution Flow */}
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-1 gap-1.5 text-[10px] font-mono">
                          <div className="flex items-center gap-2 text-zinc-400"><CheckCircle className="h-3 w-3 text-emerald-500" /> [Discovery]: Buyer found (SADC Foods)</div>
                          <div className="flex items-center gap-2 text-zinc-400"><CheckCircle className="h-3 w-3 text-emerald-500" /> [Compliance]: Pioneer Gate clearance valid</div>
                          <div className="flex items-center gap-2 text-amber-400 animate-pulse"><TrendingUp className="h-3 w-3" /> [Logistics]: Calculating multi-modal routes...</div>
                          <div className="flex items-center gap-2 text-zinc-600"><Lock className="h-3 w-3" /> [Deal Closing]: Awaiting contract draft</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/50 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-555">Real-time SADC API orchestration</span>
                      <Button 
                        onClick={() => onLaunchApp(undefined, 'ai_agents')}
                        className="bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-900/60 text-[10px] h-7 font-bold transition-all px-3 cursor-pointer"
                      >
                        Enter AI Agent Center →
                      </Button>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
          
        </div>
      </section>



      {/* Interactive Role Switcher Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Explore Sandbox Role Panels</h2>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">Click any profile below to launch the sandbox app pre-configured as that specific SADC trade participant.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Farmer Card */}
          <div className="group flex flex-col justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-emerald-700/60 hover:bg-zinc-950 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10"></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/60">Supplier</span>
                <span className="text-[10px] font-medium text-zinc-500">Botswana</span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-emerald-400 transition-colors">Tshepo Mokgosi</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Chobe Valley Industrials</p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Manage B2B listings, request compliance audits, view SADC regional demand maps.</p>
              </div>
            </div>
            <Button 
              onClick={() => onLaunchApp('f1000000-0000-0000-0000-000000000001')}
              className="mt-6 w-full text-xs bg-emerald-950/40 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-900/60 group-hover:border-emerald-600 font-semibold py-1.5 h-8 cursor-pointer"
            >
              Access Supplier view
            </Button>
          </div>

          {/* Buyer Card */}
          <div className="group flex flex-col justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-amber-700/60 hover:bg-zinc-950 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10"></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/40 text-amber-500 border border-amber-900/60">Buyer</span>
                <span className="text-[10px] font-medium text-zinc-500">South Africa</span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-amber-400 transition-colors">SADC Food Distributors</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Procurement Hub</p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Browse commodities, generate digital contracts, request import readiness checks, track orders.</p>
              </div>
            </div>
            <Button 
              onClick={() => onLaunchApp('b2000000-0000-0000-0000-000000000001')}
              className="mt-6 w-full text-xs bg-amber-950/40 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-900/60 group-hover:border-amber-600 font-semibold py-1.5 h-8 cursor-pointer"
            >
              Access Buyer view
            </Button>
          </div>

          {/* Transporter Card */}
          <div className="group flex flex-col justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-blue-700/60 hover:bg-zinc-950 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10"></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/60">Logistics</span>
                <span className="text-[10px] font-medium text-zinc-500">Botswana</span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-blue-400 transition-colors">Kalahari Logistics</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Express Fleet</p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Coordinate cross-border trucks, update real-time GPS locations, log custom wait times.</p>
              </div>
            </div>
            <Button 
              onClick={() => onLaunchApp('t3000000-0000-0000-0000-000000000001')}
              className="mt-6 w-full text-xs bg-blue-950/40 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-900/60 group-hover:border-blue-600 font-semibold py-1.5 h-8 cursor-pointer"
            >
              Access Logistics view
            </Button>
          </div>

          {/* Exporter Card */}
          <div className="group flex flex-col justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-purple-700/60 hover:bg-zinc-950 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10"></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-900/60">Exporter</span>
                <span className="text-[10px] font-medium text-zinc-500">Zimbabwe</span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-purple-400 transition-colors">AfriTrade Group</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Enterprise B2B Linkers</p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Verify enterprise guidelines, issue regional trade permits, clear custom duty exemptions.</p>
              </div>
            </div>
            <Button 
              onClick={() => onLaunchApp('e4000000-0000-0000-0000-000000000001')}
              className="mt-6 w-full text-xs bg-purple-950/40 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-900/60 group-hover:border-purple-600 font-semibold py-1.5 h-8 cursor-pointer"
            >
              Access Exporter view
            </Button>
          </div>

          {/* Admin Card */}
          <div className="group flex flex-col justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/60 hover:bg-zinc-950 transition-all duration-305 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-zinc-500/10"></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900/40 text-zinc-400 border border-zinc-800">Admin</span>
                <span className="text-[10px] font-medium text-zinc-500">SADC Corridor</span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-zinc-300 transition-colors">PulaOperations</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Platform Admin</p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Oversee regional contracts, track border waiting times, review active shipments and compliance scores.</p>
              </div>
            </div>
            <Button 
              onClick={() => onLaunchApp('a5000000-0000-0000-0000-000000000001')}
              className="mt-6 w-full text-xs bg-zinc-900/40 hover:bg-zinc-750 text-zinc-450 hover:text-white border border-zinc-800 group-hover:border-zinc-700 font-semibold py-1.5 h-8 cursor-pointer"
            >
              Access Admin view
            </Button>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-16 border-t border-zinc-900">
        <div className="text-center space-y-2 mb-12">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs">AI-Native Infrastructure</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">Specialized B2B AI Agents</h2>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">Digitizing the African enterprise value chain through a collaborative, autonomous agent ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 w-fit">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Trade Discovery Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Analyzes regional SADC demand matrices, finds enterprise buyers, checks historical prices, and recommends optimal export corridors.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-xl text-amber-500 w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Compliance Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Checks regional/international trade treaties, determines tariffs, validates compliance clearances, and identifies required border documents.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-blue-400 w-fit">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Logistics Agent</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Formulates multimodal transport routing plans (road, rail, sea), tracks border gate queue delays, and estimates cargo transit costs.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 w-fit">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Documentation Compiler</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatically structures dynamic trade documents like Commercial Invoices, Packing Lists, and SADC Certificates of Origin.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-xl text-amber-500 w-fit">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Deal Closing Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drafts binding legal bilateral treaties, establishes digital settlement milestones, and generates robust B2B negotiation workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-blue-400 w-fit">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Workflow Orchestrator</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The control tower that sequentially coordinates parameters across all five agents, enabling end-to-end operations directly from user prompt queries.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>



      {/* Market Opportunity & Partner Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <Badge className="bg-amber-950 text-amber-400 border border-amber-900 text-xs">Market Opportunity</Badge>
            <h2 className="text-3xl font-extrabold text-zinc-100 leading-tight">
              Unlocking the $300B+ African Enterprise Sector
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sub-Saharan Africa possesses massive industrial potential, yet cross-border enterprise distribution remains severely bottlenecked by paper-based processes and logistics fragmentation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 space-y-1">
                <div className="font-bold text-zinc-200">Cross-Border Inefficiency</div>
                <p className="text-[10px] text-zinc-400">Average customs processing times at SADC borders exceed 18 hours, resulting in substantial product spoilage.</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 space-y-1">
                <div className="font-bold text-zinc-200">Trade Intelligence Gap</div>
                <p className="text-[10px] text-zinc-400">Over $120B in requested trade credit goes unserved annually due to disjointed data and inefficient trade workflows.</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 space-y-1">
                <div className="font-bold text-zinc-200">Regional Supply Insecurity</div>
                <p className="text-[10px] text-zinc-400">Regional supply mismatches lead to enterprise bottlenecks in some nations while adjacent markets experience surplus decay.</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 space-y-1">
                <div className="font-bold text-zinc-200">Expanding Digital Coverage</div>
                <p className="text-[10px] text-zinc-400">Internet connectivity along trade corridors is up 400% since 2020, enabling real-time mobile tracking.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 rounded-2xl border border-zinc-800 bg-zinc-955 relative overflow-hidden text-left flex flex-col justify-between min-h-[350px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-400" />
                Partner With TradeGridAfrica
              </h3>
              <p className="text-xs text-zinc-400">
                Join our regional network. Choose your integration track below to request an AI Agent pilot, partner with our customs compliance systems, or view investor packages.
              </p>
            </div>

            <div className="space-y-3 pt-6">
              {/* Option 1: Request Pilot */}
              <button 
                onClick={() => onLaunchApp('b2000000-0000-0000-0000-000000000001', 'onboarding')}
                className="w-full p-3.5 rounded-xl border border-zinc-900 bg-zinc-900/60 hover:bg-emerald-950/20 hover:border-emerald-800 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">Request Pilot</div>
                  <p className="text-[10px] text-zinc-500">Register corporate aggregation hubs or enterprise procurement accounts.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Option 2: Gov */}
              <button 
                onClick={() => onLaunchApp('e4000000-0000-0000-0000-000000000001', 'onboarding')}
                className="w-full p-3.5 rounded-xl border border-zinc-900 bg-zinc-900/60 hover:bg-amber-950/20 hover:border-amber-800 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">Government Partnership</div>
                  <p className="text-[10px] text-zinc-500">Integrate compliance checkpoints and border manifest automation.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => onLaunchApp('k7000000-0000-0000-0000-000000000001', 'dashboard')}
                className="w-full p-3.5 rounded-xl border border-zinc-900 bg-zinc-900/60 hover:bg-blue-950/20 hover:border-blue-800 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">Investor Access</div>
                  <p className="text-[10px] text-zinc-500">Review deployment metrics, trade volume projections, and seed targets.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-zinc-900">
        <div className="text-center space-y-2 mb-12">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs">Collaborative Networks</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">Tailored Partnerships for SADC Development</h2>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">Pula Trade Africa integrates multi-sector institutions into a unified digital corridor.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* For Governments */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/30 hover:bg-zinc-950/60 transition-all duration-300 space-y-4 text-left">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              For Governments
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlock compliance automation, industrial output analytics, and cross-border customs data feeds to optimize trade flow.
            </p>
            <div className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 w-fit px-2 py-0.5 rounded">
              Economic security + trade intelligence
            </div>
          </div>

          {/* For Banks */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/30 hover:bg-zinc-950/60 transition-all duration-300 space-y-4 text-left">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              For Banks
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Leverage our predictive Deal Closing agent, view transaction logs, and assess compliance audit histories for risk-scoring trade finance.
            </p>
            <div className="text-[10px] font-semibold text-amber-400 bg-amber-950/30 border border-amber-900/40 w-fit px-2 py-0.5 rounded">
              Trade finance + risk scoring
            </div>
          </div>

          {/* For Cooperatives */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/30 hover:bg-zinc-950/60 transition-all duration-300 space-y-4 text-left">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              For Cooperatives
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Access regional bulk buyer networks, verify exporter compliance standards, and coordinate transport fleets from local industrial hubs.
            </p>
            <div className="text-[10px] font-semibold text-blue-400 bg-blue-950/30 border border-blue-900/40 w-fit px-2 py-0.5 rounded">
              B2B Aggregation + logistics
            </div>
          </div>
        </div>
      </section>

      {/* SADC Map Visualization Banner */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-zinc-900 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <Badge className="bg-amber-950 text-amber-400 border border-amber-900 text-xs">Live Corridor Tracking</Badge>
          <h2 className="text-3xl font-bold text-zinc-100 leading-tight">Connecting the Kalahari, Maputo, and North-South Corridor Route</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            By connecting logistics vectors directly with customs hubs, Pula Trade Africa reduces product transit times and border waiting times.
          </p>
          <div className="space-y-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Automated Border Queue Notifications
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Customs manifests integrated with SADC Trade Registry
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              GPS tracking logs dynamically analyzed by the Logistics Agent
            </div>
          </div>
        </div>
        <div className="flex-1 w-full bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="text-center space-y-4">
            <Globe className="h-16 w-16 mx-auto text-emerald-500/80 animate-pulse" />
            <h3 className="font-bold text-zinc-200">Bilateral Customs Integration</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Automated checkpoints tracking active shipments crossing Gaborone, Windhoek, Johannesburg, Harare, and Lusaka.
            </p>
            <Button onClick={() => onLaunchApp()} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-900/60 text-xs mt-2">
              Launch Live Map Sandbox <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-gradient-to-b from-zinc-950 to-zinc-900 border-t border-zinc-900 py-16 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">Ready to accelerate African Trade?</h2>
          <p className="text-xs text-zinc-400">
            Experience the full platform demo right now in the sandbox. Switch roles to view how Pula Trade Africa serves Suppliers, Buyers, Exporters, and Transporters.
          </p>
          <Button 
            onClick={() => onLaunchApp()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg border border-emerald-500 shadow-lg shadow-emerald-950/40"
          >
            Launch Sandbox Dashboard
          </Button>
        </div>
      </section>
    </div>
  );
};
