import type { ComponentPropsWithRef } from "react";

/** Approved native dropdown. Keep option/optgroup children and native keyboard behavior. */
export default function Select({ className = "", ...props }: ComponentPropsWithRef<"select">) {
  return (
    <select
      {...props}
      className={`input disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}
