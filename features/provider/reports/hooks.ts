"use client";
import { useCallback, useEffect, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";
import type { ComplianceWindow, ProviderReportsResult } from "@/lib/types.api";
import { PAGE_SIZE, csvEscape } from "./model";

export function useGroupReportsModel() {
  const [window, updateWindow] = useState<ComplianceWindow>("30d");
  const [offset, setOffset] = useState(0);
  const setWindow = (value: ComplianceWindow) => {
    updateWindow(value);
    setOffset(0);
  };
  const [data, setData] = useState<ProviderReportsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(
    async (w = window, o = offset) => {
      setLoading(true);
      setError(null);
      try {
        setData(await homeCareApi.providerReports({ window: w, limit: PAGE_SIZE, offset: o }));
      } catch (err) {
        setError((err as ApiError).message || "Could not load report.");
      } finally {
        setLoading(false);
      }
    },
    [window, offset],
  );
  useEffect(() => {
    void load();
  }, [load]);
  function exportCsv() {
    if (!data?.rows?.length) return;
    const header = [
      "patientId",
      "name",
      "deviceId",
      "totalDays",
      "therapyHours",
      "sessionsOver4h",
      "ahi",
      "pctCompliant",
      "compliant",
    ];
    const rows = data.rows.map((r) =>
      [
        r.patientId,
        r.name,
        r.deviceId,
        r.totalDays,
        r.therapyHours,
        r.sessionsOver4h,
        r.ahi.toFixed(2),
        r.pctCompliant,
        r.compliant ? "Yes" : "No",
      ]
        .map(csvEscape)
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-${data.window}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  return { window, setWindow, offset, setOffset, data, loading, error, load, exportCsv };
}
