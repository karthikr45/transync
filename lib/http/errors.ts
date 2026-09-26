export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function errorMessage(body: unknown, fallback: string): string {
  return isRecord(body) && typeof body.message === "string" ? body.message : fallback;
}

export function fieldErrors(body: unknown): Record<string, string[]> | undefined {
  if (!isRecord(body) || body.error !== "Validation Failed" || !isRecord(body.message))
    return undefined;
  const entries = Object.entries(body.message).filter(
    (entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) && entry[1].every((value) => typeof value === "string"),
  );
  return entries.length ? Object.fromEntries(entries) : undefined;
}
