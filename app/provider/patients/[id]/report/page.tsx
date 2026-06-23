"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import { homeCareApi, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getTimeZoneName } from "@/lib/timezone";
import { getCurrentUser } from "@/lib/auth";
import type { AccountUser, ComplianceReportResult } from "@/lib/types.api";
import { ArrowLeft, Printer, AlertTriangle, RefreshCw } from "lucide-react";

// Default window when the report opens — Medicare's 90-day compliance
// look-back. The user can pick anything in the date pickers.
const DEFAULT_WINDOW_DAYS = 90;

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Australia/Sydney",
  "UTC",
];

const DASH = "—";
const num = (v: number | null | undefined, suffix = "", decimals = 2): string => {
  if (v === null || v === undefined || Number.isNaN(v)) return DASH;
  return `${Number(v).toFixed(decimals)}${suffix}`;
};
const intOrDash = (v: number | null | undefined): string => (v === null || v === undefined ? DASH : String(v));
const boolOrDash = (v: boolean | null | undefined): string => (v === null || v === undefined ? DASH : v ? "Yes" : "No");
const strOrDash = (v: string | null | undefined): string => (v ? v : DASH);

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
      initialTz={tzParam}
    />
  );
}

function ApiReport({
  deviceId, emailHashed, name, email, initialTz,
}: { deviceId: string; emailHashed: string; name: string; email?: string; initialTz?: string }) {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [timeZoneName, setTimeZoneName] = useState<string>(
    initialTz || (typeof window !== "undefined" ? getTimeZoneName() : "UTC"),
  );
  const [data, setData] = useState<ComplianceReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setAccount(getCurrentUser()); }, []);

  // Seed the date pickers with the default 90-day window. Users can
  // change either end with the date inputs.
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
    setLoading(true); setError(null);
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
    } finally { setLoading(false); }
  }, [deviceId, emailHashed, start, end, timeZoneName]);

  useEffect(() => { load(); }, [load]);

  const displayName = data?.HeaderMetrics?.name || name || "(patient)";
  const provider = account?.companyName || account?.institutionName || "";

  return (
    <>
      <Link href="/provider/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader
        title="Compliance report"
        subtitle={`${displayName} · Device ${deviceId}`}
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={load} disabled={loading || !start || !end}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button className="btn-primary" onClick={() => window.print()} disabled={!data}>
              <Printer className="w-4 h-4" /> Print to PDF
            </button>
          </div>
        }
      />

      <RequestControls
        start={start}
        end={end}
        timeZoneName={timeZoneName}
        onStart={(v) => setStart(v)}
        onEnd={(v) => setEnd(v)}
        onTzChange={setTimeZoneName}
      />

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : data ? (
        <ReportSections data={data} patientName={displayName} email={email} provider={provider} deviceId={deviceId} />
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">No data for this window yet.</div>
      )}
    </>
  );
}

