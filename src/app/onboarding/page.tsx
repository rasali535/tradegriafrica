"use client";

import React, { useEffect, useState } from 'react';
import { OnboardingPortal } from '@/components/OnboardingPortal';
import { Sprout } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Premium Header/Navigation */}
      <header className="sticky top-0 z-50 glass-nav border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer select-none group">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-900/60 text-emerald-400 group-hover:scale-105 transition-transform">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="font-extrabold tracking-tight text-zinc-100 text-lg">
              TradeGrid<span className="text-emerald-500">Africa</span>
            </span>
          </Link>

          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto px-4 py-12 max-w-7xl">
        <div className="max-w-4xl mx-auto mb-8 text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
            Join the Regional Trade Network
          </h1>
          <p className="text-sm text-zinc-400">
            Complete your registration below to unlock SADC bilateral trade corridors.
          </p>
        </div>
        
        <OnboardingPortal />
      </main>

      {/* Basic Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-8 text-zinc-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} TradeGridAfrica Technologies Inc. All Rights Reserved.</span>
          <span className="text-zinc-500 text-[10px]">Web app platform by Pameltech Labs</span>
        </div>
      </footer>
    </div>
  );
}
