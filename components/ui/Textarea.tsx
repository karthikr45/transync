import type { ComponentPropsWithRef } from "react";

export default function Textarea({ className = "", ...props }: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea
      {...props}
      className={`input disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}
