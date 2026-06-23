// Display ↔ API date format helpers. The API speaks yyyy-MM-dd (ISO);
// the UI displays "01-jun-2026".

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "2026-06-01" -> "01-jun-2026". Returns the input unchanged if not parseable. */
export function displayDob(iso: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mm, dd] = m;
  const idx = Number(mm) - 1;
  if (idx < 0 || idx > 11) return iso;
  return `${dd}-${MONTHS[idx]}-${y}`;
}
