"use client";

import { useState } from "react";

import { insuranceProviders, InsuranceProvider } from "@/lib/mock-data";
import { blank } from "./model";

export function useInsuranceSettingsModel() {
  const [list, setList] = useState<InsuranceProvider[]>(insuranceProviders);
  const [open, setOpen] = useState<string | null>(insuranceProviders[0].id);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(blank);
  const [added, setAdded] = useState<string | null>(null);
  function save() {
    if (!draft.name.trim()) return;
    const id = `ins-${Date.now()}`;
    const created: InsuranceProvider = { id, ...draft };
    setList((l) => [...l, created]);
    setOpen(id);
    setAdded(draft.name);
    setShowAdd(false);
    setDraft(blank);
    setTimeout(() => setAdded(null), 4000);
  }
  return { list, open, setOpen, showAdd, setShowAdd, draft, setDraft, added, save };
}
