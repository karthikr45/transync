import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Users, Stethoscope, ShieldCheck, Layers, Bell, Building2, ChevronRight } from "lucide-react";

const items = [
  { href: "/provider/settings/users", icon: <Users className="w-5 h-5" />, title: "Users", desc: "Manage org users and roles (IT Admin / Full / Read-Only)." },
  { href: "/provider/settings/care-monitors", icon: <Stethoscope className="w-5 h-5" />, title: "Care monitors", desc: "Referring & prescribing physicians (informational tags)." },
  { href: "/provider/settings/insurance", icon: <ShieldCheck className="w-5 h-5" />, title: "Insurance providers", desc: "Payers, compliance rules & replacement schedules." },
  { href: "/provider/settings/mask-types", icon: <Layers className="w-5 h-5" />, title: "Mask types", desc: "Catalog of mask SKUs you stock." },
  { href: "/provider/settings/reminders", icon: <Bell className="w-5 h-5" />, title: "Replacement reminders", desc: "Upcoming consumable replacements." },
];

export default function SettingsHub() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Organization-wide configuration." />
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="card p-5 flex items-start gap-4 hover:bg-slate-50 transition">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">{i.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{i.title}</div>
              <p className="text-sm text-slate-600 mt-0.5">{i.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 mt-1" />
          </Link>
        ))}
      </div>

      <div className="card p-5 mt-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Building2 className="w-5 h-5" /></div>
          <div>
            <div className="font-semibold text-slate-900">Sub-accounts</div>
            <p className="text-sm text-slate-600 mt-0.5">
              Partner branches / second locations. Patients can be shared to a sub-account while you keep control.
            </p>
            <div className="mt-2 text-sm">
              <span className="badge badge-slate mr-2">Northside — West Branch</span>
              <span className="badge badge-slate">Northside — South Clinic</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
