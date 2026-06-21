// Minimal i18n. No runtime dependency; copy strings into the dictionary
// and call t() with a key path. Add a new locale by writing
// `messages/<lang>.json` and registering it in `dictionaries`.
//
// We intentionally avoid pulling in `next-intl` until we need RTL support,
// number / date formatting per locale, pluralisation, or middleware-based
// locale negotiation.

import en from "@/messages/en.json";

type Messages = typeof en;

export type Locale = "en";

const dictionaries: Record<Locale, Messages> = {
  en,
};

let currentLocale: Locale = "en";

export function setLocale(locale: Locale): void {
  if (dictionaries[locale]) currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

type DotPath<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${DotPath<T[K]>}`
        : `${K}`;
    }[keyof T & string]
  : never;

export type MessageKey = DotPath<Messages>;

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const parts = key.split(".");
  let cur: unknown = dictionaries[currentLocale];
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key; // missing key falls back to the dotted key (helps spot misses)
    }
  }
  let out = typeof cur === "string" ? cur : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return out;
}
