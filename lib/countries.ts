// Country lookups derived from i18n-iso-countries (English locale) and
// the static states.json keyed by ISO 3166-1 alpha-2 (lowercase) codes.

import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import statesByIso from "@/data/states.json";

let registered = false;
function ensure(): void {
  if (registered) return;
  countries.registerLocale(en);
  registered = true;
}

export type CountryOption = { code: string; name: string };

export function listCountries(): CountryOption[] {
  ensure();
  const names = countries.getNames("en", { select: "official" }) as Record<string, string>;
  return Object.entries(names)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function nameForCode(code: string): string {
  ensure();
  const n = countries.getName(code, "en", { select: "official" });
  return n ?? code;
}

export function codeForName(name: string): string | null {
  ensure();
  return countries.getAlpha2Code(name, "en") ?? null;
}

// State / province lookup. Returns null when the source data has no
// entry for the country and an empty array for sentinel "No States".
export function statesForCode(code: string): string[] | null {
  const map = statesByIso as Record<string, string[]>;
  const list = map[code.toLowerCase()];
  if (!list) return null;
  if (list.length === 1 && list[0] === "No States") return [];
  return list;
}
