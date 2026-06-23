// Shared display formatters. The API speaks ISO yyyy-MM-dd and E.164
// phone numbers; everywhere we render those in the UI it has to go
// through one of these helpers so the format stays consistent.

import { formatPhoneNumberIntl, isValidPhoneNumber } from "react-phone-number-input";

const MONTHS_LONG = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function ymdToFriendly(y: number, monthIdx: number, day: number): string {
  if (monthIdx < 0 || monthIdx > 11) return "";
  return `${day}-${MONTHS_LONG[monthIdx]}-${y}`;
}

/** Friendly date string ("1-june-2026") from either yyyy-MM-dd or an ISO timestamp. */
export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "";
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return "";
    return ymdToFriendly(input.getFullYear(), input.getMonth(), input.getDate());
  }
  // Date-only yyyy-MM-dd
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (dateOnly) {
    const [, y, mm, dd] = dateOnly;
    return ymdToFriendly(Number(y), Number(mm) - 1, Number(dd));
  }
  // Full ISO / parseable timestamp
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return ymdToFriendly(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Friendly date+time ("1-june-2026 14:32"). */
export function formatDateTime(input: string | Date | null | undefined): string {
  if (!input) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return typeof input === "string" ? input : "";
  const date = ymdToFriendly(d.getFullYear(), d.getMonth(), d.getDate());
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${date} ${hh}:${mm}`;
}

/** Format a stored E.164 phone number into the international display
 *  form (e.g. "+1 415 555 1234"). */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return "";
  try {
    const out = formatPhoneNumberIntl(e164);
    return out || e164;
  } catch {
    return e164;
  }
}

export function isValidPhone(e164: string | null | undefined): boolean {
  if (!e164) return false;
  try { return isValidPhoneNumber(e164); } catch { return false; }
}

// Kept for back-compat with code still importing displayDob.
export const displayDob = formatDate;
