"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!supabase || !isSupabaseConfigured) {
      setError("Supabase authentication is not configured for this deployment.");
      return;
    }

    setBusy(true);
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setBusy(false);
      setError(loginError.message);
      return;
    }

    try {
      const pendingRaw = localStorage.getItem("tradegrid_pending_onboarding");
      if (pendingRaw && loginData.user) {
        const pending = JSON.parse(pendingRaw);

        const { data: existingProfile } = await supabase
          .from("users")
          .select("id")
          .eq("id", loginData.user.id)
          .maybeSingle();

        if (!existingProfile) {
          const { data: org, error: orgError } = await supabase.from("organizations").insert({
            name: pending.companyName,
            type: pending.role === "buyer" ? "buyer" : pending.role === "supplier" ? "supplier" : "both",
            country: pending.country,
            registration_number: pending.registrationNumber,
            created_by: loginData.user.id,
            region: pending.region,
            industry: pending.industry,
            verification_status: "Pending",
            trust_score: 50
          }).select().single();

          if (orgError) throw orgError;

          const nameParts = String(pending.name || "").trim().split(/\s+/);
          const firstName = nameParts.shift() || pending.name || email;
          const lastName = nameParts.join(" ");

          const { error: profileError } = await supabase.from("users").insert({
            id: loginData.user.id,
            org_id: org.id,
            role: pending.role,
            email: pending.email || email,
            first_name: firstName,
            last_name: lastName,
            phone: pending.phone || ""
          });

          if (profileError) throw profileError;
        }

        localStorage.removeItem("tradegrid_pending_onboarding");
      }
    } catch (profileError: any) {
      setBusy(false);
      setError(profileError.message || "Signed in, but company setup could not be completed.");
      return;
    }

    setBusy(false);
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.assign(next === "/admin" ? "/admin" : "/sandbox");
  };

  return (
    <main className="dark min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-zinc-900 bg-zinc-950/80">
        <CardHeader className="space-y-3">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-200 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to TradeGrid Africa
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-zinc-100">Company Sign In</CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Access your company RFQs, bids, and shipment workflow.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {busy ? "Signing in…" : "Sign In"}
            </Button>
            <p className="text-[11px] text-zinc-500 text-center">
              New company? <Link href="/onboarding" className="text-emerald-400 hover:text-emerald-300">Create an account</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
