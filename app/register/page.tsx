"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Building2, Eye, User, Clock, Mail, HelpCircle, AlertTriangle } from "lucide-react";
import Logo from "@/components/Logo";
import { homeCareApi, ApiError } from "@/lib/api";
import type { UserType, RegisterDto } from "@/lib/types.api";

type AccountType = "provider" | "monitor" | "individual";

type Form = {
  firstName: string;
  lastName: string;
  title: string;
  userName: string;
  email: string;
  confirmEmail: string;
  timeZone: string;
  address1: string;
  address2: string;
  city: string;
  country: string;
  stateProvince: string;
  postalCode: string;
  phone: string;
  companyName: string;
  accountNumber: string;
  uniqueIdentifier: string;
  institutionName: string;
  password: string;
  confirmPassword: string;
};

const blank: Form = {
  firstName: "", lastName: "", title: "", userName: "", email: "", confirmEmail: "",
  timeZone: "", address1: "", address2: "", city: "", country: "United States",
  stateProvince: "", postalCode: "", phone: "",
  companyName: "", accountNumber: "", uniqueIdentifier: "", institutionName: "",
  password: "", confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<AccountType | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submitRegistration() {
    if (!type || type === "individual") return;
    setError(null); setFieldErrors(undefined);
    const userType: UserType = type === "provider" ? "home_care_provider" : "authorized_monitor";
    const dto: RegisterDto = {
      userType,
      firstName: form.firstName,
      lastName: form.lastName,
      title: form.title || undefined,
      userName: form.userName,
      email: form.email,
      confirmEmail: form.confirmEmail,
      timeZone: form.timeZone,
      address1: form.address1,
      address2: form.address2 || undefined,
      city: form.city,
      country: form.country,
      stateProvince: form.stateProvince,
      postalCode: form.postalCode,
      phone: form.phone,
      password: form.password,
      confirmPassword: form.confirmPassword,
      ...(userType === "home_care_provider"
        ? { companyName: form.companyName, accountNumber: form.accountNumber }
        : { uniqueIdentifier: form.uniqueIdentifier, institutionName: form.institutionName }),
    };
    setSubmitting(true);
    try {
      await homeCareApi.register(dto);
      setStep(4);
    } catch (e) {
      const err = e as ApiError;
      setError(err.message || "Registration failed.");
      setFieldErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (step === 1) {
      if (!type) return;
      // Individual users go through a dedicated OTP-based End User flow.
      if (type === "individual") { router.push("/register/patient"); return; }
      setStep(2); return;
    }
    if (step === 2) { setStep(3); return; }
    // step === 3 — Consent → submit (provider/monitor)
    submitRegistration();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className={`w-full ${step === 2 ? "max-w-4xl" : "max-w-2xl"}`}>
        <Link href="/" className="flex items-center justify-center mb-6">
          <Logo className="h-9 w-auto" />
        </Link>
        {step === 4 ? (
          <Completion type={type} />
        ) : (
          <div className="card p-6">
            <Stepper step={step} />
            {step === 1 && <PickType type={type} setType={setType} />}
            {step === 2 && type === "provider" && <ProviderDetails form={form} update={update} fieldErrors={fieldErrors} />}
            {step === 2 && type === "monitor" && <MonitorDetails form={form} update={update} fieldErrors={fieldErrors} />}
            {step === 2 && type === "individual" && <IndividualDetails form={form} update={update} />}
            {step === 3 && <Consent type={type} />}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => { setError(null); setStep(Math.max(1, step - 1)); }}
                disabled={step === 1 || submitting}
                className="btn-secondary disabled:opacity-50"
              >
                Back
              </button>
              <button onClick={next} disabled={(step === 1 && !type) || submitting} className="btn-primary disabled:opacity-50">
                {step < 3 ? (
                  <>Continue Registration <ArrowRight className="w-4 h-4" /></>
                ) : submitting ? (
                  <>Submitting…</>
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
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Registration submitted</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Your Homecare Provider account is awaiting Super Admin approval. You&apos;ll be able to log in once it&apos;s
          approved. Until then, logging in will tell you the current status.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link href="/" className="btn-secondary">Back to home</Link>
          <Link href="/login" className="btn-primary">Go to login</Link>
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
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Registration submitted</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Your Authorized Monitor account is awaiting Super Admin approval. Once approved you can log in and claim the
          device IDs you&apos;re authorized to monitor.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link href="/" className="btn-secondary">Back to home</Link>
          <Link href="/login" className="btn-primary">Go to login</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="card p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
        <Mail className="w-6 h-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">Check your email</h2>
      <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
        Verify your email to activate your account. Patient registration is not yet wired to the live API.
      </p>
      <div className="mt-6"><Link href="/" className="btn-primary">Back to home</Link></div>
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
        <TypeCard selected={type === "provider"} onClick={() => setType("provider")}
          icon={<Building2 className="w-5 h-5" />} title="Homecare Provider Account"
          desc="Choose this account if you are an institution that wishes to track compliance for a patient population. This account provides full access to patient data, including editing and sharing with other accounts." />
        <TypeCard selected={type === "monitor"} onClick={() => setType("monitor")}
          icon={<Eye className="w-5 h-5" />} title="Authorized Monitoring Account"
          desc={<>Choose this <span className="underline">read-only</span> account if you are a clinician, monitoring service, insurance provider, or are otherwise authorized to view patient compliance data.</>} />
        <TypeCard selected={type === "individual"} onClick={() => setType("individual")}
          icon={<User className="w-5 h-5" />} title="Individual User Account"
          desc="Choose this account type if you have a Transcend device and wish to track your own compliance. (Not yet wired to the live API.)" />
      </div>
    </div>
  );
}

function TypeCard({ selected, onClick, icon, title, desc }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition flex gap-4 ${selected ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${selected ? "border-brand-600 bg-brand-600" : "border-slate-300"}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <span className={selected ? "text-brand-700" : "text-slate-500"}>{icon}</span>{title}
        </div>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed"><span className="text-green-600">✓</span> {desc}</p>
      </div>
    </button>
  );
}

type DetailsProps = { form: Form; update: <K extends keyof Form>(k: K, v: Form[K]) => void; fieldErrors?: Record<string, string[]> };

function ProviderDetails({ form, update, fieldErrors }: DetailsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
      <p className="text-sm text-slate-500 mb-5">Homecare Provider account. Fields marked * are required.</p>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Corporate Information</h3>
          <div className="space-y-3">
            <TextField label="Company Name" required value={form.companyName} onChange={(v) => update("companyName", v)} err={fieldErrors?.companyName} />
            <TextField label="Account Number" required help="Your Transcend account number, from your invoice." value={form.accountNumber} onChange={(v) => update("accountNumber", v)} err={fieldErrors?.accountNumber} />
            <TextField label="Address 1" required value={form.address1} onChange={(v) => update("address1", v)} err={fieldErrors?.address1} />
            <TextField label="Address 2" value={form.address2} onChange={(v) => update("address2", v)} />
            <TextField label="City" required value={form.city} onChange={(v) => update("city", v)} err={fieldErrors?.city} />
            <CountryField value={form.country} onChange={(v) => update("country", v)} err={fieldErrors?.country} />
            <StateField value={form.stateProvince} onChange={(v) => update("stateProvince", v)} err={fieldErrors?.stateProvince} />
            <TextField label="Postal Code" required value={form.postalCode} onChange={(v) => update("postalCode", v)} err={fieldErrors?.postalCode} />
            <TextField label="Phone" required type="tel" value={form.phone} onChange={(v) => update("phone", v)} err={fieldErrors?.phone} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">User Information</h3>
          <div className="space-y-3">
            <TextField label="First Name" required value={form.firstName} onChange={(v) => update("firstName", v)} err={fieldErrors?.firstName} />
            <TextField label="Last Name" required value={form.lastName} onChange={(v) => update("lastName", v)} err={fieldErrors?.lastName} />
            <TextField label="Title" value={form.title} onChange={(v) => update("title", v)} />
            <TextField label="User Name" required value={form.userName} onChange={(v) => update("userName", v)} err={fieldErrors?.userName} />
            <TextField label="Email" required type="email" value={form.email} onChange={(v) => update("email", v)} err={fieldErrors?.email} />
            <TextField label="Confirm Email" required type="email" value={form.confirmEmail} onChange={(v) => update("confirmEmail", v)} err={fieldErrors?.confirmEmail} />
            <TimeZoneField value={form.timeZone} onChange={(v) => update("timeZone", v)} err={fieldErrors?.timeZone} />
            <TextField label="Password" required type="password" help="Minimum 8 characters." value={form.password} onChange={(v) => update("password", v)} err={fieldErrors?.password} />
            <TextField label="Confirm Password" required type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} err={fieldErrors?.confirmPassword} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitorDetails({ form, update, fieldErrors }: DetailsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
      <p className="text-sm text-slate-500 mb-5">Authorized Monitor account. Fields marked * are required.</p>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">User Information</h3>
          <div className="space-y-3">
            <TextField label="First Name" required value={form.firstName} onChange={(v) => update("firstName", v)} err={fieldErrors?.firstName} />
            <TextField label="Last Name" required value={form.lastName} onChange={(v) => update("lastName", v)} err={fieldErrors?.lastName} />
            <TextField label="Title" value={form.title} onChange={(v) => update("title", v)} />
            <TextField label="Unique Identifier" required help="Your NPI or unique identifier — providers find you by this." value={form.uniqueIdentifier} onChange={(v) => update("uniqueIdentifier", v)} err={fieldErrors?.uniqueIdentifier} />
            <TextField label="User Name" required value={form.userName} onChange={(v) => update("userName", v)} err={fieldErrors?.userName} />
            <TextField label="Email" required type="email" value={form.email} onChange={(v) => update("email", v)} err={fieldErrors?.email} />
            <TextField label="Confirm Email" required type="email" value={form.confirmEmail} onChange={(v) => update("confirmEmail", v)} err={fieldErrors?.confirmEmail} />
            <TextField label="Password" required type="password" help="Minimum 8 characters." value={form.password} onChange={(v) => update("password", v)} err={fieldErrors?.password} />
            <TextField label="Confirm Password" required type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} err={fieldErrors?.confirmPassword} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Contact Information</h3>
          <div className="space-y-3">
            <TextField label="Institution Name" required value={form.institutionName} onChange={(v) => update("institutionName", v)} err={fieldErrors?.institutionName} />
            <TextField label="Address 1" required value={form.address1} onChange={(v) => update("address1", v)} err={fieldErrors?.address1} />
            <TextField label="Address 2" value={form.address2} onChange={(v) => update("address2", v)} />
            <TextField label="City" required value={form.city} onChange={(v) => update("city", v)} err={fieldErrors?.city} />
            <CountryField value={form.country} onChange={(v) => update("country", v)} err={fieldErrors?.country} />
            <StateField value={form.stateProvince} onChange={(v) => update("stateProvince", v)} err={fieldErrors?.stateProvince} />
            <TextField label="Postal Code" required value={form.postalCode} onChange={(v) => update("postalCode", v)} err={fieldErrors?.postalCode} />
            <TextField label="Phone" required type="tel" value={form.phone} onChange={(v) => update("phone", v)} err={fieldErrors?.phone} />
            <TimeZoneField value={form.timeZone} onChange={(v) => update("timeZone", v)} err={fieldErrors?.timeZone} />
          </div>
        </div>
      </div>
    </div>
  );
}

function IndividualDetails({ form, update }: Pick<DetailsProps, "form" | "update">) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Your details</h2>
      <p className="text-sm text-slate-500">Patient registration is a placeholder for now (not yet wired to the live API).</p>
      <TextField label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} />
      <TextField label="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} />
      <TextField label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} />
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
            <div className="text-sm font-medium text-slate-900">I will only access patient data I am authorized to view</div>
            <div className="text-xs text-slate-500">All access is logged and auditable.</div>
          </div>
        </label>
      )}
    </div>
  );
}

