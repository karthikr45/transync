"use client";

import { LayoutDashboard, FileText, Smartphone, Share2, User } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import { getCurrentEndUser } from "@/lib/auth";
import { currentPatient } from "@/lib/mock-data";

const nav = [
  { href: "/patient/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/patient/reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
  { href: "/patient/devices", label: "Devices", icon: <Smartphone className="w-4 h-4" /> },
  { href: "/patient/sharing", label: "Sharing", icon: <Share2 className="w-4 h-4" /> },
  { href: "/patient/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const eu = getCurrentEndUser();
  const displayName = eu ? `${eu.firstName ?? ""} ${eu.lastName ?? ""}`.trim() || eu.email : currentPatient.name;
  const displayEmail = eu?.email ?? currentPatient.email;
  return (
    <PortalShell role="Individual User" user={{ name: displayName, email: displayEmail }} nav={nav}>
      {children}
    </PortalShell>
  );
}
