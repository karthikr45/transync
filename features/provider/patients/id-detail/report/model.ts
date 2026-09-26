export const DEFAULT_WINDOW_DAYS = 90;

export const DASH = "—";

export const num = (v: number | null | undefined, suffix = "", decimals = 2): string => {
  if (v === null || v === undefined || Number.isNaN(v)) return DASH;
  return `${Number(v).toFixed(decimals)}${suffix}`;
};

export const intOrDash = (v: number | null | undefined): string =>
  v === null || v === undefined ? DASH : String(v);

export const boolOrDash = (v: boolean | null | undefined): string =>
  v === null || v === undefined ? DASH : v ? "Yes" : "No";

export const strOrDash = (v: string | null | undefined): string => (v ? v : DASH);
