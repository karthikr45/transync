"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";
import { displayDob } from "@/lib/format";

/**
 * Date-of-birth field.
 *
 * Visible: a read-only text input rendering "1-june-2026".
 * Underneath: a transparent <input type="date"> that fills the same box,
 * so clicking anywhere on the field opens the browser's native date
 * picker. The API still receives the ISO yyyy-MM-dd value.
 */
export default function DobField({
  value,
  onChange,
  ariaLabel = "Date of birth",
}: {
  value: string;
  onChange: (iso: string) => void;
  ariaLabel?: string;
}) {
  const dateRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const el = dateRef.current;
    if (!el) return;
    // showPicker() is the modern, gesture-safe API; fall back to focus/click.
    const anyEl = el as HTMLInputElement & { showPicker?: () => void };
    if (typeof anyEl.showPicker === "function") {
      try { anyEl.showPicker(); return; } catch { /* fall through */ }
    }
    el.focus();
    el.click();
  }

  return (
    <div className="relative">
      <input
        type="text"
        readOnly
        value={value ? displayDob(value) : ""}
        placeholder="DD-MMMM-YYYY"
        onClick={openPicker}
        onFocus={openPicker}
        className="input pr-10 cursor-pointer"
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
        aria-label="Open calendar"
      >
        <Calendar className="w-4 h-4" />
      </button>
      {/* The actual date picker. It sits behind the text input, invisible
          but interactive, so the native picker chrome shows up under the
          field. */}
      <input
        ref={dateRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
