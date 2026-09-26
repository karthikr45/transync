import { Phone, Activity, RefreshCw, Mail } from "lucide-react";
import type { WorklistCategory } from "@/lib/types.api";
import { CategoryMeta } from "./model";
export const CATEGORIES: Record<WorklistCategory, CategoryMeta> = {
  non_compliant: {
    title: "Non-compliant — call patient",
    tone: "red",
    icon: <Phone className="w-4 h-4" />,
  },
  at_risk: {
    title: "At risk — review trend",
    tone: "amber",
    icon: <Activity className="w-4 h-4" />,
  },
  missed_sync: {
    title: "Missed device sync",
    tone: "amber",
    icon: <RefreshCw className="w-4 h-4" />,
  },
  awaiting_consent: {
    title: "Awaiting patient consent",
    tone: "blue",
    icon: <Mail className="w-4 h-4" />,
  },
};
