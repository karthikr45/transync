// Next.js calls this once per server boot. Wire up SDK init here
// (Sentry, Datadog, OTel) when needed — keep it side-effect-only so
// it remains lightweight.

export async function register(): Promise<void> {
  if (process.env.SENTRY_DSN) {
    // Example wiring (uncomment after `npm i @sentry/nextjs`):
    // const Sentry = await import("@sentry/nextjs");
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   tracesSampleRate: 0.05,
    //   environment: process.env.NODE_ENV,
    //   release: process.env.NEXT_PUBLIC_RELEASE_ID,
    // });
  }
}
