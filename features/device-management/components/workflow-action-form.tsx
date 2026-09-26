"use client";
import UiTextarea from "@/components/ui/Textarea";
import UiInput from "@/components/ui/Input";
import UiButton from "@/components/ui/Button";

import type { WorkflowRow, WorkflowArea } from "../domain/types";
import type { FormKind } from "../domain/directory-config";
import { ChoicePicker } from "./choice-picker";
import { ErrorNotice } from "./error-notice";
import { useWorkflowAction } from "../hooks/use-workflow-action";
export function WorkflowActionForm({
  kind,
  row,
  area,
  onCancel,
  onDone,
}: {
  kind: FormKind;
  row?: WorkflowRow;
  area: WorkflowArea;
  onCancel: () => void;
  onDone: (message: string) => void;
}) {
  const {
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
  } = useWorkflowAction(kind, row, area, onDone);
  return (
    <form onSubmit={submit} className="card p-5 mb-6 border-brand-200 max-w-3xl" aria-label={title}>
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      {row && (
        <p className="text-sm text-slate-600 mb-4">
          {row.serial || row.serials?.join(", ")}
          {row.organizationName ? ` · ${row.organizationName}` : ""}
        </p>
      )}
      {error && <ErrorNotice message={error} />}
      <fieldset disabled={busy} className="space-y-4">
        {needsSerials && (
          <label className="block text-sm">
            {kind === "transfer" ? "Device serial" : "Device serials"}
            <UiTextarea
              required
              className="input mt-1 min-h-[90px] font-mono"
              value={serials}
              onChange={(e) => setSerials(e.target.value)}
              placeholder="One serial per line, up to 100"
            />
            <span className="text-xs text-slate-500">
              Exact serials from the device label or manufacturing record. Duplicates are removed.
            </span>
          </label>
        )}
        {kind === "import" && (
          <label className="block text-sm">
            Model
            <UiInput
              aria-label="Model"
              required
              maxLength={120}
              className="input mt-1"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <span className="text-xs text-slate-500">
              Register one model per batch using verified manufacturing records.
            </span>
          </label>
        )}
        {needsOrg && (
          <ChoicePicker
            kind="organizations"
            label={kind === "transfer" ? "Destination organization" : "Approved HCP"}
            value={organizationId}
            onChange={setOrganizationId}
          />
        )}
        {kind === "assign" && (
          <ChoicePicker kind="patients" label="Patient" value={patientId} onChange={setPatientId} />
        )}
        {(kind === "assign" || kind === "return") && (
          <label className="block text-sm">
            Effective date and time (your local time)
            <UiInput
              required
              className="input mt-1"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        )}
        {needsReference && (
          <label className="block text-sm">
            {kind === "import" ? "Manufacturing reference" : "Order / shipment reference"}
            <UiInput
              required
              maxLength={200}
              className="input mt-1"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </label>
        )}
        <label className="block text-sm">
          Reason
          <UiTextarea
            required
            maxLength={2000}
            className="input mt-1"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        {kind === "request" && (
          <p className="text-sm text-slate-600">
            This submits a request for Transcend review. It does not claim the device or grant
            patient-data access.
          </p>
        )}
        {kind === "transfer" && (
          <p className="text-sm text-slate-600">
            The device remains with its current organization until the required release, acceptance,
            and review are complete.
          </p>
        )}
        {kind === "return" && (
          <p className="text-sm text-slate-600">
            This ends the current patient assignment. Previous patient history remains separate; the
            device must be cleared for reuse.
          </p>
        )}
        <label className="flex items-start gap-2 text-sm">
          <UiInput
            type="checkbox"
            required
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1"
          />
          <span>
            {kind === "assign"
              ? "I have verified the patient, setup details, and authorization to provide care."
              : kind === "retire"
                ? "I understand that retiring this device prevents future allocations and claims."
                : "I have checked these details and am authorized to perform this action."}
          </span>
        </label>
        <div className="flex gap-2 justify-end">
          <UiButton variant="secondary" className="btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </UiButton>
          <UiButton variant="primary" className="btn-primary" type="submit">
            {busy ? "Submitting…" : title}
          </UiButton>
        </div>
      </fieldset>
    </form>
  );
}
