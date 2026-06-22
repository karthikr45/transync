"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { AlertTriangle, ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { endUserApi, ApiError } from "@/lib/api";
import { setSession } from "@/lib/auth";
import type { CreateUserDto } from "@/lib/types.api";

type Step = 1 | 2 | 3 | 4 | 5; // 4 = OTP, 5 = done

type Form = {
  // Step 1 — Basic
  country: string;
  state: string;
  firstName: string;
  lastName: string;
  email: string;
  // Step 2 — Profile
  dob: string;            // yyyy-MM-dd (sent to API)
  occupation: string;
  cpapUser: string;       // "How long have you been a CPAP user?"
  transcendUsage: string; // "How are you using the Transcend device?"
  devicePurchased: string;
  // Step 3 — Account
  provider: string;
  providerEmail: string;
  countryCode: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  consentTerms: boolean;
  consentMarketing: boolean;
};

const blank: Form = {
  country: "United States of America",
  state: "",
  firstName: "",
  lastName: "",
  email: "",
  dob: "",
  occupation: "Other",
  cpapUser: "New User",
  transcendUsage: "Business Travel",
  devicePurchased: "MyTranscend.com",
  provider: "",
  providerEmail: "",
  countryCode: "+1",
  mobile: "",
  password: "",
  confirmPassword: "",
  consentTerms: false,
  consentMarketing: false,
};

const COUNTRIES = [
  "United States of America", "Canada", "United Kingdom",
  "Germany", "France", "Australia", "India",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
];

const OCCUPATIONS = [
  "Other", "Engineer", "Teacher", "Healthcare professional", "Driver",
  "Retired", "Student", "Office / administrative",
];

const CPAP_DURATION = [
  "New User", "Less than 1 month", "1–3 months", "3–6 months",
  "6–12 months", "1–3 years", "More than 3 years",
];

const USAGE = [
  "Business Travel", "Personal Travel", "Daily Home Use",
  "Backup Device", "Camping / Outdoors",
];

const PURCHASE = [
  "MyTranscend.com", "Local Dealer", "Online retailer", "Medical equipment supplier", "Other",
];

const TIME_ZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "UTC", "Europe/London", "Australia/Sydney",
];

