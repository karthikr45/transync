// Display ↔ API date format helpers. The API speaks yyyy-MM-dd (ISO);
// the UI displays the friendly "1-june-2026" form.

const MONTHS_LONG = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** "2026-06-01" -> "1-june-2026". Returns the input unchanged if not parseable. */
export function displayDob(iso: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mm, dd] = m;
  const idx = Number(mm) - 1;
  if (idx < 0 || idx > 11) return iso;
  const day = String(Number(dd)); // strip leading zero
  return `${day}-${MONTHS_LONG[idx]}-${y}`;
}
