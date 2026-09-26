"use client";
import { useRef, useState } from "react";
import { ApiError } from "@/lib/http/errors";
import { deviceWorkflowApi } from "../api/device-workflow-api";
import { parseSerials } from "../domain/serials";
import { workflowError } from "../domain/errors";
import type { ClaimCheck, SerialResult } from "../domain/types";
import { useMutation } from "./use-mutation";
import { useWorkflowContext } from "./use-workflow-context";
export function useDeviceClaim() {
  const { context, error: contextError, retry } = useWorkflowContext();
  const [input, setInput] = useState("");
  const [check, setCheck] = useState<ClaimCheck | null>(null);
  const [results, setResults] = useState<SerialResult[] | null>(null);
  const [checking, setChecking] = useState(false);
  const checkingRef = useRef(false);
  const [duplicates, setDuplicates] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const { run, busy } = useMutation();
  const canClaim = context?.permissions.includes("claims:write");
  const eligible =
    check?.results.filter((r) => r.outcome === "eligible").map((r) => r.serial) ?? [];
  const needsApproval =
    check?.results.filter((r) => r.outcome === "approval_required").map((r) => r.serial) ?? [];
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (checkingRef.current || busy) return;
    setError(null);
    setMessage(null);
    setCheck(null);
    setResults(null);
    checkingRef.current = true;
    setChecking(true);
    try {
      const parsed = parseSerials(input);
      setDuplicates(parsed.duplicates);
      const result = await deviceWorkflowApi.check(parsed.serials);
      setCheck(result);
    } catch (e) {
      setError(workflowError(e));
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }
  async function submit(kind: "claim" | "request") {
    if (!check || busy) return;
    setError(null);
    setMessage(null);
    if (Date.parse(check.expiresAt) <= Date.now()) {
      setCheck(null);
      setError("Verification expired. Verify the serial numbers again.");
      return;
    }
    if (kind === "request" && (!reference.trim() || !reason.trim())) {
      setError("Enter an order reference and reason for the approval request.");
      return;
    }
    try {
      const serials = kind === "claim" ? eligible : needsApproval;
      if (!serials.length)
        throw new Error("No eligible devices selected. Verify the serial numbers again.");
      const result = await run(kind === "claim" ? "claims" : "claim-requests", {
        validationId: check.validationId,
        serials,
        ...(kind === "request" ? { reference: reference.trim(), reason: reason.trim() } : {}),
      });
      setMessage(result.message);
      setResults(result.results ?? null);
      setCheck(null);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 409) setCheck(null);
      setError(workflowError(e));
    }
  }
  const rows = check?.results ?? results;
  return {
    context,
    contextError,
    retry,
    input,
    setInput,
    check,
    setCheck,
    setResults,
    checking,
    duplicates,
    error,
    setError,
    message,
    setMessage,
    reference,
    setReference,
    reason,
    setReason,
    busy,
    canClaim,
    eligible,
    needsApproval,
    verify,
    submit,
    rows,
  };
}
