"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, FileText, Smartphone, Share2, User } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import AuthGuard from "@/components/AuthGuard";
import { getCurrentEndUser } from "@/lib/auth";

const nav = [
  { href: "/patient/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/patient/reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
  { href: "/patient/devices", label: "Devices", icon: <Smartphone className="w-4 h-4" /> },
  { href: "/patient/sharing", label: "Sharing", icon: <Share2 className="w-4 h-4" /> },
  { href: "/patient/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
];

const PLACEHOLDER = { name: "", email: "" };

function PatientShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string }>(PLACEHOLDER);
  useEffect(() => {
    const eu = getCurrentEndUser();
    if (!eu) return;
    setUser({
      name: `${eu.firstName ?? ""} ${eu.lastName ?? ""}`.trim() || eu.email,
      email: eu.email,
    });
  }, []);
  return (
    <PortalShell role="Individual User" user={user} nav={nav}>
      {children}
    </PortalShell>
  );
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireKind="end-user">
      <PatientShell>{children}</PatientShell>
    </AuthGuard>
  );
}
