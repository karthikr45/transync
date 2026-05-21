"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Building2, Eye, User, Clock, Mail } from "lucide-react";
import Logo from "@/components/Logo";

type AccountType = "provider" | "monitor" | "individual";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<AccountType | null>(null);

  function next() {
    if (step === 1) {
      if (!type) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    setStep(4); // completion — role-specific
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <Link href="/" className="flex items-center justify-center mb-6">
          <Logo className="h-9 w-auto" />
        </Link>
        {step === 4 ? (
          <Completion type={type} />
        ) : (
          <div className="card p-6">
            <Stepper step={step} />
            {step === 1 && <PickType type={type} setType={setType} />}
            {step === 2 && type && <DetailsForm type={type} />}
            {step === 3 && <Consent type={type} />}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Back
              </button>
              <button onClick={next} disabled={step === 1 && !type} className="btn-primary disabled:opacity-50">
                {step < 3 ? (
                  <>Continue Registration <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Finish <Check className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}
        {step !== 4 && (
          <div className="text-center text-sm text-slate-600 mt-4">
            Already have an account? <Link href="/login" className="text-brand-600 font-medium">Log on</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Completion({ type }: { type: AccountType | null }) {
  if (type === "provider") {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Account submitted for review</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Homecare Provider accounts are verified by Transcend before activation. We&apos;ll review your business license,
          accreditation and Business Associate Agreement (BAA) — typically within 1–2 business days. You&apos;ll get an
          email once approved, and the first user becomes your IT Administrator.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link href="/" className="btn-secondary">Back to home</Link>
          <Link href="/provider/dashboard" className="btn-primary">Preview provider portal (demo)</Link>
        </div>
      </div>
    );
  }
  if (type === "monitor") {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Verify your email</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Check your inbox to verify your address. Once verified you&apos;ll receive a <strong>Monitor ID</strong>. Note:
          you won&apos;t see any patient data until a Homecare Provider shares a patient with you and that patient has
          consented. Clinicians may be granted read-write access; payers receive read-only.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link href="/" className="btn-secondary">Back to home</Link>
          <Link href="/monitor/dashboard" className="btn-primary">Preview monitor portal (demo)</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="card p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
        <Mail className="w-6 h-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">Verify your email</h2>
      <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
        Check your inbox and click the confirmation link to activate your account, then pair your Transcend device in the
        mobile app to start seeing your therapy data.
      </p>
      <div className="mt-6 flex gap-2 justify-center">
        <Link href="/" className="btn-secondary">Back to home</Link>
        <Link href="/patient/dashboard" className="btn-primary">Open my portal (demo)</Link>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Account type", "Details", "Consent"];
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx;
        return (
          <div key={label} className="flex-1 flex items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                done ? "bg-brand-600 text-white" : active ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500" : "bg-slate-100 text-slate-500"
              }`}
            >
              {done ? <Check className="w-4 h-4" /> : idx}
            </div>
            <div className={`ml-2 text-xs font-medium ${active ? "text-slate-900" : "text-slate-500"}`}>{label}</div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-3" />}
          </div>
        );
      })}
    </div>
  );
}

function PickType({ type, setType }: { type: AccountType | null; setType: (t: AccountType) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Account Registration</h2>
      <p className="text-sm text-slate-600 mt-1">Please select the type of account you are registering for:</p>

      <div className="mt-5 space-y-3">
        <TypeCard
          selected={type === "provider"}
          onClick={() => setType("provider")}
          icon={<Building2 className="w-5 h-5" />}
          title="Homecare Provider Account"
          desc="Choose this account if you are an institution that wishes to track compliance for a patient population. This account provides full access to patient data, including editing and sharing with other accounts."
        />
        <TypeCard
          selected={type === "monitor"}
          onClick={() => setType("monitor")}
          icon={<Eye className="w-5 h-5" />}
          title="Authorized Monitoring Account"
          desc={
            <>
              Choose this <span className="underline">read-only</span> account if you are a clinician, monitoring service, insurance provider, or are otherwise authorized to view patient compliance data. Note: In order for you to view patient compliance data, Homecare Providers must share patients with you.
            </>
          }
        />
        <TypeCard
          selected={type === "individual"}
          onClick={() => setType("individual")}
          icon={<User className="w-5 h-5" />}
          title="Individual User Account"
          desc="Choose this account type if you have a Transcend device and wish to track your own compliance."
        />
      </div>
    </div>
  );
}

function TypeCard({
  selected,
  onClick,
  icon,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition flex gap-4 ${
        selected ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30" : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
          selected ? "border-brand-600 bg-brand-600" : "border-slate-300"
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <span className={selected ? "text-brand-700" : "text-slate-500"}>{icon}</span>
          {title}
        </div>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          <span className="text-green-600">✓</span> {desc}
        </p>
      </div>
    </button>
  );
}

function DetailsForm({ type }: { type: AccountType }) {
  if (type === "provider") return <ProviderDetails />;
  if (type === "monitor") return <MonitorDetails />;
  return <IndividualDetails />;
}

function ProviderDetails() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Homecare provider details</h2>
      <p className="text-sm text-slate-500">Tell us about your institution.</p>
      <div><label className="label">Institution / company name</label><input className="input" placeholder="Northside Homecare" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Country</label>
          <select className="input">
            <option>United States</option><option>Canada</option><option>United Kingdom</option>
            <option>Germany</option><option>France</option><option>Australia</option><option>India</option>
          </select>
        </div>
        <div><label className="label">State / region</label><input className="input" /></div>
      </div>
      <div><label className="label">Business address</label><input className="input" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Primary contact name</label><input className="input" /></div>
        <div><label className="label">Phone</label><input className="input" /></div>
      </div>
      <div><label className="label">Email (used to log in)</label><input className="input" type="email" /></div>
      <div><label className="label">Password</label><input className="input" type="password" /></div>
    </div>
  );
}

function MonitorDetails() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Authorized monitor details</h2>
      <p className="text-sm text-slate-500">Used to verify your identity before Homecare Providers can share patients with you.</p>
      <div><label className="label">Organization name</label><input className="input" placeholder="BlueCross Claims / Dr. Park clinic / etc." /></div>
      <div>
        <label className="label">Organization type</label>
        <select className="input">
          <option>Clinician / Sleep specialist</option>
          <option>Insurance / Payer</option>
          <option>Monitoring service</option>
          <option>Other</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">First name</label><input className="input" /></div>
        <div><label className="label">Last name</label><input className="input" /></div>
      </div>
      <div><label className="label">Country</label>
        <select className="input"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Germany</option><option>France</option><option>Australia</option></select>
      </div>
      <div><label className="label">Email (used to log in)</label><input className="input" type="email" /></div>
      <div><label className="label">Password</label><input className="input" type="password" /></div>
    </div>
  );
}

function IndividualDetails() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Your details</h2>
      <p className="text-sm text-slate-500">We&apos;ll use these to link to your Transcend mobile data.</p>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">First name</label><input className="input" /></div>
        <div><label className="label">Last name</label><input className="input" /></div>
      </div>
      <div><label className="label">Date of birth</label><input className="input" type="date" /></div>
      <div><label className="label">Country</label>
        <select className="input"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Germany</option><option>France</option><option>Australia</option><option>India</option></select>
      </div>
      <div><label className="label">Transcend device serial (optional)</label><input className="input" placeholder="TR-MC3-..." /></div>
      <div><label className="label">Email (used to log in)</label><input className="input" type="email" /></div>
      <div><label className="label">Password</label><input className="input" type="password" /></div>
    </div>
  );
}

function Consent({ type }: { type: AccountType | null }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Terms & privacy</h2>
      <p className="text-sm text-slate-500">Please review and accept before finishing.</p>
      <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
        <input type="checkbox" defaultChecked className="mt-1" />
        <div>
          <div className="text-sm font-medium text-slate-900">I accept the Transcend Terms of Use</div>
          <div className="text-xs text-slate-500">Including acceptable use and account responsibilities.</div>
        </div>
      </label>
      <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
        <input type="checkbox" defaultChecked className="mt-1" />
        <div>
          <div className="text-sm font-medium text-slate-900">I acknowledge the HIPAA Privacy Notice</div>
          <div className="text-xs text-slate-500">How Transcend handles protected health information.</div>
        </div>
      </label>
      {type === "individual" && (
        <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
          <input type="checkbox" defaultChecked className="mt-1" />
          <div>
            <div className="text-sm font-medium text-slate-900">I consent to compliance data being shared with accounts I authorize</div>
            <div className="text-xs text-slate-500">You can revoke any sharing later from the Sharing screen.</div>
          </div>
        </label>
      )}
      {type === "provider" && (
        <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
          <input type="checkbox" defaultChecked className="mt-1" />
          <div>
            <div className="text-sm font-medium text-slate-900">I am authorized to act on behalf of my institution</div>
            <div className="text-xs text-slate-500">And to view PHI of patients we serve.</div>
          </div>
        </label>
      )}
      {type === "monitor" && (
        <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
          <input type="checkbox" defaultChecked className="mt-1" />
          <div>
            <div className="text-sm font-medium text-slate-900">I will only access patient data shared with me</div>
            <div className="text-xs text-slate-500">All access is logged and auditable.</div>
          </div>
        </label>
      )}
    </div>
  );
}
