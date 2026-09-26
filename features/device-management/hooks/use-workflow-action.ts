"use client";
import { buildWorkflowCommand } from "../domain/commands";
import { useState } from "react";
import { outcomeLabel } from "../domain/serials";
import { workflowError } from "../domain/errors";
import type { WorkflowRow, WorkflowArea } from "../domain/types";
import type { FormKind } from "../domain/directory-config";
import { useMutation } from "./use-mutation";
export function useWorkflowAction(
  kind: FormKind,
  row: WorkflowRow | undefined,
  area: WorkflowArea,
  onDone: (message: string) => void,
) {
  const [serials, setSerials] = useState(row?.serial ?? "");
  const [model, setModel] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { busy, run } = useMutation();
  const title = {
    import: "Register devices",
    allocate: "Allocate devices",
    request: "Request claim approval",
    transfer: "Request device transfer",
    assign: "Assign patient",
    return: "Return device",
    restrict: "Restrict device",
    retire: "Retire device",
    approve: "Approve request",
    reject: "Reject request",
    release: "Release for transfer",
    accept: "Accept transfer",
  }[kind];
  const needsSerials = ["import", "allocate", "request", "transfer"].includes(kind);
  const needsOrg = kind === "allocate" || kind === "transfer";
  const needsReference = ["import", "allocate", "request", "transfer"].includes(kind);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (busy) return;
    try {
      const { path, payload } = buildWorkflowCommand({
        kind,
        row,
        area,
        serials,
        model,
        organizationId,
        patientId,
        reference,
        reason,
        date,
        confirmed,
      });
      const result = await run(path, payload);
      onDone(
        result.message +
          (result.results?.length
            ? " " +
              result.results
                .map((r) => `${r.serial}: ${r.message || outcomeLabel(r.outcome)}`)
                .join("; ")
            : ""),
      );
    } catch (e) {
      setError(workflowError(e));
    }
  }
  return {
    serials,
    setSerials,
    model,
    setModel,
    organizationId,
    setOrganizationId,
    patientId,
    setPatientId,
    reference,
    setReference,
    reason,
    setReason,
    date,
    setDate,
    confirmed,
    setConfirmed,
    error,
    busy,
    title,
    needsSerials,
    needsOrg,
    needsReference,
    submit,
  };
}
