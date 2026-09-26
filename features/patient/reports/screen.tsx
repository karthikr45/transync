"use client";

import { AlertTriangle, ChevronDown, Printer, RefreshCw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MobileReport from "@/components/MobileReport";

import { formatDate } from "@/lib/format";

import { RANGES, TAB_LABEL } from "./model";

import { usePatientReportsModel, useRangeModalModel } from "./hooks";
export default function PatientReports() {
  const {
    user,
    ready,
    rangeLabel,
    start,
    end,
    showRangeModal,
    setShowRangeModal,
    tab,
    setTab,
    loading,
    downloading,
    downloadMenuOpen,
    setDownloadMenuOpen,
    error,
    downloadMenuRef,
    load,
    viewPdf,
    handleRangeSelect,
    applyCustomRange,
    vm,
    customActive,
  } = usePatientReportsModel();
  if (!ready) {
    return (
      <>
        <PageHeader title="Report" />
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      </>
    );
  }
  if (!user) {
    return (
      <>
        <PageHeader title="Report" />
        <div className="card p-8 text-center text-sm text-slate-500">
          Not signed in.{" "}
          <a href="/login" className="text-brand-600 font-medium">
            Log on
          </a>
          .
        </div>
      </>
    );
  }
  if (!user.deviceId) {
    return (
      <>
        <PageHeader title="Report" subtitle="Generated from your device's event stream." />
        <div className="card p-8 text-center text-sm text-slate-500">
          No device is linked to this account yet. Sync your Transcend device from the mobile app —
          reports will be available once events are uploaded.
        </div>
      </>
    );
  }
  return (
    <>
      <PageHeader title="Report" subtitle="Generated from your device's event stream." />

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
          rangeOptions={RANGES.map((r) => r.label)}
          onRangeSelect={handleRangeSelect}
          tab={tab}
          onTabChange={(t) => {
            setTab(t);
            load();
          }}
          customRange={
            customActive ? (
              <button
                type="button"
                onClick={() => setShowRangeModal(true)}
                className="text-xs text-slate-600 underline-offset-2 hover:underline"
                title="Edit custom range"
              >
                {formatDate(start)} → {formatDate(end)} (Edit)
              </button>
            ) : null
          }
          headerActions={
            <>
              <button className="btn-secondary" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <div className="relative" ref={downloadMenuRef}>
                <button
                  className="btn-primary disabled:opacity-50 !pr-2"
                  onClick={() => (tab === "faa" ? viewPdf(false) : setDownloadMenuOpen((o) => !o))}
                  disabled={downloading || loading}
                >
                  <Printer className="w-4 h-4" /> {downloading ? "Generating…" : "View PDF"}
                  {tab !== "faa" && <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {tab !== "faa" && downloadMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 card p-1 z-10 shadow-lg">
                    <button
                      type="button"
                      className="w-full text-left text-sm px-3 py-2 rounded hover:bg-slate-50"
                      onClick={() => viewPdf(false)}
                    >
                      {TAB_LABEL[tab]}
                    </button>
                    <button
                      type="button"
                      className="w-full text-left text-sm px-3 py-2 rounded hover:bg-slate-50"
                      onClick={() => viewPdf(true)}
                    >
                      {TAB_LABEL[tab]} With Daily Log
                    </button>
                  </div>
                )}
              </div>
            </>
          }
        />
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">
          No data for this window yet.
        </div>
      )}

      {showRangeModal && (
        <RangeModal
          initialStart={start}
          initialEnd={end}
          onCancel={() => setShowRangeModal(false)}
          onSubmit={applyCustomRange}
        />
      )}
    </>
  );
}

function RangeModal({
  initialStart,
  initialEnd,
  onCancel,
  onSubmit,
}: {
  initialStart: string;
  initialEnd: string;
  onCancel: () => void;
  onSubmit: (start: string, end: string) => void;
}) {
  const { s, setS, e, setE, err, handleSubmit, today } = useRangeModalModel({
    initialStart,
    initialEnd,
    onCancel,
    onSubmit,
  });
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="range-modal-title"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onCancel();
      }}
    >
      <form onSubmit={handleSubmit} className="card p-6 w-full max-w-md">
        <h2 id="range-modal-title" className="text-lg font-semibold text-slate-900">
          Select a Range
        </h2>
        <p className="text-sm text-slate-500 mt-1">Pick the start and end date for your report.</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="range-start">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="range-start"
              type="date"
              className="input"
              value={s}
              max={e || today}
              onChange={(ev) => setS(ev.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="range-end">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              id="range-end"
              type="date"
              className="input"
              value={e}
              min={s || undefined}
              max={today}
              onChange={(ev) => setE(ev.target.value)}
              required
            />
          </div>
        </div>

        {err && (
          <div
            role="alert"
            className="mt-3 p-2 rounded bg-red-50 border border-red-100 text-xs text-red-800 flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {err}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
