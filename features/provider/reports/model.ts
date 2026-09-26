import type { ComplianceWindow } from "@/lib/types.api";
export const PAGE_SIZE = 50;

export const WINDOWS: { id: ComplianceWindow; label: string }[] = [
  { id: "24h", label: "Past 24 hours" },
  { id: "7d", label: "Past 7 days" },
  { id: "30d", label: "Past 30 days" },
  { id: "90d", label: "Past 90 days" },
];

export function csvEscape(v: string | number | boolean): string {
  const raw = String(v);
  // Spreadsheet applications interpret leading formula characters on import.
  const s = /^[=+@\t\r]|^-\D/.test(raw) ? "'" + raw : raw;
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
