"use client";
import { useEffect, useState } from "react";

import { homeCareApi, ApiError } from "@/lib/api";

import type { AccountUser } from "@/lib/types.api";

export function useAdminApprovalsModel() {
  const [regs, setRegs] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"providers" | "monitors">("providers");
  const [detail, setDetail] = useState<AccountUser | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await homeCareApi.listPending();
      setRegs(data);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load pending registrations.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function doApprove(id: string) {
    setActing(id);
    try {
      await homeCareApi.approve(id);
      setRegs((r) => r.filter((x) => x._id !== id));
      setDetail(null);
    } catch (e) {
      setError((e as ApiError).message || "Approve failed.");
    } finally {
      setActing(null);
    }
  }
  async function doReject(id: string, reason: string) {
    setActing(id);
    try {
      await homeCareApi.reject(id, reason || undefined);
      setRegs((r) => r.filter((x) => x._id !== id));
      setDetail(null);
      setRejectReason("");
    } catch (e) {
      setError((e as ApiError).message || "Reject failed.");
    } finally {
      setActing(null);
    }
  }
  const pendingProviders = regs.filter((r) => r.userType === "home_care_provider");
  const pendingMonitors = regs.filter((r) => r.userType === "authorized_monitor");
  const list = tab === "providers" ? pendingProviders : pendingMonitors;
  return {
    loading,
    error,
    tab,
    setTab,
    detail,
    setDetail,
    acting,
    rejectReason,
    setRejectReason,
    load,
    doApprove,
    doReject,
    pendingProviders,
    pendingMonitors,
    list,
  };
}
