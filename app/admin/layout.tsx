import { LayoutDashboard, ClipboardCheck, Building2 } from "lucide-react";
import PortalShell from "@/components/PortalShell";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/admin/approvals", label: "Approvals", icon: <ClipboardCheck className="w-4 h-4" /> },
  { href: "/admin/organizations", label: "Organizations", icon: <Building2 className="w-4 h-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="Platform Admin" user={{ name: "Transcend Operations", email: "ops@transcend.com" }} nav={nav}>
      {children}
    </PortalShell>
  );
}
