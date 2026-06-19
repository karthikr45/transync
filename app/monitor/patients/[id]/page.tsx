"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ComplianceReport from "@/components/ComplianceReport";
import ThirtyDayWindow from "@/components/ThirtyDayWindow";
import ComplianceBadge from "@/components/ComplianceBadge";
import { patients, patientExtras, generateSessions, insuranceProviders } from "@/lib/mock-data";
import { homeCareApi, ApiError } from "@/lib/api";
import type { ComplianceReportResult } from "@/lib/types.api";
import { ArrowLeft, Printer, Lock, AlertTriangle, RefreshCw } from "lucide-react";

export default function MonitorPatientDetail() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id);
  const deviceId = search.get("deviceId");
  const emailHashed = search.get("emailHashed");
  const name = search.get("name") ?? "";
  const tz = search.get("tz") ?? undefined;
  const apiMode = !!(deviceId && emailHashed);

  if (!apiMode) {
    // Fallback to mock view for the existing test paths (p001..p006)
    const p = patients.find((x) => x.id === id);
    if (!p || !p.consentedInsurer) notFound();
    const ex = patientExtras[p.id];
    const sessions = generateSessions(90);
    const ins = insuranceProviders.find((i) => i.name === p.payer) ?? insuranceProviders[0];
    return (
      <>
        <Link href="/monitor/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> Back to patients
        </Link>
        <PageHeader
          title={p.name}
          subtitle={`Shared by ${p.provider} · DOB ${p.dob} · ${p.payer}`}
          actions={
            <>
              <ComplianceBadge status={p.status} />
              <button className="btn-primary"><Printer className="w-4 h-4" /> Print to PDF</button>
            </>
          }
        />
        <div className="card p-4 mb-5 flex items-center gap-3 bg-slate-50 border-slate-200">
          <Lock className="w-4 h-4 text-slate-500" />
          <div className="text-xs text-slate-600">Read-only view. Every access is logged.</div>
        </div>
        <div className="mb-5"><ThirtyDayWindow sessions={sessions} rule={ins.compliance} /></div>
        <ComplianceReport sessions={sessions} />
        <p className="text-xs text-slate-400 mt-4">Patient ID {ex?.patientId} · Device {p.device} {p.serial}.</p>
      </>
    );
  }

  return <ApiReportView deviceId={deviceId!} emailHashed={emailHashed!} name={name} tz={tz} />;
}

function ApiReportView({ deviceId, emailHashed, name, tz }: { deviceId: string; emailHashed: string; name: string; tz?: string }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<ComplianceReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await homeCareApi.complianceReport({
        deviceId, emailHashed,
        ComplianceStartDate: from || undefined,
        ComplianceEndDate: to || undefined,
        timeZoneName: tz,
      });
      setData(r);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load compliance report.");
    } finally { setLoading(false); }
  }, [deviceId, emailHashed, from, to, tz]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Link href="/monitor/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader
        title={name || "(patient)"}
        subtitle={`Device ${deviceId}`}
        actions={
          <>
            <div className="flex items-center gap-2 text-sm">
              <input className="input !py-1.5" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-slate-400">→</span>
              <input className="input !py-1.5" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              <button className="btn-secondary" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Submit
              </button>
            </div>
            <button className="btn-primary" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print to PDF</button>
          </>
        }
      />

      <div className="card p-4 mb-5 flex items-center gap-3 bg-slate-50 border-slate-200">
        <Lock className="w-4 h-4 text-slate-500" />
        <div className="text-xs text-slate-600">Read-only view. Every access is logged.</div>
      </div>

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !data && <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>}

      {data && <Sections data={data} />}
    </>
  );
}

function Sections({ data }: { data: ComplianceReportResult }) {
  const num = (n: number | null | undefined, suffix = "", digits = 1) =>
    n === null || n === undefined ? "—" : `${n.toFixed(digits)}${suffix}`;
  const intOrDash = (n: number | null | undefined) => (n === null || n === undefined ? "—" : String(n));

  return (
    <div className="space-y-5">
      <Section title="Header">
        <dl className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <Cell label="Name" value={data.HeaderMetrics.name} />
          <Cell label="Birthday" value={data.HeaderMetrics.birthday} />
          <Cell label="Age" value={String(data.HeaderMetrics.age)} />
          <Cell label="Days in range" value={String(data.HeaderMetrics.daysFromTo)} />
          <Cell label="Report ID" value={data.HeaderMetrics.reportId} />
        </dl>
      </Section>
      <Section title="Analysis Summary">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Cell label="Average AHI" value={num(data.AnalysisSummaryMetrics.averageAHI)} />
          <Cell label="Average usage time" value={num(data.AnalysisSummaryMetrics.averageUsageTime, " h")} />
          <Cell label="Average pressure" value={num(data.AnalysisSummaryMetrics.averagePressure, " cmH₂O")} />
          <Cell label="Average leak" value={num(data.AnalysisSummaryMetrics.averageLeak, " L/min")} />
        </dl>
      </Section>
      <div className="grid md:grid-cols-2 gap-5">
        <Section title="Usage">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Cell label="Days used" value={intOrDash(data.UsageMetrics.daysUsed)} />
            <Cell label="Days ≥ 4h" value={intOrDash(data.UsageMetrics.daysUsedOver4Hours)} />
            <Cell label="Days < 4h" value={intOrDash(data.UsageMetrics.daysUsedUnder4Hours)} />
            <Cell label="Days not used" value={intOrDash(data.UsageMetrics.daysNotUsed)} />
          </dl>
        </Section>
        <Section title="AHI">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Cell label="AHI" value={num(data.AhiMetrics.ahi)} />
            <Cell label="Obstructive apneas" value={num(data.AhiMetrics.obstructiveApneas)} />
            <Cell label="Obstructive hypopneas" value={num(data.AhiMetrics.obstructiveHypopneas)} />
            <Cell label="Leak" value={num(data.AhiMetrics.leak, " L/min")} />
          </dl>
        </Section>
        <Section title="Pressure">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Cell label="Average" value={num(data.PressureMetrics.averagePressure, " cmH₂O")} />
            <Cell label="Maximum" value={num(data.PressureMetrics.maxPressure, " cmH₂O")} />
            <Cell label="P90" value={num(data.PressureMetrics.p90Pressure, " cmH₂O")} />
          </dl>
        </Section>
        <Section title="Leak">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Cell label="Average" value={num(data.LeakMetrics.averageLeak, " L/min")} />
            <Cell label="Max" value={num(data.LeakMetrics.maxLeak, " L/min")} />
            <Cell label="P90" value={num(data.LeakMetrics.p90Leak, " L/min")} />
            <Cell label="Limit exceedance" value={num(data.LeakMetrics.leakLimitExceedance)} />
          </dl>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium mt-0.5 break-all">{value}</dd>
    </div>
  );
}
