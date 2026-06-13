"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bot, Send, Terminal, CheckCircle2, 
  ArrowUpRight, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { Card } from "@/components/ui/card";
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
  const { formatCurrency } = useApp();
  
  const [query, setQuery] = useState("I need to procure 10 tons of industrial steel");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1: idle, 0: parsing, 1: supplier, 2: rfq, 3: compliance, 4: market, 5: done
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'audit'>('pipeline');
  const [expandedLogIdx, setExpandedLogIdx] = useState<number | null>(null);

  const [auditLogs, setAuditLogs] = useState<AgentLog[]>([]);

  const presets = [
    { label: "Procure Industrial Steel", text: "I need to procure 10 tons of industrial steel" },
    { label: "Heavy Machinery RFQ", text: "Draft an RFQ for 5 Caterpillar excavators" },
    { label: "Compliance Check", text: "Check compliance requirements for importing electronics to Zambia" }
  ];

  const handleOrchestrate = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setPipelineData(null);
    setCurrentStep(0);
    
    try {
      const res = await fetch('/api/agents/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error(`Orchestration failed with status ${res.status}`);

      const data = await res.json();
      
      if (data.pipeline_logs) {
        setAuditLogs(prev => [...data.pipeline_logs, ...prev]);
      }

      await new Promise(r => setTimeout(r, 600));
      setCurrentStep(1); // Supplier Discovery
      await new Promise(r => setTimeout(r, 800));
      setCurrentStep(2); // RFQ Intelligence
      await new Promise(r => setTimeout(r, 800));
      setCurrentStep(3); // Compliance
      await new Promise(r => setTimeout(r, 800));
      setCurrentStep(4); // Market Intelligence
      await new Promise(r => setTimeout(r, 600));

      setPipelineData(data);
      setCurrentStep(5); // Done
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setCurrentStep(-1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-zinc-950 border border-emerald-900/30 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-400" />
            Enterprise AI Procurement Pipeline
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Autonomous multi-agent system for intelligent sourcing, RFQ drafting, compliance checking, and market intelligence.
          </p>
        </div>
      </div>

      <div className="flex border-b border-zinc-800 gap-4">
        <button onClick={() => setActiveTab('pipeline')} className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${activeTab === 'pipeline' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}><Sparkles className="h-4 w-4" />Workflow Orchestration</button>
        <button onClick={() => setActiveTab('audit')} className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${activeTab === 'audit' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}><Terminal className="h-4 w-4" />Agent Audit Ledger</button>
      </div>

      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 glass-card border-zinc-900/60 p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">Discharge Procurement Command</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Describe your sourcing needs.</p>
              </div>
              <div className="space-y-2">
                <textarea value={query} onChange={(e) => setQuery(e.target.value)} className="w-full h-32 bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 outline-none resize-none transition-colors" placeholder="e.g. I need to procure 10 tons of industrial steel" />
                <Button onClick={handleOrchestrate} disabled={loading || !query.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 text-white border border-emerald-500 text-xs shadow-md py-2.5 flex items-center justify-center gap-1.5">
                  {loading ? <><RefreshCw className="h-4 w-4 animate-spin text-white" />Running Pipeline Agents...</> : <><Send className="h-3.5 w-3.5" />Trigger AI Agents</>}
                </Button>
              </div>
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Select Template Preset</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {presets.map((preset, idx) => (
                    <button key={idx} onClick={() => setQuery(preset.text)} className="text-left text-[11px] p-2 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 rounded text-zinc-400">{preset.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {currentStep === -1 && !error && (
              <Card className="glass-card border-zinc-900/60 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Bot className="h-16 w-16 text-zinc-700 stroke-1 mb-4" />
                <h4 className="font-bold text-zinc-300 text-sm">Orchestration Standby</h4>
                <p className="text-xs text-zinc-500 mt-1">Run a prompt from the left column to launch the workflow.</p>
              </Card>
            )}

            {error && (
              <Card className="glass-card border-red-950 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <h4 className="font-bold text-red-400 text-sm">Pipeline Failed</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">{error}</p>
                <Button onClick={handleOrchestrate} variant="outline" className="border-red-900 text-red-400 mt-4">Retry Pipeline</Button>
              </Card>
            )}

            {currentStep >= 0 && (
              <div className="space-y-4">
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-zinc-200">Enterprise Procurement Pipeline</span>
                      <span className="text-[10px] text-zinc-500 block">4 Agent Sequence</span>
                    </div>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-0.5 rounded">
                    {currentStep >= 5 ? "COMPLETED" : `AGENT ${currentStep} / 4`}
                  </div>
                </div>

                <Progress value={(currentStep / 5) * 100} className="h-1 bg-zinc-900 accent-emerald-500" />

                <div className="space-y-3">
                  <AgentStepCard title="1. Supplier Discovery Agent" description="Identify and score verified enterprise suppliers across the network." isActive={currentStep === 1} isCompleted={currentStep > 1} loading={loading && currentStep === 1} data={pipelineData?.supplier_discovery}>
                    {pipelineData?.supplier_discovery?.suppliers && (
                      <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800 text-xs">
                        {pipelineData.supplier_discovery.suppliers.map((sup: any, idx: number) => (
                          <div key={idx} className="bg-zinc-950/60 p-2.5 border border-zinc-900 rounded flex justify-between">
                            <span className="font-bold text-zinc-200">{sup.name} ({sup.country})</span>
                            <span className="text-emerald-400 font-mono">{sup.match_score}% Match</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </AgentStepCard>

                  <AgentStepCard title="2. RFQ Intelligence Agent" description="Draft dynamic RFQs and predict incoming bids." isActive={currentStep === 2} isCompleted={currentStep > 2} loading={loading && currentStep === 2} data={pipelineData?.rfq_intelligence}>
                    {pipelineData?.rfq_intelligence?.rfq_draft && (
                      <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800 text-xs">
                        <div className="bg-zinc-950/60 p-2.5 border border-zinc-900 rounded">
                          <span className="text-zinc-500 font-mono block">Draft Title:</span>
                          <span className="font-bold text-zinc-200">{pipelineData.rfq_intelligence.rfq_draft.title}</span>
                          <span className="text-zinc-500 font-mono block mt-2">Budget Estimate:</span>
                          <span className="font-bold text-amber-400">${pipelineData.rfq_intelligence.rfq_draft.budget_estimate_usd.toLocaleString()} USD</span>
                        </div>
                      </div>
                    )}
                  </AgentStepCard>

                  <AgentStepCard title="3. Compliance Agent" description="Verify industrial certifications and regulatory requirements." isActive={currentStep === 3} isCompleted={currentStep > 3} loading={loading && currentStep === 3} data={pipelineData?.compliance}>
                    {pipelineData?.compliance?.required_certifications && (
                      <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800 text-xs">
                        <div className="flex gap-2">
                          {pipelineData.compliance.required_certifications.map((cert: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[10px] bg-zinc-900 border-zinc-800">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </AgentStepCard>

                  <AgentStepCard title="4. Market Intelligence Agent" description="Analyze live pricing trends and regional supply health." isActive={currentStep === 4} isCompleted={currentStep > 4} loading={loading && currentStep === 4} data={pipelineData?.market_intelligence}>
                    {pipelineData?.market_intelligence && (
                      <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800 text-xs">
                         <div className="bg-zinc-950/60 p-2.5 border border-zinc-900 rounded">
                          <span className="text-zinc-500 font-mono block">Market Insight:</span>
                          <span className="text-zinc-200">{pipelineData.market_intelligence.market_insight}</span>
                          <span className="text-zinc-500 font-mono block mt-2">Avg Market Price:</span>
                          <span className="font-bold text-emerald-400">${pipelineData.market_intelligence.avg_market_price_usd.toLocaleString()} USD (Trend: {pipelineData.market_intelligence.price_trend})</span>
                        </div>
                      </div>
                    )}
                  </AgentStepCard>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <Card className="glass-card border-zinc-900/60 p-4">
          {auditLogs.map((log, idx) => (
             <div key={idx} className="border border-zinc-900 bg-zinc-900/20 rounded-lg overflow-hidden text-xs mb-2 p-3">
               <Badge className="bg-zinc-900 text-zinc-300 mb-2">{log.agent}</Badge>
               <div className="text-zinc-400">Latency: {log.latency_ms}ms | Confidence: {log.confidence_score*100}%</div>
             </div>
          ))}
        </Card>
      )}
    </div>
  );
};

interface AgentStepProps {
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  loading: boolean;
  data?: any;
  children?: React.ReactNode;
}

const AgentStepCard: React.FC<AgentStepProps> = ({ title, description, isActive, isCompleted, loading, data, children }) => (
  <Card className={`transition-all duration-300 border ${isActive ? 'bg-zinc-950 border-emerald-500/80 shadow-lg' : isCompleted ? 'bg-zinc-900/30 border-zinc-900 text-zinc-400' : 'bg-zinc-900/10 border-zinc-900/40 text-zinc-600'} p-4`}>
    <div className="flex items-start justify-between">
      <div className="space-y-1 flex-1">
        <h4 className={`font-bold text-xs flex items-center gap-1.5 ${isActive ? 'text-emerald-400' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'}`}>
          {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
          {loading && <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin shrink-0" />}
          {!isCompleted && !loading && <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-zinc-700'}`} />}
          {title}
        </h4>
        <p className="text-[11px] leading-relaxed text-zinc-400">{description}</p>
      </div>
    </div>
    {isCompleted && children}
  </Card>
);
