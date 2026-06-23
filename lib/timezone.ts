// Mobile app calls send both the offset (in minutes, as
// Date.getTimezoneOffset() reports) and the IANA name. We mirror that
// so backend calculations match across web and mobile clients.

export function getTimeZoneOffset(): number {
  return new Date().getTimezoneOffset();
}

export function getTimeZoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// Minimal fallback so the dropdown is still useful in browsers
// without Intl.supportedValuesOf (Safari < 15.4, Firefox < 99).
const FALLBACK_TIMEZONES = [
  "UTC",
  "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos", "Africa/Nairobi",
  "America/Anchorage", "America/Argentina/Buenos_Aires", "America/Bogota",
  "America/Chicago", "America/Denver", "America/Halifax", "America/Los_Angeles",
  "America/Mexico_City", "America/New_York", "America/Phoenix", "America/Sao_Paulo",
  "America/Toronto", "America/Vancouver",
  "Asia/Bangkok", "Asia/Dubai", "Asia/Hong_Kong", "Asia/Jakarta", "Asia/Karachi",
  "Asia/Kolkata", "Asia/Manila", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore",
  "Asia/Taipei", "Asia/Tehran", "Asia/Tokyo",
  "Atlantic/Azores", "Atlantic/Reykjavik",
  "Australia/Adelaide", "Australia/Brisbane", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney",
  "Europe/Amsterdam", "Europe/Athens", "Europe/Berlin", "Europe/Brussels", "Europe/Bucharest",
  "Europe/Dublin", "Europe/Helsinki", "Europe/Istanbul", "Europe/Lisbon", "Europe/London",
  "Europe/Madrid", "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Prague",
  "Europe/Rome", "Europe/Stockholm", "Europe/Vienna", "Europe/Warsaw", "Europe/Zurich",
  "Pacific/Auckland", "Pacific/Fiji", "Pacific/Guam", "Pacific/Honolulu",
];

/**
 * The full list of IANA time-zone names the runtime supports
 * (Intl.supportedValuesOf, ECMA-402 2022+). Falls back to a curated
 * subset on older browsers so the dropdown is never empty.
 */
export function listTimeZones(): string[] {
  try {
    type SupportedValuesOf = (key: "timeZone") => string[];
    const intl = Intl as unknown as { supportedValuesOf?: SupportedValuesOf };
    if (typeof intl.supportedValuesOf === "function") {
      const list = intl.supportedValuesOf("timeZone");
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch { /* fall through */ }
  return [...FALLBACK_TIMEZONES].sort();
}

