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
  const max = points.reduce((m, p) => Math.max(m, p.value || 0), 0);
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
        <div className="h-32 flex items-end gap-1">
          {points.map((p, i) => {
            const h = max > 0 ? Math.max(2, Math.round((p.value / max) * 100)) : 0;
            return (
              <div key={`${p.label}-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className={`w-full rounded-t ${TONE_BAR[tone]}`}
                  style={{ height: `${h}%` }}
                  title={`${p.label}: ${p.value}`}
                />
                <span className="text-[10px] text-slate-500 truncate w-full text-center" title={p.label}>{p.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
