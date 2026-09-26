// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
"use client";
import UiButton from "@/components/ui/Button";

import Link from "next/link";

import { AlertTriangle, ArrowRight, Check, ShieldCheck } from "lucide-react";

import Logo from "@/components/Logo";

import PublicGuard from "@/components/PublicGuard";

import { Step } from "./model";
import { Stepper, Step1, Step2, Step3, VerifyStep, Done } from "./components";

import { usePatientRegisterInnerModel } from "./hooks";
export default function PatientRegister() {
  return (
    <PublicGuard>
      <PatientRegisterInner />
    </PublicGuard>
  );
}

function PatientRegisterInner() {
  const {
    step,
    setStep,
    form,
    otp,
    setOtp,
    submitting,
    error,
    info,
    fieldErrors,
    touched,
    upd,
    touch,
    countries,
    stateOptions,
    pw,
    pwOk,
    passwordsMatch,
    occupationOptions,
    cpapOptions,
    usageOptions,
    purchaseOptions,
    clearMsgs,
    goNext,
    resendOtp,
  } = usePatientRegisterInnerModel();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="flex items-center justify-center mb-6"
          aria-label="Transcend home"
        >
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="card p-6">
          <Stepper step={step} />

          {step === 1 && (
            <Step1
              form={form}
              upd={upd}
              touch={touch}
              touched={touched}
              countries={countries}
              stateOptions={stateOptions}
            />
          )}
          {step === 2 && (
            <Step2
              form={form}
              upd={upd}
              occupations={occupationOptions}
              cpapOpts={cpapOptions}
              usageOpts={usageOptions}
              purchaseOpts={purchaseOptions}
            />
          )}
          {step === 3 && (
            <Step3 form={form} upd={upd} pw={pw} pwOk={pwOk} passwordsMatch={passwordsMatch} />
          )}
          {step === 4 && (
            <VerifyStep
              email={form.email}
              otp={otp}
              setOtp={setOtp}
              onResend={resendOtp}
              disabled={submitting}
            />
          )}
          {step === 5 && <Done />}

          {step !== 5 && info && (
            <div
              className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800 flex items-start gap-2"
              role="status"
            >
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {info}
            </div>
          )}
          {step !== 5 && error && (
            <div
              className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
              {fieldErrors && (
                <ul className="mt-1 list-disc list-inside text-xs">
                  {Object.entries(fieldErrors).map(([k, v]) => (
                    <li key={k}>
                      {k}: {v[0]}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step !== 5 && (
            <div className="mt-6 flex justify-between">
              <UiButton
                variant="secondary"
                type="button"
                onClick={() => {
                  clearMsgs();
                  setStep((s) => Math.max(1, s - 1) as Step);
                }}
                disabled={step === 1 || submitting}
                className="btn-secondary disabled:opacity-50"
              >
                Back
              </UiButton>
              <UiButton
                variant="primary"
                type="button"
                onClick={goNext}
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {step === 1 || step === 2 ? (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                ) : step === 3 ? (
                  submitting ? (
                    "Sending code…"
                  ) : (
                    <>
                      Submit <ArrowRight className="w-4 h-4" />
                    </>
                  )
                ) : submitting ? (
                  "Verifying…"
                ) : (
                  <>
                    Verify <Check className="w-4 h-4" />
                  </>
                )}
              </UiButton>
            </div>
          )}
        </div>
        {step !== 5 && (
          <div className="text-center text-sm text-slate-600 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-medium">
              Log on
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
