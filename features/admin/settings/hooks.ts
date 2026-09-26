"use client";
import { useState } from "react";

import { platformFeatureFlags } from "@/lib/mock-data";

export function useAdminSettingsModel() {
  const [flags, setFlags] = useState(platformFeatureFlags);
  const toggle = (id: string) =>
    setFlags((fs) => fs.map((f) => (f.id === id ? { ...f, on: !f.on } : f)));
  return { flags, toggle };
}
