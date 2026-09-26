"use client";
import { useEffect, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";

import type { IncomingShare } from "@/lib/types.api";

export function useMonitorSharesModel() {
  const [pending, setPending] = useState<IncomingShare[]>([]);
  const [decided, setDecided] = useState<IncomingShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { pending, shares } = await homeCareApi.listIncomingShares();
      setPending(pending);
      setDecided(shares);
    } catch (err) {
      setError((err as ApiError).message || "Could not load incoming shares.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function decide(id: string, action: "accept" | "decline") {
    setBusyId(id);
    try {
      if (action === "accept") await homeCareApi.acceptShare(id);
      else await homeCareApi.declineShare(id);
      const row = pending.find((p) => p.id === id);
      if (row) {
        const next: IncomingShare = {
          ...row,
          status: action === "accept" ? "accepted" : "declined",
        };
        setPending((p) => p.filter((x) => x.id !== id));
        setDecided((d) => [next, ...d]);
      }
    } catch (err) {
      alert((err as ApiError).message || `Could not ${action} share.`);
    } finally {
      setBusyId(null);
    }
  }
  return { pending, decided, loading, error, busyId, load, decide };
}
