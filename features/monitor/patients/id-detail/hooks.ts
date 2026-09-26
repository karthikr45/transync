"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";

import { fromComplianceReportResult } from "@/lib/report-vm";
import { formatDate } from "@/lib/format";
import type { ComplianceReportResult } from "@/lib/types.api";

import { RANGE_TO_DAYS } from "./model";

export function useMonitorPatientDetailModel() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id);
  const deviceId = search.get("deviceId");
  const emailHashed = search.get("emailHashed");
  const name = search.get("name") ?? "";
  const email = search.get("email") ?? undefined;
  const tz = search.get("tz") ?? undefined;
  const apiMode = !!(deviceId && emailHashed);
  return { deviceId, emailHashed, name, email, tz, apiMode };
}

export function useApiReportModel({
  deviceId,
  emailHashed,
  name,
  email,
  tz,
}: {
  deviceId: string;
  emailHashed: string;
  name: string;
  email?: string;
  tz?: string;
}) {
  const [rangeLabel, setRangeLabel] = useState("90 Days");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState<ComplianceReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const applyPreset = useCallback((label: string) => {
    const days = RANGE_TO_DAYS[label] ?? 90;
    const endD = new Date();
    const startD = new Date();
    startD.setDate(endD.getDate() - days + 1);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    setRangeLabel(label);
    setStart(iso(startD));
    setEnd(iso(endD));
  }, []);
  useEffect(() => {
    applyPreset("90 Days");
  }, [applyPreset]);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await homeCareApi.complianceReport({
        deviceId,
        emailHashed,
        ComplianceStartDate: start || undefined,
        ComplianceEndDate: end || undefined,
        timeZoneName: tz,
      });
      setData(r);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load compliance report.");
    } finally {
      setLoading(false);
    }
  }, [deviceId, emailHashed, start, end, tz]);
  useEffect(() => {
    if (start && end) load();
  }, [load, start, end]);
  const days = RANGE_TO_DAYS[rangeLabel];
  const datesOfReport = start && end ? `${formatDate(start)} to ${formatDate(end)}` : undefined;
  const vm = data
    ? fromComplianceReportResult(data, {
        name,
        email,
        deviceSerial: deviceId,
        datesOfReportOverride: datesOfReport,
        totalDaysOverride: days,
      })
    : null;
  return { rangeLabel, start, setStart, end, setEnd, loading, error, applyPreset, load, vm };
}
