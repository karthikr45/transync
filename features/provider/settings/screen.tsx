import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ChevronRight } from "lucide-react";
import { groups } from "./components";

export default function SettingsHub() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Organization-wide configuration." />
      {groups.map((g) => (
        <div key={g.title} className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            {g.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {g.items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="card p-5 flex items-start gap-4 hover:bg-slate-50 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  {i.icon}
                </div>
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
