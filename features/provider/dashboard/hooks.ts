"use client";
import { useEffect, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";

import type { ProviderDashboardResult } from "@/lib/types.api";

export function useProviderDashboardModel() {
  const [data, setData] = useState<ProviderDashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await homeCareApi.providerDashboard());
    } catch (err) {
      setError((err as ApiError).message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const m = data?.metrics;
  return { data, loading, error, load, m };
}
