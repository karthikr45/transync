"use client";

import { useEffect, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";

import type {
  AdminActivityEntry,
  AdminDashboardResult,
  AccountUser,
  MarketsResponse,
} from "@/lib/types.api";

export function useSuperAdminDashboardModel() {
  const [metrics, setMetrics] = useState<AdminDashboardResult | null>(null);
  const [pending, setPending] = useState<AccountUser[]>([]);
  const [activity, setActivity] = useState<AdminActivityEntry[]>([]);
  const [markets, setMarkets] = useState<MarketsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [m, p, a, mk] = await Promise.allSettled([
        homeCareApi.adminDashboard(),
        homeCareApi.listPending(),
        homeCareApi.adminRecentActivity({ limit: 8 }),
        homeCareApi.markets(),
      ]);
      if (m.status === "fulfilled") setMetrics(m.value);
      else throw m.reason;
      if (p.status === "fulfilled") setPending(p.value);
      if (a.status === "fulfilled") setActivity(a.value.activity);
      if (mk.status === "fulfilled") setMarkets(mk.value);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return { metrics, pending, activity, markets, loading, error, load };
}
