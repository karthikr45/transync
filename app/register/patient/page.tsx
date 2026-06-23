"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import PhoneInputField from "@/components/PhoneInputField";
import { endUserApi, ApiError } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { passwordPolicy, validatePassword, validName, validEmail } from "@/lib/validators";
import { listCountries, statesForCode, nameForCode } from "@/lib/countries";
import { displayDob } from "@/lib/format";
import { normaliseOptions } from "@/lib/options";
import type { CreateUserDto, MetadataResponse } from "@/lib/types.api";

type Step = 1 | 2 | 3 | 4 | 5;

type Form = {
  // Step 1
  countryCode: string;          // ISO alpha-2 ("US"). API sends the full name.
  state: string;
  firstName: string;
  lastName: string;
  email: string;
  // Step 2
  dob: string;                  // yyyy-MM-dd (input + API)
  occupation: string;
  cpapUser: string;
  transcendUsage: string;
  devicePurchased: string;
  // Step 3
  provider: string;
  providerEmail: string;
  mobile: string;               // E.164 ("+14155551234")
  password: string;
  confirmPassword: string;
  consentTerms: boolean;
  consentMarketing: boolean;
};

const blank: Form = {
  countryCode: "US",
  state: "",
  firstName: "",
  lastName: "",
  email: "",
  dob: "",
  occupation: "",
  cpapUser: "",
  transcendUsage: "",
  devicePurchased: "",
  provider: "",
  providerEmail: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  consentTerms: false,
  consentMarketing: false,
};

// Sensible defaults used when the /metadata endpoint is unavailable or
// missing a particular field.
const FALLBACK_OCCUPATIONS = [
  "Other", "Engineer", "Teacher", "Healthcare professional", "Driver",
  "Retired", "Student", "Office / administrative",
];
const FALLBACK_CPAP_USER = [
  "New User", "Less than 1 month", "1–3 months", "3–6 months",
  "6–12 months", "1–3 years", "More than 3 years",
];
const FALLBACK_USAGE = [
  "Business Travel", "Personal Travel", "Daily Home Use", "Backup Device", "Camping / Outdoors",
];
const FALLBACK_PURCHASE = [
  "MyTranscend.com", "Local Dealer", "Online retailer", "Medical equipment supplier", "Other",
];
const TIME_ZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "UTC", "Europe/London", "Australia/Sydney",
];

function friendlyError(raw: string): string {
  const m = (raw || "").toLowerCase();
  if (m.includes("argument must be of type") || m.includes("received undefined") || m.includes("buffer")) {
    console.error("[register] backend error:", raw);
    return "We couldn't complete sign-up. Please request a new code and try again.";
  }
  if (m.includes("invalid otp") || m.includes("expired")) return "That code is invalid or has expired. Request a new one.";
  if (m.includes("user already exists") || m.includes("already in use")) return "An account with this email already exists. Try logging in instead.";
  return raw || "Something went wrong.";
}

