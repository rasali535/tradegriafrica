import React from 'react';
import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans pt-12 px-4 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-emerald-500 hover:text-emerald-400 text-sm font-semibold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">Cookie Policy</h1>
        <p className="text-zinc-400">Effective Date: June 2026</p>
        
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p>
            This Cookie Policy explains how TradeGrid Africa uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
          
          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">1. What are cookies?</h2>
          <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
          
          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">2. Why do we use cookies?</h2>
          <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Websites to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.</p>

          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">3. How can I control cookies?</h2>
          <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.</p>
        </div>
      </div>
    </div>
  );
}
