"use client";
import { useEffect, useState } from "react";

import { getCurrentEndUser, setSession, getRefreshToken, logout } from "@/lib/auth";
import { endUserApi, ApiError } from "@/lib/api";

import { nameForCode } from "@/lib/countries";
import type { EndUser } from "@/lib/types.api";

export function usePatientProfileModel() {
  const [user, setUser] = useState<EndUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load() {
    const cached = getCurrentEndUser();
    setUser(cached);
    if (!cached?.email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fresh = await endUserApi.getByEmail(cached.email);
      // /users/getByEmail does not return token/refreshToken — keep the
      // existing session tokens but refresh the profile fields.
      const merged: EndUser = {
        ...cached,
        ...fresh,
        deviceId: fresh.deviceId || cached.deviceId,
        token: cached.token,
        refreshToken: cached.refreshToken ?? getRefreshToken() ?? "",
      };
      setUser(merged);
      setSession(merged.token, merged.refreshToken, merged, "end-user");
    } catch (err) {
      setError((err as ApiError).message || "Could not refresh profile.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "—";
  const countryName = user?.country ? nameForCode(user.country) : "";
  return { user, loading, error, setError, load, fullName, countryName };
}

export function useDeleteAccountButtonModel({
  email,
  deviceId,
}: {
  email: string;
  deviceId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const canSubmit = confirmText === "DELETE" && !!deviceId && !submitting;
  async function submit() {
    if (!deviceId) {
      setError("No device associated with your account yet.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await endUserApi.deleteAccount({ email, deviceId });
      setSubmittedAt(res.AccountDeletionRequestDate);
      setTimeout(() => logout(), 2500);
    } catch (err) {
      setError((err as ApiError).message || "Could not submit deletion request.");
    } finally {
      setSubmitting(false);
    }
  }
  return {
    open,
    setOpen,
    confirmText,
    setConfirmText,
    submitting,
    error,
    setError,
    submittedAt,
    canSubmit,
    submit,
  };
}
