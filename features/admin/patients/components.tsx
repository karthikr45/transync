import type { ApiJson } from "@/lib/types.api";
export function FieldValue({ value }: { value: ApiJson | undefined }) {
  if (value === undefined || value === null || value === "")
    return <span className="text-slate-400">—</span>;
  if (typeof value === "object")
    return (
      <details>
        <summary className="cursor-pointer text-brand-600">View details</summary>
        <pre className="mt-2 text-xs whitespace-pre-wrap break-words max-w-md">
          {JSON.stringify(value, null, 2)}
        </pre>
      </details>
    );
  return <>{String(value)}</>;
}
