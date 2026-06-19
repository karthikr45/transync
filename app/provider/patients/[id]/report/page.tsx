"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ComplianceReport from "@/components/ComplianceReport";
import ThirtyDayWindow from "@/components/ThirtyDayWindow";
import { patients, patientExtras, generateSessions } from "@/lib/mock-data";
import { homeCareApi, ApiError } from "@/lib/api";
import type { ComplianceReportResult } from "@/lib/types.api";
import { ArrowLeft, Printer, AlertTriangle, RefreshCw } from "lucide-react";

export default function FullReportPage() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id);
  const deviceId = search.get("deviceId");
  const emailHashed = search.get("emailHashed");
  const nameParam = search.get("name");
  const tz = search.get("tz") ?? undefined;

  const apiMode = !!(deviceId && emailHashed);

  // ---------- Mock fallback (when no API params present) ----------
  if (!apiMode) {
    const p = patients.find((x) => x.id === id);
    if (!p) notFound();
    const ex = patientExtras[p.id];
    const sessions = generateSessions(90);
    return (
      <>
        <Link href={`/provider/patients/${p.id}`} className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> Back to patient
        </Link>
        <PageHeader
          title="Full Compliance Report"
          subtitle={`${p.name} · Patient ID ${ex?.patientId} · ${p.device} ${p.serial}`}
          actions={<button className="btn-primary"><Printer className="w-4 h-4" /> Print to PDF</button>}
        />
        <div className="mb-5"><ThirtyDayWindow sessions={sessions} /></div>
        <ComplianceReport sessions={sessions} />
      </>
    );
  }

  // ---------- API mode ----------
  return <ApiReport deviceId={deviceId!} emailHashed={emailHashed!} name={nameParam ?? ""} tz={tz} />;
}

function ApiReport({ deviceId, emailHashed, name, tz }: { deviceId: string; emailHashed: string; name: string; tz?: string }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<ComplianceReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await homeCareApi.complianceReport({
        deviceId,
        emailHashed,
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
      <Link href={`/provider/patients`} className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader
        title="Full Compliance Report"
        subtitle={`${name || "(patient)"} · Device ${deviceId}`}
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

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !data && <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>}

      {data && <ApiReportSections data={data} />}
    </>
  );
}

function ApiReportSections({ data }: { data: ComplianceReportResult }) {
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
            <Cell label="Avg / used day" value={num(data.UsageMetrics.averageUsageTimePerUsedDays, " h")} />
            <Cell label="Avg / total days" value={num(data.UsageMetrics.averageUsageTimePerTotalDays, " h")} />
            <Cell label="Max usage" value={num(data.UsageMetrics.maxUsageTime, " h")} />
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

        <Section title="Breathing events">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Cell label="AHI" value={num(data.BreathingEventMetrics.ahi)} />
            <Cell label="Obstructive apneas" value={num(data.BreathingEventMetrics.obstructiveApneas)} />
            <Cell label="Obstructive hypopneas" value={num(data.BreathingEventMetrics.obstructiveHypopneas)} />
            <Cell label="Central apneas" value={num(data.BreathingEventMetrics.centralApneas)} />
            <Cell label="Central hypopneas" value={num(data.BreathingEventMetrics.centralHypopneas)} />
            <Cell label="Avg apnea duration" value={num(data.BreathingEventMetrics.averageApneaDuration, " s")} />
            <Cell label="IFL" value={num(data.BreathingEventMetrics.ifl)} />
            <Cell label="Snoring" value={num(data.BreathingEventMetrics.snoring)} />
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

        <Section title="Device settings">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Cell label="Mode" value={data.DeviceSettingsMetrics.mode ?? "—"} />
            <Cell label="Ramp" value={intOrDash(data.DeviceSettingsMetrics.ramp)} />
            <Cell label="Therapy pressure" value={data.DeviceSettingsMetrics.therapyPressure ? `${data.DeviceSettingsMetrics.therapyPressure.min}–${data.DeviceSettingsMetrics.therapyPressure.max} cmH₂O` : "—"} />
            <Cell label="Ramp start pressure" value={num(data.DeviceSettingsMetrics.rampStartPressure, " cmH₂O", 0)} />
            <Cell label="Comfort Control+ level" value={intOrDash(data.DeviceSettingsMetrics.comfortControlPlusLevel)} />
            <Cell label="Tubing type" value={data.DeviceSettingsMetrics.tubingType ?? "—"} />
            <Cell label="Heated humidifier" value={data.DeviceSettingsMetrics.heatedHumidifier === null ? "—" : data.DeviceSettingsMetrics.heatedHumidifier ? "Yes" : "No"} />
            <Cell label="Heated tube" value={data.DeviceSettingsMetrics.heatedTube === null ? "—" : data.DeviceSettingsMetrics.heatedTube ? "Yes" : "No"} />
          </dl>
        </Section>
      </div>

      <p className="text-xs text-slate-400">
        Values shown as “—” are not yet derived from the underlying data.
      </p>
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
