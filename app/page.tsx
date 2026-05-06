import Link from "next/link";
import { Activity, User, Building2, Eye, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">TranSync</div>
              <div className="text-xs text-slate-500">Cloud Compliance Reporting</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">Log on</Link>
            <Link href="/register" className="btn-primary">Register</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold text-slate-900 leading-tight">
            Manage Transcend miniCPAP compliance from anywhere.
          </h1>
          <p className="mt-4 text-slate-600">
            TranSync is the cloud companion to your Transcend miniCPAP. Patients view their therapy. Homecare providers
            track populations. Authorized monitors review compliance for clinical or insurance purposes.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/login" className="btn-primary">Log on <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/register" className="btn-secondary">Register</Link>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-lg font-semibold text-slate-900">Three account types</h2>
          <p className="text-sm text-slate-600 mt-1">Pick the one that matches how you&apos;ll use TranSync.</p>
          <div className="mt-5 grid md:grid-cols-3 gap-5">
            <RoleCard
              icon={<Building2 className="w-6 h-6" />}
              title="Homecare Provider"
              desc="An institution that tracks compliance for a patient population. Full access to patient data, including editing and sharing with other accounts."
              href="/provider/dashboard"
              cta="Open provider portal"
            />
            <RoleCard
              icon={<Eye className="w-6 h-6" />}
              title="Authorized Monitor"
              desc="Read-only access for clinicians, monitoring services, or insurance providers. Homecare Providers must share patients with you."
              href="/monitor/dashboard"
              cta="Open monitor portal"
            />
            <RoleCard
              icon={<User className="w-6 h-6" />}
              title="Individual User"
              desc="A patient with a Transcend device, tracking their own compliance and sharing data with their care team."
              href="/patient/dashboard"
              cta="Open my portal"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-500 flex justify-between">
          <span>© 2026 TranSync. For demo purposes only.</span>
          <span>HIPAA · GDPR ready</span>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({
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
      <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 flex-1">{desc}</p>
      <Link href={href} className="mt-4 text-sm font-medium text-brand-600 inline-flex items-center gap-1">
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
