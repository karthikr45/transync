import { LayoutDashboard, Users, Bell, FileText, UserPlus } from "lucide-react";
import PortalShell from "@/components/PortalShell";

const nav = [
  { href: "/provider/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/provider/patients", label: "Patients", icon: <Users className="w-4 h-4" /> },
  { href: "/provider/alerts", label: "Alerts", icon: <Bell className="w-4 h-4" /> },
  { href: "/provider/reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
  { href: "/provider/invite", label: "Invite patient", icon: <UserPlus className="w-4 h-4" /> },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="Homecare provider" user={{ name: "Sarah Kim, RT", email: "skim@northside.com" }} nav={nav}>
      {children}
    </PortalShell>
  );
}
