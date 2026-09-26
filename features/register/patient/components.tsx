import Link from "next/link";
import { Check, Mail } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";
import PasswordInput from "@/components/PasswordInput";
import PhoneInputField from "@/components/PhoneInputField";
import DobField from "@/components/DobField";
import { passwordPolicy, validName, validEmail } from "@/lib/validators";
import { Step, Form } from "./model";
export function Stepper({ step }: { step: Step }) {
  const items = ["Basic", "Profile", "Account", "Verify"];
  return (
    <div
      className="flex items-center justify-between mb-6"
      aria-label={`Step ${Math.min(step, 4)} of 4`}
    >
      {items.map((label, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx || step === 5;
        return (
          <div key={label} className="flex-1 flex items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${done ? "bg-brand-600 text-white" : active ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500" : "bg-slate-100 text-slate-500"}`}
            >
              {done ? <Check className="w-4 h-4" /> : idx}
            </div>
            <div
              className={`ml-2 text-xs font-medium ${active ? "text-slate-900" : "text-slate-500"}`}
            >
              {label}
            </div>
            {i < items.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-3" />}
          </div>
        );
      })}
    </div>
  );
}

export function Step1({
  form,
  upd,
  touch,
  touched,
  countries,
  stateOptions,
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
          <select
            className="input"
            value={form.countryCode}
            onChange={(e) => {
              upd("countryCode", e.target.value);
              upd("state", "");
            }}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="State" required>
          {stateOptions === null ? (
            <input
              className="input"
              placeholder="State / Province"
              value={form.state}
              onChange={(e) => upd("state", e.target.value)}
            />
          ) : stateOptions.length === 0 ? (
            <input
              className="input bg-slate-50 text-slate-500"
              disabled
              value="No states for this country"
            />
          ) : (
            <select
              className="input"
              value={form.state}
              onChange={(e) => upd("state", e.target.value)}
            >
              <option value="">Select State</option>
              {stateOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
        </Field>
        <Field
          label="First Name"
          required
          err={fnInvalid ? "Only letters, apostrophes and single spaces are allowed." : null}
        >
          <input
            className={`input ${fnInvalid ? "border-red-300" : ""}`}
            placeholder="Enter your First Name"
            value={form.firstName}
            onChange={(e) => upd("firstName", e.target.value)}
            onBlur={() => touch("firstName")}
            autoComplete="given-name"
          />
        </Field>
        <Field
          label="Last Name"
          required
          err={lnInvalid ? "Only letters, apostrophes and single spaces are allowed." : null}
        >
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

export function Step2({
  form,
  upd,
  occupations,
  cpapOpts,
  usageOpts,
  purchaseOpts,
}: {
  form: Form;
  upd: <K extends keyof Form>(k: K, v: Form[K]) => void;
  occupations: string[];
  cpapOpts: string[];
  usageOpts: string[];
  purchaseOpts: string[];
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Your Basic Information</h2>
      <p className="text-sm text-slate-500 mb-4">Tell us a bit about your therapy.</p>
      <div className="space-y-3">
        <Field label="Date of Birth" required>
          <DobField value={form.dob} onChange={(iso) => upd("dob", iso)} />
        </Field>
        <Field label="Occupation">
          <select
            className="input"
            value={form.occupation}
            onChange={(e) => upd("occupation", e.target.value)}
          >
            {occupations.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="How long have you been a CPAP user?" required>
          <select
            className="input"
            value={form.cpapUser}
            onChange={(e) => upd("cpapUser", e.target.value)}
          >
            {cpapOpts.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="How are you using the Transcend device?" required>
          <select
            className="input"
            value={form.transcendUsage}
            onChange={(e) => upd("transcendUsage", e.target.value)}
          >
            {usageOpts.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Where was the Transcend device purchased?" required>
          <select
            className="input"
            value={form.devicePurchased}
            onChange={(e) => upd("devicePurchased", e.target.value)}
          >
            {purchaseOpts.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

export function Step3({
  form,
  upd,
  pw,
  pwOk,
  passwordsMatch,
}: {
  form: Form;
  upd: <K extends keyof Form>(k: K, v: Form[K]) => void;
  pw: ReturnType<typeof passwordPolicy>;
  pwOk: boolean;
  passwordsMatch: boolean;
}) {
  const mobileEntered = form.mobile.trim().length > 0;
  const mobileValid = !mobileEntered || isValidPhoneNumber(form.mobile);
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Your Basic Information</h2>
      <p className="text-sm text-slate-500 mb-4">
        Almost done — create your password and accept the terms.
      </p>
      <div className="space-y-3">
        <Field label="Care Provider">
          <input
            className="input"
            placeholder="Enter Care Provider"
            value={form.provider}
            onChange={(e) => upd("provider", e.target.value)}
          />
        </Field>
        <Field label="Care Provider Email">
          <input
            className="input"
            type="email"
            placeholder="Enter Care Provider Email"
            value={form.providerEmail}
            onChange={(e) => upd("providerEmail", e.target.value)}
          />
        </Field>
        <Field
          label="Mobile Number"
          required
          err={!mobileValid ? "Please enter a valid mobile number for the selected country." : null}
        >
          <PhoneInputField
            value={form.mobile}
            onChange={(v) => upd("mobile", v)}
            defaultCountry={form.countryCode || "US"}
          />
        </Field>
        <Field label="Password" required>
          <PasswordInput
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
          <PasswordInput
            className={form.confirmPassword && !passwordsMatch ? "border-red-300" : ""}
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
          <input
            type="checkbox"
            className="mt-1"
            checked={form.consentTerms}
            onChange={(e) => upd("consentTerms", e.target.checked)}
          />
          <div className="text-sm text-slate-700">
            I consent to the{" "}
            <Link href="#" className="text-brand-600">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-brand-600">
              Privacy Notice
            </Link>
            .
          </div>
        </label>
        <label className="flex gap-3 items-start p-3 border border-slate-200 rounded-lg">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.consentMarketing}
            onChange={(e) => upd("consentMarketing", e.target.checked)}
          />
          <div className="text-sm text-slate-700">
            I consent to receiving email messages about other Transcend products and services.
          </div>
        </label>
      </div>
      {!pwOk && form.password.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Pick a password that satisfies all five rules.
        </p>
      )}
    </div>
  );
}

export function VerifyStep({
  email,
  otp,
  setOtp,
  onResend,
  disabled,
}: {
  email: string;
  otp: string;
  setOtp: (v: string) => void;
  onResend: () => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
        <Mail className="w-5 h-5 text-brand-600" aria-hidden="true" /> Verify your email
      </h2>
      <p className="text-sm text-slate-500">
        Enter the code we sent to <strong>{email}</strong>.
      </p>
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
      <button
        type="button"
        onClick={onResend}
        disabled={disabled}
        className="text-xs text-brand-600 hover:underline"
      >
        Resend code
      </button>
    </div>
  );
}

export function Done() {
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

export function Field({
  label,
  required,
  hint,
  err,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  err?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}{" "}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
      {hint && !err && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={`badge ${ok ? "badge-green" : "badge-slate"} inline-flex items-center gap-1`}>
      {ok && <Check className="w-3 h-3" aria-hidden="true" />}
      {children}
    </span>
  );
}
