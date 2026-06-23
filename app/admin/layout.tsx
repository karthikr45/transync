import { LayoutDashboard, ClipboardCheck, Building2, HardDrive, Users, ScrollText, Settings } from "lucide-react";
import HomeCareShell from "@/components/HomeCareShell";
import AuthGuard from "@/components/AuthGuard";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/admin/approvals", label: "Approvals", icon: <ClipboardCheck className="w-4 h-4" /> },
  { href: "/admin/organizations", label: "Organizations", icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/devices", label: "Device fleet", icon: <HardDrive className="w-4 h-4" /> },
  { href: "/admin/users", label: "Admin users", icon: <Users className="w-4 h-4" /> },
  { href: "/admin/audit", label: "Audit log", icon: <ScrollText className="w-4 h-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireKind="home-care" requireRole="super_admin">
      <HomeCareShell role="Super Admin" nav={nav}>
        {children}
      </HomeCareShell>
    </AuthGuard>
  );
}
