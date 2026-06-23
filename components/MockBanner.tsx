import { AlertTriangle } from "lucide-react";

/**
 * Banner shown on screens that don't yet have a backend API behind
 * them. Renders sample data underneath only as a layout placeholder.
 */
export default function MockBanner({ note }: { note?: string }) {
  return (
    <div className="card p-3 mb-4 bg-amber-50 border-amber-100 text-amber-900 text-xs flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <strong>Awaiting backend integration.</strong> Sample data shown for layout reference only — no live API is wired here yet.
        {note ? ` ${note}` : ""}
      </div>
    </div>
  );
}
