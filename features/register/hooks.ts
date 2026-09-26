"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";
import { getTimeZoneName } from "@/lib/timezone";
import type { UserType, RegisterDto } from "@/lib/types.api";
import { AccountType, Form, blank } from "./model";

export function useRegisterInnerModel() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<AccountType | null>(null);
  const [form, setForm] = useState<Form>(() => ({ ...blank, timeZone: getTimeZoneName() }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();
  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  async function submitRegistration() {
    if (!type || type === "individual") return;
    setError(null);
    setFieldErrors(undefined);
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
      if (type === "individual") {
        router.push("/register/patient");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    // step === 3 — Consent → submit (provider/monitor)
    submitRegistration();
  }
  return {
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
  };
}
