"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";
import type { ProviderWorklistResult, WorklistCategory, WorklistItem } from "@/lib/types.api";
import { PAGE_SIZE, CategoryMeta } from "./model";

export function useProviderWorklistModel() {
  const [data, setData] = useState<ProviderWorklistResult | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  function toggle(id: string) {
    setDone((d) => {
      const n = new Set(d);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  const load = useCallback(
    async (nextOffset = offset) => {
      setLoading(true);
      setError(null);
      try {
        setData(await homeCareApi.providerWorklist({ limit: PAGE_SIZE, offset: nextOffset }));
      } catch (err) {
        setError((err as ApiError).message || "Could not load worklist.");
      } finally {
        setLoading(false);
      }
    },
    [offset],
  );
  useEffect(() => {
    void load();
  }, [load]);
  const grouped = useMemo(() => {
    const map: Partial<Record<WorklistCategory, WorklistItem[]>> = {};
    for (const item of data?.items ?? []) {
      (map[item.category] ??= []).push(item);
    }
    return map;
  }, [data]);
  const openCount = (data?.items?.length ?? 0) - done.size;
  function itemKey(item: WorklistItem, idx: number) {
    return `${item.category}-${item.patientName}-${idx}`;
  }
  const toneCls = (t: CategoryMeta["tone"]) =>
    t === "red"
      ? "text-red-600 bg-red-50"
      : t === "amber"
        ? "text-amber-600 bg-amber-50"
        : "text-brand-600 bg-brand-50";
  return {
    data,
    offset,
    setOffset,
    loading,
    error,
    done,
    toggle,
    load,
    grouped,
    openCount,
    itemKey,
    toneCls,
  };
}
