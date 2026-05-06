"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "provider" | "insurance">("patient");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dest =
      role === "patient" ? "/patient/dashboard" : role === "provider" ? "/provider/dashboard" : "/insurance/dashboard";
    router.push(dest);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">TranSync</span>
        </Link>
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back. Choose your portal to continue.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="label">Sign in as</label>
              <div className="grid grid-cols-3 gap-2">
                {(["patient", "provider", "insurance"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                      role === r
                        ? "bg-brand-50 border-brand-500 text-brand-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {r === "patient" ? "Patient" : r === "provider" ? "Provider" : "Insurance"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" defaultValue="demo@transync.io" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" defaultValue="••••••••" />
            </div>
            <div className="flex justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <Link href="#" className="text-brand-600">Forgot password?</Link>
            </div>
            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>

          <div className="mt-5 text-sm text-center text-slate-600">
            New patient? <Link href="/register" className="text-brand-600 font-medium">Create account</Link>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500 mt-4">
          By continuing you agree to TranSync&apos;s Terms and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
