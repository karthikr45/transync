"use client";

import { useEffect, useState } from "react";
import PortalShell, { NavItem } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";

const PLACEHOLDER = { name: "", email: "" };

/**
 * Sidebar shell for the three home-care portals (provider, monitor,
 * super-admin). Reads the signed-in account from localStorage in an
 * effect (placeholder during SSR to avoid hydration mismatch) and
 * derives a display name from companyName / institutionName / first+last
 * / email, in that order.
 */
export default function HomeCareShell({
  role,
  nav,
  children,
}: {
  role: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ name: string; email: string }>(PLACEHOLDER);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    const name = u.companyName || u.institutionName || fullName || u.email;
    setUser({ name, email: u.email });
  }, []);

  return (
    <PortalShell role={role} user={user} nav={nav}>
      {children}
    </PortalShell>
  );
}
