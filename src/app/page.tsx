"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LandingPage } from '@/components/LandingPage';
import { DocsPage } from '@/components/DocsPage';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { FarmerDashboard } from '@/components/FarmerDashboard';
import { BuyerDashboard } from '@/components/BuyerDashboard';
import { TransporterDashboard } from '@/components/TransporterDashboard';
import { ExporterDashboard } from '@/components/ExporterDashboard';
import { CooperativeDashboard } from '@/components/CooperativeDashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { GovernmentDashboard } from '@/components/GovernmentDashboard';
import { BankDashboard } from '@/components/BankDashboard';
import { Marketplace } from '@/components/Marketplace';
import { LogisticsHub } from '@/components/LogisticsHub';
import { OnboardingPortal } from '@/components/OnboardingPortal';
import { AIAgentCenter } from '@/components/AIAgentCenter';
import { NdaSignSystem } from '@/components/NdaSignSystem';
import { 
  Sprout, LayoutDashboard, Globe, ShieldCheck, FileSpreadsheet, 
  HelpCircle, ExternalLink, Menu, X, Star, ShoppingCart, Truck, UserPlus,
  Shield, Lock, Unlock, Bot
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Home() {
  const { currentUser, users, setCurrentUser } = useApp();
  const [view, setView] = useState<'landing' | 'app' | 'docs'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appSubTab, setAppSubTab] = useState<'dashboard' | 'marketplace' | 'logistics' | 'onboarding' | 'ai_agents'>('dashboard');
  const [isNdaUnlocked, setIsNdaUnlocked] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const signed = localStorage.getItem('pt_nda_signed') === 'true';
      setIsNdaUnlocked(signed);
    }
  }, []);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'pulatrade2026') {
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        setCurrentUser(adminUser);
        setIsAdminModalOpen(false);
        setView('app');
        setAppSubTab('dashboard');
      } else {
        setPasswordError('Admin account not found.');
      }
    } else {
      setPasswordError('Invalid password. Try admin123');
    }
  };

  const handleGoHome = () => {
    setView('landing');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleLaunchApp = (userId?: string, targetTab?: 'dashboard' | 'marketplace' | 'logistics' | 'onboarding') => {
    let role = '';
    let region = '';
    let fleet = '';

    if (userId && users && setCurrentUser) {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
        setCurrentUser(targetUser);
        role = targetUser.role;
        // Determine region/fleet based on role
        if (role === 'farmer') region = 'chobe';
        else if (role === 'transporter') {
          role = 'logistics';
          fleet = 'kalahari';
        }
        else if (role === 'exporter') region = 'beitbridge';
        else if (role === 'buyer') region = 'gaborone';
        else if (role === 'admin') region = 'sadc';
      }
    }

    setView('app');
    if (targetTab) {
      setAppSubTab(targetTab);
    } else {
      setAppSubTab('dashboard'); // Reset subtab when entering app
    }

    // Update query params in URL
    if (typeof window !== 'undefined') {
      let queryStr = '';
      if (role) {
        queryStr = `?role=${role}`;
        if (region) queryStr += `&region=${region}`;
        if (fleet) queryStr += `&fleet=${fleet}`;
      }
      window.history.pushState(null, '', `/sandbox${queryStr}`);
    }
  };

  // Sync initial URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const role = params.get('role');

      if (path === '/docs') {
        setView('docs');
      } else if (path.startsWith('/sandbox') || role) {
        setView('app');
        if (role && users) {
          const roleMap: Record<string, string> = {
            farmer: 'f1000000-0000-0000-0000-000000000001',
            buyer: 'b2000000-0000-0000-0000-000000000001',
            logistics: 't3000000-0000-0000-0000-000000000001',
            exporter: 'e4000000-0000-0000-0000-000000000001',
            admin: 'a5000000-0000-0000-0000-000000000001',
          };
          const targetUserId = roleMap[role.toLowerCase()];
          if (targetUserId) {
            const targetUser = users.find(u => u.id === targetUserId);
            if (targetUser) {
              setCurrentUser(targetUser);
            }
          }
        }
      }
    }
  }, [users, setCurrentUser]);

  // Sync role switching inside app back to URL query parameters
  useEffect(() => {
    if (typeof window !== 'undefined' && view === 'app' && currentUser) {
      const role = currentUser.role;
      let region = '';
      let fleet = '';
      if (role === 'farmer') region = 'chobe';
      else if (role === 'transporter') {
        region = '';
        fleet = 'kalahari';
      }
      else if (role === 'exporter') region = 'beitbridge';
      else if (role === 'buyer') region = 'gaborone';
      else if (role === 'admin') region = 'sadc';

      let queryStr = `?role=${role === 'transporter' ? 'logistics' : role}`;
      if (region) queryStr += `&region=${region}`;
      if (fleet) queryStr += `&fleet=${fleet}`;

      window.history.pushState(null, '', `/sandbox${queryStr}`);
    }
  }, [currentUser, view]);

  const renderActiveDashboard = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'farmer':
        return <FarmerDashboard />;
      case 'buyer':
        return <BuyerDashboard />;
      case 'transporter':
        return <TransporterDashboard />;
      case 'exporter':
        return <ExporterDashboard />;
      case 'cooperative':
        return <CooperativeDashboard />;
      case 'government':
        return <GovernmentDashboard />;
      case 'bank':
        return <BankDashboard />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <FarmerDashboard />;
    }
  };

  const renderActiveSubTab = () => {
    switch (appSubTab) {
      case 'dashboard':
        return renderActiveDashboard();
      case 'marketplace':
        return <Marketplace />;
      case 'logistics':
        return <LogisticsHub />;
      case 'onboarding':
        return <OnboardingPortal />;
      case 'ai_agents':
        return <AIAgentCenter />;
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Premium Header/Navigation */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={handleGoHome}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-900/60 text-emerald-400 group-hover:scale-105 transition-transform">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="font-extrabold tracking-tight text-zinc-100 text-lg">
              Pula<span className="text-emerald-500">Trade</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <button 
              onClick={handleGoHome}
              className={`hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg ${
                view === 'landing' ? 'text-zinc-100 bg-zinc-900/80 border border-zinc-800' : ''
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => {
                setView('app');
                setAppSubTab('marketplace');
              }}
              className={`hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg ${
                view === 'app' && appSubTab === 'marketplace' ? 'text-zinc-100 bg-zinc-900/80 border border-zinc-800' : ''
              }`}
            >
              Marketplace
            </button>
            <button 
              onClick={() => {
                setView('app');
                setAppSubTab('logistics');
              }}
              className={`hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg ${
                view === 'app' && appSubTab === 'logistics' ? 'text-zinc-100 bg-zinc-900/80 border border-zinc-800' : ''
              }`}
            >
              Logistics
            </button>
            <button 
              onClick={() => {
                setView('app');
                setAppSubTab('ai_agents');
              }}
              className={`hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg ${
                view === 'app' && appSubTab === 'ai_agents' ? 'text-zinc-100 bg-zinc-900/80 border border-zinc-800' : ''
              }`}
            >
              AI Agents
            </button>
            <button 
              onClick={() => {
                setView('app');
                setAppSubTab('dashboard');
              }}
              className={`hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg ${
                view === 'app' && appSubTab === 'dashboard' ? 'text-zinc-100 bg-zinc-900/80 border border-zinc-800' : ''
              }`}
            >
              App Sandbox Desk
            </button>
            <button 
              onClick={() => {
                setView('docs');
                if (typeof window !== 'undefined') {
                  window.history.pushState(null, '', '/docs');
                }
              }}
              className={`hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg ${
                view === 'docs' ? 'text-zinc-100 bg-zinc-900/80 border border-zinc-800' : ''
              }`}
            >
              Bilateral Docs
            </button>
          </nav>

          {/* Action button */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser?.role === 'admin' ? (
              <Button
                onClick={() => {
                  setView('app');
                  setAppSubTab('dashboard');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white border border-amber-500 text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-md"
              >
                <Shield className="h-3.5 w-3.5 animate-pulse" />
                Admin Portal
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setPassword('');
                  setPasswordError('');
                  setIsAdminModalOpen(true);
                }}
                variant="outline"
                className="border-zinc-800 text-zinc-450 hover:text-zinc-100 hover:bg-zinc-900 text-xs flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-zinc-500" />
                Admin Portal
              </Button>
            )}

            {view === 'landing' ? (
              <Button 
                onClick={() => handleLaunchApp()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs shadow-md"
              >
                Launch App Console
              </Button>
            ) : (
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-900"
              >
                Back to Landing
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser?.role === 'admin' ? (
              <Button
                onClick={() => {
                  setView('app');
                  setAppSubTab('dashboard');
                }}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white border border-amber-500 text-[10px] h-8 px-2.5 flex items-center gap-1 shadow-md"
              >
                <Shield className="h-3 w-3" />
                Admin
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setPassword('');
                  setPasswordError('');
                  setIsAdminModalOpen(true);
                }}
                size="sm"
                variant="outline"
                className="border-zinc-800 text-zinc-450 hover:text-zinc-100 hover:bg-zinc-900 text-[10px] h-8 px-2.5 flex items-center gap-1"
              >
                <Lock className="h-3 w-3" />
                Admin
              </Button>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-900 bg-zinc-950 px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-400">
              <button 
                onClick={() => {
                  handleGoHome();
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-lg ${view === 'landing' ? 'bg-zinc-900 text-zinc-100' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  setView('app');
                  setAppSubTab('marketplace');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-lg ${view === 'app' && appSubTab === 'marketplace' ? 'bg-zinc-900 text-zinc-100' : ''}`}
              >
                Marketplace
              </button>
              <button 
                onClick={() => {
                  setView('app');
                  setAppSubTab('logistics');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-lg ${view === 'app' && appSubTab === 'logistics' ? 'bg-zinc-900 text-zinc-100' : ''}`}
              >
                Logistics
              </button>
              <button 
                onClick={() => {
                  setView('app');
                  setAppSubTab('ai_agents');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-lg ${view === 'app' && appSubTab === 'ai_agents' ? 'bg-zinc-900 text-zinc-100' : ''}`}
              >
                AI Agents
              </button>
              <button 
                onClick={() => {
                  setView('app');
                  setAppSubTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-lg ${view === 'app' && appSubTab === 'dashboard' ? 'bg-zinc-900 text-zinc-100' : ''}`}
              >
                App Sandbox Desk
              </button>
              <button 
                onClick={() => {
                  setView('docs');
                  if (typeof window !== 'undefined') {
                    window.history.pushState(null, '', '/docs');
                  }
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-lg ${view === 'docs' ? 'bg-zinc-900 text-zinc-100' : ''}`}
              >
                Bilateral Docs
              </button>
              <div className="pt-2 border-t border-zinc-900 flex flex-col gap-2">
                {currentUser?.role === 'admin' ? (
                  <Button
                    onClick={() => {
                      setView('app');
                      setAppSubTab('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white border border-amber-500 text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Shield className="h-3.5 w-3.5 animate-pulse" />
                    Admin Portal (Active)
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setPassword('');
                      setPasswordError('');
                      setIsAdminModalOpen(true);
                    }}
                    variant="outline"
                    className="w-full border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5 text-zinc-500" />
                    Admin Portal
                  </Button>
                )}

                {view === 'landing' ? (
                  <Button 
                    onClick={() => {
                      handleLaunchApp();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs"
                  >
                    Launch App Console
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      handleGoHome();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-900"
                  >
                    Back to Landing
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {view === 'landing' ? (
          <LandingPage onLaunchApp={handleLaunchApp} />
        ) : view === 'docs' ? (
          <DocsPage onBackToLanding={handleGoHome} />
        ) : !isNdaUnlocked ? (
          <NdaSignSystem 
            onSignSuccess={() => setIsNdaUnlocked(true)} 
            currentUserData={currentUser} 
          />
        ) : (
          <div className="space-y-6">
            {/* Persona Switcher for interactive presentation */}
            <RoleSwitcher />

            {/* Premium Sandbox Tab Bar */}
            <div className="flex border-b border-zinc-900 gap-2 md:gap-4 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setAppSubTab('dashboard')}
                className={`py-3 px-4 border-b-2 font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  appSubTab === 'dashboard'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Role Dashboard
              </button>

              <button
                onClick={() => setAppSubTab('marketplace')}
                className={`py-3 px-4 border-b-2 font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  appSubTab === 'marketplace'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Produce Marketplace
              </button>

              <button
                onClick={() => setAppSubTab('logistics')}
                className={`py-3 px-4 border-b-2 font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  appSubTab === 'logistics'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Truck className="h-4 w-4" />
                Logistics Registry
              </button>

              <button
                onClick={() => setAppSubTab('onboarding')}
                className={`py-3 px-4 border-b-2 font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  appSubTab === 'onboarding'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Onboarding Portal
              </button>

              <button
                onClick={() => setAppSubTab('ai_agents')}
                className={`py-3 px-4 border-b-2 font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  appSubTab === 'ai_agents'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Bot className="h-4 w-4" />
                AI Agent Center
              </button>
            </div>
            
            {/* Active subtab view */}
            <div className="pt-2">
              {renderActiveSubTab()}
            </div>
          </div>
        )}
      </main>

      {/* SADC Themed Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-12 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-500" />
              <span className="font-extrabold tracking-tight text-zinc-300">PulaTrade</span>
            </div>
            <p className="leading-relaxed max-w-xs text-zinc-400">
              Cross-border agribusiness trading & logistics corridor engine for South Africa, Botswana, Namibia, Zimbabwe, and Zambia.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-zinc-300 mb-3 uppercase tracking-wider text-[10px]">Corridor Gates</h4>
            <ul className="space-y-2">
              <li>Pioneer Gate Crossing (Botswana & South Africa)</li>
              <li>Plumtree Customs Post (Botswana & Zimbabwe)</li>
              <li>Beitbridge Corridor (South Africa & Zimbabwe)</li>
              <li>Kazungula Ferry Checkpoint (Botswana & Zambia)</li>
              <li>Walvis Bay Route (Namibia & Zambia)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-zinc-300 mb-3 uppercase tracking-wider text-[10px]">SADC Digital Trust Registry</h4>
            <p className="leading-relaxed text-zinc-400 mb-3">
              Automated digital escrows are locked in regional compliance registries to guarantee farmer payment security.
            </p>
            <div className="flex gap-4">
              <span className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/60 px-2 py-0.5 rounded font-mono">
                SECURE ESCROW ACTIVE
              </span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-zinc-900/60 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-600">
          <div>© {new Date().getFullYear()} PulaTrade Technologies Inc. All Rights Reserved.</div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setView('docs');
                if (typeof window !== 'undefined') {
                  window.history.pushState(null, '', '/docs');
                }
              }}
              className="hover:text-zinc-400 cursor-pointer"
            >
              Bilateral Treaty Terms
            </button>
            <span>•</span>
            <button 
              onClick={() => {
                setView('docs');
                if (typeof window !== 'undefined') {
                  window.history.pushState(null, '', '/docs');
                }
              }}
              className="hover:text-zinc-400 cursor-pointer"
            >
              Biosecurity Audits Code
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Password Dialog */}
      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-900 text-zinc-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              SADC Operations Authentication
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Access to administrative registries, event streams, and network configurations requires biosecurity corridor clearance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="admin-pass-header" className="text-xs font-semibold text-zinc-400">
                Operations Password
              </label>
              <input
                id="admin-pass-header"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none transition-colors"
                autoFocus
              />
              {passwordError && (
                <p className="text-[10px] text-red-400 mt-1 font-semibold">
                  ⚠️ {passwordError}
                </p>
              )}
              <p className="text-[9px] text-zinc-500 mt-1 font-mono">
                Hint: admin123 or pulatrade2026
              </p>
            </div>
            <DialogFooter className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="px-3.5 py-1.5 text-xs rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium border border-emerald-500 shadow-md transition-colors"
              >
                Authenticate
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
