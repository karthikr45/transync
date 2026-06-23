"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Optional aria-label on the toggle button. */
  toggleLabel?: { show?: string; hide?: string };
};

/**
 * Password text field with a show/hide toggle. Use anywhere we ask the
 * user to type a credential — login, registration, password-change etc.
 */
export default function PasswordInput({
  className = "",
  toggleLabel,
  ...rest
}: Props) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input
        type={shown ? "text" : "password"}
        className={`input pr-10 ${className}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded"
        aria-label={shown ? (toggleLabel?.hide ?? "Hide password") : (toggleLabel?.show ?? "Show password")}
        aria-pressed={shown}
        tabIndex={-1}
      >
        {shown ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
