"use client";
import { useCallback, useEffect, useState } from "react";

import { endUserApi, ApiError } from "@/lib/api";
import { getCurrentEndUser } from "@/lib/auth";

import type { LastSyncResult } from "@/lib/types.api";

export function usePatientDevicesModel() {
  const [user, setUser] = useState<ReturnType<typeof getCurrentEndUser>>(null);
  const [sync, setSync] = useState<LastSyncResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setUser(getCurrentEndUser());
  }, []);
  const load = useCallback(async () => {
    if (!user?.email || !user.deviceId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await endUserApi.getLastSyncDate({ email: user.email, deviceId: user.deviceId });
      setSync(r);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load device info.");
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    load();
  }, [load]);
  return { user, sync, loading, error, load };
}
