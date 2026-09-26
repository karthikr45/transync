"use client";
import Link from "next/link";

import { ArrowRight, Check, AlertTriangle } from "lucide-react";
import Logo from "@/components/Logo";

import PublicGuard from "@/components/PublicGuard";

import {
  Completion,
  Stepper,
  PickType,
  ProviderDetails,
  MonitorDetails,
  IndividualDetails,
  Consent,
} from "./components";

import { useRegisterInnerModel } from "./hooks";
export default function RegisterPage() {
  return (
    <PublicGuard>
      <RegisterInner />
    </PublicGuard>
  );
}

function RegisterInner() {
  const {
    step,
    setStep,
    type,
    setType,
    form,
    submitting,
    error,
    setError,
    fieldErrors,
    update,
    next,
  } = useRegisterInnerModel();
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
            {step === 2 && type === "provider" && (
              <ProviderDetails form={form} update={update} fieldErrors={fieldErrors} />
            )}
            {step === 2 && type === "monitor" && (
              <MonitorDetails form={form} update={update} fieldErrors={fieldErrors} />
            )}
            {step === 2 && type === "individual" && (
              <IndividualDetails form={form} update={update} />
            )}
            {step === 3 && <Consent type={type} />}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  setError(null);
                  setStep(Math.max(1, step - 1));
                }}
                disabled={step === 1 || submitting}
                className="btn-secondary disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={(step === 1 && !type) || submitting}
                className="btn-primary disabled:opacity-50"
              >
                {step < 3 ? (
                  <>
                    Continue Registration <ArrowRight className="w-4 h-4" />
                  </>
                ) : submitting ? (
                  <>Submitting…</>
                ) : (
                  <>
                    Finish <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        {step !== 4 && (
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
