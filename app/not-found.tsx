import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-md text-center">
        <h1 className="text-3xl font-semibold text-slate-900">404</h1>
        <p className="text-sm text-slate-600 mt-2">We couldn&apos;t find that page.</p>
        <div className="mt-6">
          <Link href="/" className="btn-primary">Go home</Link>
        </div>
      </div>
    </div>
  );
}