function RequestControls({
  start, end, timeZoneName, onStart, onEnd, onTzChange,
}: {
  start: string;
  end: string;
  timeZoneName: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onTzChange: (v: string) => void;
}) {
  const tzOptions = useMemo(() => {
    const set = new Set(TIMEZONES);
    set.add(timeZoneName);
    return Array.from(set).sort();
  }, [timeZoneName]);

  return (
    <div className="card p-4 mb-5">
      <div className="grid sm:grid-cols-3 gap-3 text-sm items-end">
        <Field label="Start date">
          <input className="input" type="date" value={start} max={end || undefined} onChange={(e) => onStart(e.target.value)} />
        </Field>
        <Field label="End date">
          <input className="input" type="date" value={end} min={start || undefined} onChange={(e) => onEnd(e.target.value)} />
        </Field>
        <Field label="Time zone">
          <select className="input" value={timeZoneName} onChange={(e) => onTzChange(e.target.value)}>
            {tzOptions.map((tz) => <option key={tz}>{tz}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ReportSections({
  data, patientName, email, provider, deviceId,
}: {
  data: ComplianceReportResult; patientName: string; email?: string; provider?: string; deviceId: string;
}) {
  const h = data.HeaderMetrics;
  const a = data.AnalysisSummaryMetrics;
  const ahi = data.AhiMetrics;
  const usage = data.UsageMetrics;
  const breath = data.BreathingEventMetrics;
  const pressure = data.PressureMetrics;
  const leak = data.LeakMetrics;
  const ds = data.DeviceSettingsMetrics;

  return (
    <div className="space-y-5">
      <Section title="Header" subtitle={`Report ID ${h?.reportId ?? DASH}`}>
        <Row label="Name" value={h?.name || patientName} />
        <Row label="Email" value={email ?? DASH} />
        <Row label="Provider" value={provider || DASH} />
        <Row label="Device" value={deviceId} mono />
        <Row label="Birthday" value={h?.birthday ? formatDate(h.birthday) : DASH} />
        <Row label="Age" value={intOrDash(h?.age)} />
        <Row label="Days in window" value={intOrDash(h?.daysFromTo)} />
      </Section>

      <Section title="Analysis summary">
        <Row label="Average AHI" value={num(a?.averageAHI, " events/hr")} />
        <Row label="Average usage time" value={num(a?.averageUsageTime, " h")} />
        <Row label="Average pressure" value={num(a?.averagePressure, " cmH₂O", 1)} />
        <Row label="Average leak" value={num(a?.averageLeak, " L/min")} />
      </Section>

      <Section title="Usage">
        <Row label="Days used" value={intOrDash(usage?.daysUsed)} />
        <Row label="Days used ≥ 4 hrs" value={intOrDash(usage?.daysUsedOver4Hours)} />
        <Row label="Days used < 4 hrs" value={intOrDash(usage?.daysUsedUnder4Hours)} />
        <Row label="Days not used" value={intOrDash(usage?.daysNotUsed)} />
        <Row label="Avg usage / total days" value={num(usage?.averageUsageTimePerTotalDays, " h")} />
        <Row label="Avg usage / used days" value={num(usage?.averageUsageTimePerUsedDays, " h")} />
        <Row label="Max usage" value={num(usage?.maxUsageTime, " h")} />
      </Section>

      <Section title="AHI">
        <Row label="AHI" value={num(ahi?.ahi, " events/hr")} />
        <Row label="Obstructive apneas" value={num(ahi?.obstructiveApneas)} />
        <Row label="Obstructive hypopneas" value={num(ahi?.obstructiveHypopneas)} />
        <Row label="Leak (from AHI block)" value={num(ahi?.leak, " L/min")} />
      </Section>

      <Section title="Breathing events">
        <Row label="AHI" value={num(breath?.ahi, " events/hr")} />
        <Row label="Obstructive apneas" value={num(breath?.obstructiveApneas)} />
        <Row label="Obstructive hypopneas" value={num(breath?.obstructiveHypopneas)} />
        <Row label="Central apneas" value={num(breath?.centralApneas)} />
        <Row label="Central hypopneas" value={num(breath?.centralHypopneas)} />
        <Row label="Avg apnea duration" value={num(breath?.averageApneaDuration, " s")} />
        <Row label="Flow-limited index (IFL)" value={num(breath?.ifl)} />
        <Row label="Snoring" value={num(breath?.snoring)} />
      </Section>

      <Section title="Pressure">
        <Row label="Average pressure" value={num(pressure?.averagePressure, " cmH₂O", 1)} />
        <Row label="Max pressure" value={num(pressure?.maxPressure, " cmH₂O", 1)} />
        <Row label="P90 pressure" value={num(pressure?.p90Pressure, " cmH₂O", 1)} />
      </Section>

      <Section title="Leak">
        <Row label="Average leak" value={num(leak?.averageLeak, " L/min")} />
        <Row label="Max leak" value={num(leak?.maxLeak, " L/min")} />
        <Row label="P90 leak" value={num(leak?.p90Leak, " L/min")} />
        <Row label="Leak limit exceedance" value={num(leak?.leakLimitExceedance)} />
      </Section>

      <Section title="Device settings">
        <Row label="Mode" value={strOrDash(ds?.mode)} />
        <Row label="Ramp" value={num(ds?.ramp, " min", 0)} />
        <Row label="Mask leak" value={num(ds?.maskLeak, " L/min")} />
        <Row label="Therapy pressure" value={ds?.therapyPressure
          ? `${ds.therapyPressure.min}–${ds.therapyPressure.max} cmH₂O`
          : DASH} />
        <Row label="Ramp start pressure" value={num(ds?.rampStartPressure, " cmH₂O", 1)} />
        <Row label="Analysis parameter" value={strOrDash(ds?.analysisParameter)} />
        <Row label="Comfort control plus" value={num(ds?.comfortControlPlusLevel, "", 0)} />
        <Row label="Tubing type" value={strOrDash(ds?.tubingType)} />
        <Row label="Heated humidifier" value={boolOrDash(ds?.heatedHumidifier)} />
        <Row label="Heated tube" value={boolOrDash(ds?.heatedTube)} />
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="px-5 py-3 border-b border-slate-200 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <span className="text-xs text-slate-500 font-mono">{subtitle}</span>}
      </div>
      <dl className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-3 p-5 text-sm">
        {children}
      </dl>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 last:border-0 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-slate-900 font-medium text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
