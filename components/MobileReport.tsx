"use client";

import { useState, ReactNode } from "react";
import type { ReportVM } from "@/lib/report-vm";

type Tab = "standard" | "advanced" | "faa";

export default function MobileReport({
  vm,
  rangeLabel,
  rangeOptions,
  onRangeSelect,
  customRange,
  headerActions,
}: {
  vm: ReportVM;
  rangeLabel?: string;
  rangeOptions?: string[];
  onRangeSelect?: (label: string) => void;
  customRange?: ReactNode; // optional explicit date range picker
  headerActions?: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("standard");

  return (
    <>
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex bg-slate-100 rounded-lg p-1">
          {(["standard", "advanced", "faa"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-medium rounded transition ${tab === t ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
            >
              {t === "standard" ? "Standard" : t === "advanced" ? "Advanced" : "FAA"}
            </button>
          ))}
        </div>
        {rangeOptions && rangeOptions.length > 0 && onRangeSelect && (
          <select
            className="input !w-auto !py-1.5"
            value={rangeLabel ?? rangeOptions[0]}
            onChange={(e) => onRangeSelect(e.target.value)}
          >
            {rangeOptions.map((r) => <option key={r}>{r}</option>)}
          </select>
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

function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
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
  n === null || n === undefined || Number.isNaN(Number(n)) ? DASH : `${Number(n).toFixed(digits)}${suffix}`;
const intOrDash = (n: number | null | undefined): string =>
  n === null || n === undefined ? DASH : String(n);
const pctOf = (used?: number, total?: number): string => {
  if (used === undefined || total === undefined || total === 0) return DASH;
  const pct = (used / total) * 100;
  return `${used} of ${total} days (${pct.toFixed(2)}%)`;
};

function StandardTab({ vm }: { vm: ReportVM }) {
  const { patientDetails: pd, patientSettings: ps, usage: u, ahi, leak, pressure: pr } = vm;
  return (
    <>
      <Section title="Patient Details">
        <Row label="Patient Name" value={pd.name ?? DASH} />
        <Row label="Device Serial" value={pd.deviceSerial ?? DASH} />
        <Row label="Patient Email" value={pd.email ?? DASH} />
        <Row label="Provider" value={pd.provider ?? DASH} />
      </Section>

      <Section title="Patient Setting">
        <Row label="Starting Pressure" value={num(ps.startingPressure, " (cmH2O)", 0)} />
        <Row label="Minimum Pressure" value={num(ps.minPressure, " (cmH2O)", 0)} />
        <Row label="Maximum Pressure" value={num(ps.maxPressure, " (cmH2O)", 0)} />
        <Row label="GentleRise Pressure" value={num(ps.gentleRisePressure, " (cmH2O)", 0)} />
        <Row label="GentleRise Duration" value={ps.gentleRiseDuration == null ? DASH : `${ps.gentleRiseDuration} Mins`} />
        <Row label="AirRelief" value={intOrDash(ps.airRelief)} />
      </Section>

      <Section
        title="Usage"
        right={u.lastSyncDate ? <>Last Sync Date: <span className="text-slate-900">{new Date(u.lastSyncDate).toLocaleDateString()}</span></> : null}
      >
        <Row label="Dates of Report" value={u.datesOfReport ?? DASH} />
        <Row label="Days Used" value={pctOf(u.daysUsed, u.totalDays)} />
        <Row label="Average Hours/Night" value={num(u.averageHoursPerNight)} />
        <Row label="4+ Hours Usage" value={pctOf(u.fourPlusUsage, u.totalDays)} />
        <Row label="6+ Hours Usage" value={pctOf(u.sixPlusUsage, u.totalDays)} />
      </Section>

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
  const { ahi, leak, pressure: pr, sleep, patientSettings: ps } = vm;
  return (
    <>
      <Section title="Breathing Events">
        <Row label="Central Apnea Index" value={ahi.centralApneaIndex ?? DASH} />
        <Row label="Central Hypopnea Index" value={ahi.centralHypopneaIndex ?? DASH} />
        <Row label="Average Apnea Duration (sec)" value={num(ahi.averageApneaDuration, "", 2)} />
        <Row label="Longest Apnea (sec)" value={intOrDash(ahi.longestApnea)} />
        <Row label="Flow-Limited Index" value={num(ahi.flowLtdIndex, "", 2)} />
        <Row label="Snore Index" value={num(ahi.snoreIndex, "", 2)} />
      </Section>
      <Section title="Leak Detail">
        <Row label="Max Leak" value={leak.maxLeak ?? DASH} />
        <Row label="Leak Limit Exceedance" value={num(leak.leakLimitExceedance, "", 2)} />
        <Row label="Leak Avg Range" value={num(leak.leakAvgRange, "", 2)} />
      </Section>
      <Section title="Pressure Detail">
        <Row label="90 Percentile Pressure" value={pr.p90Pressure ?? DASH} />
      </Section>
      {sleep && (
        <Section title="Sleep">
          <Row label="Sleep Score" value={intOrDash(sleep.sleepScore)} />
          <Row label="Avg Mask Removed" value={intOrDash(sleep.avgMaskRemoved)} />
        </Section>
      )}
      <Section title="Device Settings">
        <Row label="Mode" value={ps.mode ?? DASH} />
        <Row label="Tubing Type" value={ps.tubingType ?? DASH} />
        <Row label="Heated Humidifier" value={ps.heatedHumidifier == null ? DASH : ps.heatedHumidifier ? "Yes" : "No"} />
        <Row label="Heated Tube" value={ps.heatedTube == null ? DASH : ps.heatedTube ? "Yes" : "No"} />
      </Section>
    </>
  );
}

function FAATab({ vm }: { vm: ReportVM }) {
  const totalDays = vm.usage.totalDays ?? 0;
  const sixPlus = vm.usage.sixPlusUsage;
  const fourPlus = vm.usage.fourPlusUsage ?? 0;
  // FAA Special Issuance: typically requires ~75% nights with >= 6h use + AHI < 5.
  const sixPct = totalDays > 0 && sixPlus !== undefined ? (sixPlus / totalDays) * 100 : null;
  const fourPct = totalDays > 0 ? (fourPlus / totalDays) * 100 : 0;
  const ahi = vm.ahi.ahiIndex ?? Infinity;
  const meetsUsage = sixPct === null ? false : sixPct >= 75;
  const meetsAhi = ahi < 5;
  const meets = meetsUsage && meetsAhi;
  return (
    <>
      <Section title="FAA Special Issuance Criteria">
        <Row
          label="Usage ≥ 6 h on ≥ 75% of nights"
          value={sixPct === null ? "Not available" : `${meetsUsage ? "Yes" : "No"} (${sixPct.toFixed(1)}%)`}
        />
        <Row
          label="Compliance ≥ 4 h on nights"
          value={`${fourPct.toFixed(1)}%`}
        />
        <Row
          label="AHI < 5"
          value={ahi === Infinity ? "Not available" : `${meetsAhi ? "Yes" : "No"} (${ahi.toFixed(2)})`}
        />
        <Row
          label="Overall"
          value={<span className={`badge ${meets ? "badge-green" : "badge-red"}`}>{meets ? "Meets criteria" : "Does not meet criteria"}</span>}
        />
      </Section>
      <p className="text-xs text-slate-400 px-1">
        Verdict is a heuristic shown for guidance only — submit the full report with your medical examiner.
      </p>
    </>
  );
}
