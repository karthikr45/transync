"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AlertTriangle, User, Building2 } from "lucide-react";
import Logo from "@/components/Logo";
import { homeCareApi, endUserApi, ApiError } from "@/lib/api";
import { destinationForUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

type Kind = "patient" | "staff";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const [kind, setKind] = useState<Kind>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function safeRedirect(fallback: string) {
    const candidate = next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
    // Hard navigation so the browser issues a fresh request that carries
    // the newly-set auth cookies through middleware.
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
        await endUserApi.login({ email, password });
        safeRedirect("/patient/dashboard");
      } else {
        const { user } = await homeCareApi.login({ email, password });
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-6" aria-label="Transcend home">
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-slate-900">{t("login.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("login.subtitle")}</p>

          <div role="radiogroup" aria-label="Account kind" className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={kind === "patient"}
              onClick={() => switchKind("patient")}
              className={`text-left rounded-lg border p-3 transition flex items-start gap-2 ${kind === "patient" ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <User className="w-4 h-4 mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-slate-900">{t("login.patient")}</div>
                <div className="text-xs text-slate-500">{t("login.patientHint")}</div>
              </div>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={kind === "staff"}
              onClick={() => switchKind("staff")}
              className={`text-left rounded-lg border p-3 transition flex items-start gap-2 ${kind === "staff" ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-slate-900">{t("login.staff")}</div>
                <div className="text-xs text-slate-500">{t("login.staffHint")}</div>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" aria-describedby={error ? "login-error" : undefined}>
            <div>
              <label htmlFor="login-email" className="label">{t("login.email")}</label>
              <input id="login-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label htmlFor="login-password" className="label">{t("login.password")}</label>
              <input id="login-password" className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>

            {error && (
              <div id="login-error" role="alert" className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
              </div>
            )}

            <div className="flex justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded" /> {t("login.rememberMe")}
              </label>
              <Link href="#" className="text-brand-600">{t("login.forgotPassword")}</Link>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
              {submitting ? t("login.signingIn") : t("common.logOn")}
            </button>
          </form>

          <div className="mt-5 text-sm text-center text-slate-600">
            {t("login.newToTranscend")} <Link href="/register" className="text-brand-600 font-medium">{t("common.register")}</Link>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500 mt-4">
          {t("login.terms")}
        </div>
      </div>
    </div>
  );
}
