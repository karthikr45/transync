import { Session, fullComplianceReport } from "@/lib/mock-data";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium mt-0.5">{value}</dd>
    </div>
  );
}

export default function ComplianceReport({
  sessions,
  settings = { min: 4, max: 14, start: 8, ramp: "20 min", ezex: 2 },
}: {
  sessions: Session[];
  settings?: { min: number; max: number; start: number; ramp: string; ezex: number };
}) {
  const r = fullComplianceReport(sessions);
  return (
    <div className="space-y-5">
      <Section title="Compliance Summary">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Cell label="Total days" value={r.totalDays} />
          <Cell label="Days used" value={r.daysUsed} />
          <Cell label="Total therapy hours" value={`${r.totalHours} h`} />
          <Cell label="Avg hours/night" value={`${r.avgHours} h`} />
          <Cell label="Median hours/night" value={`${r.medianHours} h`} />
          <Cell label="90th pct pressure" value={`${r.p90Pressure} cmH₂O`} />
          <Cell label="95th pct pressure" value={`${r.p95Pressure} cmH₂O`} />
          <Cell label="Days not used" value={r.buckets.notUsed} />
        </dl>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
          {[
            ["< 4 hr", r.buckets.lt4],
            ["4–6 hr", r.buckets.h4to6],
            ["6–8 hr", r.buckets.h6to8],
            ["≥ 8 hr", r.buckets.gte8],
            ["Not used", r.buckets.notUsed],
          ].map(([l, v]) => (
            <div key={l as string} className="bg-slate-50 rounded-lg py-2">
              <div className="text-lg font-semibold text-slate-900">{v as number}</div>
              <div className="text-slate-500">{l as string}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid md:grid-cols-2 gap-5">
        <Section title="Patient Therapy Settings">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Cell label="Min pressure" value={`${settings.min} cmH₂O`} />
            <Cell label="Max pressure" value={`${settings.max} cmH₂O`} />
            <Cell label="Starting pressure" value={`${settings.start} cmH₂O`} />
            <Cell label="Ramp" value={settings.ramp} />
            <Cell label="EZEX pressure relief" value={settings.ezex} />
          </dl>
        </Section>

        <Section title="Therapy Pressure Summary">
          <dl className="grid grid-cols-3 gap-4 text-sm">
            <Cell label="Min delivered" value={`${settings.min} cmH₂O`} />
            <Cell label="Max delivered" value={`${settings.max} cmH₂O`} />
            <Cell label="Time-weighted avg" value={`${r.p90Pressure} cmH₂O`} />
          </dl>
        </Section>

        <Section title="AHI — Events Per Hour of Use">
          <dl className="grid grid-cols-3 gap-4 text-sm">
            <Cell label="AHI index" value={r.ahi} />
            <Cell label="Apnea index" value={r.apneaIndex} />
            <Cell label="Hypopnea index" value={r.hypopneaIndex} />
          </dl>
        </Section>

        <Section title="Leak Summary">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Cell label="Average leak" value={`${r.leakAvg} L/min`} />
            <Cell label="Median leak" value={`${r.leakMedian} L/min`} />
            <Cell label="90th pct leak" value={`${r.leakP90} L/min`} />
            <Cell label="95th pct leak" value={`${r.leakP95} L/min`} />
          </dl>
        </Section>
      </div>
    </div>
  );
}
