"use client";

import React, { useState } from 'react';
import { useApp, User, Farm } from '@/context/AppContext';
import { 
  UserPlus, Sprout, Truck, ShieldCheck, Briefcase, Mail, Phone, 
  MapPin, CheckCircle2, ArrowRight, Lock, Building, Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabaseClient';

export const OnboardingPortal: React.FC = () => {
  const { setCurrentUser } = useApp();
  const [role, setRole] = useState<'farmer' | 'buyer' | 'transporter'>('farmer');
  
  // Shared Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<'Botswana' | 'Zimbabwe' | 'Zambia' | 'Namibia' | 'South Africa'>('Botswana');

  // Farmer Specific Fields
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState(50);
  const [region, setRegion] = useState('');
  const [commodityFocus, setCommodityFocus] = useState<string[]>(['Maize']);
  const [productionCapacity, setProductionCapacity] = useState(100);

  // Buyer Specific Fields
  const [companyName, setCompanyName] = useState('');

  // Transporter Specific Fields
  const [corridorFocus, setCorridorFocus] = useState('Trans-Kalahari Corridor');
  const [transportMode, setTransportMode] = useState<'Road' | 'Rail' | 'Air'>('Road');

  // Onboarding On-chain Document Fields
  const [docType, setDocType] = useState('Business Registration Certificate');
  const [docRef, setDocRef] = useState('');
  const [docFileName, setDocFileName] = useState('');

  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  const toggleCommodity = (crop: string) => {
    setCommodityFocus(prev => prev.includes(crop) ? prev.filter(x => x !== crop) : [...prev, crop]);
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone) {
      alert("Please fill in all contact details.");
      return;
    }

    try {
      const companyOrName = role === 'farmer' ? name : role === 'buyer' ? companyName || `${name} Distributors` : companyName || name;
      
      if (!supabase) throw new Error("Supabase connection is not configured.");

      // 1. Register base user to Supabase
      const { data: userData, error: userError } = await supabase.from('users').insert({
        name: companyOrName,
        email,
        phone,
        country,
        role,
      }).select().single();

      if (userError) throw userError;
      const user = userData as User;

      // 2. Perform role specific side-effects
      if (role === 'farmer') {
        if (!farmName || !region) {
          alert("Please fill in your farm name and region.");
          return;
        }
        
        const { error: farmError } = await supabase.from('farms').insert({
          owner_id: user.id,
          farm_name: farmName,
          farm_size: farmSize,
          country,
          region,
          commodity_focus: commodityFocus,
          production_capacity: productionCapacity,
          certification_status: 'Certified'
        });
        
        if (farmError) throw farmError;
      }

      // 3. Set newly registered user as current user for instant sandbox test
      setCurrentUser(user);
      setRegisteredUser(user);

      alert(`Success! Onboarding Complete. Registered and signed in as: ${user.name} (${user.role.toUpperCase()})`);
    } catch (err: any) {
      alert(err.message || "Failed to finalize registration.");
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setFarmName('');
    setRegion('');
    setCompanyName('');
    setRegisteredUser(null);
  };

  if (registeredUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-100">You are Onboarded!</h2>
          <p className="text-xs text-zinc-400">
            Registered profile: <strong className="text-zinc-200">{registeredUser.name}</strong> as a <strong className="text-emerald-400">{registeredUser.role.toUpperCase()}</strong>.
          </p>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            The sandbox environment has automatically logged you in. Switch back to the <strong>Role Dashboard</strong> tab above to view your personalized SADC controls dashboard, or browse the marketplace.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={resetForm}
            variant="outline" 
            className="border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-900"
          >
            Register Another Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Onboarding Header */}
      <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-400" />
            SADC Agribusiness Onboarding
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Register your farm, procurement business, or logistics company to participate in the SADC agricultural free trade corridor.
          </p>
        </div>
        <Badge className="bg-amber-950/80 text-amber-400 border border-amber-900 z-10">
          Instant Sandbox Sync
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role Cards Selector */}
        <Card 
          onClick={() => setRole('farmer')}
          className={`cursor-pointer transition-all duration-300 p-4 border text-left ${role === 'farmer' ? 'border-emerald-800 bg-emerald-950/10' : 'border-zinc-900 hover:border-zinc-800 bg-zinc-950/40'}`}
        >
          <div className="p-2 bg-zinc-900 rounded-lg w-fit text-emerald-400 mb-3 border border-zinc-800">
            <Sprout className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-zinc-100 text-sm">Farmer Portal</h3>
          <p className="text-xs text-zinc-400 mt-1">List agricultural crops/livestock, request biosecurity audits, and gain trade financing eligibility.</p>
        </Card>

        <Card 
          onClick={() => setRole('buyer')}
          className={`cursor-pointer transition-all duration-300 p-4 border text-left ${role === 'buyer' ? 'border-emerald-800 bg-emerald-950/10' : 'border-zinc-900 hover:border-zinc-800 bg-zinc-950/40'}`}
        >
          <div className="p-2 bg-zinc-900 rounded-lg w-fit text-amber-500 mb-3 border border-zinc-800">
            <Briefcase className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-zinc-100 text-sm">Procurement / Buyer</h3>
          <p className="text-xs text-zinc-400 mt-1">Lock purchasing agreements, automate customs exemptions, and secure payment under escrow.</p>
        </Card>

        <Card 
          onClick={() => setRole('transporter')}
          className={`cursor-pointer transition-all duration-300 p-4 border text-left ${role === 'transporter' ? 'border-emerald-800 bg-emerald-950/10' : 'border-zinc-900 hover:border-zinc-800 bg-zinc-950/40'}`}
        >
          <div className="p-2 bg-zinc-900 rounded-lg w-fit text-blue-400 mb-3 border border-zinc-800">
            <Truck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-zinc-100 text-sm">Logistics Carrier</h3>
          <p className="text-xs text-zinc-400 mt-1">Register logistics trucks, bid on SADC cargo routes, and utilize digital border passports.</p>
        </Card>
      </div>

      {/* Registration Form */}
      <Card className="glass-card border-zinc-900 p-6">
        <form onSubmit={handleOnboard} className="space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="font-bold text-zinc-200 text-sm">Contact Information</h3>
            <p className="text-xs text-zinc-500">Configure credentials for your SADC digital trust registry identity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                {role === 'buyer' ? 'Representative Name' : 'Full Name'}
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Email Address</label>
              <Input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. contact@domain.com"
                className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Phone Number</label>
              <Input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +267 71 123 456"
                className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Country of Registration</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none h-9"
              >
                <option value="Botswana">Botswana</option>
                <option value="Zimbabwe">Zimbabwe</option>
                <option value="Zambia">Zambia</option>
                <option value="Namibia">Namibia</option>
                <option value="South Africa">South Africa</option>
              </select>
            </div>
          </div>

          {/* Farmer Fields */}
          {role === 'farmer' && (
            <div className="space-y-6 pt-4 border-t border-zinc-900">
              <div className="border-b border-zinc-900 pb-3">
                <h3 className="font-bold text-zinc-200 text-sm">Farm Profile</h3>
                <p className="text-xs text-zinc-500">Provide details on your farm scale, region, and primary crops.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Farm Name</label>
                  <Input
                    type="text"
                    required
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    placeholder="e.g. Chobe Organic Valley"
                    className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Farm Region</label>
                  <Input
                    type="text"
                    required
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    placeholder="e.g. Chobe District"
                    className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Farm Size (Hectares)</label>
                  <Input
                    type="number"
                    value={farmSize}
                    onChange={e => setFarmSize(parseInt(e.target.value) || 1)}
                    className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Est. Annual Capacity (Tons)</label>
                  <Input
                    type="number"
                    value={productionCapacity}
                    onChange={e => setProductionCapacity(parseInt(e.target.value) || 1)}
                    className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Commodity Focus</label>
                  <div className="flex flex-wrap gap-2">
                    {['Maize', 'Sorghum', 'Beef', 'Horticulture', 'Poultry feed products'].map(crop => {
                      const selected = commodityFocus.includes(crop);
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => toggleCommodity(crop)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${selected ? 'border-emerald-800 bg-emerald-950/30 text-emerald-400' : 'border-zinc-900 bg-zinc-950 text-zinc-500 hover:border-zinc-800'}`}
                        >
                          {crop}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buyer Fields */}
          {role === 'buyer' && (
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="border-b border-zinc-900 pb-3">
                <h3 className="font-bold text-zinc-200 text-sm">Procurement Profile</h3>
                <p className="text-xs text-zinc-500">Provide details on your distribution brand.</p>
              </div>

              <div className="space-y-2 text-xs">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Company / Distributing Brand Name</label>
                <Input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. SADC Food Distributors Ltd"
                  className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                />
              </div>
            </div>
          )}

          {/* Transporter Fields */}
          {role === 'transporter' && (
            <div className="space-y-6 pt-4 border-t border-zinc-900">
              <div className="border-b border-zinc-900 pb-3">
                <h3 className="font-bold text-zinc-200 text-sm">Logistics Carrier Profile</h3>
                <p className="text-xs text-zinc-500">Configure route focuses and corridor carrier modes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Company / Fleet Brand Name</label>
                  <Input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Kalahari Express Logistics"
                    className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Primary Corridor Route</label>
                  <select
                    value={corridorFocus}
                    onChange={e => setCorridorFocus(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none h-9"
                  >
                    <option value="Trans-Kalahari Corridor">Trans-Kalahari Corridor (Namibia ⇆ Botswana ⇆ SA)</option>
                    <option value="Beitbridge Corridor">Beitbridge Corridor (SA ⇆ Zimbabwe)</option>
                    <option value="North-South Corridor">North-South Corridor (Zambia ⇆ Botswana ⇆ SA)</option>
                    <option value="Walvis Bay Corridor">Walvis Bay Corridor (Namibia ⇆ Zambia)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Freight Carrier Mode</label>
                  <select
                    value={transportMode}
                    onChange={e => setTransportMode(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none h-9"
                  >
                    <option value="Road">Road Carrier (Semi-trucks)</option>
                    <option value="Rail">Rail Cargo (Freight trains)</option>
                    <option value="Air">Air Cargo (Express transport)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Compliance & Verification Documents */}
          <div className="space-y-6 pt-4 border-t border-zinc-900">
            <div className="border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-500" />
              <div className="text-left">
                <h3 className="font-bold text-zinc-200 text-sm">Compliance & Onboarding Documents</h3>
                <p className="text-xs text-zinc-500">Provide official trade licenses or local permits for administrative review and corridor verification.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Document Type</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs p-2 text-zinc-300 focus:border-emerald-800 outline-none h-9"
                >
                  <option value="Business Registration Certificate">Business Registration Certificate</option>
                  <option value="SADC Corridor Cross-Border Permit">SADC Corridor Cross-Border Permit</option>
                  <option value="Phytosanitary Regulatory Certificate">Phytosanitary Regulatory Certificate</option>
                  <option value="National Agribusiness License">National Agribusiness License</option>
                  <option value="Biosecurity & Land Certificate">Biosecurity & Land Certificate</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Document Reference Number</label>
                <Input
                  type="text"
                  required
                  value={docRef}
                  onChange={e => setDocRef(e.target.value)}
                  placeholder="e.g. SADC-REF-1092-2026"
                  className="bg-zinc-950 border-zinc-900 text-zinc-200 focus:border-emerald-700 h-9"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Upload Digital Copy (Mock File Simulation)</label>
                <div className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-lg p-4 transition-all flex flex-col items-center justify-center text-center space-y-2">
                  <div className="text-zinc-500">
                    <ShieldCheck className="h-6 w-6 mx-auto mb-1 text-emerald-500/80" />
                    <span className="text-xs font-semibold block text-zinc-300">
                      {docFileName ? `Selected: ${docFileName}` : "Simulate file attachment upload below"}
                    </span>
                    <span className="text-[10px] text-zinc-600 block mt-0.5">PDF, PNG or JPG up to 10MB</span>
                  </div>
                  <Input 
                    type="text" 
                    placeholder="Enter file name (e.g. business_permit.pdf) to upload" 
                    value={docFileName}
                    onChange={e => setDocFileName(e.target.value)}
                    className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-300 focus:border-emerald-700 h-8 text-center text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex justify-end">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border border-emerald-500 text-xs px-6 py-2 flex items-center gap-2"
            >
              Submit Onboarding Application <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
