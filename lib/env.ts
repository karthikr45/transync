// Client-visible backend URL. Must be NEXT_PUBLIC_* so it's available
// in the browser bundle (the client now calls the upstream directly).
// API_BASE_URL (without NEXT_PUBLIC_) is honoured as a fallback so an
// older .env still works during the transition.

export const API_BASE_URL: string = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  ""
).trim().replace(/\/$/, "");

export const HAS_API_BASE_URL: boolean = API_BASE_URL.length > 0;

if (!HAS_API_BASE_URL) {
  console.error(
    "[Transcend] NEXT_PUBLIC_API_BASE_URL is not set. Configure it in .env.local before running the app.",
  );
}
