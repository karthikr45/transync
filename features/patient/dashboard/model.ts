import type { EventGraphDto, SessionWindow } from "@/lib/types.api";
export const SESSIONS: { id: SessionWindow; label: string }[] = [
  { id: 0, label: "Last 24 Hours" },
  { id: 1, label: "7 Days" },
  { id: 2, label: "30 Days" },
  { id: 3, label: "90 Days" },
];

export function coercePoint(raw: unknown, idx: number): { label: string; value: number } {
  if (raw === null || raw === undefined) return { label: String(idx), value: 0 };
  if (typeof raw === "number") return { label: String(idx), value: raw };
  if (typeof raw === "string") return { label: String(idx), value: Number(raw) || 0 };
  const o = raw as Record<string, unknown>;
  const labelCandidate = o.label ?? o.x ?? o.date ?? o.day ?? o.name ?? o.key ?? String(idx);
  const valueCandidate =
    o.value ??
    o.y ??
    o.count ??
    o.total ??
    o.avg ??
    o.average ??
    o.hours ??
    o.usageHours ??
    o.usageHrs ??
    o.ahi ??
    o.leak ??
    o.score ??
    o.sleepScore ??
    0;
  const num = typeof valueCandidate === "number" ? valueCandidate : Number(valueCandidate);
  return { label: String(labelCandidate), value: Number.isFinite(num) ? num : 0 };
}

export function normaliseBarChart(raw: unknown): EventGraphDto[] {
  if (raw === null || raw === undefined) return [];
  if (Array.isArray(raw)) return raw.map(coercePoint);
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data.map(coercePoint);
    if (Array.isArray(o.result)) return o.result.map(coercePoint);
    if (Array.isArray(o.points)) return o.points.map(coercePoint);
    if (Array.isArray(o.labels) && Array.isArray(o.values)) {
      const labels = o.labels as unknown[];
      const values = o.values as unknown[];
      return labels.map((label, i) => coercePoint({ label, value: values[i] }, i));
    }
  }
  return [];
}

export type Charts = {
  usage: EventGraphDto[];
  leak: EventGraphDto[];
  ahi: EventGraphDto[];
  sleep: EventGraphDto[];
  mask: EventGraphDto[];
};

export const EMPTY_CHARTS: Charts = { usage: [], leak: [], ahi: [], sleep: [], mask: [] };
