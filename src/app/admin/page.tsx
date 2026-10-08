"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AdminPortal } from "@/components/AdminPortal";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function AdminPage() {
  const { currentUser, isAuthenticated, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.assign("/login?next=/admin");
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <main className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading admin session…</p>
      </main>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <main className="dark min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-900/40 bg-zinc-950/80 p-6 text-center">
          <ShieldAlert className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-zinc-100">Admin access required</h1>
          <p className="text-sm text-zinc-500 mt-2">This account does not have the TradeGrid platform-admin role.</p>
          <Link href="/sandbox" className="inline-block mt-5">
            <Button variant="outline" className="border-zinc-800">Return to TradeGrid</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <AdminPortal standalone />
    </main>
  );
}
