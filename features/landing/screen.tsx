import Link from "next/link";
import { User, Building2, Eye, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import { RoleCard } from "./components";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <div className="text-xs text-slate-500 border-l border-slate-200 pl-3">
              Cloud Compliance Reporting
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">
              Log on
            </Link>
            <Link href="/register" className="btn-primary">
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold text-slate-900 leading-tight">
            Manage Transcend miniCPAP compliance from anywhere.
          </h1>
          <p className="mt-4 text-slate-600">
            Transcend is the cloud companion to your Transcend miniCPAP. Patients view their
            therapy. Homecare providers track populations. Authorized monitors review compliance for
            clinical or insurance purposes.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/login" className="btn-primary">
              Log on <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/register" className="btn-secondary">
              Register
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-lg font-semibold text-slate-900">Three account types</h2>
          <p className="text-sm text-slate-600 mt-1">
            Pick the one that matches how you&apos;ll use Transcend.
          </p>
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
          <span>© 2026 Transcend. For demo purposes only.</span>
          <span>Patient and provider portal</span>
        </div>
      </footer>
    </div>
  );
}
