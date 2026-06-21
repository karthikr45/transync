// Lightweight error reporting hook. Sentry / Datadog can be wired in by
// supplying SENTRY_DSN (or DATADOG_API_KEY) at deploy time and replacing
// the body of `captureException` with the relevant SDK call. Until then
// this is a no-op that still logs to the console.

type Severity = "error" | "warn" | "info";

export type ErrorContext = {
  url?: string;
  user?: { id?: string; kind?: string; role?: string };
  extra?: Record<string, unknown>;
  severity?: Severity;
};

const DSN = (process.env.SENTRY_DSN ?? "").trim();

export function captureException(err: unknown, ctx: ErrorContext = {}): void {
  const severity = ctx.severity ?? "error";
  const fn = severity === "info" ? console.info : severity === "warn" ? console.warn : console.error;
  fn("[observability]", err, ctx);

  if (!DSN) return;

  // Replace this block with an SDK init at module load and Sentry.captureException(err, { contexts: ctx })
  // when SENTRY_DSN is set in your deployment.
  // For now we only emit a structured log so a log shipper can pick it up.
  try {
    const payload = {
      ts: new Date().toISOString(),
      level: severity,
      msg: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      ...ctx,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ obs: payload }));
  } catch {
    /* swallow */
  }
}

export function captureMessage(message: string, ctx: ErrorContext = {}): void {
  captureException(new Error(message), ctx);
}
