"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import MobileReport from "@/components/MobileReport";
import ComplianceBadge from "@/components/ComplianceBadge";
import { homeCareApi, ApiError } from "@/lib/api";
import { patients, patientExtras } from "@/lib/mock-data";
import { fromComplianceReportResult } from "@/lib/report-vm";
import { formatDate } from "@/lib/format";
import type { ComplianceReportResult } from "@/lib/types.api";
import { ArrowLeft, Printer, Lock, AlertTriangle, RefreshCw } from "lucide-react";

const RANGE_TO_DAYS: Record<string, number> = {
  "7 Days": 7, "30 Days": 30, "90 Days": 90, "180 Days": 180, "365 Days": 365,
};

export default function MonitorPatientDetail() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id);
  const deviceId = search.get("deviceId");
  const emailHashed = search.get("emailHashed");
  const name = search.get("name") ?? "";
  const email = search.get("email") ?? undefined;
  const tz = search.get("tz") ?? undefined;
  const apiMode = !!(deviceId && emailHashed);

  if (!apiMode) {
    const p = patients.find((x) => x.id === id);
    if (!p || !p.consentedInsurer) notFound();
    const ex = patientExtras[p.id];
    return (
      <>
        <Link href="/monitor/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> Back to patients
        </Link>
        <PageHeader
          title="Report"
          subtitle={`${p.name} · Shared by ${p.provider} · DOB ${p.dob}`}
          actions={<><ComplianceBadge status={p.status} /><button className="btn-primary"><Printer className="w-4 h-4" /> Print to PDF</button></>}
        />
        <div className="card p-4 mb-5 flex items-center gap-3 bg-slate-50 border-slate-200">
          <Lock className="w-4 h-4 text-slate-500" />
          <div className="text-xs text-slate-600">Mock record. Open from the live Patients list to fetch the API report.</div>
        </div>
        <p className="text-xs text-slate-400 mt-4">Patient ID {ex?.patientId} · Device {p.device} {p.serial}.</p>
      </>
    );
  }

  return <ApiReport deviceId={deviceId!} emailHashed={emailHashed!} name={name} email={email} tz={tz} />;
}

function ApiReport({
  deviceId, emailHashed, name, email, tz,
}: { deviceId: string; emailHashed: string; name: string; email?: string; tz?: string }) {
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
  useEffect(() => { applyPreset("90 Days"); }, [applyPreset]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await homeCareApi.complianceReport({
        deviceId, emailHashed,
        ComplianceStartDate: start || undefined,
        ComplianceEndDate: end || undefined,
        timeZoneName: tz,
      });
      setData(r);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load compliance report.");
    } finally { setLoading(false); }
  }, [deviceId, emailHashed, start, end, tz]);

  useEffect(() => { if (start && end) load(); }, [load, start, end]);

  const days = RANGE_TO_DAYS[rangeLabel];
  const datesOfReport = start && end ? `${formatDate(start)} to ${formatDate(end)}` : undefined;

  const vm = data
    ? fromComplianceReportResult(data, {
        name, email, deviceSerial: deviceId,
        datesOfReportOverride: datesOfReport,
        totalDaysOverride: days,
      })
    : null;

  return (
    <>
      <Link href="/monitor/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader title="Report" subtitle={`${name || "(patient)"} · Device ${deviceId}`} />

      <div className="card p-4 mb-5 flex items-center gap-3 bg-slate-50 border-slate-200">
        <Lock className="w-4 h-4 text-slate-500" />
        <div className="text-xs text-slate-600">Read-only view. Every access is logged.</div>
      </div>

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
        <div className="card p-8 text-center text-sm text-slate-500">No data.</div>
      )}
    </>
  );
}
