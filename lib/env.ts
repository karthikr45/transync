// Centralised environment access. Server-side variables are not prefixed
// with NEXT_PUBLIC_ so they never leak into the client bundle.

const RAW =
  (process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "")
    .trim();

export const API_BASE_URL: string = RAW.replace(/\/$/, "");

export const HAS_API_BASE_URL: boolean = API_BASE_URL.length > 0;

if (!HAS_API_BASE_URL) {
  // Loud on every boot so misconfiguration is caught immediately.
  console.error(
    "[Transcend] API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL) is not set. " +
    "Configure it in .env.local before deploying.",
  );
}
