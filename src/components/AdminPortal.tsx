"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, AlertTriangle, Ban, Building2, CheckCircle2, CircleDollarSign,
  FileWarning, HeartPulse, RefreshCw, Search, ShieldCheck, ShieldOff,
  Truck, UserCheck, Users, XCircle
} from "lucide-react";
import { useApp, Company, User } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminCase = {
  id: string;
  case_type: "dispute" | "fraud" | "compliance" | "payment" | "shipment" | "account" | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_review" | "resolved" | "dismissed";
  title: string;
  description: string;
  target_type: "user" | "organization" | "rfq" | "bid" | "shipment" | "payment" | "export" | "platform";
  target_id: string;
  resolution_notes: string;
  created_at: string;
  resolved_at?: string | null;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export function AdminPortal({ standalone = false }: { standalone?: boolean }) {
  const {
    currentUser, users, companies, rfqs, bids, shipments, payments, exports,
    shipmentDocuments, telemetryHistory, eventLogs, refreshLiveData, signOut, triggerEvent
  } = useApp();

  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [caseLoading, setCaseLoading] = useState(false);

  const loadCases = useCallback(async () => {
    if (!supabase || currentUser?.role !== "admin") return;
    setCaseLoading(true);
    const { data, error: caseError } = await supabase
      .from("admin_cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (caseError) setError(caseError.message);
    else setCases((data || []) as AdminCase[]);
    setCaseLoading(false);
  }, [currentUser?.role]);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  const refreshAll = async () => {
    setError("");
    await Promise.all([refreshLiveData(), loadCases()]);
  };

  const metrics = useMemo(() => {
    const acceptedValue = bids.filter((bid) => bid.status === "accepted")
      .reduce((sum, bid) => sum + bid.total_price, 0);
    const pendingPayments = payments.filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const complianceExceptions = exports.filter((item) =>
      item.status === "rejected" || item.status === "incomplete" || item.readiness_score < 70
    ).length;
    return {
      organizations: companies.length,
      pendingOrganizations: companies.filter((company) => company.verification_status === "Pending").length,
      users: users.length,
      suspendedUsers: users.filter((user) => user.account_status === "suspended").length,
      reviewUsers: users.filter((user) => user.account_status === "review").length,
      openRfqs: rfqs.filter((rfq) => rfq.status === "open").length,
      shipmentsInTransit: shipments.filter((shipment) => shipment.status === "transit").length,
      pendingPayments,
      acceptedValue,
      openCases: cases.filter((item) => item.status === "open" || item.status === "in_review").length,
      complianceExceptions,
    };
  }, [companies, users, rfqs, shipments, payments, bids, cases, exports]);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((company) =>
      [company.company_name, company.country, company.industry, company.registration_number]
        .some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [companies, search]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [user.name, user.email, user.role, user.country, user.account_status]
        .some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  const runAction = async (key: string, action: () => Promise<{ error: any }>, event: string, payload: Record<string, unknown>) => {
    setBusyKey(key);
    setError("");
    const result = await action();
    if (result.error) {
      setError(result.error.message || "Admin action failed.");
    } else {
      triggerEvent(event, payload);
      await refreshLiveData();
    }
    setBusyKey(null);
  };

  const reviewOrganization = async (company: Company, status: "Pending" | "Verified" | "Rejected") => {
    if (!supabase) return;
    const trustScore = status === "Verified"
      ? Math.max(company.trust_score, 70)
      : status === "Rejected"
        ? Math.min(company.trust_score, 30)
        : company.trust_score;
    await runAction(
      `org:${company.id}`,
      async () => {
        const { error } = await supabase.rpc("admin_review_organization", {
          p_org_id: company.id,
          p_status: status,
          p_trust_score: trustScore,
        });
        return { error };
      },
      "admin.organization_reviewed",
      { organization_id: company.id, status, trust_score: trustScore }
    );
  };

  const setUserStatus = async (user: User, status: "active" | "review" | "suspended") => {
    if (!supabase || user.id === currentUser?.id) return;
    await runAction(
      `user:${user.id}`,
      async () => {
        const { error } = await supabase.from("users").update({ account_status: status }).eq("id", user.id);
        return { error };
      },
      "admin.user_status_changed",
      { user_id: user.id, email: user.email, status }
    );
  };

  const openCase = async (
    targetType: AdminCase["target_type"],
    targetId: string,
    title: string,
    caseType: AdminCase["case_type"] = "other",
    severity: AdminCase["severity"] = "medium"
  ) => {
    if (!supabase || !currentUser) return;
    setBusyKey(`case:${targetType}:${targetId}`);
    setError("");
    const { error: insertError } = await supabase.from("admin_cases").insert({
      case_type: caseType,
      severity,
      status: "open",
      title,
      description: `Opened by platform admin for ${targetType} ${targetId}.`,
      target_type: targetType,
      target_id: targetId,
      created_by: currentUser.id,
      assigned_to: currentUser.id,
    });
    if (insertError) setError(insertError.message);
    else {
      triggerEvent("admin.case_opened", { target_type: targetType, target_id: targetId, title, case_type: caseType, severity });
      await loadCases();
    }
    setBusyKey(null);
  };

  const updateCase = async (item: AdminCase, status: AdminCase["status"]) => {
    if (!supabase) return;
    setBusyKey(`case:${item.id}`);
    setError("");
    const resolved = status === "resolved" || status === "dismissed";
    const { error: updateError } = await supabase.from("admin_cases").update({
      status,
      resolution_notes: resolved ? `${status === "resolved" ? "Resolved" : "Dismissed"} by platform administrator.` : item.resolution_notes,
      resolved_at: resolved ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("id", item.id);
    if (updateError) setError(updateError.message);
    else {
      triggerEvent("admin.case_status_changed", { case_id: item.id, status, target_type: item.target_type, target_id: item.target_id });
      await loadCases();
    }
    setBusyKey(null);
  };

  const setRfqStatus = async (id: string, status: "open" | "closed" | "awarded") => {
    if (!supabase) return;
    await runAction(
      `rfq:${id}`,
      async () => {
        const { error } = await supabase.from("rfqs").update({ status }).eq("id", id);
        return { error };
      },
      "admin.rfq_status_changed",
      { rfq_id: id, status }
    );
  };

  const setShipmentStatus = async (id: string, status: "pending" | "transit" | "delivered") => {
    if (!supabase) return;
    if (status === "delivered" && typeof window !== "undefined" && !window.confirm("Mark this shipment delivered? This can trigger downstream settlement/compliance automation.")) return;
    await runAction(
      `shipment:${id}`,
      async () => {
        const { error } = await supabase.from("shipments").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
        return { error };
      },
      "admin.shipment_status_changed",
      { shipment_id: id, status }
    );
  };

  const setPaymentStatus = async (id: string, status: "pending" | "released" | "refunded") => {
    if (!supabase) return;
    if (status !== "pending" && typeof window !== "undefined" && !window.confirm(`Set payment status to ${status}?`)) return;
    await runAction(
      `payment:${id}`,
      async () => {
        const { error } = await supabase.from("payments").update({ status }).eq("id", id);
        return { error };
      },
      "admin.payment_status_changed",
      { payment_id: id, status }
    );
  };

  const setExportStatus = async (id: string, status: "incomplete" | "pending_approval" | "approved" | "rejected") => {
    if (!supabase) return;
    await runAction(
      `export:${id}`,
      async () => {
        const { error } = await supabase.from("trade_exports").update({ status }).eq("id", id);
        return { error };
      },
      "admin.export_status_changed",
      { export_id: id, status }
    );
  };

  const referenceTime = Math.max(
    0,
    ...shipments.map((shipment) => new Date(shipment.created_at).getTime()),
    ...eventLogs.map((event) => new Date(event.created_at).getTime())
  );
  const staleShipments = shipments.filter((shipment) =>
    shipment.status === "transit"
    && referenceTime > 0
    && referenceTime - new Date(shipment.created_at).getTime() > 3 * 24 * 60 * 60 * 1000
  );
  const recentEvents = eventLogs.filter((event) =>
    referenceTime > 0
    && referenceTime - new Date(event.created_at).getTime() < 24 * 60 * 60 * 1000
  );
  const complianceExceptions = exports.filter((item) =>
    item.status === "rejected" || item.status === "incomplete" || item.readiness_score < 70
  );

  return (
    <div className={standalone ? "max-w-7xl mx-auto px-4 py-6 space-y-6" : "space-y-6"}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-zinc-100">TradeGrid Admin Command Centre</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Platform control, access management, disputes, operational intervention, compliance and security oversight.
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">Signed in as {currentUser?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800" onClick={() => void refreshAll()}>
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
        <MetricCard label="Organizations" value={metrics.organizations.toString()} detail={`${metrics.pendingOrganizations} pending verification`} icon={<Building2 className="h-4 w-4" />} />
        <MetricCard label="User controls" value={metrics.users.toString()} detail={`${metrics.suspendedUsers} suspended · ${metrics.reviewUsers} review`} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Open cases" value={metrics.openCases.toString()} detail={`${metrics.complianceExceptions} compliance exceptions`} icon={<FileWarning className="h-4 w-4" />} />
        <MetricCard label="Trade value" value={money(metrics.acceptedValue)} detail={`${metrics.shipmentsInTransit} in transit · ${money(metrics.pendingPayments)} pending`} icon={<Activity className="h-4 w-4" />} />
      </div>

      <Tabs defaultValue="users">
        <TabsList className="bg-zinc-900 border border-zinc-800 w-full justify-start overflow-x-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="cases">Cases ({metrics.openCases})</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <CardTitle className="text-sm">Platform user management</CardTitle>
                <div className="relative md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                  <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search user, email, role or status" className="pl-9 bg-zinc-950 border-zinc-800" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-100">{user.name}</p>
                      <Badge variant="outline" className="border-zinc-800 capitalize">{user.role}</Badge>
                      <AccountStatusBadge status={user.account_status || "active"} />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{user.email} · {user.country}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.id === currentUser?.id ? (
                      <Badge variant="outline" className="border-emerald-900 text-emerald-400">Current admin</Badge>
                    ) : (
                      <>
                        <Button size="sm" disabled={busyKey === `user:${user.id}`} onClick={() => void setUserStatus(user, "active")} className="bg-emerald-700 hover:bg-emerald-600">
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Active
                        </Button>
                        <Button size="sm" disabled={busyKey === `user:${user.id}`} onClick={() => void setUserStatus(user, "review")} variant="outline" className="border-amber-900 text-amber-400">Review</Button>
                        <Button size="sm" disabled={busyKey === `user:${user.id}`} onClick={() => void setUserStatus(user, "suspended")} variant="outline" className="border-red-900 text-red-400">
                          <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
                        </Button>
                        <Button size="sm" disabled={busyKey === `case:user:${user.id}`} onClick={() => void openCase("user", user.id, `Account review: ${user.email}`, "account", "medium")} variant="outline" className="border-zinc-800">Open case</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="text-xs text-zinc-500 py-8 text-center">No users found.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader><CardTitle className="text-sm">Disputes & intervention cases</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {caseLoading ? <p className="text-xs text-zinc-500">Loading cases…</p> : cases.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-900 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                        <Badge variant="outline" className="border-zinc-800 capitalize">{item.case_type}</Badge>
                        <SeverityBadge severity={item.severity} />
                        <Badge variant="outline" className="border-zinc-800 capitalize">{item.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">{item.description}</p>
                      <p className="text-[10px] text-zinc-600 mt-2">{item.target_type} · {item.target_id} · {new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" disabled={busyKey === `case:${item.id}`} onClick={() => void updateCase(item, "in_review")} variant="outline" className="border-amber-900 text-amber-400">Investigate</Button>
                      <Button size="sm" disabled={busyKey === `case:${item.id}`} onClick={() => void updateCase(item, "resolved")} className="bg-emerald-700 hover:bg-emerald-600">Resolve</Button>
                      <Button size="sm" disabled={busyKey === `case:${item.id}`} onClick={() => void updateCase(item, "dismissed")} variant="outline" className="border-zinc-800">Dismiss</Button>
                    </div>
                  </div>
                </div>
              ))}
              {!caseLoading && cases.length === 0 && <p className="text-xs text-zinc-500 py-8 text-center">No admin cases yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-4 space-y-4">
          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader><CardTitle className="text-sm">RFQ intervention</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {rfqs.slice(0, 20).map((rfq) => (
                <div key={rfq.id} className="border border-zinc-900 rounded-lg p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{rfq.title}</p>
                    <p className="text-[11px] text-zinc-600">{rfq.industry} · {rfq.delivery_location} · {rfq.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={busyKey === `rfq:${rfq.id}`} onClick={() => void setRfqStatus(rfq.id, "open")} variant="outline" className="border-emerald-900 text-emerald-400">Open</Button>
                    <Button size="sm" disabled={busyKey === `rfq:${rfq.id}`} onClick={() => void setRfqStatus(rfq.id, "closed")} variant="outline" className="border-red-900 text-red-400">Close</Button>
                    <Button size="sm" disabled={busyKey === `case:rfq:${rfq.id}`} onClick={() => void openCase("rfq", rfq.id, `RFQ intervention: ${rfq.title}`, "dispute", "medium")} variant="outline" className="border-zinc-800">Case</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid xl:grid-cols-2 gap-4">
            <Card className="border-zinc-900 bg-zinc-950/60">
              <CardHeader><CardTitle className="text-sm">Shipment intervention</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {shipments.slice(0, 20).map((shipment) => (
                  <div key={shipment.id} className="border border-zinc-900 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-zinc-200">{shipment.route_from} → {shipment.route_to}</p>
                        <p className="text-[11px] text-zinc-600">{shipment.transport_mode} · {shipment.status} · {shipment.id.slice(0, 8)}</p>
                      </div>
                      <Badge variant="outline" className="border-zinc-800 capitalize">{shipment.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" disabled={busyKey === `shipment:${shipment.id}`} onClick={() => void setShipmentStatus(shipment.id, "pending")} variant="outline" className="border-zinc-800">Pending</Button>
                      <Button size="sm" disabled={busyKey === `shipment:${shipment.id}`} onClick={() => void setShipmentStatus(shipment.id, "transit")} variant="outline" className="border-blue-900 text-blue-400">Transit</Button>
                      <Button size="sm" disabled={busyKey === `shipment:${shipment.id}`} onClick={() => void setShipmentStatus(shipment.id, "delivered")} variant="outline" className="border-emerald-900 text-emerald-400">Delivered</Button>
                      <Button size="sm" disabled={busyKey === `case:shipment:${shipment.id}`} onClick={() => void openCase("shipment", shipment.id, `Shipment intervention ${shipment.id.slice(0, 8)}`, "shipment", "high")} variant="outline" className="border-zinc-800">Case</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-zinc-900 bg-zinc-950/60">
              <CardHeader><CardTitle className="text-sm">Payment control</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {payments.slice(0, 20).map((payment) => (
                  <div key={payment.id} className="border border-zinc-900 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-zinc-200">{money(payment.amount)}</p>
                        <p className="text-[11px] text-zinc-600">Bid {payment.bid_id.slice(0, 8)} · {payment.status}</p>
                      </div>
                      <Badge variant="outline" className="border-zinc-800 capitalize">{payment.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" disabled={busyKey === `payment:${payment.id}`} onClick={() => void setPaymentStatus(payment.id, "pending")} variant="outline" className="border-zinc-800">Hold</Button>
                      <Button size="sm" disabled={busyKey === `payment:${payment.id}`} onClick={() => void setPaymentStatus(payment.id, "released")} variant="outline" className="border-emerald-900 text-emerald-400">Release</Button>
                      <Button size="sm" disabled={busyKey === `payment:${payment.id}`} onClick={() => void setPaymentStatus(payment.id, "refunded")} variant="outline" className="border-red-900 text-red-400">Refund</Button>
                      <Button size="sm" disabled={busyKey === `case:payment:${payment.id}`} onClick={() => void openCase("payment", payment.id, `Payment dispute ${payment.id.slice(0, 8)}`, "payment", "high")} variant="outline" className="border-zinc-800">Case</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader><CardTitle className="text-sm">Export & compliance exceptions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {exports.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-900 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="text-sm font-semibold text-zinc-100">{item.country}</p>
                      <Badge variant="outline" className="border-zinc-800 capitalize">{item.status.replace("_", " ")}</Badge>
                      <Badge variant="outline" className={item.readiness_score < 70 ? "border-red-900 text-red-400" : "border-emerald-900 text-emerald-400"}>
                        {item.readiness_score}% ready
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {item.missing_requirements.length ? `Missing: ${item.missing_requirements.join(", ")}` : "No recorded missing requirements"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={busyKey === `export:${item.id}`} onClick={() => void setExportStatus(item.id, "pending_approval")} variant="outline" className="border-amber-900 text-amber-400">Review</Button>
                    <Button size="sm" disabled={busyKey === `export:${item.id}`} onClick={() => void setExportStatus(item.id, "approved")} variant="outline" className="border-emerald-900 text-emerald-400">Approve</Button>
                    <Button size="sm" disabled={busyKey === `export:${item.id}`} onClick={() => void setExportStatus(item.id, "rejected")} variant="outline" className="border-red-900 text-red-400">Reject</Button>
                    <Button size="sm" disabled={busyKey === `case:export:${item.id}`} onClick={() => void openCase("export", item.id, `Compliance review ${item.id.slice(0, 8)}`, "compliance", item.readiness_score < 50 ? "high" : "medium")} variant="outline" className="border-zinc-800">Case</Button>
                  </div>
                </div>
              ))}
              {exports.length === 0 && <p className="text-xs text-zinc-500 py-8 text-center">No export records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="mt-4">
          <Card className="border-zinc-900 bg-zinc-950/60">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <CardTitle className="text-sm">Company verification queue</CardTitle>
                <div className="relative md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company, country or registration" className="pl-9 bg-zinc-950 border-zinc-800" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-zinc-100">{company.company_name}</p>
                      <StatusBadge status={company.verification_status} />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{company.industry} · {company.country}{company.region ? ` · ${company.region}` : ""}</p>
                    <p className="text-[11px] text-zinc-600 mt-1">Registration: {company.registration_number || "Not supplied"} · Trust: {company.trust_score}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={busyKey === `org:${company.id}`} onClick={() => void reviewOrganization(company, "Verified")} className="bg-emerald-700 hover:bg-emerald-600"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify</Button>
                    <Button size="sm" disabled={busyKey === `org:${company.id}`} onClick={() => void reviewOrganization(company, "Pending")} variant="outline" className="border-zinc-800">Pending</Button>
                    <Button size="sm" disabled={busyKey === `org:${company.id}`} onClick={() => void reviewOrganization(company, "Rejected")} variant="outline" className="border-red-900 text-red-400"><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button>
                    <Button size="sm" disabled={busyKey === `case:organization:${company.id}`} onClick={() => void openCase("organization", company.id, `Organization review: ${company.company_name}`, "compliance", "medium")} variant="outline" className="border-zinc-800">Case</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-zinc-900 bg-zinc-950/60">
              <CardHeader><CardTitle className="text-sm">Platform health</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <HealthRow label="Supabase client" ok={Boolean(supabase)} detail={supabase ? "Connected/configured" : "Not configured"} />
                <HealthRow label="Admin authorization" ok={currentUser?.role === "admin" && currentUser.account_status !== "suspended"} detail={currentUser?.role === "admin" ? "Platform admin active" : "Admin role unavailable"} />
                <HealthRow label="Recent platform events" ok={recentEvents.length > 0 || eventLogs.length === 0} detail={`${recentEvents.length} events in last 24h`} />
                <HealthRow label="Telemetry pipeline" ok={telemetryHistory.length > 0 || shipments.length === 0} detail={`${telemetryHistory.length} samples loaded`} />
                <HealthRow label="Stale in-transit shipments" ok={staleShipments.length === 0} detail={`${staleShipments.length} older than 3 days`} />
                <HealthRow label="Compliance exceptions" ok={complianceExceptions.length === 0} detail={`${complianceExceptions.length} need review`} />
              </CardContent>
            </Card>

            <Card className="border-zinc-900 bg-zinc-950/60">
              <CardHeader><CardTitle className="text-sm">Control summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs">
                <SummaryRow label="Pending settlement" value={money(metrics.pendingPayments)} icon={<CircleDollarSign className="h-4 w-4" />} />
                <SummaryRow label="Open cases" value={metrics.openCases.toString()} icon={<FileWarning className="h-4 w-4" />} />
                <SummaryRow label="Suspended users" value={metrics.suspendedUsers.toString()} icon={<ShieldOff className="h-4 w-4" />} />
                <SummaryRow label="In-transit shipments" value={metrics.shipmentsInTransit.toString()} icon={<Truck className="h-4 w-4" />} />
                <SummaryRow label="Shipment documents" value={shipmentDocuments.length.toString()} icon={<Activity className="h-4 w-4" />} />
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

function HealthRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="rounded-lg border border-zinc-900 p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {ok ? <HeartPulse className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
        <span className="text-xs text-zinc-300">{label}</span>
      </div>
      <span className={`text-[11px] ${ok ? "text-emerald-400" : "text-amber-400"}`}>{detail}</span>
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

function AccountStatusBadge({ status }: { status: "active" | "review" | "suspended" }) {
  const cls = status === "active"
    ? "border-emerald-900 text-emerald-400"
    : status === "suspended"
      ? "border-red-900 text-red-400"
      : "border-amber-900 text-amber-400";
  return <Badge variant="outline" className={`${cls} capitalize`}>{status}</Badge>;
}

function SeverityBadge({ severity }: { severity: AdminCase["severity"] }) {
  const cls = severity === "critical" || severity === "high"
    ? "border-red-900 text-red-400"
    : severity === "medium"
      ? "border-amber-900 text-amber-400"
      : "border-zinc-800 text-zinc-400";
  return <Badge variant="outline" className={`${cls} capitalize`}>{severity}</Badge>;
}
