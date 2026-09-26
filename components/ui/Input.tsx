import type { ComponentPropsWithRef } from "react";

/** Approved native input. Use PasswordInput, PhoneInputField and DobField for those workflows. */
export default function Input({
  className = "",
  type = "text",
  ...props
}: ComponentPropsWithRef<"input">) {
  const base =
    type === "checkbox" || type === "radio" ? "accent-brand-600" : type === "hidden" ? "" : "input";
  return (
    <input
      {...props}
      type={type}
      className={`${base} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}
