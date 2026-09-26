export const dynamic = "force-dynamic";
/** Liveness only; deliberately does not expose infrastructure or credentials. */
export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
