import type { ComponentPropsWithRef } from "react";

/** Use a caption or accessible name, scoped column headers and an overflow container. */
export default function Table({ className = "", ...props }: ComponentPropsWithRef<"table">) {
  return <table {...props} className={`w-full text-sm ${className}`} />;
}
