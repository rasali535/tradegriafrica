"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bot, Send, Search, Terminal, Download, ShieldCheck, CheckCircle2, 
  ArrowUpRight, Clock, HelpCircle, Activity, FileText, Check, 
  Sparkles, Layers, RefreshCw, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AgentLog {
  agent: string;
  input: any;
  output: any;
  latency_ms: number;
  confidence_score: number;
  timestamp: string;
}

export const AIAgentCenter: React.FC = () => {
  const { placeOrder, triggerEvent } = useApp();
  
  // Prompt and Pipeline States
  const [query, setQuery] = useState("I want to export 12 tons of maize from Botswana to South Africa");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1: idle, 0: parsing, 1: discovery, 2: compliance, 3: logistics, 4: documentation, 5: closing, 6: done
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'audit'>('pipeline');
  const [expandedLogIdx, setExpandedLogIdx] = useState<number | null>(null);

  // In-memory audit logs for demo presentation
  const [auditLogs, setAuditLogs] = useState<AgentLog[]>([]);

  // Load preset templates
  const presets = [
    { label: "Botswana Maize Export", text: "I want to export 10 tons of maize from Botswana to South Africa" },
    { label: "Namibia Beef Export", text: "Export 25 tons of beef from Namibia to UAE" },
    { label: "SADC FMD Inquiry", text: "Are there any Foot-and-Mouth Disease movement bans from Botswana to South Africa?" },
    { label: "Phyto Requirements", text: "Explain Botswana phytosanitary requirements for exporting maize to Zimbabwe" }
  ];

  // Run the Orchestrator pipeline
  const handleOrchestrate = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setPipelineData(null);
    setCurrentStep(0); // Parsing query
    
    try {
      // Hit the backend first so we know the intent
      const res = await fetch('/api/agents/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`Orchestration failed with status ${res.status}`);
      }

      const data = await res.json();
      
      // Update local audit logs early so user sees them
      if (data.pipeline_logs) {
        setAuditLogs(prev => [...data.pipeline_logs, ...prev]);
      }

      // Step-by-step loading simulation for premium user experience
      if (data.intent === 'inquiry') {
        // Inquiry flow simulation
        await new Promise(r => setTimeout(r, 800));
        setCurrentStep(7); // 7: Regulatory Inquiry Agent Active
        await new Promise(r => setTimeout(r, 1200));
      } else {
        // Transaction flow simulation
        await new Promise(r => setTimeout(r, 600));
        setCurrentStep(1); // Discovery Agent
        await new Promise(r => setTimeout(r, 800));
        setCurrentStep(2); // Compliance Agent
        await new Promise(r => setTimeout(r, 800));
        setCurrentStep(3); // Logistics Agent
        await new Promise(r => setTimeout(r, 800));
        setCurrentStep(4); // Documentation Agent
        await new Promise(r => setTimeout(r, 600));
        setCurrentStep(5); // Closing Agent
        await new Promise(r => setTimeout(r, 600));
        setCurrentStep(6); // ASYCUDA Agent
        await new Promise(r => setTimeout(r, 600));
      }

      setPipelineData(data);
      setCurrentStep(7); // Done
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred in the agent orchestrator.");
      setCurrentStep(-1);
    } finally {
      setLoading(false);
    }
  };

  // Convert the opportunity into a real order and transaction in the context
  const handleExecuteDeal = () => {
    if (!pipelineData) return;

    try {
      const parsed = pipelineData.parsed_request;
      // Get price per unit from discovery buyers, or default
      const price = pipelineData.trade_opportunity?.buyers?.[0]?.estimated_price_per_unit || 320;
      
      // Create listing first or place order directly
      // Since placeOrder handles both, let's trigger it!
      // First, we find or create an order
      // We will simulate placing the order
      const order = placeOrder('l0000002-0000-0000-0000-000000000005', parsed.quantity);
      
      triggerEvent("agent.deal_executed", {
        product: parsed.product,
        quantity: parsed.quantity,
        origin: parsed.origin_country,
        destination: parsed.destination_country,
        price,
        order_id: order.id
      });

      alert(`🚀 DEAL LOCKED IN SMART CONTRACT!\n\nOrder ID: ${order.id}\nValuation: $${(parsed.quantity * price).toLocaleString()} USD\nTradeGridAfrica Smart Contract registry has recorded the procurement. Check the Exporter compliance desk to approve.`);
    } catch (err: any) {
      alert("Error executing deal: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* SADC Digital Agents Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-zinc-950 border border-emerald-900/30 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-400" />
            AI Trade Agent Tower & Workflow Orchestrator
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Unleash autonomous AI agents to research markets, verify customs protocols, estimate freight routing, and draft bilateral treaties. Input standard natural language below.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs px-2.5 py-1 flex items-center gap-1 font-mono">
            <Activity className="h-3 w-3 animate-pulse" /> 5 AGENTS READY
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-zinc-800 gap-4">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'pipeline'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Workflow Orchestration
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="h-4 w-4" />
          Agent Audit Ledger
        </button>
      </div>

      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query Input Section */}
          <Card className="lg:col-span-1 glass-card border-zinc-900/60 p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">Discharge Exporter Command</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Describe your export goal in plain language</p>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-32 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg p-3 text-xs text-zinc-100 outline-none resize-none transition-colors"
                  placeholder="e.g. I want to export 12 tons of maize from Botswana to South Africa"
                />
                
                <Button 
                  onClick={handleOrchestrate}
                  disabled={loading || !query.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 text-white border border-emerald-500 text-xs shadow-md py-2.5 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      Running Pipeline Agents...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Trigger AI Agents
                    </>
                  )}
                </Button>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Select Template Preset</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(preset.text)}
                      className="text-left text-[11px] p-2 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 mt-4 text-[9px] text-zinc-500 flex justify-between items-center font-mono">
              <span>ORCHESTRATOR v1.1.2</span>
              <span>READY</span>
            </div>
          </Card>

          {/* Pipeline Trace Visualizer */}
          <div className="lg:col-span-2 space-y-4">
            {/* If idle or loading but no data yet */}
            {currentStep === -1 && !error && (
              <Card className="glass-card border-zinc-900/60 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Bot className="h-16 w-16 text-zinc-700 stroke-1 mb-4" />
                <h4 className="font-bold text-zinc-300 text-sm">Orchestration Standby</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Run a prompt from the left column to launch the step-by-step agent workflow engine.
                </p>
              </Card>
            )}

            {/* Error View */}
            {error && (
              <Card className="glass-card border-red-950 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <h4 className="font-bold text-red-400 text-sm">Orchestrator Pipeline Failed</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm leading-relaxed">
                  {error}
                </p>
                <Button 
                  onClick={handleOrchestrate}
                  variant="outline" 
                  className="border-red-900 text-red-400 hover:bg-red-950/20 text-xs mt-4"
                >
                  Retry Pipeline
                </Button>
              </Card>
            )}

            {/* Steps execution trace */}
            {currentStep >= 0 && (
              <div className="space-y-4">
                {/* Visual workflow progression header */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-zinc-200">
                        {pipelineData?.intent === 'inquiry' || currentStep === 7 ? 'Regulatory Intelligence Agent' : 'Bilateral Export Agent Thread'}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {pipelineData?.intent === 'inquiry' || currentStep === 7 ? 'SADC Customs & Legal Knowledge Base' : 'Sequential analysis pipeline'}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-0.5 rounded">
                    {currentStep === 7 ? "COMPLETED" : currentStep === 8 ? "ACTIVE" : `AGENT ${currentStep} / 6`}
                  </div>
                </div>

                {/* Progress bar */}
                <Progress 
                  value={currentStep === 7 || (currentStep === 8 && pipelineData) ? 100 : currentStep === 8 ? 60 : (currentStep / 6) * 100} 
                  className="h-1 bg-zinc-900 accent-emerald-500" 
                />

                {/* Inquiry Agent View */}
                {(pipelineData?.intent === 'inquiry' || currentStep === 8) ? (
                  <AgentStepCard
                    title="Regulatory Inquiry Agent"
                    description="Searching SADC trade protocols, tracking phytosanitary outbreaks, and verifying compliance rules."
                    isActive={currentStep === 8 && !pipelineData}
                    isCompleted={!!pipelineData?.inquiry_response}
                    loading={loading && currentStep === 8}
                    data={pipelineData?.inquiry_response}
                  >
                    {pipelineData?.inquiry_response && (
                      <div className="space-y-4 mt-4 pt-4 border-t border-zinc-800 text-xs">
                        <div className="p-4 bg-zinc-950/60 border border-emerald-900/40 rounded-lg">
                          <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{pipelineData.inquiry_response.answer}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-zinc-500 text-[10px] font-mono block uppercase tracking-wider">Verified Sources:</span>
                          <div className="flex flex-wrap gap-2">
                            {pipelineData.inquiry_response.sources?.map((source: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-[10px] bg-zinc-900/50 border-zinc-700 text-zinc-400">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </AgentStepCard>
                ) : (
                  <div className="space-y-3">
                    {/* Agent Steps Stack */}
                  {/* Step 1: Trade Discovery */}
                  <AgentStepCard
                    title="1. Trade Discovery Agent"
                    description="Analyze regional demand matrices, search available buyers, and identify optimal SADC trade corridors."
                    isActive={currentStep === 1}
                    isCompleted={currentStep > 1}
                    loading={loading && currentStep === 1}
                    data={pipelineData?.trade_opportunity}
                  >
                    {pipelineData?.trade_opportunity?.buyers && (
                      <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800 text-xs">
                        <span className="text-zinc-500 text-[10px] font-mono block">Potential SADC Buyers Found:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {pipelineData.trade_opportunity.buyers.map((buyer: any, idx: number) => (
                            <div key={idx} className="bg-zinc-950/60 p-2.5 border border-zinc-900 rounded">
                              <span className="font-semibold text-zinc-200">{buyer.buyer_type}</span>
                              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                <span>Country: {buyer.country}</span>
                                <span className="font-mono font-bold text-emerald-400">${buyer.estimated_price_per_unit}/unit</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400 mt-1">
                          <span>Markets: <strong>{pipelineData.trade_opportunity.recommended_markets?.join(', ')}</strong></span>
                          <span>•</span>
                          <span>Export Window: <strong>{pipelineData.trade_opportunity.best_export_windows}</strong></span>
                        </div>
                      </div>
                    )}
                  </AgentStepCard>

                  {/* Step 2: Compliance */}
                  <AgentStepCard
                    title="2. Compliance & Treaty Verification Agent"
                    description="Verify phytosanitary parameters, customs tariffs, SPS health requirements, and governing trade treaties."
                    isActive={currentStep === 2}
                    isCompleted={currentStep > 2}
                    loading={loading && currentStep === 2}
                    data={pipelineData?.compliance}
                  >
                    {pipelineData?.compliance && (
                      <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800 text-xs">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-500 font-mono">Customs Tariff Duty:</span>
                          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] font-mono">{pipelineData.compliance.tariffs_estimate}</Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-zinc-500 text-[10px] font-mono block">Required Border Certifications:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {pipelineData.compliance.required_documents?.map((doc: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-[9px] bg-zinc-900 border-zinc-800 text-zinc-300">{doc}</Badge>
                            ))}
                          </div>
                        </div>

                        {pipelineData.compliance.sps_requirements?.length > 0 && (
                          <div className="space-y-1 mt-1">
                            <span className="text-zinc-500 text-[10px] font-mono block">SPS Verification Guidelines:</span>
                            <ul className="list-disc pl-4 text-[10px] text-amber-400 space-y-0.5">
                              {pipelineData.compliance.sps_requirements.map((sps: string, i: number) => (
                                <li key={i}>{sps}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </AgentStepCard>

                  {/* Step 3: Logistics Agent */}
                  <AgentStepCard
                    title="3. Logistics & Port Routing Agent"
                    description="Generate multimodal freight routes, cost estimates, customs check times, and border queue delay logs."
                    isActive={currentStep === 3}
                    isCompleted={currentStep > 3}
                    loading={loading && currentStep === 3}
                    data={pipelineData?.logistics}
                  >
                    {pipelineData?.logistics?.routes && (
                      <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800 text-xs">
                        <span className="text-zinc-500 text-[10px] font-mono block">Multimodal Logistics Paths:</span>
                        <div className="grid grid-cols-1 gap-2">
                          {pipelineData.logistics.routes.map((route: any, idx: number) => (
                            <div key={idx} className="bg-zinc-950/60 p-2.5 border border-zinc-900 rounded flex justify-between items-center text-[10px]">
                              <div>
                                <span className="font-semibold text-zinc-200 block">{route.route}</span>
                                <span className="text-zinc-500">Port Gateway: {pipelineData.logistics.recommended_port}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-amber-400 block">${route.estimated_cost_usd} USD</span>
                                <span className="text-zinc-400 block font-mono">{route.transit_time_days} days ({route.mode})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AgentStepCard>

                  {/* Step 4: Documentation Agent */}
                  <AgentStepCard
                    title="4. SADC Document compiler Agent"
                    description="Instantly generate structured trade documents including invoices, packing lists, and biosecurity forms."
                    isActive={currentStep === 4}
                    isCompleted={currentStep > 4}
                    loading={loading && currentStep === 4}
                    data={pipelineData}
                  >
                    {pipelineData?.documents_ready && (
                      (() => {
                        const parsed = pipelineData.parsed_request;
                        const seller = pipelineData.pipeline_logs?.[4]?.input?.seller || "Regional Agricultural Exporters";
                        const buyer = pipelineData.trade_opportunity?.buyers?.[0]?.buyer_name || "Global Commodity Importers";
                        const product = parsed.product;
                        const quantity = parsed.quantity;
                        const price = pipelineData.trade_opportunity?.buyers?.[0]?.estimated_price_per_unit || 320;
                        const queryParams = `?seller=${encodeURIComponent(seller)}&buyer=${encodeURIComponent(buyer)}&product=${encodeURIComponent(product)}&quantity=${quantity}&price=${price}`;
                        
                        return (
                          <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800 text-xs">
                            <span className="text-zinc-500 text-[10px] font-mono block">Generated Certificates & Filings:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <a 
                                href={`/api/documents/invoice${queryParams}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 border border-zinc-800 hover:border-emerald-800 bg-zinc-950/60 hover:bg-emerald-950/20 text-zinc-300 hover:text-emerald-400 rounded flex items-center justify-between transition-all"
                              >
                                <span className="truncate">Commercial Invoice</span>
                                <Download className="h-3.5 w-3.5 shrink-0 ml-1.5" />
                              </a>
                              <a 
                                href={`/api/documents/packing_list${queryParams}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 border border-zinc-800 hover:border-emerald-800 bg-zinc-950/60 hover:bg-emerald-950/20 text-zinc-300 hover:text-emerald-400 rounded flex items-center justify-between transition-all"
                              >
                                <span className="truncate">Packing List</span>
                                <Download className="h-3.5 w-3.5 shrink-0 ml-1.5" />
                              </a>
                              <a 
                                href={`/api/documents/certificate_of_origin${queryParams}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 border border-zinc-800 hover:border-emerald-800 bg-zinc-950/60 hover:bg-emerald-950/20 text-zinc-300 hover:text-emerald-400 rounded flex items-center justify-between transition-all"
                              >
                                <span className="truncate">SADC Certificate</span>
                                <Download className="h-3.5 w-3.5 shrink-0 ml-1.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </AgentStepCard>

                  {/* Step 5: Deal Closing Agent */}
                  <AgentStepCard
                    title="5. Deal Closing & Contract Registry Agent"
                    description="Compile bilateral trade contract drafts, set contract execution milestones, and outline action steps."
                    isActive={currentStep === 5}
                    isCompleted={currentStep > 5}
                    loading={loading && currentStep === 5}
                    data={pipelineData}
                  >
                    {pipelineData?.deal_ready && pipelineData?.pipeline_logs?.[4]?.output && (
                      <div className="space-y-3 mt-2 pt-2 border-t border-zinc-800 text-xs">
                        <div className="bg-zinc-950 p-2.5 rounded border border-zinc-850 text-zinc-300 leading-normal">
                          <strong className="text-emerald-400">Contract Message:</strong> {pipelineData.pipeline_logs[4].output.negotiation_message}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-zinc-500 text-[10px] font-mono block">Action Steps:</span>
                            <ul className="list-decimal pl-4 mt-1 text-[10px] text-zinc-400 space-y-0.5">
                              {pipelineData.pipeline_logs[4].output.next_steps?.map((step: string, i: number) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-col justify-end gap-2">
                            <a
                              href={`/api/documents/contract?buyer=${encodeURIComponent(pipelineData.pipeline_logs?.[4]?.input?.buyer || "Global Commodity Importers")}&seller=${encodeURIComponent(pipelineData.pipeline_logs?.[4]?.input?.seller || "Regional Agricultural Exporters")}&product=${encodeURIComponent(pipelineData.parsed_request.product)}&price=${pipelineData.trade_opportunity?.buyers?.[0]?.estimated_price_per_unit || 320}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-zinc-100 rounded text-center flex items-center justify-center gap-1.5 transition-all text-[11px]"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View Contract Draft
                            </a>
                            <Button
                              onClick={handleExecuteDeal}
                              className="bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white font-bold text-[11px] py-2 flex items-center justify-center gap-1.5 shadow"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Confirm & Lock Contract
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </AgentStepCard>

                  {/* Step 6: Customs Filing Agent */}
                  <AgentStepCard
                    title={`6. ${pipelineData?.customs_clearance?.system_used?.includes('BESW') ? 'BESW' : 'ASYCUDA'} Customs Filing Agent`}
                    description={`Automatically lodges the commercial invoice and certificates to ${pipelineData?.customs_clearance?.system_used?.includes('BESW') ? 'BURS (Botswana)' : 'ZIMRA/Customs'} nodes for SAD500 clearance.`}
                    isActive={currentStep === 6}
                    isCompleted={currentStep > 6}
                    loading={loading && currentStep === 6}
                    data={pipelineData?.customs_clearance}
                  >
                    {pipelineData?.customs_clearance && (
                      <div className="space-y-3 mt-2 pt-2 border-t border-zinc-800 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-zinc-950 p-2 border border-zinc-900 rounded">
                            <span className="text-zinc-500 font-mono block mb-0.5">SAD500 Registration:</span>
                            <span className="font-bold text-emerald-400">{pipelineData.customs_clearance.sad500_registration_no}</span>
                          </div>
                          <div className="bg-zinc-950 p-2 border border-zinc-900 rounded">
                            <span className="text-zinc-500 font-mono block mb-0.5">{pipelineData.customs_clearance.system_used.includes('BESW') ? 'BESW/BOBS Assessment:' : 'ASYCUDA Assessment:'}</span>
                            <span className="font-bold text-emerald-400">{pipelineData.customs_clearance.assessment_id}</span>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-950/60 p-2 border border-emerald-900/30 rounded text-[10px] text-zinc-300">
                          <span className="text-emerald-500 font-bold block mb-1">OGA Routing Status:</span>
                          {pipelineData.customs_clearance.oga_routing_status}
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-zinc-400">
                          <span>Customs Post: <strong className="text-zinc-300">{pipelineData.customs_clearance.office_of_clearance}</strong></span>
                          <span>Duty Liability: <strong className="text-zinc-300">{pipelineData.customs_clearance.duty_taxes_calculated}</strong></span>
                        </div>
                        
                        <div className="pt-2 border-t border-zinc-800">
                          <a
                            href="/api/documents/sad500"
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 w-full border border-emerald-900/50 hover:border-emerald-700 bg-emerald-950/20 text-emerald-400 hover:text-emerald-300 rounded text-center flex items-center justify-center gap-1.5 transition-all text-[11px] font-bold"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Official SAD500 Declaration
                          </a>
                        </div>
                      </div>
                    )}
                  </AgentStepCard>
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Log View */}
      {activeTab === 'audit' && (
        <Card className="glass-card border-zinc-900/60 p-4">
          <div className="border-b border-zinc-800 pb-2 mb-4">
            <h3 className="font-bold text-zinc-100 text-sm">Decentralized Agent Audit Ledger</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Immutable audit trails of inputs, latency benchmarks, and confidence metrics for SADC operations proof</p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-20 text-zinc-650 text-xs">
              No agent transactions logged yet. Run a workflow orchestration on the main tab to populate logs.
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log, idx) => {
                const isExpanded = expandedLogIdx === idx;
                return (
                  <div key={idx} className="border border-zinc-900 bg-zinc-900/20 rounded-lg overflow-hidden text-xs">
                    {/* Header bar */}
                    <div 
                      onClick={() => setExpandedLogIdx(isExpanded ? null : idx)}
                      className="p-3 bg-zinc-950/60 hover:bg-zinc-950 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Badge className="bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-mono">
                          {log.agent}
                        </Badge>
                        <span className="font-mono text-[9px] text-zinc-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className="text-zinc-400 font-mono">Latency: <strong className="text-emerald-400">{log.latency_ms}ms</strong></span>
                        <span className="text-zinc-400 font-mono">Confidence: <strong className="text-amber-400">{log.confidence_score * 100}%</strong></span>
                        <span className="text-[10px] text-zinc-500 font-bold">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expandable details */}
                    {isExpanded && (
                      <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
                        <div className="space-y-2">
                          <span className="text-emerald-500 uppercase tracking-wider font-bold text-[9px] block flex items-center gap-1"><ArrowUpRight className="h-3 w-3"/> Agent Parameters (Input)</span>
                          <div className="p-3 bg-zinc-950/80 border border-zinc-800/60 rounded max-h-64 overflow-y-auto shadow-inner">
                            <ReadableObject data={log.input} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-emerald-500 uppercase tracking-wider font-bold text-[9px] block flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Agent Analysis (Output)</span>
                          <div className="p-3 bg-zinc-950/80 border border-zinc-800/60 rounded max-h-64 overflow-y-auto shadow-inner">
                            <ReadableObject data={log.output} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

// Recursive helper to render objects as readable lists instead of JSON
const ReadableObject = ({ data }: { data: any }) => {
  if (data === null || data === undefined) return <span className="text-zinc-500 italic">None</span>;
  if (typeof data !== 'object') {
    return <span className="text-zinc-200 font-medium">{String(data)}</span>;
  }
  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-4 space-y-1 my-1">
        {data.map((item, i) => (
          <li key={i} className="text-zinc-300"><ReadableObject data={item} /></li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-2 my-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-zinc-400 text-[9px] uppercase tracking-wider font-semibold">{key.replace(/_/g, ' ')}:</span>
          <div className="pl-2 border-l border-zinc-800 ml-1 mt-0.5">
            <ReadableObject data={value} />
          </div>
        </div>
      ))}
    </div>
  );
};

// UI card helper for Agent progression steps
interface AgentStepProps {
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  loading: boolean;
  data?: any;
  children?: React.ReactNode;
}

const AgentStepCard: React.FC<AgentStepProps> = ({ 
  title, 
  description, 
  isActive, 
  isCompleted, 
  loading, 
  data, 
  children 
}) => {
  return (
    <Card className={`transition-all duration-300 border ${
      isActive 
        ? 'bg-zinc-950 border-emerald-500/80 shadow-lg scale-[1.01] ring-1 ring-emerald-500/30' 
        : isCompleted 
          ? 'bg-zinc-900/30 border-zinc-900 text-zinc-400' 
          : 'bg-zinc-900/10 border-zinc-900/40 text-zinc-600'
    } p-4`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h4 className={`font-bold text-xs flex items-center gap-1.5 ${
            isActive ? 'text-emerald-400' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'
          }`}>
            {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
            {loading && <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin shrink-0" />}
            {!isCompleted && !loading && (
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-zinc-700'}`} />
            )}
            {title}
          </h4>
          <p className="text-[11px] leading-relaxed text-zinc-400">{description}</p>
        </div>
        {data && isCompleted && (
          <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] font-mono ml-2">
            RESOLVED
          </Badge>
        )}
      </div>
      
      {/* Display custom children details when completed */}
      {isCompleted && children}
    </Card>
  );
};