// ---- Field helpers ----

function FieldLabel({ label, required, help }: { label: string; required?: boolean; help?: string }) {
  return (
    <label className="label flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
      {help && (
        <span title={help} className="inline-flex cursor-help">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </span>
      )}
    </label>
  );
}

function FieldErrorMsg({ err }: { err?: string[] }) {
  if (!err || err.length === 0) return null;
  return <p className="text-xs text-red-600 mt-1">{err[0]}</p>;
}

function TextField({ label, required, help, type = "text", value, onChange, err }:
  { label: string; required?: boolean; help?: string; type?: string; value: string; onChange: (v: string) => void; err?: string[] }) {
  return (
    <div>
      <FieldLabel label={label} required={required} help={help} />
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      <FieldErrorMsg err={err} />
    </div>
  );
}

function CountryField({ value, onChange, err }: { value: string; onChange: (v: string) => void; err?: string[] }) {
  return (
    <div>
      <FieldLabel label="Country" required />
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option>United States</option><option>Canada</option><option>United Kingdom</option>
        <option>Germany</option><option>France</option><option>Australia</option><option>India</option>
      </select>
      <FieldErrorMsg err={err} />
    </div>
  );
}

function StateField({ value, onChange, err }: { value: string; onChange: (v: string) => void; err?: string[] }) {
  return (
    <div>
      <FieldLabel label="State/Province" required />
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select State/Province --</option>
        <option>California</option><option>Colorado</option><option>Florida</option>
        <option>Massachusetts</option><option>New York</option><option>Texas</option><option>Washington</option>
      </select>
      <FieldErrorMsg err={err} />
    </div>
  );
}

function TimeZoneField({ value, onChange, err }: { value: string; onChange: (v: string) => void; err?: string[] }) {
  return (
    <div>
      <FieldLabel label="Time Zone" required />
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select Time Zone --</option>
        <option value="America/New_York">America/New_York (ET)</option>
        <option value="America/Chicago">America/Chicago (CT)</option>
        <option value="America/Denver">America/Denver (MT)</option>
        <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
        <option value="UTC">UTC</option>
        <option value="Europe/London">Europe/London</option>
        <option value="Australia/Sydney">Australia/Sydney</option>
      </select>
      <FieldErrorMsg err={err} />
    </div>
  );
}
