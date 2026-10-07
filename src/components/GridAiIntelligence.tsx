"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileBarChart,
  FileSearch,
  Package,
  Radar,
  Route,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IntelligenceView = "overview" | "documents" | "cargo" | "risk" | "reports";

const trendData = [
  { day: "Mon", risk: 22 },
  { day: "Tue", risk: 28 },
  { day: "Wed", risk: 26 },
  { day: "Thu", risk: 48 },
  { day: "Fri", risk: 37 },
  { day: "Sat", risk: 31 },
  { day: "Sun", risk: 24 },
];

export const GridAiIntelligence: React.FC = () => {
  const { shipments, rfqs, bids, exports, tradeCorridors, currentUser, formatCurrency } = useApp();
  const [view, setView] = useState<IntelligenceView>("overview");

  const activeShipments = shipments.filter((shipment) => shipment.status === "transit");
  const pendingShipments = shipments.filter((shipment) => shipment.status === "pending");
  const deliveredShipments = shipments.filter((shipment) => shipment.status === "delivered");
  const highRiskExports = exports.filter((item) => item.readiness_score < 60 || item.status === "rejected");
  const openRfqs = rfqs.filter((rfq) => rfq.status === "open");
  const acceptedBids = bids.filter((bid) => bid.status === "accepted");
  const corridorAlerts = tradeCorridors.filter((corridor) => corridor.biosecurity_status === "Alert" || corridor.queue_delay_hours > 6);

  const complianceData = useMemo(() => [
    { name: "Ready", count: exports.filter((item) => item.readiness_score >= 80).length },
    { name: "Review", count: exports.filter((item) => item.readiness_score >= 60 && item.readiness_score < 80).length },
    { name: "High Risk", count: highRiskExports.length },
  ], [exports, highRiskExports.length]);

  const intelligenceScore = Math.max(
    0,
    Math.min(
      100,
      92 - highRiskExports.length * 8 - corridorAlerts.length * 5 - pendingShipments.length * 2
    )
  );

  const tabs: { id: IntelligenceView; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "documents", label: "Documents" },
    { id: "cargo", label: "Cargo Operations" },
    { id: "risk", label: "Risk Engine" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/80 via-zinc-950 to-zinc-950 p-6">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
              <Radar className="h-4 w-4" />
              GridAi Intelligence
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Trade intelligence across procurement, compliance and cargo</h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              One intelligence layer for TradeGrid. GridAi combines RFQ activity, supplier outcomes, shipment telemetry,
              corridor conditions and export readiness into a single operating picture.
            </p>
          </div>
          <div className="grid min-w-[230px] grid-cols-2 gap-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Network score</div>
              <div className="mt-1 text-2xl font-black text-emerald-400">{intelligenceScore}</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Signed in as</div>
              <div className="mt-1 truncate text-sm font-bold text-zinc-200">{currentUser?.name || "TradeGrid User"}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto border-b border-zinc-900 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
              view === tab.id
                ? "bg-emerald-600 text-white"
                : "border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Open RFQs" value={openRfqs.length} icon={<FileSearch className="h-4 w-4" />} />
            <MetricCard label="Active Shipments" value={activeShipments.length} icon={<Truck className="h-4 w-4" />} />
            <MetricCard label="Pending Cargo" value={pendingShipments.length} icon={<Package className="h-4 w-4" />} />
            <MetricCard label="High-Risk Exports" value={highRiskExports.length} icon={<ShieldAlert className="h-4 w-4" />} alert={highRiskExports.length > 0} />
            <MetricCard label="Corridor Alerts" value={corridorAlerts.length} icon={<Route className="h-4 w-4" />} alert={corridorAlerts.length > 0} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="border-zinc-900 bg-zinc-950/60">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-200">GridAi Risk Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[290px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: 10 }} />
                    <Area type="monotone" dataKey="risk" stroke="#10b981" fill="#10b981" fillOpacity={0.14} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-zinc-900 bg-zinc-950/60">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-200">Export Compliance State</CardTitle>
              </CardHeader>
              <CardContent className="h-[290px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: 10 }} />
                    <Bar dataKey="count" fill="#10b981" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {view === "documents" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="border-zinc-900 bg-zinc-950/60 xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-zinc-200">
                <FileSearch className="h-4 w-4 text-emerald-400" />
                Document Intelligence Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(exports.length ? exports : [{ id: "demo", country: "SADC", readiness_score: 84, status: "pending_approval", missing_requirements: ["Certificate of Origin"] }]).slice(0, 8).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">Export Pack · {item.country}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {item.missing_requirements?.length ? `${item.missing_requirements.length} requirement(s) need review` : "Required documents present"}
                    </div>
                  </div>
                  <Badge className={item.readiness_score >= 80 ? "bg-emerald-950 text-emerald-400 border-emerald-900" : "bg-amber-950 text-amber-400 border-amber-900"}>
                    {item.readiness_score}% ready
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-emerald-900/40 bg-emerald-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-emerald-400">
                <Bot className="h-4 w-4" />
                GridAi Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-zinc-400">
              <p>GridAi will consolidate invoice, origin, permit and customs checks into this panel once the dedicated backend is connected.</p>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
                <div className="mb-2 font-bold text-zinc-300">Current signal</div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  {exports.length - highRiskExports.length} export pack(s) are currently above the high-risk threshold.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === "cargo" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="border-zinc-900 bg-zinc-950/60 xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-zinc-200">
                <Activity className="h-4 w-4 text-emerald-400" />
                Live Cargo Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shipments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
                  Shipment telemetry will appear here after a bid is awarded and cargo is created.
                </div>
              ) : shipments.map((shipment) => (
                <div key={shipment.id} className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <div className="font-mono text-xs text-emerald-400">{shipment.id.slice(0, 10)}</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-200">{shipment.route_from} → {shipment.route_to}</div>
                    <div className="mt-1 text-xs text-zinc-500">{shipment.transport_mode} · {shipment.gps ? `${shipment.gps.lat.toFixed(3)}, ${shipment.gps.lng.toFixed(3)}` : "GPS pending"}</div>
                  </div>
                  <Badge className="border-zinc-700 bg-zinc-900 text-zinc-300">{shipment.status}</Badge>
                  <div className="text-right text-xs text-zinc-500">{shipment.transporter_id ? "Transporter assigned" : "Awaiting transporter"}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-200">Corridor Watch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tradeCorridors.slice(0, 8).map((corridor) => (
                <div key={corridor.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">{corridor.name}</div>
                      <div className="mt-1 text-[11px] text-zinc-500">{corridor.border_checkpoint}</div>
                    </div>
                    <span className={corridor.queue_delay_hours > 6 ? "text-xs font-bold text-amber-400" : "text-xs font-bold text-emerald-400"}>
                      {corridor.queue_delay_hours}h
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {view === "risk" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-zinc-200">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                Predictive Trade Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-full border-8 border-emerald-500/40 bg-emerald-950/20">
                <span className="text-5xl font-black text-emerald-400">{100 - intelligenceScore}</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Risk index</span>
              </div>
              <div className="mt-6 space-y-2">
                <RiskRow label="Exports requiring intervention" value={highRiskExports.length} />
                <RiskRow label="Corridor alerts" value={corridorAlerts.length} />
                <RiskRow label="Unassigned shipments" value={pendingShipments.filter((shipment) => !shipment.transporter_id).length} />
                <RiskRow label="Open procurement exposure" value={openRfqs.length} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-200">GridAi Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActionItem done={highRiskExports.length === 0} text={highRiskExports.length ? "Review export packs below 60% readiness before clearance." : "No high-risk export packs require intervention."} />
              <ActionItem done={corridorAlerts.length === 0} text={corridorAlerts.length ? "Reroute or review shipments crossing delayed or alerted corridors." : "Current monitored corridors are within normal operating range."} />
              <ActionItem done={pendingShipments.length === 0} text={pendingShipments.length ? "Assign logistics providers to pending shipments." : "No pending shipment assignments."} />
              <ActionItem done={acceptedBids.length > 0} text={acceptedBids.length ? "Accepted bids are ready to flow into shipment execution." : "No accepted bids yet; procurement pipeline is still pre-award."} />
            </CardContent>
          </Card>
        </div>
      )}

      {view === "reports" && (
        <Card className="border-zinc-900 bg-zinc-950/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-200">
              <FileBarChart className="h-4 w-4 text-emerald-400" />
              GridAi Executive Trade Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ReportStat label="Procurement" value={`${openRfqs.length} RFQs open`} />
              <ReportStat label="Execution" value={`${activeShipments.length} in transit`} />
              <ReportStat label="Delivery" value={`${deliveredShipments.length} delivered`} />
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h4 className="text-sm font-bold text-zinc-200">Commercial exposure</h4>
              <p className="mt-2 text-2xl font-black text-emerald-400">
                {formatCurrency(acceptedBids.reduce((total, bid) => total + bid.total_price, 0))}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Value of currently accepted supplier bids.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-sm leading-6 text-zinc-400">
              GridAi currently reads TradeGrid application state. When the dedicated TradeGrid Supabase project is connected,
              this report can be generated from company-scoped production data and extended with audit-ready document and telemetry history.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, icon, alert = false }: { label: string; value: number; icon: React.ReactNode; alert?: boolean }) => (
  <div className={`rounded-xl border p-4 ${alert ? "border-amber-900/50 bg-amber-950/15" : "border-zinc-900 bg-zinc-950/60"}`}>
    <div className="flex items-center justify-between text-xs text-zinc-500">
      <span>{label}</span>
      <span className={alert ? "text-amber-400" : "text-emerald-400"}>{icon}</span>
    </div>
    <div className={`mt-2 text-2xl font-black ${alert ? "text-amber-400" : "text-zinc-100"}`}>{value}</div>
  </div>
);

const RiskRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-xs">
    <span className="text-zinc-400">{label}</span>
    <span className={value > 0 ? "font-bold text-amber-400" : "font-bold text-emerald-400"}>{value}</span>
  </div>
);

const ActionItem = ({ done, text }: { done: boolean; text: string }) => (
  <div className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
    {done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />}
    <p className="text-xs leading-5 text-zinc-400">{text}</p>
  </div>
);

const ReportStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
    <div className="mt-2 text-lg font-bold text-zinc-200">{value}</div>
  </div>
);
