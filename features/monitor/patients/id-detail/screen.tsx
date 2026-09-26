// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
"use client";
import UiInput from "@/components/ui/Input";
import UiButton from "@/components/ui/Button";

import Link from "next/link";

import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import MobileReport from "@/components/MobileReport";

import { ArrowLeft, Printer, Lock, AlertTriangle, RefreshCw } from "lucide-react";
import { RANGE_TO_DAYS } from "./model";

import { useMonitorPatientDetailModel, useApiReportModel } from "./hooks";
export default function MonitorPatientDetail() {
  const { deviceId, emailHashed, name, email, tz, apiMode } = useMonitorPatientDetailModel();
  if (!apiMode) notFound();
  return (
    <ApiReport deviceId={deviceId!} emailHashed={emailHashed!} name={name} email={email} tz={tz} />
  );
}

function ApiReport({
  deviceId,
  emailHashed,
  name,
  email,
  tz,
}: {
  deviceId: string;
  emailHashed: string;
  name: string;
  email?: string;
  tz?: string;
}) {
  const { rangeLabel, start, setStart, end, setEnd, loading, error, applyPreset, load, vm } =
    useApiReportModel({ deviceId, emailHashed, name, email, tz });
  return (
    <>
      <Link
        href="/monitor/patients"
        className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader title="Report" subtitle={`${name || "(patient)"} · Device ${deviceId}`} />

      <div className="card p-4 mb-5 flex items-center gap-3 bg-slate-50 border-slate-200">
        <Lock className="w-4 h-4 text-slate-500" />
        <div className="text-xs text-slate-600">Read-only view. Every access is logged.</div>
      </div>

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !vm ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : vm ? (
        <MobileReport
          vm={vm}
          rangeLabel={rangeLabel}
          rangeOptions={Object.keys(RANGE_TO_DAYS)}
          onRangeSelect={applyPreset}
          onTabChange={() => load()}
          customRange={
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-slate-500">or pick range:</span>
              <UiInput
                className="input !py-1.5"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <span className="text-slate-400">→</span>
              <UiInput
                className="input !py-1.5"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          }
          headerActions={
            <>
              <UiButton
                variant="secondary"
                type="submit"
                className="btn-secondary"
                onClick={load}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </UiButton>
              <UiButton
                variant="primary"
                type="submit"
                className="btn-primary"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" /> Print to PDF
              </UiButton>
            </>
          }
        />
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">No data.</div>
      )}
    </>
  );
}
