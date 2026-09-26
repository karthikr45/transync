import type { ComponentPropsWithRef } from "react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  plain: "inline-flex items-center justify-center",
} as const;
export type ButtonProps = ComponentPropsWithRef<"button"> & { variant?: keyof typeof variants };
/** Explicit submit buttons only; plain is reserved for icon, tab and inline actions. */
export default function Button({
  variant = "secondary",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}
