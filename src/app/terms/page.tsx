import React from 'react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans pt-12 px-4 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-emerald-500 hover:text-emerald-400 text-sm font-semibold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">Terms & Conditions</h1>
        <p className="text-zinc-400">Effective Date: June 2026</p>
        
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p>
            Welcome to TradeGrid Africa. These Terms and Conditions govern your use of our platform and services. By accessing or using our platform, you agree to be bound by these Terms.
          </p>
          
          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use TradeGrid Africa if you do not agree to take all of the terms and conditions stated on this page.</p>
          
          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">2. Platform Services</h2>
          <p>TradeGrid Africa provides an AI-powered platform for cross-border agribusiness trading within the SADC region. We act as facilitators and orchestrators of trade data, logistics, and compliance checks but are not legally liable for individual transactions executed between independent entities on the platform.</p>

          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">3. User Responsibilities</h2>
          <p>You agree to use the platform only for lawful purposes. You must not use our platform in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</p>

          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">4. Intellectual Property</h2>
          <p>Unless otherwise stated, TradeGrid Africa and/or its licensors own the intellectual property rights for all material on the platform. All intellectual property rights are reserved.</p>
        </div>
      </div>
    </div>
  );
}
