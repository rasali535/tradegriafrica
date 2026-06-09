import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans pt-12 px-4 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-emerald-500 hover:text-emerald-400 text-sm font-semibold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">Privacy Policy</h1>
        <p className="text-zinc-400">Effective Date: June 2026</p>
        
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p>
            At TradeGrid Africa, we are committed to protecting the privacy and security of our users' personal and business information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website and use our platform.
          </p>
          
          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">1. Information We Collect</h2>
          <p>We may collect personal identification information from Users in a variety of ways, including, but not limited to, when Users visit our site, register on the site, place an order, subscribe to the newsletter, respond to a survey, fill out a form, and in connection with other activities, services, features or resources we make available on our Site. Users may be asked for, as appropriate, name, email address, mailing address, phone number, and business details.</p>
          
          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">2. How We Use Collected Information</h2>
          <p>TradeGrid Africa may collect and use Users personal information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To run and operate our Site.</li>
            <li>To improve customer service.</li>
            <li>To personalize user experience.</li>
            <li>To improve our Site.</li>
            <li>To process payments.</li>
            <li>To send periodic emails.</li>
          </ul>

          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">3. How We Protect Your Information</h2>
          <p>We adopt appropriate data collection, storage and processing practices and security measures to protect against unauthorized access, alteration, disclosure or destruction of your personal information, username, password, transaction information and data stored on our Site.</p>

          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">4. Sharing Your Personal Information</h2>
          <p>We do not sell, trade, or rent Users personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates and advertisers for the purposes outlined above.</p>
        </div>
      </div>
    </div>
  );
}
