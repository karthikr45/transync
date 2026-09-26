"use client";
import Link from "next/link";

import PageHeader from "@/components/PageHeader";

import { ArrowLeft, Printer, AlertTriangle, RefreshCw } from "lucide-react";
import { Field, ReportSections } from "./components";

import { useFullReportPageModel, useApiReportModel, useRequestControlsModel } from "./hooks";
export default function FullReportPage() {
  const { deviceId, emailHashed, nameParam, tzParam, emailParam } = useFullReportPageModel();
  if (!deviceId || !emailHashed) {
    return (
      <>
        <Link
          href="/provider/patients"
          className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to patients
        </Link>
        <PageHeader title="Report" />
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          Missing <code className="font-mono text-xs">deviceId</code> or{" "}
          <code className="font-mono text-xs">emailHashed</code> in the URL. Open this report from
          the Patients list.
        </div>
      </>
    );
  }
  return (
    <ApiReport
      deviceId={deviceId}
      emailHashed={emailHashed}
      name={nameParam}
      email={emailParam}
      initialTz={tzParam}
    />
  );
}

function ApiReport({
  deviceId,
  emailHashed,
  name,
  email,
  initialTz,
}: {
  deviceId: string;
  emailHashed: string;
  name: string;
  email?: string;
  initialTz?: string;
}) {
  const {
    start,
    setStart,
    end,
    setEnd,
    timeZoneName,
    setTimeZoneName,
    data,
    loading,
    error,
    load,
    displayName,
    provider,
  } = useApiReportModel({ deviceId, emailHashed, name, email, initialTz });
  return (
    <>
      <Link
        href="/provider/patients"
        className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader
        title="Compliance report"
        subtitle={`${displayName} · Device ${deviceId}`}
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={load} disabled={loading || !start || !end}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button className="btn-primary" onClick={() => window.print()} disabled={!data}>
              <Printer className="w-4 h-4" /> Print to PDF
            </button>
          </div>
        }
      />

      <RequestControls
        start={start}
        end={end}
        timeZoneName={timeZoneName}
        onStart={(v) => setStart(v)}
        onEnd={(v) => setEnd(v)}
        onTzChange={setTimeZoneName}
      />

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : data ? (
        <ReportSections
          data={data}
          patientName={displayName}
          email={email}
          provider={provider}
          deviceId={deviceId}
        />
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">
          No data for this window yet.
        </div>
      )}
    </>
  );
}

function RequestControls({
  start,
  end,
  timeZoneName,
  onStart,
  onEnd,
  onTzChange,
}: {
  start: string;
  end: string;
  timeZoneName: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onTzChange: (v: string) => void;
}) {
  const { tzOptions } = useRequestControlsModel({
    start,
    end,
    timeZoneName,
    onStart,
    onEnd,
    onTzChange,
  });
  return (
    <div className="card p-4 mb-5">
      <div className="grid sm:grid-cols-3 gap-3 text-sm items-end">
        <Field label="Start date">
          <input
            className="input"
            type="date"
            value={start}
            max={end || undefined}
            onChange={(e) => onStart(e.target.value)}
          />
        </Field>
        <Field label="End date">
          <input
            className="input"
            type="date"
            value={end}
            min={start || undefined}
            onChange={(e) => onEnd(e.target.value)}
          />
        </Field>
        <Field label="Time zone">
          <select
            className="input"
            value={timeZoneName}
            onChange={(e) => onTzChange(e.target.value)}
          >
            {tzOptions.map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}
