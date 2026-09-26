import Link from "next/link";
import { ArrowRight } from "lucide-react";
export function RoleCard({
  icon,
  title,
  desc,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="card p-6 flex flex-col">
      <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 flex-1">{desc}</p>
      <Link
        href={href}
        className="mt-4 text-sm font-medium text-brand-600 inline-flex items-center gap-1"
      >
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
