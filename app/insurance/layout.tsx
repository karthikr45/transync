import { LayoutDashboard, Users, FileText, ScrollText } from "lucide-react";
import PortalShell from "@/components/PortalShell";

const nav = [
  { href: "/insurance/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/insurance/patients", label: "Patients", icon: <Users className="w-4 h-4" /> },
  { href: "/insurance/reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
  { href: "/insurance/audit", label: "Audit log", icon: <ScrollText className="w-4 h-4" /> },
];

export default function InsuranceLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="Insurance / Monitor" user={{ name: "BlueCross — Claims", email: "claims@bluecross.com" }} nav={nav}>
      {children}
    </PortalShell>
  );
}
