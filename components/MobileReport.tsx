"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { ReportVM } from "@/lib/report-vm";
import { formatDate } from "@/lib/format";

export type Tab = "standard" | "advanced" | "faa";

export default function MobileReport({
  vm,
  rangeLabel,
  rangeOptions,
  onRangeSelect,
  tab: tabProp,
  onTabChange,
  customRange,
  headerActions,
}: {
  vm: ReportVM;
  rangeLabel?: string;
  rangeOptions?: string[];
  onRangeSelect?: (label: string) => void;
  tab?: Tab; // controlled tab; omit to let the component manage its own state
  onTabChange?: (tab: Tab) => void; // re-fetch the report data for the newly selected tab
  customRange?: ReactNode; // optional explicit date range picker
  headerActions?: ReactNode;
}) {
  const [internalTab, setInternalTab] = useState<Tab>("standard");
  const tab = tabProp ?? internalTab;

  function selectTab(t: Tab) {
    if (tabProp === undefined) setInternalTab(t);
    if (t !== tab) onTabChange?.(t);
  }

  return (
    <>
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex bg-slate-100 rounded-lg p-1">
          {(["standard", "advanced", "faa"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => selectTab(t)}
              className={`px-4 py-1.5 text-xs font-medium rounded transition ${tab === t ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
            >
              {t === "standard" ? "Standard" : t === "advanced" ? "Advanced" : "FAA"}
            </button>
          ))}
        </div>
        {rangeOptions && rangeOptions.length > 0 && onRangeSelect && (
          <div className="relative">
            <select
              className="input !w-auto !py-1.5 pr-8 appearance-none"
              value={rangeLabel ?? rangeOptions[0]}
              onChange={(e) => onRangeSelect(e.target.value)}
            >
              {rangeOptions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
        {customRange}
        <div className="ml-auto flex gap-2">{headerActions}</div>
      </div>

      {tab === "standard" && <StandardTab vm={vm} />}
      {tab === "advanced" && <AdvancedTab vm={vm} />}
      {tab === "faa" && <FAATab vm={vm} />}
    </>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="card mb-4 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="text-sm font-semibold text-brand-700">{title}</h3>
        {right && <div className="text-xs text-slate-500">{right}</div>}
      </div>
      <div className="divide-y divide-slate-100 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="px-5 py-2.5 flex items-center justify-between gap-4">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900 font-medium text-right break-all">{value}</span>
    </div>
  );
}

const DASH = "—";
const num = (n: number | null | undefined, suffix = "", digits = 1): string =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? DASH
    : `${Number(n).toFixed(digits)}${suffix}`;
const intOrDash = (n: number | null | undefined): string =>
  n === null || n === undefined ? DASH : String(n);
// The mobile app displays these settings verbatim (no toFixed/rounding
// at all) — reproduce that exactly rather than forcing a decimal count.
const rawNum = (n: number | null | undefined, suffix = ""): string =>
  n === null || n === undefined ? DASH : `${n}${suffix}`;
const pctOf = (used?: number, total?: number): string => {
  if (used === undefined || total === undefined || total === 0) return DASH;
  const pct = Math.max(0, (used / total) * 100);
  return `${used} of ${total} ${total === 1 ? "day" : "days"} (${pct.toFixed(2)}%)`;
};
// Mirrors the mobile app's convertMinsToTime: pads minutes to 2 digits,
// switches to "H Hrs:MM Mins" past an hour, and reads "Ramp Disabled"
// at 0 (matching the CPAP's own "disabled" state for GentleRise).
const rampDuration = (mins?: number | null): string => {
  if (mins == null) return DASH;
  if (mins <= 0) return "Ramp Disabled";
  const hours = Math.floor(mins / 60);
  const minutes = String(mins % 60).padStart(2, "0");
  return hours > 0 ? `${hours} Hrs:${minutes} Mins` : `${minutes} Mins`;
};

function PatientOverviewSections({ vm }: { vm: ReportVM }) {
  const { patientDetails: pd, patientSettings: ps, usage: u } = vm;
  return (
    <>
      <Section title="Patient Details">
        <Row label="Patient Name" value={pd.name ?? DASH} />
        <Row label="Device Serial" value={pd.deviceSerial ?? DASH} />
        <Row label="Patient Email" value={pd.email ?? DASH} />
        <Row label="Provider" value={pd.provider ?? DASH} />
      </Section>

      <Section title="Patient Setting">
        <Row label="Starting Pressure" value={rawNum(ps.startingPressure, " (cmH2O)")} />
        <Row label="Minimum Pressure" value={rawNum(ps.minPressure, " (cmH2O)")} />
        <Row label="Maximum Pressure" value={rawNum(ps.maxPressure, " (cmH2O)")} />
        <Row label="GentleRise Pressure" value={rawNum(ps.gentleRisePressure, " (cmH2O)")} />
        <Row label="GentleRise Duration" value={rampDuration(ps.gentleRiseDuration)} />
        <Row label="AirRelief" value={intOrDash(ps.airRelief)} />
      </Section>

      <Section
        title="Usage"
        right={
          u.lastSyncDate ? (
            <>
              Last Sync Date:{" "}
              <span className="text-slate-900">{formatDate(u.lastSyncDate, true)}</span>
            </>
          ) : null
        }
      >
        <Row label="Dates of Report" value={u.datesOfReport ?? DASH} />
        <Row label="Days Used" value={pctOf(u.daysUsed, u.totalDays)} />
        <Row label="Average Hours/Night" value={num(u.averageHoursPerNight, "", 2)} />
        <Row label="4+ Hours Usage" value={pctOf(u.fourPlusUsage, u.totalDays)} />
        <Row label="6+ Hours Usage" value={pctOf(u.sixPlusUsage, u.totalDays)} />
      </Section>
    </>
  );
}

function StandardTab({ vm }: { vm: ReportVM }) {
  const { ahi, leak, pressure: pr } = vm;
  return (
    <>
      <PatientOverviewSections vm={vm} />

      <Section title="AHI Summary">
        <Row label="AHI Index" value={num(ahi.ahiIndex, "", 2)} />
        <Row label="Apnea Index" value={num(ahi.apneaIndex, "", 2)} />
        <Row label="Hypopnea Index" value={num(ahi.hypopneaIndex, "", 2)} />
        <Row label="Total Apnea Duration (sec)" value={num(ahi.totalApneaDuration, "", 0)} />
        <Row label="% of Time Spent in Apnea" value={num(ahi.percentTimeInApnea, "", 2)} />
      </Section>

      <Section title="Leak Summary">
        <Row label="Average Leak" value={num(leak.averageLeak, " (L/Min)", 2)} />
        <Row label="95 Percentile Leak" value={num(leak.p95Leak, " (L/Min)", 2)} />
      </Section>

      <Section title="Pressure Summary">
        <Row label="Minimum Pressure" value={num(pr.minPressure, " (cmH2O)", 2)} />
        <Row label="Maximum Pressure" value={num(pr.maxPressure, " (cmH2O)", 2)} />
        <Row label="Average Pressure" value={num(pr.averagePressure, " (cmH2O)", 2)} />
        <Row label="95 Percentile Pressure" value={num(pr.p95Pressure, " (cmH2O)", 2)} />
      </Section>
    </>
  );
}

function AdvancedTab({ vm }: { vm: ReportVM }) {
  const { ahi, leak, pressure: pr, sleep } = vm;
  return (
    <>
      <PatientOverviewSections vm={vm} />

      <Section title="AHI Summary">
        <Row label="AHI Index" value={num(ahi.ahiIndex, "", 2)} />
        <Row label="Apnea Index" value={num(ahi.apneaIndex, "", 2)} />
        <Row label="Hypopnea Index" value={num(ahi.hypopneaIndex, "", 2)} />
        <Row label="Total Apnea Duration (sec)" value={num(ahi.totalApneaDuration, "", 0)} />
        <Row label="% of Time Spent in Apnea" value={num(ahi.percentTimeInApnea, "", 2)} />
        <Row label="Average Length of Apneas (sec)" value={num(ahi.averageApneaDuration, "", 2)} />
        <Row label="Longest Apnea (sec)" value={num(ahi.longestApnea, "", 0)} />
        <Row label="Flow-Limited Index" value={num(ahi.flowLtdIndex, "", 2)} />
        <Row label="Snore Index" value={num(ahi.snoreIndex, "", 2)} />
        {ahi.centralApneaIndex != null && (
          <Row label="Central Apnea Index" value={ahi.centralApneaIndex} />
        )}
        {ahi.centralHypopneaIndex != null && (
          <Row label="Central Hypopnea Index" value={ahi.centralHypopneaIndex} />
        )}
      </Section>

      <Section title="Leak Summary">
        <Row label="Average Leak" value={num(leak.averageLeak, " (L/Min)", 2)} />
        <Row label="95 Percentile Leak" value={num(leak.p95Leak, " (L/Min)", 2)} />
        <Row label="% of Time Spent with High Leak" value={num(leak.leakAvgRange, "", 2)} />
        {leak.maxLeak != null && <Row label="Max Leak" value={leak.maxLeak} />}
        {leak.leakLimitExceedance != null && (
          <Row label="Leak Limit Exceedance" value={num(leak.leakLimitExceedance, "", 2)} />
        )}
      </Section>

      <Section title="Pressure Summary">
        <Row label="Minimum Pressure" value={num(pr.minPressure, " (cmH2O)", 2)} />
        <Row label="Maximum Pressure" value={num(pr.maxPressure, " (cmH2O)", 2)} />
        <Row label="Average Pressure" value={num(pr.averagePressure, " (cmH2O)", 2)} />
        <Row label="95 Percentile Pressure" value={num(pr.p95Pressure, " (cmH2O)", 2)} />
        {pr.p90Pressure != null && <Row label="90 Percentile Pressure" value={pr.p90Pressure} />}
      </Section>

      {sleep && (
        <Section title="Sleep Score Summary">
          <Row
            label="Sleep Score"
            value={
              sleep.sleepScore == null ? DASH : `${Number(sleep.sleepScore).toFixed(0)} of 100`
            }
          />
          <Row label="Mask Removed Average" value={num(sleep.avgMaskRemoved, "", 0)} />
        </Section>
      )}

      {vm.deviceSettings && <DeviceSettingsSection vm={vm} />}
    </>
  );
}

function DeviceSettingsSection({ vm }: { vm: ReportVM }) {
  // Prefer the raw deviceSettings block, then fall back to the patientSettings
  // labelled fields (which is what the End User reportBySession path uses).
  const ds = vm.deviceSettings ?? {};
  const ps = vm.patientSettings;
  const mode = ds.mode ?? ps.mode ?? null;
  const ramp = ds.ramp ?? ps.gentleRiseDuration ?? null;
  const therapy =
    ds.therapyPressure ??
    (ps.minPressure != null && ps.maxPressure != null
      ? { min: Number(ps.minPressure), max: Number(ps.maxPressure) }
      : null);
  const rampStart = ds.rampStartPressure ?? ps.startingPressure ?? null;
  const comfort = ds.comfortControlPlusLevel ?? ps.airRelief ?? null;
  const tubing = ds.tubingType ?? ps.tubingType ?? null;
  const humidifier = ds.heatedHumidifier ?? ps.heatedHumidifier ?? null;
  const tube = ds.heatedTube ?? ps.heatedTube ?? null;
  const maskLeak = ds.maskLeak ?? null;
  const analysis = ds.analysisParameter ?? null;
  return (
    <Section title="Device Settings">
      <Row label="Mode" value={mode ?? DASH} />
      <Row label="Ramp" value={ramp == null ? DASH : `${ramp} Mins`} />
      <Row
        label="Therapy pressure"
        value={therapy ? `${therapy.min}–${therapy.max} cmH2O` : DASH}
      />
      <Row label="Ramp start pressure" value={rampStart == null ? DASH : `${rampStart} cmH2O`} />
      <Row label="Comfort Control+ level" value={comfort == null ? DASH : String(comfort)} />
      <Row label="Tubing type" value={tubing ?? DASH} />
      <Row
        label="Heated humidifier"
        value={humidifier == null ? DASH : humidifier ? "Yes" : "No"}
      />
      <Row label="Heated tube" value={tube == null ? DASH : tube ? "Yes" : "No"} />
      <Row label="Mask leak" value={maskLeak == null ? DASH : `${maskLeak} L/Min`} />
      <Row label="Analysis parameter" value={analysis ?? DASH} />
    </Section>
  );
}

function FAATab({ vm }: { vm: ReportVM }) {
  const { patientDetails: pd, usage: u, ahi } = vm;
  // Both "Days in Report" and "Days Used" share the plurality of the
  // report window itself (e.g. "Last 24 Hours" -> "1 day" for both),
  // matching the mobile app's FAA screen rather than pluralizing each
  // count independently.
  const dayWord = u.totalDays === 1 ? "day" : "days";
  const pctUsed =
    u.daysUsed == null || !u.totalDays
      ? DASH
      : `${Math.max(0, (u.daysUsed / u.totalDays) * 100).toFixed(0)}%`;
  return (
    <>
      <Section title="Patient Details">
        <Row label="Patient Name" value={pd.name ?? DASH} />
        <Row label="Device Serial" value={pd.deviceSerial ?? DASH} />
      </Section>

      <Section
        title="Usage"
        right={
          u.lastSyncDate ? (
            <>
              Last Sync Date:{" "}
              <span className="text-slate-900">{formatDate(u.lastSyncDate, true)}</span>
            </>
          ) : null
        }
      >
        <Row label="Dates of Report" value={u.datesOfReport ?? DASH} />
        <Row
          label="Days in Report"
          value={u.totalDays == null ? DASH : `${u.totalDays} ${dayWord}`}
        />
        <Row label="Days Used" value={u.daysUsed == null ? DASH : `${u.daysUsed} ${dayWord}`} />
        <Row label="% of Days Used" value={pctUsed} />
        <Row label="Average Hours/Night" value={num(u.averageHoursPerNight, "", 2)} />
      </Section>

      <Section title="AHI Summary">
        <Row label="AHI Index" value={num(ahi.ahiIndex, "", 2)} />
      </Section>
    </>
  );
}