function checkPassword(p: string) {
  return {
    length: p.length >= 8 && p.length <= 16,
    lower: /[a-z]/.test(p),
    upper: /[A-Z]/.test(p),
    digit: /\d/.test(p),
    special: /[^A-Za-z0-9]/.test(p),
  };
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

  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }));
  const pw = checkPassword(form.password);
  const pwOk = pw.length && pw.lower && pw.upper && pw.digit && pw.special;
  const passwordsMatch = form.password.length > 0 && form.password === form.confirmPassword;

  const stateOptions = useMemo(
    () => (form.country === "United States of America" ? US_STATES : null),
    [form.country],
  );

  function err(msg: string) { setError(msg); setInfo(null); }
  function inf(msg: string) { setInfo(msg); setError(null); }
  function clearMsgs() { setError(null); setInfo(null); setFieldErrors(undefined); }

  function validateStep1(): string | null {
    if (!form.country || !form.state) return "Country and State are required.";
    if (!form.firstName.trim() || !form.lastName.trim()) return "First and Last name are required.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    return null;
  }
  function validateStep2(): string | null {
    if (!form.dob) return "Date of Birth is required.";
    if (!form.cpapUser) return "Tell us how long you have been a CPAP user.";
    if (!form.transcendUsage) return "Tell us how you use the Transcend device.";
    return null;
  }
  function validateStep3(): string | null {
    if (!form.mobile.trim()) return "Mobile number is required.";
    if (!pwOk) return "Password does not meet the policy.";
    if (!passwordsMatch) return "Passwords do not match.";
    if (!form.consentTerms) return "Please accept the Terms of Use to continue.";
    if (form.providerEmail && !/^\S+@\S+\.\S+$/.test(form.providerEmail)) return "Care Provider email is not valid.";
    return null;
  }

  // Translate raw backend / Node.js error messages into something the user
  // can act on. Keeps the original in the dev console for debugging.
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
      // Send OTP and advance to verify step.
      setSubmitting(true);
      try {
        const name = `${form.firstName} ${form.lastName}`.trim();
        await endUserApi.signUpOtp({ email: form.email, name });
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
      await endUserApi.signUpOtp({ email: form.email, name });
      inf("New code sent.");
    } catch (e) {
      err(friendlyError((e as ApiError).message || "Could not resend."));
    } finally { setSubmitting(false); }
  }

  async function createAccount() {
    // Send every known optional field as an empty string (not undefined).
    // JSON.stringify drops undefined values entirely, which then causes
    // the backend to crash when it reads body.<field> and pipes that
    // straight into crypto.update() / Buffer.from().
    const trim = (s: string) => s.trim();
    const dto: CreateUserDto = {
      firstName: trim(form.firstName),
      lastName: trim(form.lastName),
      email: trim(form.email),
      password: form.password,
      dob: trim(form.dob),
      state: trim(form.state),
      country: trim(form.country),
      mobile: trim(form.mobile),
      cpapUser: trim(form.cpapUser),
      transcendDevice: "Transcend 365 miniCPAP",
      occupation: trim(form.occupation),
      gender: "",
      city: "",
      pincode: undefined,
      countryCode: trim(form.countryCode) || "+1",
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
      if (typeof window !== "undefined") {
        window.location.assign("/patient/dashboard");
      } else {
        router.push("/patient/dashboard");
      }
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

          {step === 1 && <Step1 form={form} upd={upd} stateOptions={stateOptions} />}
          {step === 2 && <Step2 form={form} upd={upd} />}
          {step === 3 && <Step3 form={form} upd={upd} pw={pw} pwOk={pwOk} passwordsMatch={passwordsMatch} />}
          {step === 4 && <VerifyStep email={form.email} otp={otp} setOtp={setOtp} onResend={resendOtp} disabled={submitting} />}
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
                {step === 1 || step === 2 ? <>Next <ArrowRight className="w-4 h-4" /></>
                  : step === 3 ? (submitting ? "Sending code…" : <>Submit <ArrowRight className="w-4 h-4" /></>)
                  : (submitting ? "Verifying…" : <>Verify <Check className="w-4 h-4" /></>)}
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

function Step1({ form, upd, stateOptions }: {
  form: Form;
  upd: <K extends keyof Form>(k: K, v: Form[K]) => void;
  stateOptions: string[] | null;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Your Basic Information</h2>
      <p className="text-sm text-slate-500 mb-4">Fields marked * are required.</p>
      <div className="space-y-3">
        <Field label="Country" required>
          <select className="input" value={form.country} onChange={(e) => upd("country", e.target.value)}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="State" required>
          {stateOptions
            ? (
              <select className="input" value={form.state} onChange={(e) => upd("state", e.target.value)}>
                <option value="">Select State</option>
                {stateOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            )
            : <input className="input" placeholder="State / Province" value={form.state} onChange={(e) => upd("state", e.target.value)} />}
        </Field>
        <Field label="First Name" required>
          <input className="input" placeholder="Enter your First Name" value={form.firstName} onChange={(e) => upd("firstName", e.target.value)} />
        </Field>
        <Field label="Last Name" required>
          <input className="input" placeholder="Enter your Last Name" value={form.lastName} onChange={(e) => upd("lastName", e.target.value)} />
        </Field>
        <Field label="Email" required>
          <input className="input" type="email" placeholder="Enter your Email" value={form.email} onChange={(e) => upd("email", e.target.value)} autoComplete="email" />
        </Field>
      </div>
    </div>
  );
}

function Step2({ form, upd }: { form: Form; upd: <K extends keyof Form>(k: K, v: Form[K]) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Your Basic Information</h2>
      <p className="text-sm text-slate-500 mb-4">Tell us a bit about your therapy.</p>
      <div className="space-y-3">
        <Field label="Date of Birth" required>
          <input className="input" type="date" value={form.dob} onChange={(e) => upd("dob", e.target.value)} />
        </Field>
        <Field label="Occupation">
          <select className="input" value={form.occupation} onChange={(e) => upd("occupation", e.target.value)}>
            {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="How long have you been a CPAP user?" required>
          <select className="input" value={form.cpapUser} onChange={(e) => upd("cpapUser", e.target.value)}>
            {CPAP_DURATION.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="How are you using the Transcend device?" required>
          <select className="input" value={form.transcendUsage} onChange={(e) => upd("transcendUsage", e.target.value)}>
            {USAGE.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Where was the Transcend device purchased?" required>
          <select className="input" value={form.devicePurchased} onChange={(e) => upd("devicePurchased", e.target.value)}>
            {PURCHASE.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Step3({ form, upd, pw, pwOk, passwordsMatch }: {
  form: Form;
  upd: <K extends keyof Form>(k: K, v: Form[K]) => void;
  pw: ReturnType<typeof checkPassword>;
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
          <div className="flex gap-2">
            <input className="input !w-20" value={form.countryCode} onChange={(e) => upd("countryCode", e.target.value)} aria-label="Country code" />
            <input className="input flex-1" inputMode="tel" placeholder="Enter Mobile Number" value={form.mobile} onChange={(e) => upd("mobile", e.target.value)} autoComplete="tel-national" />
          </div>
        </Field>
        <Field label="Password" required>
          <input className="input" type="password" placeholder="Create Password" value={form.password} onChange={(e) => upd("password", e.target.value)} autoComplete="new-password" />
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
            className={`input ${form.confirmPassword && !passwordsMatch ? "border-red-300 focus:ring-red-500" : ""}`}
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

function VerifyStep({ email, otp, setOtp, onResend, disabled }: {
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label} {required && <span className="text-red-500" aria-hidden="true">*</span>}</label>
      {children}
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
