"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { isValidPhoneNumber } from "react-phone-number-input";

import { endUserApi, ApiError } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { passwordPolicy, validatePassword, validName, validEmail } from "@/lib/validators";
import { listCountries, statesForCode, nameForCode } from "@/lib/countries";
import { getTimeZoneName } from "@/lib/timezone";
import { normaliseOptions } from "@/lib/options";
import type { CreateUserDto, MetadataResponse } from "@/lib/types.api";
import {
  Step,
  Form,
  blank,
  FALLBACK_OCCUPATIONS,
  FALLBACK_CPAP_USER,
  FALLBACK_USAGE,
  FALLBACK_PURCHASE,
  friendlyError,
} from "./model";

export function usePatientRegisterInnerModel() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<Form>(blank);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();
  const [meta, setMeta] = useState<MetadataResponse | null>(null);
  const [touched, setTouched] = useState<Record<keyof Form, boolean>>(
    {} as Record<keyof Form, boolean>,
  );
  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }));
  const touch = (k: keyof Form) => setTouched((t) => ({ ...t, [k]: true }));
  const countries = useMemo(() => listCountries(), []);
  const stateOptions = useMemo(() => statesForCode(form.countryCode), [form.countryCode]);
  const pw = passwordPolicy(form.password);
  const pwOk = validatePassword(form.password);
  const passwordsMatch = form.password.length > 0 && form.password === form.confirmPassword;
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
    return () => {
      cancelled = true;
    };
  }, []);
  function mergeList(key: keyof MetadataResponse, fallback: string[]): string[] {
    const list = normaliseOptions(meta?.[key]);
    return list.length > 0 ? list : fallback;
  }
  const occupationOptions = mergeList("occupation", FALLBACK_OCCUPATIONS);
  const cpapOptions = mergeList("userExpList", FALLBACK_CPAP_USER);
  const usageOptions = mergeList("devicePurposeList", FALLBACK_USAGE);
  const purchaseOptions = mergeList("devicePurchaseList", FALLBACK_PURCHASE);
  useEffect(() => {
    setForm((p) => ({
      ...p,
      occupation: p.occupation || occupationOptions[0] || "",
      cpapUser: p.cpapUser || cpapOptions[0] || "",
      transcendUsage: p.transcendUsage || usageOptions[0] || "",
      devicePurchased: p.devicePurchased || purchaseOptions[0] || "",
    }));
  }, [occupationOptions, cpapOptions, usageOptions, purchaseOptions]);
  function err(msg: string) {
    setError(msg);
    setInfo(null);
  }
  function inf(msg: string) {
    setInfo(msg);
    setError(null);
  }
  function clearMsgs() {
    setError(null);
    setInfo(null);
    setFieldErrors(undefined);
  }
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
    if (!form.mobile) return "Mobile number is required.";
    if (!isValidPhoneNumber(form.mobile)) return "Please enter a valid mobile number.";
    if (!pwOk) return "Password does not meet the policy.";
    if (!passwordsMatch) return "Passwords do not match.";
    if (!form.consentTerms) return "Please accept the Terms of Use to continue.";
    if (form.providerEmail && !validEmail(form.providerEmail))
      return "Care Provider email is not valid.";
    return null;
  }
  async function goNext() {
    clearMsgs();
    if (step === 1) {
      const v = validateStep1();
      if (v) return err(v);
      setStep(2);
      return;
    }
    if (step === 2) {
      const v = validateStep2();
      if (v) return err(v);
      setStep(3);
      return;
    }
    if (step === 3) {
      const v = validateStep3();
      if (v) return err(v);
      setSubmitting(true);
      try {
        const name = `${form.firstName} ${form.lastName}`.trim();
        await endUserApi.signUpOtp({ email: form.email.trim(), name });
        inf("Verification code sent. Check your inbox.");
        setStep(4);
      } catch (e) {
        err(friendlyError((e as ApiError).message || "Could not send the verification code."));
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (step === 4) {
      const otpClean = otp.trim();
      const otpNum = Number(otpClean);
      if (!otpClean || !Number.isFinite(otpNum))
        return err("Enter the numeric code from the email.");
      setSubmitting(true);
      try {
        const ok = await endUserApi.validateOtp({ email: form.email.trim(), otp: otpNum });
        if (!ok) throw new ApiError("Code did not match.", 400);
        await createAccount();
      } catch (e) {
        const apiErr = e as ApiError;
        err(friendlyError(apiErr.message || "Invalid or expired code."));
        setFieldErrors(apiErr.fieldErrors);
      } finally {
        setSubmitting(false);
      }
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
    } finally {
      setSubmitting(false);
    }
  }
  async function createAccount() {
    const trim = (s: string) => s.trim();
    const countryName = nameForCode(form.countryCode);
    const dto: CreateUserDto = {
      firstName: trim(form.firstName),
      lastName: trim(form.lastName),
      email: trim(form.email),
      password: form.password,
      dob: trim(form.dob), // yyyy-MM-dd (ISO date string)
      state: trim(form.state),
      country: countryName,
      mobile: trim(form.mobile),
      cpapUser: trim(form.cpapUser),
      transcendDevice: "Transcend 365 miniCPAP",
      occupation: trim(form.occupation),
      gender: "",
      city: "",
      pincode: undefined,
      countryCode: "", // dial code embedded in `mobile` E.164
      profileImage: "",
      provider: trim(form.provider),
      providerEmail: trim(form.providerEmail),
      dealerName: "",
      devicePurchased: trim(form.devicePurchased),
      timeZone: getTimeZoneName(),
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
  return {
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
  };
}
