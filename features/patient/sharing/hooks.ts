"use client";
import { useEffect, useState } from "react";

import { endUserApi, ApiError } from "@/lib/api";

import type { RecipientType, Share, ShareRecipient } from "@/lib/types.api";

export function usePatientSharingModel() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { shares } = await endUserApi.listMyShares();
      setShares(shares);
    } catch (err) {
      setError((err as ApiError).message || "Could not load shares.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function revoke(id: string) {
    if (!confirm("Revoke this recipient's access? They will lose data access immediately.")) return;
    try {
      await endUserApi.revokeShare(id);
      setShares((s) => s.map((x) => (x.id === id ? { ...x, status: "revoked" } : x)));
    } catch (err) {
      alert((err as ApiError).message || "Could not revoke share.");
    }
  }
  return { shares, setShares, loading, error, showInvite, setShowInvite, load, revoke };
}

export function useInviteModalModel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (s: Share) => void;
}) {
  const [type, setType] = useState<RecipientType | "">("");
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [validTill, setValidTill] = useState("");
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setRecipientId("");
    setRecipients([]);
    if (!type) return;
    setLoadingRecipients(true);
    setError(null);
    endUserApi
      .listShareRecipients(type)
      .then(({ recipients }) => setRecipients(recipients))
      .catch((err) => setError((err as ApiError).message || "Could not load recipients."))
      .finally(() => setLoadingRecipients(false));
  }, [type]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientId || !validTill) return;
    setSubmitting(true);
    setError(null);
    try {
      const share = await endUserApi.createShare({ recipientId, validTill });
      onCreated(share);
    } catch (err) {
      setError((err as ApiError).message || "Could not create share.");
    } finally {
      setSubmitting(false);
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  return {
    type,
    setType,
    recipients,
    recipientId,
    setRecipientId,
    validTill,
    setValidTill,
    loadingRecipients,
    submitting,
    error,
    submit,
    today,
  };
}
