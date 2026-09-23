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

/**
 * Friendly date string ("1-june-2026") from either yyyy-MM-dd or an ISO
 * timestamp. Pass utc=true for device-sync timestamps (lastSyncDate,
 * lastSettingSyncDate, firstSyncDate) — the mobile app displays those
 * against the UTC calendar date the API returned rather than converting
 * to the viewer's local timezone, so a sync at 23:17 UTC stays on that
 * UTC day instead of rolling into the next local day.
 */
export function formatDate(input: string | Date | null | undefined, utc = false): string {
  if (!input) return "";
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return "";
    return utc
      ? ymdToFriendly(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate())
      : ymdToFriendly(input.getFullYear(), input.getMonth(), input.getDate());
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
  return utc
    ? ymdToFriendly(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    : ymdToFriendly(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Friendly date+time ("1-june-2026 14:32"). See formatDate for the utc flag. */
export function formatDateTime(input: string | Date | null | undefined, utc = false): string {
  if (!input) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return typeof input === "string" ? input : "";
  const date = utc
    ? ymdToFriendly(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    : ymdToFriendly(d.getFullYear(), d.getMonth(), d.getDate());
  const hh = String(utc ? d.getUTCHours() : d.getHours()).padStart(2, "0");
  const mm = String(utc ? d.getUTCMinutes() : d.getMinutes()).padStart(2, "0");
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
