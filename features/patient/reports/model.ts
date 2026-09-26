import { type Tab } from "@/components/MobileReport";
import type { SessionWindow } from "@/lib/types.api";
export const CUSTOM_LABEL = "Select a Range";

export const RANGES: { label: string; session: SessionWindow }[] = [
  { label: "Last 24 Hours", session: 0 },
  { label: "7 Days", session: 1 },
  { label: "30 Days", session: 2 },
  { label: "90 Days", session: 3 },
  { label: "1 Year", session: 4 },
  { label: CUSTOM_LABEL, session: 3 },
];

export const TAB_LABEL: Record<Tab, string> = {
  standard: "Standard",
  advanced: "Advanced",
  faa: "FAA",
};
