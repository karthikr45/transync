import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Users, Stethoscope, ShieldCheck, Layers, Bell, Building2, BellRing, Plug, ScrollText, ChevronRight } from "lucide-react";

const groups: { title: string; items: { href: string; icon: React.ReactNode; title: string; desc: string }[] }[] = [
  {
    title: "Reference data",
    items: [
      { href: "/provider/settings/users", icon: <Users className="w-5 h-5" />, title: "Users", desc: "Org users & roles (IT Admin / Full / Read-Only)." },
      { href: "/provider/settings/care-monitors", icon: <Stethoscope className="w-5 h-5" />, title: "Care monitors", desc: "Referring & prescribing physicians." },
      { href: "/provider/settings/insurance", icon: <ShieldCheck className="w-5 h-5" />, title: "Insurance providers", desc: "Compliance rules & replacement schedules." },
      { href: "/provider/settings/mask-types", icon: <Layers className="w-5 h-5" />, title: "Mask types", desc: "Catalog of mask SKUs you stock." },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/provider/settings/reminders", icon: <Bell className="w-5 h-5" />, title: "Replacement reminders", desc: "Upcoming consumable replacements." },
      { href: "/provider/settings/alerts", icon: <BellRing className="w-5 h-5" />, title: "Proactive alerts", desc: "Automated non-compliance alerting." },
      { href: "/provider/settings/sub-accounts", icon: <Building2 className="w-5 h-5" />, title: "Sub-accounts", desc: "Partner branches / second locations." },
    ],
  },
  {
    title: "Organization",
    items: [
      { href: "/provider/settings/organization", icon: <Building2 className="w-5 h-5" />, title: "Organization", desc: "Identity, region & data residency." },
      { href: "/provider/settings/integrations", icon: <Plug className="w-5 h-5" />, title: "Integrations", desc: "Brightree, EHR/FHIR, webhooks, API." },
      { href: "/provider/settings/audit", icon: <ScrollText className="w-5 h-5" />, title: "Audit log", desc: "Every PHI & config action, exportable." },
    ],
  },
];

export default function SettingsHub() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Organization-wide configuration." />
      {groups.map((g) => (
        <div key={g.title} className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{g.title}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {g.items.map((i) => (
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
        </div>
      ))}
    </>
  );
}
