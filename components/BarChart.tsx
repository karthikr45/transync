"use client";

import type { EventGraphDto } from "@/lib/types.api";

type Tone = "brand" | "amber" | "green" | "slate";

// Bar gradient by tone — top color → bottom color, matching the mobile
// mint/cyan look on the patient dashboard.
const TONE_GRAD: Record<Tone, string> = {
  brand: "from-cyan-300 to-emerald-300",
  amber: "from-amber-300 to-orange-400",
  green: "from-emerald-300 to-green-400",
  slate: "from-slate-300 to-slate-400",
};

// Round a value up to a "nice" axis maximum (1, 2, 5 × 10^n) so y-axis
// labels land on whole numbers — the way every other chart library
// does it. Returns 1 for non-positive input so we always draw an axis.
function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const pow = Math.pow(10, exp);
  const norm = value / pow;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * pow;
}

function ticksDownFrom(max: number, segments = 5): number[] {
  const step = max / segments;
  const out: number[] = [];
  for (let i = segments; i >= 0; i--) out.push(Math.round(step * i * 100) / 100);
  return out;
}

function fmt(v: number): string {
  if (!Number.isFinite(v)) return "0";
  if (v === 0) return "0";
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

/**
 * Vertical bar chart for patient-dashboard trend cards. Pure CSS — no
 * chart-library dependency. Y-axis is rendered with "nice" ticks +
 * gridlines, value labels sit above each bar (mobile pattern).
 */
export default function BarChart({
  title, unit, points, tone = "brand", loading, empty,
}: {
  title: string;
  unit?: string;
  points: EventGraphDto[];
  tone?: Tone;
  loading?: boolean;
  empty?: string;
}) {
  const numericValues = points
    .map((p) => Number(p.value))
    .filter((v) => Number.isFinite(v));
  const dataMax = numericValues.reduce((m, v) => Math.max(m, v), 0);
  const yMax = niceMax(dataMax);
  const ticks = ticksDownFrom(yMax);
  const allZero = numericValues.length > 0 && dataMax === 0;
  const PLOT_H = "h-56"; // ~224 px

  if (loading) {
    return (
      <ChartFrame title={title} unit={unit}>
        <div className={`${PLOT_H} flex items-center justify-center text-xs text-slate-400`}>Loading…</div>
      </ChartFrame>
    );
  }
  if (points.length === 0) {
    return (
      <ChartFrame title={title} unit={unit}>
        <div className={`${PLOT_H} flex items-center justify-center text-xs text-slate-400`}>{empty ?? "No data."}</div>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame title={title} unit={unit}>
      <div className={`${PLOT_H} flex`}>
        {/* Y-axis */}
        <div className="w-10 flex flex-col justify-between text-[10px] text-slate-400 pr-2 text-right tabular-nums">
          {ticks.map((t, i) => <span key={i}>{fmt(t)}</span>)}
        </div>

        {/* Plot area */}
        <div className="relative flex-1">
          {/* Horizontal gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {ticks.map((_, i) => <div key={i} className="border-t border-slate-100" />)}
          </div>
          {/* Bars + value labels */}
          <div className="absolute inset-0 flex items-end gap-3 px-1">
            {points.map((p, i) => {
              const v = Number(p.value);
              const safeV = Number.isFinite(v) ? v : 0;
              // Cap bar fill at 90% so the value label always fits in
              // the top 10% of the plot area. Non-zero values clamped
              // to a 4 % min so they're never invisible.
              const h = yMax > 0
                ? safeV === 0
                  ? 0
                  : Math.max(4, Math.round((safeV / yMax) * 90))
                : 0;
              return (
                <div key={`${p.label}-${i}`} className="flex-1 flex flex-col items-center justify-end min-w-0">
                  <span className="text-[10px] text-slate-700 font-medium leading-none mb-1 tabular-nums">
                    {fmt(safeV)}
                  </span>
                  <div
                    className={`w-full max-w-[44px] rounded-t bg-gradient-to-b ${TONE_GRAD[tone]}`}
                    style={{ height: `${h}%` }}
                    title={`${p.label}: ${safeV}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels — aligned under the bars (same gap + padding) */}
      <div className="flex pl-10 gap-3 mt-2 px-1">
        {points.map((p, i) => (
          <span
            key={`xl-${i}`}
            className="flex-1 text-[10px] text-slate-500 truncate text-center"
            title={p.label}
          >
            {p.label}
          </span>
        ))}
      </div>

      {allZero && (
        <p className="mt-2 text-[10px] text-slate-400 text-center">No events recorded in this window.</p>
      )}
    </ChartFrame>
  );
}

function ChartFrame({
  title, unit, children,
}: { title: string; unit?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {children}
    </div>
  );
}
