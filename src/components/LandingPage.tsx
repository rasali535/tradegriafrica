"use client";

import React, { useState } from 'react';
import { 
  Globe, Shield, TrendingUp, Truck, Users, ArrowRight, CheckCircle, 
  MapPin, ShoppingBag, BarChart3, Star, Compass, Award, ExternalLink,
  Sprout, Briefcase, Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LandingPageProps {
  onLaunchApp: (userId?: string, targetTab?: 'dashboard' | 'marketplace' | 'logistics' | 'onboarding') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [activeHeroTab, setActiveHeroTab] = useState<'marketplace' | 'logistics' | 'buyers'>('marketplace');

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
              🌱 SADC Cross-Border Agricultural Infrastructure
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight">
              Unifying Agricultural Trade across <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-500">African Nations</span>
            </h1>
            
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-lg">
              PulaTrade connects farmers, buyers, exporters, and transporters through smart escrow contracts, automated phytosanitary compliance, and transparent border tracking.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                onClick={() => onLaunchApp()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 border border-emerald-500 shadow-xl shadow-emerald-950/30 text-xs transition-all cursor-pointer"
              >
                Launch Sandbox Console
                <ArrowRight className="h-4 w-4" />
              </Button>
              <a href="#features">
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 px-5 py-2.5 text-xs transition-all cursor-pointer">
                  Explore Infrastructure
                </Button>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-200">5 Nations</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Connected in Corridor</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">$14.2M+</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Escrow Trade Value</div>
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
                  <span className="text-[10px] text-zinc-500 font-mono ml-2">platform-preview.sadc</span>
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
                    onClick={() => setActiveHeroTab('buyers')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer w-full justify-center sm:w-auto ${
                      activeHeroTab === 'buyers' 
                        ? 'bg-amber-950/65 text-amber-400 border border-amber-900/60' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Briefcase className="h-3 w-3" />
                    Buyers
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
                        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Live Commodity Exchange</h3>
                        <p className="text-[10px] text-zinc-500">Real-time SADC agricultural bulk produce listings</p>
                      </div>
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Exchange
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Item 1 */}
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 flex justify-between items-center hover:border-emerald-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-center text-emerald-400 text-xs font-bold">
                            MZ
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-200">White Maize (Non-GMO)</div>
                            <div className="text-[10px] text-zinc-500">Chobe Cooperative • Botswana</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-400">$320 / Ton</div>
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
                            <div className="text-xs font-bold text-zinc-200">Red Sorghum Grain</div>
                            <div className="text-[10px] text-zinc-500">Beitbridge Farmers • Zimbabwe</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-400">$295 / Ton</div>
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
                            <div className="text-xs font-bold text-zinc-200">Chilled Halal Beef Quarters</div>
                            <div className="text-[10px] text-zinc-500">Francistown Abattoir • Botswana</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-400">$4,500 / Ton</div>
                          <div className="text-[10px] text-zinc-400">15 Tons Left</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/50 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500">Phytosanitary & SADC exemption pre-validated</span>
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
                        <span className="text-[10px] text-zinc-300">Truck #L-KGL-402 (Maize): <strong>Passing Kazungula Bridge</strong></span>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono">GPS: LOCK</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/50 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-550">SADC digital border passes integrated</span>
                      <Button 
                        onClick={() => onLaunchApp('t3000000-0000-0000-0000-000000000001', 'logistics')}
                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-900/60 text-[10px] h-7 font-bold transition-all px-3 cursor-pointer"
                      >
                        Enter Logistics Portal →
                      </Button>
                    </div>
                  </div>
                )}

                {/* BUYERS TAB PREVIEW */}
                {activeHeroTab === 'buyers' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Escrow Contracts Ledger</h3>
                        <p className="text-[10px] text-zinc-500">Secured B2B purchasing accounts with autonomous release</p>
                      </div>
                      <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-900/60 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5 text-amber-400" /> SECURED
                      </span>
                    </div>

                    {/* Escrow Contract Card */}
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-mono">Contract ID: SADC-1049</div>
                          <div className="text-xs font-bold text-zinc-200">SADC Food Distributors (SA) ⇆ Chobe Valley (BW)</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-amber-400">$16,000.00</div>
                          <div className="text-[9px] text-zinc-500">Escrow Locked</div>
                        </div>
                      </div>

                      {/* Escrow Progress Milestones */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-zinc-400 font-medium">Bilateral Milestone status</span>
                          <span className="text-emerald-400 font-bold">75% Complete</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 h-full w-[75%] rounded-full"></div>
                        </div>

                        {/* Milestone indicators */}
                        <div className="grid grid-cols-4 gap-1 pt-1 text-[8px] font-mono text-center">
                          <div className="text-emerald-400 font-bold font-semibold">Deposit [✓]</div>
                          <div className="text-emerald-400 font-bold font-semibold">Phytosanitary [✓]</div>
                          <div className="text-emerald-400 font-bold font-semibold">In Transit [✓]</div>
                          <div className="text-zinc-650 font-bold font-semibold">Payout [ ]</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/50 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-550">Escrows automatically execute via smart contracts</span>
                      <Button 
                        onClick={() => onLaunchApp('b2000000-0000-0000-0000-000000000001', 'dashboard')}
                        className="bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-900/60 text-[10px] h-7 font-bold transition-all px-3 cursor-pointer"
                      >
                        Enter Buyer Hub →
                      </Button>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Counter Metrics / Stats */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl glass-card border-zinc-900 text-center">
          <div className="p-4 space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-200">50K+</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Farmers Connected</div>
          </div>
          <div className="p-4 space-y-1 border-l border-zinc-800/80">
            <div className="text-3xl md:text-4xl font-extrabold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">5 Nations</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold">SADC Corridor Corridor</div>
          </div>
          <div className="p-4 space-y-1 border-l border-zinc-800/80">
            <div className="text-3xl md:text-4xl font-extrabold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-200">1M+ Tons</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Commodities Traded</div>
          </div>
          <div className="p-4 space-y-1 border-l border-zinc-800/80">
            <div className="text-3xl md:text-4xl font-extrabold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">10K+</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Secured Transactions</div>
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
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/60">Farmer</span>
                <span className="text-[10px] font-medium text-zinc-500">Botswana</span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-emerald-400 transition-colors">Tshepo Mokgosi</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Chobe Valley Farms</p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Manage beef/maize listings, request biosecurity audits, view SADC regional demand maps.</p>
              </div>
            </div>
            <Button 
              onClick={() => onLaunchApp('f1000000-0000-0000-0000-000000000001')}
              className="mt-6 w-full text-xs bg-emerald-950/40 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-900/60 group-hover:border-emerald-600 font-semibold py-1.5 h-8 cursor-pointer"
            >
              Access Farmer view
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
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Browse commodities, lock funds in escrow, request import readiness checks, track orders.</p>
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
                <p className="text-[11px] text-zinc-500 mt-1">Agribusiness Linkers</p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Verify biosecurity guidelines, issue Phytosanitary permits, clear custom duty exemptions.</p>
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
          <div className="group flex flex-col justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/60 hover:bg-zinc-950 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-zinc-500/10"></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900/40 text-zinc-400 border border-zinc-800">Admin</span>
                <span className="text-[10px] font-medium text-zinc-500">SADC Corridor</span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-zinc-300 transition-colors">PulaOperations</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Platform Admin</p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">Oversee regional escrows, track border waiting times, review active shipments and biosecurity scores.</p>
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
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">Regional Agritech Infrastructure Pillars</h2>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">Digitizing the African agribusiness value chain to unlock cross-border trade.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 w-fit">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">B2B Commodity Marketplace</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aggregated produce listings from local farmer cooperatives available to regional food buyers and millers with transparent pricing.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-xl text-amber-500 w-fit">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Cross-Border Logistics</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Book authorized regional transporters, coordinate freight logistics, and monitor real-time customs queues at SADC borders.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-blue-400 w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Escrow Trade tracking</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mitigate risk with smart contract security escrow. Funds are locked at purchase and auto-released upon verified cargo receipt.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 w-fit">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Export & Biosecurity Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Country-specific regulatory checklist validator. Automated phytosanitary audits and custom clearance certificates.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-xl text-amber-500 w-fit">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Regional Trade Analytics</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Access supply map heatmaps, demand deficits, and trade pricing updates to balance distribution corridors.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-900/40 transition-all duration-300">
            <CardContent className="p-0 space-y-3">
              <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-blue-400 w-fit">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Bilateral Tariffs Exemption</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Integration with regional SADC trade certificates for simplified duty-free and tariff-exempt customs crossings.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SADC Map Visualization Banner */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-zinc-900 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <Badge className="bg-amber-950 text-amber-400 border border-amber-900 text-xs">Live Corridor Tracking</Badge>
          <h2 className="text-3xl font-bold text-zinc-100 leading-tight">Connecting the Kalahari, Maputo, and North-South Corridor Route</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            By connecting logistics vectors directly with customs biosecurity hubs, PulaTrade reduces agricultural product decay rates and border waiting times.
          </p>
          <div className="space-y-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Automated Border queues notifications
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Customs manifests integrated with SADC Trade Registry
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              GPS tracking logs tied directly to escrow releases
            </div>
          </div>
        </div>
        <div className="flex-1 w-full bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
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
            Experience the full platform demo right now in the sandbox. Switch roles to view how PulaTrade serves Farmers, Buyers, Exporters, and Transporters.
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
