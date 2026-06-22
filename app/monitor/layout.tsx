import { LayoutDashboard, Users, Inbox, FileText, ScrollText } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import AuthGuard from "@/components/AuthGuard";

const nav = [
  { href: "/monitor/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/monitor/patients", label: "Patients", icon: <Users className="w-4 h-4" /> },
  { href: "/monitor/shares", label: "Shares", icon: <Inbox className="w-4 h-4" /> },
  { href: "/monitor/reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
  { href: "/monitor/audit", label: "Audit log", icon: <ScrollText className="w-4 h-4" /> },
];

export default function MonitorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireKind="home-care" requireUserType="authorized_monitor">
      <PortalShell role="Authorized Monitor" user={{ name: "BlueCross Claims", email: "claims@bluecross.com" }} nav={nav}>
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
