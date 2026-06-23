"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import MobileReport from "@/components/MobileReport";
import { homeCareApi, ApiError } from "@/lib/api";
import { fromComplianceReportResult } from "@/lib/report-vm";
import { formatDate } from "@/lib/format";
import { getTimeZoneName } from "@/lib/timezone";
import { getCurrentUser } from "@/lib/auth";
import type { AccountUser, ComplianceReportResult } from "@/lib/types.api";
import { ArrowLeft, Printer, AlertTriangle, RefreshCw } from "lucide-react";

const RANGE_TO_DAYS: Record<string, number> = {
  "7 Days": 7, "30 Days": 30, "90 Days": 90, "180 Days": 180, "365 Days": 365,
};

export default function FullReportPage() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id);
  void id;

  const deviceId = search.get("deviceId");
  const emailHashed = search.get("emailHashed");
  const nameParam = search.get("name") ?? "";
  const tzParam = search.get("tz") ?? undefined;
  const emailParam = search.get("email") ?? undefined;

  if (!deviceId || !emailHashed) {
    return (
      <>
        <Link href="/provider/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> Back to patients
        </Link>
        <PageHeader title="Report" />
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          Missing <code className="font-mono text-xs">deviceId</code> or <code className="font-mono text-xs">emailHashed</code> in the URL.
          Open this report from the Patients list.
        </div>
      </>
    );
  }

  return (
    <ApiReport
      deviceId={deviceId}
      emailHashed={emailHashed}
      name={nameParam}
      email={emailParam}
      tz={tzParam}
    />
  );
}

function ApiReport({
  deviceId, emailHashed, name, email, tz,
}: { deviceId: string; emailHashed: string; name: string; email?: string; tz?: string }) {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [rangeLabel, setRangeLabel] = useState("90 Days");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState<ComplianceReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setAccount(getCurrentUser()); }, []);

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

  useEffect(() => { applyPreset("90 Days"); }, [applyPreset]);

  // Resolve timezone in this order: ?tz query → provider's registered
  // timeZone → browser's current zone. Matches what the mobile app's
  // payload-builder does for the home-care console.
  const timeZoneName = tz || account?.timeZone || getTimeZoneName();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await homeCareApi.complianceReport({
        deviceId,
        emailHashed,
        ComplianceStartDate: start || undefined,
        ComplianceEndDate: end || undefined,
        timeZoneName,
      });
      setData(r);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load compliance report.");
    } finally { setLoading(false); }
  }, [deviceId, emailHashed, start, end, timeZoneName]);

  useEffect(() => { if (start && end) load(); }, [load, start, end]);

  const datesOfReport = start && end ? `${formatDate(start)} to ${formatDate(end)}` : undefined;
  // Prefer HeaderMetrics.name from the API response — it's the canonical
  // patient name. Fall back to the ?name query string for the loading state.
  const displayName = data?.HeaderMetrics?.name || name || "(patient)";
  const provider = account?.companyName || account?.institutionName || "";

  const vm = data
    ? fromComplianceReportResult(data, {
        name: displayName,
        email,
        deviceSerial: deviceId,
        provider,
        datesOfReportOverride: datesOfReport,
        // HeaderMetrics.daysFromTo is the API's own count; let it win
        // unless we have a UI-side preset that's already correct.
        totalDaysOverride: data.HeaderMetrics?.daysFromTo ?? RANGE_TO_DAYS[rangeLabel],
      })
    : null;

  return (
    <>
      <Link href="/provider/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader title="Report" subtitle={`${displayName} · Device ${deviceId}`} />

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !vm ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : vm ? (
        <MobileReport
          vm={vm}
          rangeLabel={rangeLabel}
          rangeOptions={Object.keys(RANGE_TO_DAYS)}
          onRangeSelect={applyPreset}
          customRange={
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-slate-500">or pick range:</span>
              <input className="input !py-1.5" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              <span className="text-slate-400">→</span>
              <input className="input !py-1.5" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          }
          headerActions={
            <>
              <button className="btn-secondary" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button className="btn-primary" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Print to PDF
              </button>
            </>
          }
        />
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">No data for this window yet.</div>
      )}
    </>
  );
}
