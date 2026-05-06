import { LayoutDashboard, FileText, Smartphone, Share2, User } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import { currentPatient } from "@/lib/mock-data";

const nav = [
  { href: "/patient/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/patient/reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
  { href: "/patient/devices", label: "Devices", icon: <Smartphone className="w-4 h-4" /> },
  { href: "/patient/sharing", label: "Sharing", icon: <Share2 className="w-4 h-4" /> },
  { href: "/patient/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="Individual User" user={{ name: currentPatient.name, email: currentPatient.email }} nav={nav}>
      {children}
    </PortalShell>
  );
}
