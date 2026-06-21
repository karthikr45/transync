"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { endUserApi, ApiError } from "@/lib/api";
import type { CreateUserDto } from "@/lib/types.api";

type Profile = {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  dob: string;
  gender: string;
  mobile: string;
  countryCode: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  timeZone: string;
  cpapUser: string;
  transcendDevice: string;
  deviceId: string;
  occupation: string;
  provider: string;
  providerEmail: string;
  dealerName: string;
};

const blankProfile: Profile = {
  firstName: "", lastName: "", password: "", confirmPassword: "",
  dob: "", gender: "", mobile: "", countryCode: "+1",
  country: "United States", state: "", city: "", pincode: "",
  timeZone: "America/New_York",
  cpapUser: "self", transcendDevice: "Transcend 365 miniCPAP", deviceId: "",
  occupation: "", provider: "", providerEmail: "", dealerName: "",
};

export default function PatientRegister() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [profile, setProfile] = useState<Profile>(blankProfile);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();
  const [info, setInfo] = useState<string | null>(null);

  const upd = <K extends keyof Profile>(k: K, v: Profile[K]) => setProfile((p) => ({ ...p, [k]: v }));

  async function requestOtp() {
    setError(null); setInfo(null);
    if (!email || !name) { setError("Enter your name and email."); return; }
    setSubmitting(true);
    try {
      await endUserApi.signUpOtp({ email, name });
      setInfo("Verification code sent. Check your inbox.");
      setStep(2);
    } catch (e) {
      setError((e as ApiError).message || "Could not send OTP.");
    } finally { setSubmitting(false); }
  }

  async function verifyOtp() {
    setError(null); setInfo(null);
    if (!otp || isNaN(Number(otp))) { setError("Enter the numeric code."); return; }
    setSubmitting(true);
    try {
      const ok = await endUserApi.validateOtp({ email, otp: Number(otp) });
      if (!ok) throw new ApiError("Code did not match.", 400);
      // Pre-fill names from the typed name
      const [fn, ...rest] = name.trim().split(/\s+/);
      setProfile((p) => ({ ...p, firstName: p.firstName || fn || "", lastName: p.lastName || rest.join(" ") }));
      setStep(3);
    } catch (e) {
      setError((e as ApiError).message || "Invalid or expired code.");
    } finally { setSubmitting(false); }
  }

  async function submitProfile() {
    setError(null); setFieldErrors(undefined);
    if (profile.password !== profile.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (profile.password.length < 8 || profile.password.length > 16) {
      setError("Password must be 8–16 characters."); return;
    }
    const dto: CreateUserDto = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      password: profile.password,
      dob: profile.dob,
      state: profile.state,
      country: profile.country,
      mobile: profile.mobile,
      cpapUser: profile.cpapUser,
      transcendDevice: profile.transcendDevice,
      occupation: profile.occupation,
      gender: profile.gender || undefined,
      city: profile.city || undefined,
      pincode: profile.pincode ? Number(profile.pincode) : undefined,
      countryCode: profile.countryCode || undefined,
      timeZone: profile.timeZone || undefined,
      deviceId: profile.deviceId || undefined,
      provider: profile.provider || undefined,
      providerEmail: profile.providerEmail || undefined,
      dealerName: profile.dealerName || undefined,
    };
    setSubmitting(true);
    try {
      await endUserApi.createUser(dto);
      // The server set httpOnly auth cookies; just navigate.
      setStep(4);
      setTimeout(() => router.push("/patient/dashboard"), 800);
    } catch (e) {
      const err = e as ApiError;
      setError(err.message || "Could not create account.");
      setFieldErrors(err.fieldErrors);
    } finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className={`w-full ${step === 3 ? "max-w-3xl" : "max-w-md"}`}>
        <Link href="/" className="flex items-center justify-center mb-6">
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="card p-6">
          <Stepper step={step} />

          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Create your account</h2>
              <p className="text-sm text-slate-500">We&apos;ll send a one-time code to verify your email.</p>
              <div>
                <label className="label">Full name *</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2"><Mail className="w-5 h-5 text-brand-600" /> Verify your email</h2>
              <p className="text-sm text-slate-500">Enter the code we sent to <strong>{email}</strong>.</p>
              <div>
                <label className="label">Verification code *</label>
                <input className="input tracking-widest text-center font-mono text-lg" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="0000" inputMode="numeric" />
              </div>
              <button
                type="button"
                onClick={async () => {
                  setSubmitting(true);
                  try { await endUserApi.signUpOtp({ email, name }); setInfo("New code sent."); }
                  catch (e) { setError((e as ApiError).message); }
                  finally { setSubmitting(false); }
                }}
                disabled={submitting}
                className="text-xs text-brand-600 hover:underline"
              >
                Resend code
              </button>
            </div>
          )}

          {step === 3 && (
            <ProfileStep profile={profile} update={upd} fieldErrors={fieldErrors} email={email} />
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">Account created</h2>
              <p className="text-sm text-slate-600 mt-1">Signing you in…</p>
            </div>
          )}

          {info && step !== 4 && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" /> {info}
            </div>
          )}
          {error && step !== 4 && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          {step !== 4 && (
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => { setError(null); setInfo(null); setStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3 | 4)); }}
                disabled={step === 1 || submitting}
                className="btn-secondary disabled:opacity-50"
              >
                Back
              </button>
              {step === 1 && <button onClick={requestOtp} disabled={submitting} className="btn-primary disabled:opacity-50">{submitting ? "Sending…" : (<>Send code <ArrowRight className="w-4 h-4" /></>)}</button>}
              {step === 2 && <button onClick={verifyOtp} disabled={submitting} className="btn-primary disabled:opacity-50">{submitting ? "Verifying…" : (<>Verify <ArrowRight className="w-4 h-4" /></>)}</button>}
              {step === 3 && <button onClick={submitProfile} disabled={submitting} className="btn-primary disabled:opacity-50">{submitting ? "Creating…" : (<>Create account <Check className="w-4 h-4" /></>)}</button>}
            </div>
          )}
        </div>
        <div className="text-center text-sm text-slate-600 mt-4">
          Already have an account? <Link href="/login" className="text-brand-600 font-medium">Log on</Link>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const steps = ["Account", "Verify", "Profile"];
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx;
        return (
          <div key={label} className="flex-1 flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${done ? "bg-brand-600 text-white" : active ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500" : "bg-slate-100 text-slate-500"}`}>
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

function ProfileStep({ profile, update, fieldErrors, email }: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
  fieldErrors?: Record<string, string[]>;
  email: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Your profile</h2>
      <p className="text-sm text-slate-500 mb-5">Fields marked * are required.</p>
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
        <Text label="First name" required value={profile.firstName} onChange={(v) => update("firstName", v)} err={fieldErrors?.firstName} />
        <Text label="Last name" required value={profile.lastName} onChange={(v) => update("lastName", v)} err={fieldErrors?.lastName} />
        <div>
          <label className="label">Email</label>
          <input className="input bg-slate-50" value={email} readOnly />
        </div>
        <Text label="Date of birth" required type="date" value={profile.dob} onChange={(v) => update("dob", v)} err={fieldErrors?.dob} />
        <Text label="Password" required type="password" help="8–16 characters." value={profile.password} onChange={(v) => update("password", v)} err={fieldErrors?.password} />
        <Text label="Confirm password" required type="password" value={profile.confirmPassword} onChange={(v) => update("confirmPassword", v)} />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label">Country code</label>
            <input className="input" value={profile.countryCode} onChange={(e) => update("countryCode", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Mobile *</label>
            <input className="input" value={profile.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="555-555-5555" />
          </div>
        </div>
        <Sel label="Gender" value={profile.gender} onChange={(v) => update("gender", v)} options={["", "male", "female", "other", "prefer not to say"]} />

        <Sel label="Country" required value={profile.country} onChange={(v) => update("country", v)} options={["United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "India"]} />
        <Text label="State / province" required value={profile.state} onChange={(v) => update("state", v)} err={fieldErrors?.state} />
        <Text label="City" value={profile.city} onChange={(v) => update("city", v)} />
        <Text label="Postal code" value={profile.pincode} onChange={(v) => update("pincode", v)} />

        <Sel label="Time zone" value={profile.timeZone} onChange={(v) => update("timeZone", v)} options={["America/New_York","America/Chicago","America/Denver","America/Los_Angeles","UTC","Europe/London","Australia/Sydney"]} />
        <Sel label="CPAP user" required value={profile.cpapUser} onChange={(v) => update("cpapUser", v)} options={["self", "spouse", "parent", "other"]} />
        <Text label="Transcend device" required value={profile.transcendDevice} onChange={(v) => update("transcendDevice", v)} err={fieldErrors?.transcendDevice} />
        <Text label="Device ID" value={profile.deviceId} onChange={(v) => update("deviceId", v)} />
        <Text label="Occupation" required value={profile.occupation} onChange={(v) => update("occupation", v)} err={fieldErrors?.occupation} />

        <Text label="Care provider (optional)" value={profile.provider} onChange={(v) => update("provider", v)} />
        <Text label="Provider email (optional)" type="email" value={profile.providerEmail} onChange={(v) => update("providerEmail", v)} />
        <Text label="Dealer (optional)" value={profile.dealerName} onChange={(v) => update("dealerName", v)} />
      </div>
    </div>
  );
}

function Text({ label, required, value, onChange, type = "text", help, err }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; type?: string; help?: string; err?: string[] }) {
  return (
    <div>
      <label className="label">{label} {required && <span className="text-red-500">*</span>}{help && <span className="text-xs text-slate-400 ml-1">{help}</span>}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {err && err[0] && <p className="text-xs text-red-600 mt-1">{err[0]}</p>}
    </div>
  );
}

function Sel({ label, required, value, onChange, options }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="label">{label} {required && <span className="text-red-500">*</span>}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    </div>
  );
}
