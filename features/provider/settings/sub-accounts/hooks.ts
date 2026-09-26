"use client";

import { useState } from "react";

export function useSubAccountsSettingsModel() {
  const [showCreate, setShowCreate] = useState(false);
  return { showCreate, setShowCreate };
}
