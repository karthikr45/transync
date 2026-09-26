"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";

import { homeCareApi, ApiError } from "@/lib/api";

import { getTimeZoneName, listTimeZones } from "@/lib/timezone";
import { getCurrentUser } from "@/lib/auth";
import type { AccountUser, ComplianceReportResult } from "@/lib/types.api";

import { DEFAULT_WINDOW_DAYS } from "./model";

export function useFullReportPageModel() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id);
  void id;
  const deviceId = search.get("deviceId");
  const emailHashed = search.get("emailHashed");
  const nameParam = search.get("name") ?? "";
  const tzParam = search.get("tz") ?? undefined;
  const emailParam = search.get("email") ?? undefined;
  return { deviceId, emailHashed, nameParam, tzParam, emailParam };
}

export function useApiReportModel({
  deviceId,
  emailHashed,
  name,
  email,
  initialTz,
}: {
  deviceId: string;
  emailHashed: string;
  name: string;
  email?: string;
  initialTz?: string;
}) {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [timeZoneName, setTimeZoneName] = useState<string>(
    initialTz || (typeof window !== "undefined" ? getTimeZoneName() : "UTC"),
  );
  const [data, setData] = useState<ComplianceReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setAccount(getCurrentUser());
  }, []);
  useEffect(() => {
    const endD = new Date();
    const startD = new Date();
    startD.setDate(endD.getDate() - DEFAULT_WINDOW_DAYS + 1);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    setStart(iso(startD));
    setEnd(iso(endD));
  }, []);
  const load = useCallback(async () => {
    if (!start || !end) return;
    setLoading(true);
    setError(null);
    try {
      const r = await homeCareApi.complianceReport({
        deviceId,
        emailHashed,
        ComplianceStartDate: start,
        ComplianceEndDate: end,
        timeZoneName,
      });
      setData(r);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load compliance report.");
    } finally {
      setLoading(false);
    }
  }, [deviceId, emailHashed, start, end, timeZoneName]);
  useEffect(() => {
    load();
  }, [load]);
  const displayName = data?.HeaderMetrics?.name || name || "(patient)";
  const provider = account?.companyName || account?.institutionName || "";
  return {
    start,
    setStart,
    end,
    setEnd,
    timeZoneName,
    setTimeZoneName,
    data,
    loading,
    error,
    load,
    displayName,
    provider,
  };
}

export function useRequestControlsModel({
  start,
  end,
  timeZoneName,
  onStart,
  onEnd,
  onTzChange,
}: {
  start: string;
  end: string;
  timeZoneName: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onTzChange: (v: string) => void;
}) {
  const tzOptions = useMemo(() => {
    const set = new Set(listTimeZones());
    if (timeZoneName) set.add(timeZoneName);
    return Array.from(set).sort();
  }, [timeZoneName]);
  return { tzOptions };
}
