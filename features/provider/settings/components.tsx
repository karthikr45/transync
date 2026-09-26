import {
  Users,
  Stethoscope,
  ShieldCheck,
  Layers,
  Bell,
  Building2,
  BellRing,
  Plug,
  ScrollText,
} from "lucide-react";
export const groups: {
  title: string;
  items: { href: string; icon: React.ReactNode; title: string; desc: string }[];
}[] = [
  {
    title: "Reference data",
    items: [
      {
        href: "/provider/settings/users",
        icon: <Users className="w-5 h-5" />,
        title: "Users",
        desc: "Org users & roles (IT Admin / Full / Read-Only).",
      },
      {
        href: "/provider/settings/care-monitors",
        icon: <Stethoscope className="w-5 h-5" />,
        title: "Care monitors",
        desc: "Referring & prescribing physicians.",
      },
      {
        href: "/provider/settings/insurance",
        icon: <ShieldCheck className="w-5 h-5" />,
        title: "Insurance providers",
        desc: "Compliance rules & replacement schedules.",
      },
      {
        href: "/provider/settings/mask-types",
        icon: <Layers className="w-5 h-5" />,
        title: "Mask types",
        desc: "Catalog of mask SKUs you stock.",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/provider/settings/reminders",
        icon: <Bell className="w-5 h-5" />,
        title: "Replacement reminders",
        desc: "Upcoming consumable replacements.",
      },
      {
        href: "/provider/settings/alerts",
        icon: <BellRing className="w-5 h-5" />,
        title: "Proactive alerts",
        desc: "Automated non-compliance alerting.",
      },
      {
        href: "/provider/settings/sub-accounts",
        icon: <Building2 className="w-5 h-5" />,
        title: "Sub-accounts",
        desc: "Partner branches / second locations.",
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        href: "/provider/settings/organization",
        icon: <Building2 className="w-5 h-5" />,
        title: "Organization",
        desc: "Identity, region & data residency.",
      },
      {
        href: "/provider/settings/integrations",
        icon: <Plug className="w-5 h-5" />,
        title: "Integrations",
        desc: "Brightree, EHR/FHIR, webhooks, API.",
      },
      {
        href: "/provider/settings/audit",
        icon: <ScrollText className="w-5 h-5" />,
        title: "Audit log",
        desc: "Every PHI & config action, exportable.",
      },
    ],
  },
];
