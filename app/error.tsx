"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-600 mt-2">
          An unexpected error occurred. We&apos;ve logged it. You can try again or go back to the home page.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-400 font-mono">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button className="btn-secondary" onClick={reset}>Try again</button>
          <Link href="/" className="btn-primary">Go home</Link>
        </div>
      </div>
    </div>
  );
}
