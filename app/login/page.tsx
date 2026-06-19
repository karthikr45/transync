"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Logo from "@/components/Logo";
import { homeCareApi, ApiError } from "@/lib/api";
import { setSession, destinationForUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, refreshToken, user } = await homeCareApi.login({ email, password });
      setSession(token, refreshToken, user);
      router.push(destinationForUser(user));
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-6">
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-slate-900">Log on</h1>
          <p className="text-sm text-slate-500 mt-1">
            One login for Homecare Providers, Authorized Monitors and Super Admins.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <div className="flex justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <Link href="#" className="text-brand-600">Forgot password?</Link>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
              {submitting ? "Signing in…" : "Log on"}
            </button>
          </form>

          <div className="mt-5 text-sm text-center text-slate-600">
            New to Transcend? <Link href="/register" className="text-brand-600 font-medium">Register</Link>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500 mt-4">
          By continuing you agree to Transcend&apos;s Terms and HIPAA Notice.
        </div>
      </div>
    </div>
  );
}
