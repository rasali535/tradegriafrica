"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, Building2, CheckCircle2, DollarSign, FileText, RefreshCw,
  Search, ShieldCheck, Truck, Users, XCircle
} from "lucide-react";
import { useApp, Company } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export function AdminPortal({ standalone = false }: { standalone?: boolean }) {
  const {
    currentUser, users, companies, rfqs, bids, shipments, payments, exports,
    shipmentDocuments, eventLogs, refreshLiveData, signOut
  } = useApp();

  const [search, setSearch] = useState("");
  const [busyOrg, setBusyOrg] = useState<string | null>(null);
  const [error, setError] = useState("");

  const metrics = useMemo(() => {
    const acceptedValue = bids.filter((bid) => bid.status === "accepted")
      .reduce((sum, bid) => sum + bid.total_price, 0);
    return {
      organizations: companies.length,
      pendingOrganizations: companies.filter((company) => company.verification_status === "Pending").length,
      users: users.length,
      openRfqs: rfqs.filter((rfq) => rfq.status === "open").length,
      shipmentsInTransit: shipments.filter((shipment) => shipment.status === "transit").length,
      pendingPayments: payments.filter((payment) => payment.status === "pending")
        .reduce((sum, payment) => sum + payment.amount, 0),
      acceptedValue,
    };
  }, [companies, users, rfqs, shipments, payments, bids]);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((company) =>
      [company.company_name, company.country, company.industry, company.registration_number]
        .some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [companies, search]);

  const reviewOrganization = async (company: Company, status: "Pending" | "Verified" | "Rejected") => {
    if (!supabase) return;
    setBusyOrg(company.id);
    setError("");
    const trustScore = status === "Verified"
      ? Math.max(company.trust_score, 70)
      : status === "Rejected"
        ? Math.min(company.trust_score, 30)
        : company.trust_score;

    const { error: reviewError } = await supabase.rpc("admin_review_organization", {
      p_org_id: company.id,
      p_status: status,
      p_trust_score: trustScore,
    });

    if (reviewError) {
      setError(reviewError.message);
    } else {
      await refreshLiveData();
    }
    setBusyOrg(null);
  };

  return (
    <div className={standalone ? "max-w-7xl mx-auto px-4 py-6 space-y-6" : "space-y-6"}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-zinc-100">TradeGrid Admin Command Centre</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Live platform oversight, company verification, trade operations and audit visibility.
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">Signed in as {currentUser?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800" onClick={() => void refreshLiveData()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          {standalone && (
            <>
              <Link href="/sandbox"><Button variant="outline" className="border-zinc-800">TradeGrid</Button></Link>
              <Button variant="outline" className="border-zinc-800" onClick={() => void signOut()}>Sign out</Button>
            </>
          )}
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-300">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Organizations" value={metrics.organizations.toString()} detail={`${metrics.pendingOrganizations} pending review`} icon={<Building2 className="h-4 w-4" />} />
        <MetricCard label="Platform users" value={metrics.users.toString()} detail="RLS-visible admin directory" icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Open RFQs" value={metrics.openRfqs.toString()} detail={`${bids.length} total bids`} icon={<FileText className="h-4 w-4" />} />
        <MetricCard label="Trade value" value={money(metrics.acceptedValue)} detail={`${metrics.shipmentsInTransit} shipments in transit`} icon={<Activity className="h-4 w-4" />} />
      </div>

      <Tabs defaultValue="organizations">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="operations">Trade Operations</TabsTrigger>
          <TabsTrigger value="audit">Audit Events</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="mt-4">
          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader className="gap-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <CardTitle className="text-sm">Company verification queue</CardTitle>
                <div className="relative md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company, country or registration" className="pl-9 bg-zinc-950 border-zinc-800" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredCompanies.length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">No organizations found.</p>
              ) : filteredCompanies.map((company) => (
                <div key={company.id} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-zinc-100">{company.company_name}</p>
                      <StatusBadge status={company.verification_status} />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {company.industry} · {company.country}{company.region ? ` · ${company.region}` : ""}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Registration: {company.registration_number || "Not supplied"} · Trust score: {company.trust_score}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={busyOrg === company.id} onClick={() => void reviewOrganization(company, "Verified")} className="bg-emerald-700 hover:bg-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify
                    </Button>
                    <Button size="sm" disabled={busyOrg === company.id} onClick={() => void reviewOrganization(company, "Pending")} variant="outline" className="border-zinc-800">
                      Pending
                    </Button>
                    <Button size="sm" disabled={busyOrg === company.id} onClick={() => void reviewOrganization(company, "Rejected")} variant="outline" className="border-red-900/60 text-red-400">
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-zinc-900 bg-zinc-950/60">
              <CardHeader><CardTitle className="text-sm">Shipment operations</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {shipments.slice(0, 12).map((shipment) => (
                  <div key={shipment.id} className="border border-zinc-900 rounded-lg p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-zinc-200">{shipment.route_from} → {shipment.route_to}</p>
                      <p className="text-[11px] text-zinc-600">{shipment.transport_mode} · {shipment.id.slice(0, 8)}</p>
                    </div>
                    <Badge variant="outline" className="border-zinc-800 capitalize">{shipment.status}</Badge>
                  </div>
                ))}
                {shipments.length === 0 && <p className="text-xs text-zinc-500">No live shipments yet.</p>}
              </CardContent>
            </Card>

            <Card className="border-zinc-900 bg-zinc-950/60">
              <CardHeader><CardTitle className="text-sm">Settlement & compliance</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs">
                <SummaryRow label="Pending settlement" value={money(metrics.pendingPayments)} icon={<DollarSign className="h-4 w-4" />} />
                <SummaryRow label="Export records" value={exports.length.toString()} icon={<FileText className="h-4 w-4" />} />
                <SummaryRow label="Shipment documents" value={shipmentDocuments.length.toString()} icon={<FileText className="h-4 w-4" />} />
                <SummaryRow label="In-transit shipments" value={metrics.shipmentsInTransit.toString()} icon={<Truck className="h-4 w-4" />} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader><CardTitle className="text-sm">Platform audit events</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {eventLogs.slice(0, 100).map((event) => (
                <div key={event.id} className="border border-zinc-900 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-[11px] text-emerald-400">{event.event}</code>
                    <span className="text-[10px] text-zinc-600">{new Date(event.created_at).toLocaleString()}</span>
                  </div>
                  <pre className="text-[10px] text-zinc-500 mt-2 whitespace-pre-wrap break-all">{JSON.stringify(event.payload, null, 2)}</pre>
                </div>
              ))}
              {eventLogs.length === 0 && <p className="text-xs text-zinc-500">No audit events recorded yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <Card className="border-zinc-900 bg-zinc-950/60">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</CardTitle>
        <span className="text-emerald-500">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-zinc-100">{value}</div>
        <p className="text-[11px] text-zinc-600 mt-1">{detail}</p>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-900 p-3 flex items-center justify-between">
      <span className="flex items-center gap-2 text-zinc-400">{icon}{label}</span>
      <strong className="text-zinc-100">{value}</strong>
    </div>
  );
}

function StatusBadge({ status }: { status: Company["verification_status"] }) {
  const cls = status === "Verified"
    ? "border-emerald-900 text-emerald-400"
    : status === "Rejected"
      ? "border-red-900 text-red-400"
      : "border-amber-900 text-amber-400";
  return <Badge variant="outline" className={cls}>{status}</Badge>;
}
