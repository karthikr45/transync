import { LayoutDashboard, ListChecks, Users, HardDrive, FileText, Bell, Settings } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import AuthGuard from "@/components/AuthGuard";

const nav = [
  { href: "/provider/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/provider/worklist", label: "Worklist", icon: <ListChecks className="w-4 h-4" /> },
  { href: "/provider/patients", label: "Patients", icon: <Users className="w-4 h-4" /> },
  { href: "/provider/devices", label: "Devices", icon: <HardDrive className="w-4 h-4" /> },
  { href: "/provider/reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
  { href: "/provider/alerts", label: "Alerts", icon: <Bell className="w-4 h-4" /> },
  { href: "/provider/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireKind="home-care" requireUserType="home_care_provider">
      <PortalShell role="Homecare Provider" user={{ name: "Northside Homecare", email: "skim@northside.com" }} nav={nav}>
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
