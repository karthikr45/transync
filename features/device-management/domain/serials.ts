export function parseSerials(input: string): { serials: string[]; duplicates: number } {
  const entries = input
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!entries.length) throw new Error("Enter at least one device serial number.");
  if (entries.length > 100) throw new Error("Enter no more than 100 serial numbers at a time.");
  // Do not invent a manufacturer format or change case; the registry is authoritative.
  if (entries.some((s) => s.length > 128 || /[\x00-\x1f\x7f]/.test(s)))
    throw new Error(
      "One or more serial numbers contain invalid characters or exceed 128 characters.",
    );
  const serials = [...new Set(entries)];
  return { serials, duplicates: entries.length - serials.length };
}
export const outcomeLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
