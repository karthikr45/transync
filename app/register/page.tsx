"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Activity, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  function next() {
    if (step < 3) setStep(step + 1);
    else router.push("/patient/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">TranSync</span>
        </Link>
        <div className="card p-6">
          <Stepper step={step} />
          {step === 1 && <Account />}
          {step === 2 && <Prescription />}
          {step === 3 && <Consent />}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Back
            </button>
            <button onClick={next} className="btn-primary">
              {step < 3 ? (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Finish <Check className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
        <div className="text-center text-sm text-slate-600 mt-4">
          Already have an account? <Link href="/login" className="text-brand-600 font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Account", "Prescription", "Consent"];
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

function Account() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Create your account</h2>
      <p className="text-sm text-slate-500">We&apos;ll use this to link to your TranSync mobile data.</p>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">First name</label><input className="input" defaultValue="" /></div>
        <div><label className="label">Last name</label><input className="input" defaultValue="" /></div>
      </div>
      <div><label className="label">Email</label><input className="input" type="email" /></div>
      <div><label className="label">Date of birth</label><input className="input" type="date" /></div>
      <div><label className="label">Password</label><input className="input" type="password" /></div>
    </div>
  );
}

function Prescription() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Prescription details</h2>
      <p className="text-sm text-slate-500">From your prescribing physician. You can update this later.</p>
      <div><label className="label">Prescribing physician</label><input className="input" placeholder="Dr. ..." /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Therapy type</label>
          <select className="input"><option>CPAP</option><option>APAP</option><option>BiPAP</option></select>
        </div>
        <div><label className="label">Pressure (cmH2O)</label><input className="input" placeholder="e.g. 10" /></div>
      </div>
      <div><label className="label">Insurance / payer</label>
        <select className="input">
          <option>Medicare</option><option>BlueCross</option><option>Aetna</option><option>Self pay</option>
        </select>
      </div>
    </div>
  );
}

function Consent() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Privacy & consent</h2>
      <p className="text-sm text-slate-500">Choose what you&apos;d like to share. You can revoke at any time.</p>
      <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
        <input type="checkbox" defaultChecked className="mt-1" />
        <div>
          <div className="text-sm font-medium text-slate-900">Share with my homecare provider</div>
          <div className="text-xs text-slate-500">Allows your clinician to see therapy data and intervene early.</div>
        </div>
      </label>
      <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
        <input type="checkbox" className="mt-1" />
        <div>
          <div className="text-sm font-medium text-slate-900">Share with my insurance / payer</div>
          <div className="text-xs text-slate-500">Required by some plans for coverage. You control the date range.</div>
        </div>
      </label>
      <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
        <input type="checkbox" defaultChecked className="mt-1" />
        <div>
          <div className="text-sm font-medium text-slate-900">I accept the Terms and HIPAA Notice</div>
          <div className="text-xs text-slate-500">You acknowledge how TranSync handles your health data.</div>
        </div>
      </label>
    </div>
  );
}
