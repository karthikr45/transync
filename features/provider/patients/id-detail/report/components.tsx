import { formatDate } from "@/lib/format";
import type { ComplianceReportResult } from "@/lib/types.api";
import { DASH, num, intOrDash, boolOrDash, strOrDash } from "./model";
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function ReportSections({
  data,
  patientName,
  email,
  provider,
  deviceId,
}: {
  data: ComplianceReportResult;
  patientName: string;
  email?: string;
  provider?: string;
  deviceId: string;
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
      <Section title="Patient" subtitle={`Report ID ${h?.reportId ?? DASH}`}>
        <Row label="Name" value={h?.name || patientName} />
        <Row label="Email" value={email ?? DASH} />
        <Row label="Provider" value={provider || DASH} />
        <Row label="Device" value={deviceId} mono />
        <Row label="Birthday" value={h?.birthday ? formatDate(h.birthday) : DASH} />
        <Row label="Age" value={intOrDash(h?.age)} />
        <Row label="Days in window" value={intOrDash(h?.daysFromTo)} />
      </Section>

      <div className="grid lg:grid-cols-2 gap-5">
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
          <Row
            label="Avg usage / total days"
            value={num(usage?.averageUsageTimePerTotalDays, " h")}
          />
          <Row
            label="Avg usage / used days"
            value={num(usage?.averageUsageTimePerUsedDays, " h")}
          />
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
          <Row
            label="Therapy pressure"
            value={
              ds?.therapyPressure
                ? `${ds.therapyPressure.min}–${ds.therapyPressure.max} cmH₂O`
                : DASH
            }
          />
          <Row label="Ramp start pressure" value={num(ds?.rampStartPressure, " cmH₂O", 1)} />
          <Row label="Analysis parameter" value={strOrDash(ds?.analysisParameter)} />
          <Row label="Comfort control plus" value={num(ds?.comfortControlPlusLevel, "", 0)} />
          <Row label="Tubing type" value={strOrDash(ds?.tubingType)} />
          <Row label="Heated humidifier" value={boolOrDash(ds?.heatedHumidifier)} />
          <Row label="Heated tube" value={boolOrDash(ds?.heatedTube)} />
        </Section>
      </div>
    </div>
  );
}

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="px-5 py-3 border-b border-slate-200 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <span className="text-xs text-slate-500 font-mono">{subtitle}</span>}
      </div>
      <dl className="divide-y divide-slate-100">{children}</dl>
    </div>
  );
}

export function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 px-5 py-2.5 text-sm">
      <dt className="text-slate-500 shrink-0">{label}</dt>
      <dd
        className={`text-slate-900 font-medium text-right ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
