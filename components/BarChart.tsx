"use client";

import type { EventGraphDto } from "@/lib/types.api";

type Tone = "brand" | "amber" | "green" | "slate";

const TONE_BAR: Record<Tone, string> = {
  brand: "bg-brand-500/80",
  amber: "bg-amber-500/80",
  green: "bg-green-500/80",
  slate: "bg-slate-400/80",
};

/**
 * Minimal vertical-bar chart for the patient dashboard trend cards.
 * Pure CSS — no chart lib dependency.
 */
export default function BarChart({
  title,
  unit,
  points,
  tone = "brand",
  loading,
  empty,
}: {
  title: string;
  unit?: string;
  points: EventGraphDto[];
  tone?: Tone;
  loading?: boolean;
  empty?: string;
}) {
  const numericValues = points.map((p) => Number(p.value)).filter((v) => Number.isFinite(v));
  const max = numericValues.reduce((m, v) => Math.max(m, v), 0);
  const allZero = numericValues.length > 0 && max === 0;

  const fmt = (v: number) => {
    if (!Number.isFinite(v)) return "0";
    if (v === 0) return "0";
    if (Math.abs(v) >= 100) return v.toFixed(0);
    if (Math.abs(v) >= 10) return v.toFixed(1);
    return v.toFixed(2);
  };

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {loading ? (
        <div className="h-32 flex items-center justify-center text-xs text-slate-400">Loading…</div>
      ) : points.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-xs text-slate-400">{empty ?? "No data."}</div>
      ) : (
        <>
          <div className="h-36 flex items-end gap-1">
            {points.map((p, i) => {
              const v = Number(p.value);
              const safeV = Number.isFinite(v) ? v : 0;
              // Always render at least a 4% sliver so the user can see
              // the chart has data. Bars scale to the page max above
              // that baseline.
              const h = max > 0 ? Math.max(4, Math.round((safeV / max) * 100)) : 4;
              return (
                <div key={`${p.label}-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
                  <span className="text-[10px] text-slate-600 font-medium truncate w-full text-center">{fmt(safeV)}</span>
                  <div
                    className={`w-full rounded-t ${TONE_BAR[tone]}`}
                    style={{ height: `${h}%` }}
                    title={`${p.label}: ${safeV}`}
                  />
                  <span className="text-[10px] text-slate-500 truncate w-full text-center" title={p.label}>{p.label}</span>
                </div>
              );
            })}
          </div>
          {allZero && (
            <p className="mt-2 text-[10px] text-slate-400 text-center">No events recorded in this window.</p>
          )}
        </>
      )}
    </div>
  );
}
