// RFC 9116 security.txt for vulnerability disclosure.

export function GET() {
  const contact = process.env.SECURITY_CONTACT_EMAIL ?? "security@transcend.example";
  const policy = process.env.SECURITY_POLICY_URL ?? "https://transcend.example/security";
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  const body = [
    `Contact: mailto:${contact}`,
    `Policy: ${policy}`,
    `Preferred-Languages: en`,
    `Expires: ${expires.toISOString()}`,
    "",
  ].join("\n");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
