"use client";

import React, { useState } from 'react';
import { 
  FileText, Shield, Globe, Landmark, Scale, ChevronRight, Search, 
  ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Layers 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DocsPageProps {
  onBackToLanding: () => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ onBackToLanding }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('sadc-protocol');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interactive corridor selector state
  const [countryA, setCountryA] = useState<string>('Botswana');
  const [countryB, setCountryB] = useState<string>('South Africa');
  
  const countries = ['Botswana', 'South Africa', 'Namibia', 'Zimbabwe', 'Zambia'];

  // Matrix lookup data
  const getBilateralInfo = (cA: string, cB: string) => {
    if (cA === cB) {
      return {
        agreement: 'Internal National Trade',
        relevance: 'National supply chains and domestic transport infrastructure.',
        keyNote: 'Subject to local agricultural licensing and standard domestic logistics.',
        rules: ['National health inspectorate clearances', 'Domestic cargo insurance regulations'],
        status: 'Unrestricted'
      };
    }
    
    const pair = [cA, cB].sort().join(' ↔ ');
    switch (pair) {
      case 'Botswana ↔ South Africa':
        return {
          agreement: 'SACU (Southern African Customs Union) + SADC Protocol',
          relevance: 'Duty-free movement of agricultural cargo, subject to common external tariff structures.',
          keyNote: 'Simplifies livestock and feed flows, though border phyto-checks are strictly required at Ramatlabama.',
          rules: [
            'Zero-rated customs tariffs for originating agricultural goods',
            'SADC Phytosanitary certificate validation',
            'SACU Common External Tariff application on external transshipments'
          ],
          status: 'Active Corridor'
        };
      case 'Botswana ↔ Namibia':
        return {
          agreement: 'SACU + SADC Corridor Protocol',
          relevance: 'Customs union alignment covering the Trans-Kalahari Highway corridor.',
          keyNote: 'High beef exports and grain transshipments. Fast customs clearing via Mamuno border post.',
          rules: [
            'Trans-Kalahari corridor customs bond system compatibility',
            'Livestock movement veterinary restrictions',
            'Bilateral road transport permit exemptions'
          ],
          status: 'Active Corridor'
        };
      case 'Botswana ↔ Zimbabwe':
        return {
          agreement: 'Bilateral Trade Agreement (1988) + SADC Protocol',
          relevance: 'Duty-free access for goods containing at least 25% local content.',
          keyNote: 'Important corridor via Plumtree. Non-tariff barriers like import permits can cause border holding queues.',
          rules: [
            '25% local content threshold validation',
            'Bilateral import/export permits from Ministries of Agriculture',
            'Plumtree customs queue priority check'
          ],
          status: 'Active Corridor'
        };
      case 'South Africa ↔ Zimbabwe':
        return {
          agreement: 'Bilateral Trade Agreement + SADC Free Trade Protocol',
          relevance: 'Heavy grain and fresh produce shipping lanes via Beitbridge.',
          keyNote: 'Beitbridge is the busiest border post in the region. Mandatory digitized SADC Trade Registry pre-filing recommended.',
          rules: [
            'Pre-clearance customs filing on SADC Trade Registry',
            'Mandatory commercial invoice + phyto inspection at Musina',
            'South African VAT exemption on originating transit foods'
          ],
          status: 'Active Corridor'
        };
      case 'Namibia ↔ South Africa':
        return {
          agreement: 'SACU + SADC Protocol',
          relevance: 'Deep integration for fruits, horticulture, and livestock distribution.',
          keyNote: 'Duty-free customs clearance. Direct alignment with South African agricultural standard boards.',
          rules: [
            'Common monetary area transactions support',
            'Veterinary export hygiene certificates for red meat',
            'SACU customs declaration forms (SAD500) compliance'
          ],
          status: 'Active Corridor'
        };
      case 'Namibia ↔ Zimbabwe':
        return {
          agreement: 'Bilateral Trade Agreement (1992) + SADC Protocol',
          relevance: 'Reciprocal duty-free entry for goods matching local rules of origin.',
          keyNote: 'Corridor transit via Botswana (Trans-Kalahari / Kazungula). Requires dual-transit customs bonds.',
          rules: [
            'Local manufacturing/origin certificate requirement',
            'Transit customs bond for Botswana territory traversal',
            'Namibian veterinary import authorization'
          ],
          status: 'Active Corridor'
        };
      case 'Zambia ↔ Zimbabwe':
        return {
          agreement: 'COMESA Free Trade Area + SADC Protocol',
          relevance: 'Critical grain, fertilizer, and seed shipping corridor across the Zambezi.',
          keyNote: 'Chirundu One-Stop Border Post (OSBP) integrates biosecurity and customs desks under one roof.',
          rules: [
            'COMESA Simplified Trade Regime (STR) for smallholders',
            'Chirundu OSBP joint customs clearance',
            'Maize export ban exemptions validation'
          ],
          status: 'Active Corridor'
        };
      case 'Botswana ↔ Zambia':
        return {
          agreement: 'SADC Protocol + Bilateral Trade Agreement',
          relevance: 'Key corridor link via the Kazungula Bridge One-Stop Border Post.',
          keyNote: 'Significant route for horticultural crops and machinery. Kazungula OSBP reduces processing times to under 2 hours.',
          rules: [
            'Kazungula OSBP integrated clearance process',
            'SADC regional customs transit bond (RCTG) support',
            'Ministry-approved seed & feed certificates'
          ],
          status: 'Active Corridor'
        };
      case 'South Africa ↔ Zambia':
        return {
          agreement: 'SADC Free Trade Protocol',
          relevance: 'Large scale commercial agro-inputs and retail supply distribution.',
          keyNote: 'Traverses Zimbabwe or Botswana. Transit bonds are crucial to avoid dual tariff assessments.',
          rules: [
            'SADC Certificate of Origin requirement',
            'Multi-border transit custom declarations',
            'Pre-shipment biosecurity compliance inspection'
          ],
          status: 'Active Corridor'
        };
      case 'Namibia ↔ Zambia':
        return {
          agreement: 'SADC Protocol + Bilateral Trade Agreement',
          relevance: 'Logistics corridor linking Walvis Bay port to copperbelt agro-demand.',
          keyNote: 'Growing trade route via Wenela/Katima Mulilo border post. High volume of fish and timber.',
          rules: [
            'Katima Mulilo border clearance protocol',
            'Walvis Bay agricultural corridor logistics priority',
            'Forestry/veterinary export stamps'
          ],
          status: 'Active Corridor'
        };
      default:
        return {
          agreement: 'SADC Protocol on Trade',
          relevance: 'General multilateral trade rules governing Southern African nations.',
          keyNote: 'Subject to regional tariffs reductions and harmonized sanitary standards.',
          rules: ['SADC Certificate of Origin', 'Standard sanitary inspections'],
          status: 'Active Corridor'
        };
    }
  };

  const bilateralData = getBilateralInfo(countryA, countryB);

  const docList = [
    {
      id: 'sadc-protocol',
      title: 'SADC Protocol on Trade',
      category: 'Regional Protocols',
      icon: Globe,
      summary: 'Main multilateral treaty establishing free trade, tariff reductions, and phytosanitary harmonization across the SADC region.',
      content: `### SADC Protocol on Trade: Overview & Agricultural Compliance

The SADC Protocol on Trade is the primary legal instrument governing regional trade integration in Southern Africa. Signed in 1996 and fully implemented in 2008, the protocol seeks to eliminate trade barriers, ease customs procedures, and establish a common market for agricultural goods.

#### Key Provisions for Agribusiness:
1. **Sanitary and Phytosanitary (SPS) Harmonization:** Article 16 commits member states to harmonize sanitary and phytosanitary measures in accordance with international standards (IPPC, OIE, Codex Alimentarius). This prevents governments from using health and safety regulations as disguised barriers to trade.
2. **Rules of Origin:** Agricultural products must be wholly obtained in a SADC member state to qualify for duty-free access. For processed agricultural goods, the regional content must meet specific thresholds.
3. **Elimination of Non-Tariff Barriers (NTBs):** Outlaws arbitrary import/export quotas, import bans, and unjustified administrative fees.

> [!IMPORTANT]
> **Permit Issuance:** Exporters must obtain official Phytosanitary certificates and import/export licenses from their respective national Ministries of Agriculture. PulaTrade acts as a secure tracking layer and does not issue sovereign permits directly.`
    },
    {
      id: 'sacu-treaty',
      title: 'SACU Agreement (2002)',
      category: 'Customs Treaties',
      icon: Landmark,
      summary: 'Treaty governing the Southern African Customs Union (Botswana, Lesotho, Namibia, Eswatini, South Africa) with free internal trade.',
      content: `### The Southern African Customs Union (SACU) Agreement

The SACU Agreement of 2002 governs the oldest continuous customs union in the world. It provides for a common external tariff (CET) and the duty-free movement of domestically produced goods among its five member states.

#### Key Rules for Agricultural Trade:
- **Free Movement of Goods:** Article 18 guarantees that no member state shall apply customs duties on goods originating from the customs area.
- **Agricultural Marketing Restrictions:** Under Article 26, member states can regulate the marketing of agricultural products within their borders, provided such regulations apply equally to imports and domestic production.
- **National Protection:** Members can temporarily prohibit or restrict agricultural imports to protect domestic industries in times of extreme surplus or biosecurity outbreaks (e.g., Foot and Mouth Disease).

> [!NOTE]
> Transshipments from outside SACU entering one member state destined for another are subject to the Common External Tariff (CET) at the initial port of entry, with revenue distributed via the SACU revenue-sharing pool.`
    },
    {
      id: 'phyto-guidelines',
      title: 'SADC Biosecurity & SPS Guide',
      category: 'Compliance Standards',
      icon: Shield,
      summary: 'Practical guide to sanitary and phytosanitary inspections, quarantine procedures, and disease prevention rules along regional corridors.',
      content: `### SADC Phytosanitary and Veterinary Guidelines

Biosecurity is the most frequent cause of border delays for agricultural shipments. SADC members maintain rigorous inspection regimes to protect local ecosystems and animal health from pests and transboundary diseases.

#### Core Compliance Requirements:
1. **Phytosanitary Certification:** Every crop cargo shipment must be accompanied by an original Phytosanitary Certificate issued by the exporting country's plant health authority (e.g., Division of Plant Health in Botswana, DAFF in South Africa).
2. **Cold Chain Integrity:** Horticulture and meat shipments must maintain log records showing temperature maintenance. Sudden temperature spikes can void biosecurity validations.
3. **Fumigation & Packaging:** Wood packaging material must comply with ISPM 15 standards (heat treatment or methyl bromide fumigation) to prevent pest transport.

> [!WARNING]
> Failing to verify biosecurity certificate validity prior to arriving at border crossings like Beitbridge or Ramatlabama can result in complete cargo quarantine, cargo rejection, or severe border hold-ups exceeding 48 hours.`
    },
    {
      id: 'escrow-framework',
      title: 'Digital Escrow Engine Guide',
      category: 'Financial Operations',
      icon: Scale,
      summary: 'Operational framework of PulaTrade’s digital escrow engine, milestone-based payments, and trade dispute resolution.',
      content: `### PulaTrade Escrow & Settlement Framework

To bridge the regional trade credit gap and resolve the trust deficit between cross-border buyers and sellers, PulaTrade implements an automated digital escrow settlement layer.

#### Workflow of the Escrow Engine:
1. **Contract Lock-in:** The buyer locks the trade payment in USD, BWP, or ZAR within the PulaTrade Escrow vault.
2. **Milestone Tracking:** Payments are released in structured tranches tied to regional trade checkpoints:
   - **Tranche 1 (20%):** Released upon verification of the Phytosanitary certificate on the SADC Trade Registry.
   - **Tranche 2 (50%):** Released upon GPS verification crossing the designated border checkpoint.
   - **Tranche 3 (30%):** Released upon buyer receipt and quality check sign-off at the delivery warehouse.
3. **Dispute Resolution:** In the event of a dispute (e.g., quality degradation or border rejection), funds remain locked in escrow. A joint arbitration panel composed of representatives from local chambers of commerce reviews the digital logs to allocate payouts.

> [!TIP]
> Exporters using pre-validated transport carriers with active GPS tracking enjoy 40% faster escrow payout releases due to automated border-crossing validation.`
    }
  ];

  const filteredDocs = docList.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDoc = docList.find(d => d.id === selectedDocId) || docList[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-6">
        <div>
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs font-semibold mb-2">
            Regional Trade Treaties & Guidelines
          </Badge>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Bilateral Docs Hub</h1>
          <p className="text-xs text-zinc-400 mt-1">Access regional regulatory treaties, SADC trade protocols, and cross-border compliance guides.</p>
        </div>
        <Button 
          onClick={onBackToLanding}
          variant="outline" 
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          Back to Landing Page
        </Button>
      </div>

      {/* Interactive Corridor Matrix Section */}
      <Card className="border-zinc-900 bg-zinc-950/60 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/60">
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Interactive Bilateral Treaty Matrix</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-6">Select any two SADC corridor countries to check the active bilateral trade agreements, customs tariffs, and biosecurity rules.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Country Selector Controls */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Country A (Origin)</label>
                <select 
                  value={countryA}
                  onChange={(e) => setCountryA(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 outline-none hover:border-zinc-700 transition-colors"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex justify-center text-zinc-600 font-bold">
                <ArrowRight className="h-4 w-4 rotate-90 lg:rotate-0" />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Country B (Destination)</label>
                <select 
                  value={countryB}
                  onChange={(e) => setCountryB(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 outline-none hover:border-zinc-700 transition-colors"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-900/80 rounded-xl p-5 text-left space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider font-mono text-zinc-500">Active Treaty Link</div>
                  <h3 className="font-bold text-zinc-100 text-sm">{bilateralData.agreement}</h3>
                </div>
                <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900/60 text-[9px] font-bold">
                  {bilateralData.status}
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Agricultural Trade Impact:</span>
                  <p className="text-zinc-300 text-xs leading-relaxed">{bilateralData.relevance}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Corridor Logistics Note:</span>
                  <p className="text-amber-500/90 text-xs leading-relaxed">{bilateralData.keyNote}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block mb-2">Mandatory Border Cross Rules:</span>
                  <ul className="space-y-1.5 pl-1">
                    {bilateralData.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-zinc-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar + Main Reader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-650 outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div className="space-y-2">
            {filteredDocs.map((doc) => {
              const Icon = doc.icon;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 group relative overflow-hidden ${
                    selectedDocId === doc.id
                      ? 'border-emerald-700/60 bg-emerald-950/10 text-zinc-100 shadow-sm'
                      : 'border-zinc-900 bg-zinc-950/30 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg border transition-colors shrink-0 ${
                    selectedDocId === doc.id
                      ? 'border-emerald-900/60 bg-emerald-950/45 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-500 group-hover:text-zinc-300'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 pr-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">{doc.category}</div>
                    <h3 className="font-bold text-xs">{doc.title}</h3>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">{doc.summary}</p>
                  </div>
                  <ChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700 transition-transform ${
                    selectedDocId === doc.id ? 'translate-x-0.5 text-emerald-500' : 'group-hover:translate-x-0.5 group-hover:text-zinc-500'
                  }`} />
                </button>
              );
            })}
            {filteredDocs.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-xs">
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-zinc-650" />
                No matching documents found.
              </div>
            )}
          </div>
        </div>

        {/* Document Reader Container */}
        <div className="lg:col-span-8 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 md:p-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <article className="prose prose-invert max-w-none space-y-6 text-xs text-zinc-300 leading-relaxed">
            {/* Split rendering for markdown-like formatting */}
            {activeDoc.content.split('\n\n').map((paragraph, index) => {
              // Header 3
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg font-bold text-zinc-100 border-b border-zinc-900 pb-2 pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              // Header 4
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={index} className="text-xs font-bold text-zinc-200 uppercase tracking-wider pt-2">
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              // Bullet Points
              if (paragraph.includes('\n- ') || paragraph.includes('\n1. ')) {
                const lines = paragraph.split('\n');
                const title = lines[0];
                const listItems = lines.slice(1);
                
                return (
                  <div key={index} className="space-y-2">
                    {title && <span className="font-semibold text-zinc-200">{title}</span>}
                    <ul className="space-y-1.5 pl-4 list-disc list-outside text-zinc-400">
                      {listItems.map((li, lIdx) => (
                        <li key={lIdx} className="text-xs">
                          {li.replace(/^- |^\d+\. /, '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              // Callout Alerts
              if (paragraph.startsWith('> [!')) {
                const alertType = paragraph.includes('IMPORTANT') ? 'IMPORTANT' : paragraph.includes('WARNING') ? 'WARNING' : paragraph.includes('TIP') ? 'TIP' : 'NOTE';
                const cleanText = paragraph.replace(/> \[\!(NOTE|TIP|IMPORTANT|WARNING)\]\n>/, '').replace(/> /, '').trim();
                
                let theme = 'border-blue-900/60 bg-blue-950/20 text-blue-300';
                if (alertType === 'IMPORTANT') theme = 'border-emerald-900/60 bg-emerald-950/20 text-emerald-300';
                else if (alertType === 'WARNING') theme = 'border-red-900/60 bg-red-950/20 text-red-300';
                else if (alertType === 'TIP') theme = 'border-amber-900/60 bg-amber-950/20 text-amber-300';

                return (
                  <div key={index} className={`p-4 rounded-lg border flex gap-3 text-xs leading-relaxed ${theme}`}>
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[10px] uppercase font-bold tracking-wider mb-1">{alertType}</strong>
                      {cleanText}
                    </div>
                  </div>
                );
              }

              // Simple Paragraph
              return (
                <p key={index} className="text-zinc-400 leading-relaxed text-xs">
                  {paragraph}
                </p>
              );
            })}
          </article>
        </div>

      </div>
    </div>
  );
};
