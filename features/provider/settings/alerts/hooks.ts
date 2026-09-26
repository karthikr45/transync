"use client";

import { useState } from "react";

import { alertRules } from "@/lib/mock-data";

export function useAlertsSettingsModel() {
  const [rules, setRules] = useState(alertRules);
  const toggle = (id: string) =>
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  return { rules, toggle };
}