export default function PatientRegister() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<Form>(blank);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();
  const [meta, setMeta] = useState<MetadataResponse | null>(null);
  const [touched, setTouched] = useState<Record<keyof Form, boolean>>({} as Record<keyof Form, boolean>);

  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }));
  const touch = (k: keyof Form) => setTouched((t) => ({ ...t, [k]: true }));

  const countries = useMemo(() => listCountries(), []);
  const stateOptions = useMemo(() => statesForCode(form.countryCode), [form.countryCode]);
  const pw = passwordPolicy(form.password);
  const pwOk = validatePassword(form.password);
  const passwordsMatch = form.password.length > 0 && form.password === form.confirmPassword;

  // Pull dropdown contents from /metadata if available. Falls back to
  // the static lists above when the endpoint is missing or fields are
  // not provided.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await endUserApi.getMetadata();
        if (!cancelled) setMeta(m ?? {});
      } catch {
        if (!cancelled) setMeta({});
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function mergeList(key: keyof MetadataResponse, fallback: string[]): string[] {
    const list = normaliseOptions(meta?.[key]);
    return list.length > 0 ? list : fallback;
  }
  const occupationOptions = mergeList("occupation", FALLBACK_OCCUPATIONS);
  const cpapOptions = mergeList("cpapUser", FALLBACK_CPAP_USER);
  const usageOptions = mergeList("transcendUsage", FALLBACK_USAGE);
  const purchaseOptions = mergeList("devicePurchased", FALLBACK_PURCHASE);

  // Set defaults from the option lists once they're known.
  useEffect(() => {
    setForm((p) => ({
      ...p,
      occupation: p.occupation || occupationOptions[0] || "",
      cpapUser: p.cpapUser || cpapOptions[0] || "",
      transcendUsage: p.transcendUsage || usageOptions[0] || "",
      devicePurchased: p.devicePurchased || purchaseOptions[0] || "",
    }));
  }, [occupationOptions, cpapOptions, usageOptions, purchaseOptions]);

  function err(msg: string) { setError(msg); setInfo(null); }
  function inf(msg: string) { setInfo(msg); setError(null); }
  function clearMsgs() { setError(null); setInfo(null); setFieldErrors(undefined); }

  function validateStep1(): string | null {
    if (!form.countryCode) return "Country is required.";
    if (stateOptions && stateOptions.length > 0 && !form.state) return "Please select a state.";
    if (!validName(form.firstName)) return "First Name is invalid.";
    if (!validName(form.lastName)) return "Last Name is invalid.";
    if (!validEmail(form.email)) return "Please enter a valid email.";
    return null;
  }
  function validateStep2(): string | null {
    if (!form.dob || !/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) return "Date of Birth is required.";
    if (!form.cpapUser) return "Tell us how long you have been a CPAP user.";
    if (!form.transcendUsage) return "Tell us how you use the Transcend device.";
    return null;
  }
  function validateStep3(): string | null {
    if (!form.mobile || form.mobile.length < 6) return "Mobile number is required.";
    if (!pwOk) return "Password does not meet the policy.";
    if (!passwordsMatch) return "Passwords do not match.";
    if (!form.consentTerms) return "Please accept the Terms of Use to continue.";
    if (form.providerEmail && !validEmail(form.providerEmail)) return "Care Provider email is not valid.";
    return null;
  }

  async function goNext() {
    clearMsgs();
    if (step === 1) {
      const v = validateStep1(); if (v) return err(v);
      setStep(2); return;
    }
    if (step === 2) {
      const v = validateStep2(); if (v) return err(v);
      setStep(3); return;
    }
    if (step === 3) {
      const v = validateStep3(); if (v) return err(v);
      setSubmitting(true);
      try {
        const name = `${form.firstName} ${form.lastName}`.trim();
        await endUserApi.signUpOtp({ email: form.email.trim(), name });
        inf("Verification code sent. Check your inbox.");
        setStep(4);
      } catch (e) {
        err(friendlyError((e as ApiError).message || "Could not send the verification code."));
      } finally { setSubmitting(false); }
      return;
    }
    if (step === 4) {
      const otpClean = otp.trim();
      const otpNum = Number(otpClean);
      if (!otpClean || !Number.isFinite(otpNum)) return err("Enter the numeric code from the email.");
      setSubmitting(true);
      try {
        const ok = await endUserApi.validateOtp({ email: form.email.trim(), otp: otpNum });
        if (!ok) throw new ApiError("Code did not match.", 400);
        await createAccount();
      } catch (e) {
        const apiErr = e as ApiError;
        err(friendlyError(apiErr.message || "Invalid or expired code."));
        setFieldErrors(apiErr.fieldErrors);
      } finally { setSubmitting(false); }
    }
  }

  async function resendOtp() {
    clearMsgs();
    setSubmitting(true);
    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      await endUserApi.signUpOtp({ email: form.email.trim(), name });
      inf("New code sent.");
    } catch (e) {
      err(friendlyError((e as ApiError).message || "Could not resend."));
    } finally { setSubmitting(false); }
  }

  async function createAccount() {
    const trim = (s: string) => s.trim();
    const countryName = nameForCode(form.countryCode);
    const dto: CreateUserDto = {
      firstName: trim(form.firstName),
      lastName: trim(form.lastName),
      email: trim(form.email),
      password: form.password,
      dob: trim(form.dob),                 // yyyy-MM-dd (ISO date string)
      state: trim(form.state),
      country: countryName,
      mobile: trim(form.mobile),
      cpapUser: trim(form.cpapUser),
      transcendDevice: "Transcend 365 miniCPAP",
      occupation: trim(form.occupation),
      gender: "",
      city: "",
      pincode: undefined,
      countryCode: "",                     // dial code embedded in `mobile` E.164
      profileImage: "",
      provider: trim(form.provider),
      providerEmail: trim(form.providerEmail),
      dealerName: "",
      devicePurchased: trim(form.devicePurchased),
      timeZone: TIME_ZONES[0],
      deviceId: "",
      eventCount: 0,
      isFirmwareUpdate: false,
    };
    const eu = await endUserApi.createUser(dto);
    setSession(eu.token, eu.refreshToken, eu, "end-user");
    setStep(5);
    setTimeout(() => {
      if (typeof window !== "undefined") window.location.assign("/patient/dashboard");
      else router.push("/patient/dashboard");
    }, 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <Link href="/" className="flex items-center justify-center mb-6" aria-label="Transcend home">
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="card p-6">
          <Stepper step={step} />

          {step === 1 && (
            <Step1
              form={form} upd={upd} touch={touch} touched={touched}
              countries={countries} stateOptions={stateOptions}
            />
          )}
          {step === 2 && (
            <Step2
              form={form} upd={upd}
              occupations={occupationOptions} cpapOpts={cpapOptions}
              usageOpts={usageOptions} purchaseOpts={purchaseOptions}
            />
          )}
          {step === 3 && (
            <Step3
              form={form} upd={upd}
              pw={pw} pwOk={pwOk} passwordsMatch={passwordsMatch}
            />
          )}
          {step === 4 && (
            <VerifyStep
              email={form.email} otp={otp} setOtp={setOtp}
              onResend={resendOtp} disabled={submitting}
            />
          )}
          {step === 5 && <Done />}

          {step !== 5 && info && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800 flex items-start gap-2" role="status">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {info}
            </div>
          )}
          {step !== 5 && error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2" role="alert">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
              {fieldErrors && (
                <ul className="mt-1 list-disc list-inside text-xs">
                  {Object.entries(fieldErrors).map(([k, v]) => <li key={k}>{k}: {v[0]}</li>)}
                </ul>
              )}
            </div>
          )}

          {step !== 5 && (
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => { clearMsgs(); setStep((s) => (Math.max(1, s - 1) as Step)); }}
                disabled={step === 1 || submitting}
                className="btn-secondary disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {step === 1 || step === 2 ? (<>Next <ArrowRight className="w-4 h-4" /></>) :
                  step === 3 ? (submitting ? "Sending code…" : (<>Submit <ArrowRight className="w-4 h-4" /></>)) :
                  (submitting ? "Verifying…" : (<>Verify <Check className="w-4 h-4" /></>))}
              </button>
            </div>
          )}
        </div>
        {step !== 5 && (
          <div className="text-center text-sm text-slate-600 mt-4">
            Already have an account? <Link href="/login" className="text-brand-600 font-medium">Log on</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const items = ["Basic", "Profile", "Account", "Verify"];
  return (
    <div className="flex items-center justify-between mb-6" aria-label={`Step ${Math.min(step, 4)} of 4`}>
      {items.map((label, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx || step === 5;
        return (
          <div key={label} className="flex-1 flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${done ? "bg-brand-600 text-white" : active ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500" : "bg-slate-100 text-slate-500"}`}>
              {done ? <Check className="w-4 h-4" /> : idx}
            </div>
            <div className={`ml-2 text-xs font-medium ${active ? "text-slate-900" : "text-slate-500"}`}>{label}</div>
            {i < items.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-3" />}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Steps ----------

function Step1({
  form, upd, touch, touched, countries, stateOptions,
}: {
  form: Form;
  upd: <K extends keyof Form>(k: K, v: Form[K]) => void;
  touch: (k: keyof Form) => void;
  touched: Record<keyof Form, boolean>;
  countries: { code: string; name: string }[];
  stateOptions: string[] | null;
}) {
  const fnInvalid = touched.firstName && !validName(form.firstName);
  const lnInvalid = touched.lastName && !validName(form.lastName);
  const emInvalid = touched.email && !validEmail(form.email);
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Your Basic Information</h2>
      <p className="text-sm text-slate-500 mb-4">Fields marked * are required.</p>
      <div className="space-y-3">
        <Field label="Country" required>
          <select className="input" value={form.countryCode} onChange={(e) => { upd("countryCode", e.target.value); upd("state", ""); }}>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="State" required>
          {stateOptions === null ? (
            <input className="input" placeholder="State / Province" value={form.state} onChange={(e) => upd("state", e.target.value)} />
          ) : stateOptions.length === 0 ? (
            <input className="input bg-slate-50 text-slate-500" disabled value="No states for this country" />
          ) : (
            <select className="input" value={form.state} onChange={(e) => upd("state", e.target.value)}>
              <option value="">Select State</option>
              {stateOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
        </Field>
        <Field label="First Name" required err={fnInvalid ? "Only letters, apostrophes and single spaces are allowed." : null}>
          <input
            className={`input ${fnInvalid ? "border-red-300" : ""}`}
            placeholder="Enter your First Name"
            value={form.firstName}
            onChange={(e) => upd("firstName", e.target.value)}
            onBlur={() => touch("firstName")}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last Name" required err={lnInvalid ? "Only letters, apostrophes and single spaces are allowed." : null}>
          <input
            className={`input ${lnInvalid ? "border-red-300" : ""}`}
            placeholder="Enter your Last Name"
            value={form.lastName}
            onChange={(e) => upd("lastName", e.target.value)}
            onBlur={() => touch("lastName")}
            autoComplete="family-name"
          />
        </Field>
        <Field label="Email" required err={emInvalid ? "Enter a valid email address." : null}>
          <input
            className={`input ${emInvalid ? "border-red-300" : ""}`}
            type="email"
            placeholder="Enter your Email"
            value={form.email}
            onChange={(e) => upd("email", e.target.value)}
            onBlur={() => touch("email")}
            autoComplete="email"
          />
        </Field>
      </div>
    </div>
  );
}

function Step2({
  form, upd, occupations, cpapOpts, usageOpts, purchaseOpts,
}: {
  form: Form;
  upd: <K extends keyof Form>(k: K, v: Form[K]) => void;
  occupations: string[]; cpapOpts: string[]; usageOpts: string[]; purchaseOpts: string[];
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Your Basic Information</h2>
      <p className="text-sm text-slate-500 mb-4">Tell us a bit about your therapy.</p>
      <div className="space-y-3">
        <Field label="Date of Birth" required hint={form.dob ? `Will appear as: ${displayDob(form.dob)}` : "Format: 01-jun-2026"}>
          <input className="input" type="date" value={form.dob} onChange={(e) => upd("dob", e.target.value)} />
        </Field>
        <Field label="Occupation">
          <select className="input" value={form.occupation} onChange={(e) => upd("occupation", e.target.value)}>
            {occupations.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="How long have you been a CPAP user?" required>
          <select className="input" value={form.cpapUser} onChange={(e) => upd("cpapUser", e.target.value)}>
            {cpapOpts.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="How are you using the Transcend device?" required>
          <select className="input" value={form.transcendUsage} onChange={(e) => upd("transcendUsage", e.target.value)}>
            {usageOpts.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Where was the Transcend device purchased?" required>
          <select className="input" value={form.devicePurchased} onChange={(e) => upd("devicePurchased", e.target.value)}>
            {purchaseOpts.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Step3({
  form, upd, pw, pwOk, passwordsMatch,
}: {
  form: Form;
  upd: <K extends keyof Form>(k: K, v: Form[K]) => void;
  pw: ReturnType<typeof passwordPolicy>;
  pwOk: boolean;
  passwordsMatch: boolean;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Your Basic Information</h2>
      <p className="text-sm text-slate-500 mb-4">Almost done — create your password and accept the terms.</p>
      <div className="space-y-3">
        <Field label="Care Provider">
          <input className="input" placeholder="Enter Care Provider" value={form.provider} onChange={(e) => upd("provider", e.target.value)} />
        </Field>
        <Field label="Care Provider Email">
          <input className="input" type="email" placeholder="Enter Care Provider Email" value={form.providerEmail} onChange={(e) => upd("providerEmail", e.target.value)} />
        </Field>
        <Field label="Mobile Number" required>
          <PhoneInputField value={form.mobile} onChange={(v) => upd("mobile", v)} defaultCountry={form.countryCode || "US"} />
        </Field>
        <Field label="Password" required>
          <input
            className="input"
            type="password"
            placeholder="Create Password"
            value={form.password}
            onChange={(e) => upd("password", e.target.value)}
            autoComplete="new-password"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill ok={pw.length}>8–16 characters</Pill>
            <Pill ok={pw.lower}>1 lowercase letter</Pill>
            <Pill ok={pw.upper}>1 uppercase letter</Pill>
            <Pill ok={pw.digit}>1 number</Pill>
            <Pill ok={pw.special}>1 special character</Pill>
          </div>
        </Field>
        <Field label="Confirm Password" required>
          <input
            className={`input ${form.confirmPassword && !passwordsMatch ? "border-red-300" : ""}`}
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => upd("confirmPassword", e.target.value)}
            autoComplete="new-password"
          />
          {form.confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
          )}
        </Field>
        <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
          <input type="checkbox" className="mt-1" checked={form.consentTerms} onChange={(e) => upd("consentTerms", e.target.checked)} />
          <div className="text-sm text-slate-700">
            I consent to the <Link href="#" className="text-brand-600">Terms of Use</Link> and{" "}
            <Link href="#" className="text-brand-600">Privacy Notice</Link>.
          </div>
        </label>
        <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
          <input type="checkbox" className="mt-1" checked={form.consentMarketing} onChange={(e) => upd("consentMarketing", e.target.checked)} />
          <div className="text-sm text-slate-700">
            I consent to receiving email messages about other Transcend products and services.
          </div>
        </label>
      </div>
      {!pwOk && form.password.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">Pick a password that satisfies all five rules.</p>
      )}
    </div>
  );
}

function VerifyStep({
  email, otp, setOtp, onResend, disabled,
}: {
  email: string; otp: string; setOtp: (v: string) => void; onResend: () => void; disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
        <Mail className="w-5 h-5 text-brand-600" aria-hidden="true" /> Verify your email
      </h2>
      <p className="text-sm text-slate-500">Enter the code we sent to <strong>{email}</strong>.</p>
      <Field label="Verification code" required>
        <input
          className="input tracking-widest text-center font-mono text-lg"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="0000"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </Field>
      <button type="button" onClick={onResend} disabled={disabled} className="text-xs text-brand-600 hover:underline">
        Resend code
      </button>
    </div>
  );
}

function Done() {
  return (
    <div className="text-center py-4">
      <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
        <Check className="w-6 h-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Account created</h2>
      <p className="text-sm text-slate-600 mt-1">Signing you in…</p>
    </div>
  );
}

// ---------- Small UI helpers ----------

function Field({
  label, required, hint, err, children,
}: { label: string; required?: boolean; hint?: string; err?: string | null; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label} {required && <span className="text-red-500" aria-hidden="true">*</span>}</label>
      {children}
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
      {hint && !err && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={`badge ${ok ? "badge-green" : "badge-slate"} inline-flex items-center gap-1`}>
      {ok && <Check className="w-3 h-3" aria-hidden="true" />}
      {children}
    </span>
  );
}
