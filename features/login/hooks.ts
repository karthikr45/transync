"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { homeCareApi, endUserApi, ApiError } from "@/lib/api";
import { destinationForUser, setSession } from "@/lib/auth";

import { Kind } from "./model";

export function useLoginInnerModel() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const [kind, setKind] = useState<Kind>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function safeRedirect(fallback: string) {
    // Allow only paths that point into a known protected portal. Blocks
    // open-redirect via ?next=//evil.example or ?next=/etc.
    const allowed = /^\/(provider|monitor|admin|patient)(\/|$)/;
    const candidate = next && allowed.test(next) ? next : fallback;
    if (typeof window !== "undefined") {
      window.location.assign(candidate);
    } else {
      router.push(candidate);
    }
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (kind === "patient") {
        const eu = await endUserApi.login({ email, password });
        setSession(eu.token, eu.refreshToken, eu, "end-user");
        safeRedirect("/patient/dashboard");
      } else {
        const { token, refreshToken, user } = await homeCareApi.login({ email, password });
        setSession(token, refreshToken, user, "home-care");
        safeRedirect(destinationForUser(user));
      }
    } catch (err) {
      setError((err as ApiError).message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }
  function switchKind(k: Kind) {
    setKind(k);
    setError(null);
  }
  return {
    kind,
    email,
    setEmail,
    password,
    setPassword,
    submitting,
    error,
    handleSubmit,
    switchKind,
  };
}
