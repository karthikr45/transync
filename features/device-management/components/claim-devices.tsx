"use client";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { outcomeLabel } from "../domain/serials";
import { useDeviceClaim } from "../hooks/use-device-claim";
import { ErrorNotice } from "./error-notice";
export default function ClaimDevices() {
  const {
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
  } = useDeviceClaim();
  return (
    <>
      <PageHeader
        title="Verify & claim devices"
        subtitle="Check registered serials and your organization's allocation before claiming."
        actions={
          <Link href="/provider/devices" className="btn-secondary">
            Back to devices
          </Link>
        }
      />
      {contextError ? (
        <ErrorNotice message={contextError} retry={retry} />
      ) : !context ? (
        <p role="status">Loading device management…</p>
      ) : !canClaim ? (
        <ErrorNotice message="Only authorized organization administrators can claim devices. Contact your administrator." />
      ) : (
        <>
          {error && <ErrorNotice message={error} />}
          {message && (
            <div role="status" className="card p-4 mb-4 bg-green-50 text-green-800">
              {message}{" "}
              <Link href="/provider/devices" className="underline">
                View inventory
              </Link>{" "}
              ·{" "}
              <Link href="/provider/claim-requests" className="underline">
                View requests
              </Link>
            </div>
          )}
          <form className="card p-5 max-w-3xl" onSubmit={verify}>
            <label className="block text-sm font-medium">
              Device serials
              <textarea
                aria-label="Device serials"
                required
                disabled={checking || busy}
                className="input mt-2 min-h-[140px] font-mono"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setCheck(null);
                  setResults(null);
                  setMessage(null);
                  setError(null);
                }}
                placeholder="Scan or paste serials, one per line"
              />
            </label>
            <p className="text-xs text-slate-500 mt-2">
              Up to 100 serials. Duplicates are removed. Verification does not claim devices or
              grant access to patient data.
            </p>
            <button className="btn-primary mt-4" disabled={checking || busy || !input.trim()}>
              {checking ? "Verifying…" : "Verify serials"}
            </button>
          </form>
          {rows && (
            <div className="mt-5">
              {duplicates > 0 && (
                <p className="text-sm text-slate-600 mb-2">
                  {duplicates} duplicate entries removed.
                </p>
              )}
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Device verification results</caption>
                  <thead className="bg-slate-50">
                    <tr>
                      {["Serial", "Result", "Details"].map((s) => (
                        <th key={s} scope="col" className="p-3 text-left">
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.serial} className="border-t border-slate-100">
                        <td className="p-3 font-mono">{r.serial}</td>
                        <td className="p-3">{outcomeLabel(r.outcome)}</td>
                        <td className="p-3">
                          {r.message}
                          {r.outcome === "transfer_required" && (
                            <>
                              {" "}
                              <Link className="text-brand-600 underline" href="/provider/transfers">
                                View transfer requests
                              </Link>
                              . Ask the current provider or Transcend to initiate a transfer.
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {check && (
                <div className="mt-4 space-y-4">
                  {eligible.length > 0 && (
                    <div className="card p-4">
                      <p className="text-sm mb-3">
                        {eligible.length} devices are eligible for your organization. Claiming adds
                        them to inventory; patient assignment is a separate step.
                      </p>
                      <button
                        className="btn-primary"
                        disabled={busy || checking}
                        onClick={() => submit("claim")}
                      >
                        {busy ? "Submitting…" : `Claim ${eligible.length} eligible devices`}
                      </button>
                    </div>
                  )}
                  {needsApproval.length > 0 && (
                    <form
                      className="card p-4 space-y-3 max-w-3xl"
                      onSubmit={(e) => {
                        e.preventDefault();
                        submit("request");
                      }}
                    >
                      <h2 className="font-semibold">
                        Request approval for {needsApproval.length} devices
                      </h2>
                      <p className="text-sm text-slate-600">
                        Transcend will review the allocation. Pending requests do not grant device
                        or patient-data access.
                      </p>
                      <label className="block text-sm">
                        Order / shipment reference
                        <input
                          required
                          maxLength={200}
                          disabled={busy}
                          className="input mt-1"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                        />
                      </label>
                      <label className="block text-sm">
                        Reason
                        <textarea
                          required
                          maxLength={2000}
                          disabled={busy}
                          className="input mt-1"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </label>
                      <button className="btn-primary" disabled={busy || checking}>
                        {busy ? "Submitting…" : "Submit for approval"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
