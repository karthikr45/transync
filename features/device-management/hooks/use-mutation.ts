"use client";
import { useRef, useState } from "react";
import { deviceWorkflowApi } from "../api/device-workflow-api";
export function useMutation() {
  const keys = useRef(new Map<string, string>());
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  async function run(path: string, payload: Record<string, unknown>) {
    if (busyRef.current) throw new Error("An action is already in progress.");
    const fingerprint = JSON.stringify([path, payload]);
    let key = keys.current.get(fingerprint);
    if (!key) {
      key = crypto.randomUUID();
      keys.current.set(fingerprint, key);
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const result = await deviceWorkflowApi.mutate(path, payload, key);
      if (!result || typeof result.message !== "string")
        throw new Error(
          "The server did not confirm this action. Refresh to check its status before retrying.",
        );
      keys.current.delete(fingerprint);
      return result;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return { run, busy };
}
