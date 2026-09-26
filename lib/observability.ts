// Never log patient data, request URLs, arbitrary errors, or session tokens.
// Connect this sanitized event to your organization's monitoring collector.
type Severity = "error" | "warn" | "info";
export type ErrorContext = {
  url?: string;
  user?: { id?: string; kind?: string; role?: string };
  extra?: Record<string, unknown>;
  severity?: Severity;
};
export function captureException(error: unknown, context: ErrorContext = {}): void {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;
  const event = { event: "client_error", severity: context.severity ?? "error", digest };
  console.error("[Transync]", event);
}
export function captureMessage(_message: string, context: ErrorContext = {}): void {
  captureException(undefined, context);
}
