// Only explicitly public configuration belongs in browser bundles.
export function parseApiBaseUrl(value: string | undefined): string {
  if (!value?.trim()) return "";
  const url = new URL(value.trim());
  if (url.username || url.password || url.search || url.hash)
    throw new Error("API base URL must not contain credentials, query parameters, or fragments.");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local))
    throw new Error("API base URL must use HTTPS (HTTP is allowed only for local development).");
  return url.toString().replace(/\/$/, "");
}
export const API_BASE_URL = parseApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
export const HAS_API_BASE_URL = !!API_BASE_URL;
