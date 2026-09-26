import type { WorklistAction } from "@/lib/types.api";
export const PAGE_SIZE = 25;

export type CategoryMeta = {
  title: string;
  tone: "red" | "amber" | "blue";
  icon: React.ReactNode;
};

export const ACTION_LABEL: Record<WorklistAction, string> = {
  call: "Call",
  review: "Review",
  contact: "Contact",
  resend: "Resend",
};
