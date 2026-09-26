"use client";

import { useEffect, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";

import type { DeviceUser } from "@/lib/types.api";
import { LIMIT } from "./model";

export function useMonitorPatientsModel() {
  const [users, setUsers] = useState<DeviceUser[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load(nextOffset = 0) {
    setLoading(true);
    setError(null);
    try {
      const data = await homeCareApi.listDeviceUsers({ LIMIT, OFFSET: nextOffset });
      setUsers(data.users);
      setTotal(data.total);
      setOffset(data.offset);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load(0);
  }, []);
  const filtered = users.filter((u) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (u.firstName ?? "").toLowerCase().includes(s) ||
      (u.lastName ?? "").toLowerCase().includes(s) ||
      (u.email ?? "").toLowerCase().includes(s) ||
      u.deviceId.toLowerCase().includes(s)
    );
  });
  return { users, total, offset, q, setQ, loading, error, load, filtered };
}
