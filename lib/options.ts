// Normalise any "option list" payload (string[], {label,value}[],
// {name}[]) into a plain string[] suitable for rendering inside
// <option>{value}</option>.

export function normaliseOptions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const item of input) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push(t);
      continue;
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const candidates = [o.label, o.name, o.value, o.code, o.id];
      const picked = candidates.find((c) => typeof c === "string" && (c as string).trim().length > 0);
      if (typeof picked === "string") out.push(picked.trim());
    }
  }
  return out;
}
