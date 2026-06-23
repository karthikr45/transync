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
