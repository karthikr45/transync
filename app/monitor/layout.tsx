import { LayoutDashboard, Users, FileText, ScrollText } from "lucide-react";
import PortalShell from "@/components/PortalShell";

const nav = [
  { href: "/monitor/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/monitor/patients", label: "Patients", icon: <Users className="w-4 h-4" /> },
  { href: "/monitor/reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
  { href: "/monitor/audit", label: "Audit log", icon: <ScrollText className="w-4 h-4" /> },
];

export default function MonitorLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="Authorized Monitor" user={{ name: "BlueCross Claims", email: "claims@bluecross.com" }} nav={nav}>
      {children}
    </PortalShell>
  );
}
