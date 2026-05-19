"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LandingPage } from '@/components/LandingPage';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { FarmerDashboard } from '@/components/FarmerDashboard';
import { BuyerDashboard } from '@/components/BuyerDashboard';
import { TransporterDashboard } from '@/components/TransporterDashboard';
import { ExporterDashboard } from '@/components/ExporterDashboard';
import { CooperativeDashboard } from '@/components/CooperativeDashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { 
  Sprout, LayoutDashboard, Globe, ShieldCheck, FileSpreadsheet, 
  HelpCircle, ExternalLink, Menu, X, Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Home() {
  const { currentUser, users, setCurrentUser } = useApp();
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLaunchApp = (userId?: string) => {
    if (userId && users && setCurrentUser) {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
        setCurrentUser(targetUser);
      }
    }
    setView('app');
  };

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
      case 'admin':
        return <AdminPanel />;
      default:
        return <FarmerDashboard />;
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Premium Header/Navigation */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => setView('landing')}
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
              onClick={() => setView('landing')}
              className={`hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg ${
                view === 'landing' ? 'text-zinc-100 bg-zinc-900/80 border border-zinc-800' : ''
              }`}
            >
              Corridor Infrastructure
            </button>
            <button 
              onClick={() => setView('app')}
              className={`hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg ${
                view === 'app' ? 'text-zinc-100 bg-zinc-900/80 border border-zinc-800' : ''
              }`}
            >
              App Sandbox Desk
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-zinc-100 transition-colors flex items-center gap-1"
            >
              Bilateral Docs <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          {/* Action button */}
          <div className="hidden md:flex items-center gap-3">
            {view === 'landing' ? (
              <Button 
                onClick={() => handleLaunchApp()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 text-xs px-4 py-2"
              >
                Launch App Console
              </Button>
            ) : (
              <Button 
                onClick={() => setView('landing')}
                variant="outline"
                className="border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-900"
              >
                Back to Landing Page
              </Button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-900 bg-zinc-950 p-4 space-y-3 flex flex-col text-sm font-medium text-zinc-400">
            <button 
              onClick={() => {
                setView('landing');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg ${view === 'landing' ? 'bg-zinc-900 text-zinc-100' : ''}`}
            >
              Corridor Infrastructure
            </button>
            <button 
              onClick={() => {
                setView('app');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 rounded-lg ${view === 'app' ? 'bg-zinc-900 text-zinc-100' : ''}`}
            >
              App Sandbox Desk
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="py-2 px-3 flex items-center gap-1.5"
            >
              Bilateral Docs <ExternalLink className="h-3 w-3" />
            </a>
            <div className="pt-2 border-t border-zinc-900">
              {view === 'landing' ? (
                <Button 
                  onClick={() => {
                    handleLaunchApp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-emerald-600 text-white"
                >
                  Launch App Console
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setView('landing');
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-zinc-800 text-zinc-300"
                >
                  Back to Landing
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {view === 'landing' ? (
          <LandingPage onLaunchApp={handleLaunchApp} />
        ) : (
          <div className="space-y-6">
            {/* Persona Switcher for interactive presentation */}
            <RoleSwitcher />
            
            {/* Active role-based dashboard layout */}
            <div className="pt-2">
              {renderActiveDashboard()}
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
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-zinc-300 mb-3 uppercase tracking-wider text-[10px]">SADC Digital Trust Registry</h4>
            <p className="leading-relaxed text-zinc-400 mb-3">
              Automated smart contract escrows are locked in regional compliance ledgers to guarantee farmer payment security.
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
            <span className="hover:text-zinc-400 cursor-pointer">Bilateral Treaty Terms</span>
            <span>•</span>
            <span className="hover:text-zinc-400 cursor-pointer">Biosecurity Audits Code</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
