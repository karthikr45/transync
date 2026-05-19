"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";

type Role = "individual" | "provider" | "monitor";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("individual");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dest =
      role === "individual" ? "/patient/dashboard" : role === "provider" ? "/provider/dashboard" : "/monitor/dashboard";
    router.push(dest);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-6">
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-slate-900">Log on</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back. Select your account type to continue.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="label">Account type</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "individual", label: "Individual User" },
                  { id: "provider", label: "Homecare Provider" },
                  { id: "monitor", label: "Authorized Monitor" },
                ] as const).map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition leading-tight ${
                      role === r.id
                        ? "bg-brand-50 border-brand-500 text-brand-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {r.label}
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
            <button type="submit" className="btn-primary w-full">Log on</button>
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
