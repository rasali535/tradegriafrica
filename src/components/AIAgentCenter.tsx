"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bot, Send, CheckCircle2, RefreshCw, AlertCircle, Sparkles, Server, MessageSquare
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

type Role = 'user' | 'ai' | 'pipeline';

interface Message {
  id: string;
  role: Role;
  content?: string;
  pipelineData?: any;
  currentStep?: number;
  loading?: boolean;
  error?: string;
  latency_ms?: number;
  source?: string;
}

export const AIAgentCenter: React.FC = () => {
  const { formatCurrency } = useApp();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: 'ai',
      content: "Welcome to the TradeGrid AI Agent Center. I can answer questions about the SADC region, B2B procurement, or if you need to make a purchase, you can trigger the Multi-Agent Procurement Pipeline."
    }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleChat = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Send chat context
      const chatMessages = messages
        .filter(m => m.role === 'user' || m.role === 'ai')
        .map(m => ({ role: m.role, content: m.content || "" }));
      chatMessages.push({ role: 'user', content: userMsg.content || "" });

      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages }),
      });

      if (!res.ok) throw new Error("Chat failed.");
      
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: data.text || "Sorry, I couldn't generate a response.",
        latency_ms: data.latency_ms,
        source: data.source
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: "Error: " + err.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrchestrate = async () => {
    if (!input.trim() || loading) return;
    
    const userQuery = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userQuery };
    const pipelineId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, userMsg, {
      id: pipelineId,
      role: 'pipeline',
      currentStep: 0,
      loading: true
    }]);
    
    setInput("");
    setLoading(true);
    
    const updatePipelineMsg = (updates: Partial<Message>) => {
      setMessages(prev => prev.map(m => m.id === pipelineId ? { ...m, ...updates } : m));
    };
    
    try {
      const res = await fetch('/api/agents/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!res.ok) throw new Error(`Orchestration failed with status ${res.status}`);
      const data = await res.json();

      // Simulate step-by-step UI for the pipeline
      await new Promise(r => setTimeout(r, 600));
      updatePipelineMsg({ currentStep: 1, pipelineData: data }); // Supplier Discovery
      await new Promise(r => setTimeout(r, 800));
      updatePipelineMsg({ currentStep: 2 }); // RFQ Intelligence
      await new Promise(r => setTimeout(r, 800));
      updatePipelineMsg({ currentStep: 3 }); // Compliance
      await new Promise(r => setTimeout(r, 800));
      updatePipelineMsg({ currentStep: 4 }); // Market Intelligence
      await new Promise(r => setTimeout(r, 600));
      
      updatePipelineMsg({ currentStep: 5, loading: false }); // Done
    } catch (err: any) {
      console.error(err);
      updatePipelineMsg({ error: err.message || "Pipeline failed", loading: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-zinc-950 border border-emerald-900/30 flex justify-between items-center relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-400" />
            AI Agent Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Chat with the AI or trigger the multi-agent procurement pipeline.
          </p>
        </div>
      </div>

      {/* Chat History */}
      <Card className="flex-1 glass-card border-zinc-900/60 p-4 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* User Message */}
              {msg.role === 'user' && (
                <div className="max-w-[80%] bg-emerald-600/20 border border-emerald-500/30 text-zinc-100 p-3 rounded-2xl rounded-tr-sm text-sm shadow-sm">
                  {msg.content}
                </div>
              )}

              {/* AI Chat Message */}
              {msg.role === 'ai' && (
                <div className="max-w-[80%] flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-zinc-900/60 border border-zinc-800/80 text-zinc-200 p-3.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                    {msg.source && (
                      <div className="flex items-center gap-2 pl-2">
                        <span className="text-[10px] uppercase font-mono text-zinc-500 flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          {msg.source.includes('AMD') ? (
                            <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">{msg.source}</span>
                          ) : (
                            <span className="text-emerald-500">{msg.source}</span>
                          )}
                        </span>
                        {msg.latency_ms && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            {msg.latency_ms}ms
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pipeline Output Message */}
              {msg.role === 'pipeline' && (
                <div className="w-full max-w-3xl flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center shrink-0">
                    <Server className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 bg-zinc-950/80 border border-emerald-900/30 rounded-2xl rounded-tl-sm p-4 overflow-hidden">
                    <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Procurement Pipeline Orchestration
                    </h4>
                    
                    {msg.error ? (
                       <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 p-3 rounded border border-red-900/50">
                         <AlertCircle className="h-4 w-4" />
                         {msg.error}
                       </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                          <span>AGENT SEQUENCE</span>
                          <span className="text-emerald-400">{msg.currentStep && msg.currentStep >= 5 ? "COMPLETED" : `STEP ${msg.currentStep} / 4`}</span>
                        </div>
                        <Progress value={((msg.currentStep || 0) / 5) * 100} className="h-1 bg-zinc-900 accent-emerald-500" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          {/* 1. Supplier */}
                          <AgentStepCard title="Supplier Discovery" isActive={msg.currentStep === 1} isCompleted={(msg.currentStep || 0) > 1} loading={msg.loading && msg.currentStep === 1}>
                            {msg.pipelineData?.supplier_discovery?.suppliers && (
                              <div className="mt-2 text-xs space-y-1.5">
                                {msg.pipelineData.supplier_discovery.suppliers.map((s: any, i: number) => (
                                  <div key={i} className="flex justify-between bg-zinc-900/50 p-1.5 rounded border border-zinc-800">
                                    <span className="truncate pr-2">{s.name}</span>
                                    <span className="text-emerald-400 font-mono text-[10px]">{s.match_score}%</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </AgentStepCard>

                          {/* 2. RFQ */}
                          <AgentStepCard title="RFQ Intelligence" isActive={msg.currentStep === 2} isCompleted={(msg.currentStep || 0) > 2} loading={msg.loading && msg.currentStep === 2}>
                             {msg.pipelineData?.rfq_intelligence?.rfq_draft && (
                              <div className="mt-2 text-[11px] bg-zinc-900/50 p-2 rounded border border-zinc-800">
                                <div className="text-zinc-400">Budget Estimate:</div>
                                <div className="font-bold text-amber-400">${msg.pipelineData.rfq_intelligence.rfq_draft.budget_estimate_usd.toLocaleString()}</div>
                              </div>
                            )}
                          </AgentStepCard>

                          {/* 3. Compliance */}
                          <AgentStepCard title="Compliance Check" isActive={msg.currentStep === 3} isCompleted={(msg.currentStep || 0) > 3} loading={msg.loading && msg.currentStep === 3}>
                            {msg.pipelineData?.compliance?.required_certifications && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {msg.pipelineData.compliance.required_certifications.map((c: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[9px] bg-zinc-900/80 border-zinc-700">{c}</Badge>
                                ))}
                              </div>
                            )}
                          </AgentStepCard>

                          {/* 4. Market */}
                          <AgentStepCard title="Market Intelligence" isActive={msg.currentStep === 4} isCompleted={(msg.currentStep || 0) > 4} loading={msg.loading && msg.currentStep === 4}>
                            {msg.pipelineData?.market_intelligence && (
                              <div className="mt-2 text-[11px] bg-zinc-900/50 p-2 rounded border border-zinc-800">
                                <div className="text-zinc-400">Avg Price:</div>
                                <div className="font-bold text-emerald-400">${msg.pipelineData.market_intelligence.avg_market_price_usd.toLocaleString()} <span className="text-zinc-500 font-normal">({msg.pipelineData.market_intelligence.price_trend})</span></div>
                              </div>
                            )}
                          </AgentStepCard>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && messages[messages.length - 1].role === 'user' && (
            <div className="max-w-[80%] flex gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                 <Bot className="h-4 w-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 p-3.5 rounded-2xl rounded-tl-sm text-sm flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="pt-4 mt-2 border-t border-zinc-800/50 flex gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChat()}
            placeholder="Ask a question or enter a procurement command..." 
            className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 transition-colors"
            disabled={loading}
          />
          <Button 
            onClick={handleChat} 
            disabled={loading || !input.trim()} 
            variant="outline"
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Chat
          </Button>
          <Button 
            onClick={handleOrchestrate} 
            disabled={loading || !input.trim()} 
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 text-white border border-emerald-500 shadow-md"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Run Pipeline
          </Button>
        </div>
      </Card>
    </div>
  );
};

interface AgentStepProps {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const AgentStepCard: React.FC<AgentStepProps> = ({ title, isActive, isCompleted, loading, children }) => (
  <div className={`transition-all duration-300 border rounded-lg p-3 ${isActive ? 'bg-zinc-950 border-emerald-500/80 shadow-md' : isCompleted ? 'bg-zinc-900/30 border-zinc-800 text-zinc-400' : 'bg-zinc-900/10 border-zinc-900/40 opacity-50'}`}>
    <h4 className={`font-bold text-[11px] flex items-center gap-1.5 ${isActive ? 'text-emerald-400' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'}`}>
      {isCompleted && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
      {loading && <RefreshCw className="h-3 w-3 text-emerald-400 animate-spin shrink-0" />}
      {!isCompleted && !loading && <div className={`h-2 w-2 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-zinc-700'}`} />}
      {title}
    </h4>
    {isCompleted && children}
  </div>
);
