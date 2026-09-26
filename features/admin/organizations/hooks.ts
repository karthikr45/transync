"use client";
import { useCallback, useEffect, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";

import type { AdminClientRow, AdminClientsResult } from "@/lib/types.api";
import { TypeFilter, StatusFilter, PAGE_SIZE } from "./model";

export function useAdminOrganizationsModel() {
  const [search, setSearch] = useState("");
  const [type, updateType] = useState<TypeFilter>("all");
  const [status, updateStatus] = useState<StatusFilter>("all");
  const [offset, setOffset] = useState(0);
  const setType = (value: TypeFilter) => {
    updateType(value);
    setOffset(0);
  };
  const setStatus = (value: StatusFilter) => {
    updateStatus(value);
    setOffset(0);
  };
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setOffset(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);
  const [data, setData] = useState<AdminClientsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<
    { row: AdminClientRow; action: "suspend" } | { row: AdminClientRow; action: "reinstate" } | null
  >(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const load = useCallback(
    async (o = offset) => {
      setLoading(true);
      setError(null);
      try {
        const res = await homeCareApi.adminClients({
          userType: type === "all" ? undefined : type,
          status: status === "all" ? undefined : status,
          search: debouncedSearch.trim() || undefined,
          limit: PAGE_SIZE,
          offset: o,
        });
        setData(res);
      } catch (e) {
        setError((e as ApiError).message || "Failed to load organizations.");
      } finally {
        setLoading(false);
      }
    },
    [type, status, debouncedSearch, offset],
  );
  useEffect(() => {
    void load();
  }, [load]);
  async function applyAction() {
    if (!confirm) return;
    setBusy(true);
    setBusyId(confirm.row.id);
    try {
      if (confirm.action === "suspend") {
        await homeCareApi.adminSuspendClient(confirm.row.id, {
          reason: reason.trim() || undefined,
        });
      } else {
        await homeCareApi.adminReinstateClient(confirm.row.id);
      }
      setConfirm(null);
      setReason("");
      await load(offset);
    } catch (e) {
      setError((e as ApiError).message || "Action failed.");
    } finally {
      setBusy(false);
      setBusyId(null);
    }
  }
  const rows = data?.clients ?? [];
  const total = data?.total ?? 0;
  return {
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    offset,
    setOffset,
    loading,
    error,
    confirm,
    setConfirm,
    reason,
    setReason,
    busy,
    busyId,
    load,
    applyAction,
    rows,
    total,
  };
}
