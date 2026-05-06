import Link from "next/link";
import { Activity, HeartPulse, Stethoscope, ShieldCheck, ArrowRight } from "lucide-react";

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
              <div className="text-xs text-slate-500">Transcend miniCPAP compliance</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">Sign in</Link>
            <Link href="/register" className="btn-primary">Create account</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold text-slate-900 leading-tight">
            CPAP compliance, made simple for patients, providers and payers.
          </h1>
          <p className="mt-4 text-slate-600">
            View therapy data, share compliance reports, and manage patient outcomes — all in one place. Your CPAP
            data syncs from the TranSync mobile app to the web.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/login" className="btn-primary">Sign in <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/register" className="btn-secondary">Patient registration</Link>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          <RoleCard
            icon={<HeartPulse className="w-6 h-6" />}
            title="Patient"
            desc="View your therapy data, download reports, and share access with your clinician or insurer."
            href="/patient/dashboard"
            cta="Go to patient portal"
          />
          <RoleCard
            icon={<Stethoscope className="w-6 h-6" />}
            title="Homecare provider"
            desc="Monitor patient roster, track compliance, manage alerts and intervene early."
            href="/provider/dashboard"
            cta="Go to provider portal"
          />
          <RoleCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Insurance / Monitor"
            desc="Verify compliance against payer thresholds and export claims-ready reports."
            href="/insurance/dashboard"
            cta="Go to insurance portal"
          />
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
