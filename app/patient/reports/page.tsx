"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Printer, RefreshCw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MobileReport from "@/components/MobileReport";
import { endUserApi, ApiError } from "@/lib/api";
import { getCurrentEndUser, getRefreshToken, setSession } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getTimeZoneName, getTimeZoneOffset } from "@/lib/timezone";
import type { EndUser, ParameterResult, ReportBySessionResult, SessionWindow, LastSyncResult } from "@/lib/types.api";
import { fromReportBySessionResult, mergeParameterIntoVM } from "@/lib/report-vm";

// Mirror the mobile app's range selector verbatim — same labels and
// session indexes, so the API receives the same window the mobile
// would have sent. "Select a Range" is the custom option; the session
// value below is ignored because startDate/endDate take priority.
const CUSTOM_LABEL = "Select a Range";
const RANGES: { label: string; session: SessionWindow }[] = [
  { label: "Last 24 Hours", session: 0 },
  { label: "7 Days", session: 1 },
  { label: "30 Days", session: 2 },
  { label: "90 Days", session: 3 },
  { label: "1 Year", session: 4 },
  { label: CUSTOM_LABEL, session: 3 },
];

export default function PatientReports() {
  const [user, setUser] = useState<EndUser | null>(null);
  const [ready, setReady] = useState(false);
  const [rangeLabel, setRangeLabel] = useState("90 Days");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [data, setData] = useState<ReportBySessionResult | null>(null);
  const [parameters, setParameters] = useState<ParameterResult | null>(null);
  const [sync, setSync] = useState<LastSyncResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCurrentEndUser();
    setUser(cached);
    setReady(true);
    if (!cached?.email) return;
    endUserApi.getByEmail(cached.email)
      .then((fresh) => {
        const merged: EndUser = {
          ...cached,
          ...fresh,
          deviceId: fresh.deviceId || cached.deviceId,
          token: cached.token,
          refreshToken: cached.refreshToken ?? getRefreshToken() ?? "",
        };
        setUser(merged);
        setSession(merged.token, merged.refreshToken, merged, "end-user");
      })
      .catch(() => { /* keep cached user */ });
  }, []);

  // Days in the user-picked window — drives the "X of Y days" rows
  // (Days Used / 4+ / 6+) and their percentages. For the fixed
  // presets it's the session-window length; for "Select a Range" it's
  // the inclusive day count between start and end.
  const customDays = (() => {
    if (rangeLabel !== CUSTOM_LABEL || !start || !end) return undefined;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (!Number.isFinite(ms)) return undefined;
    return Math.max(1, Math.round(ms / 86_400_000) + 1);
  })();

  // Session to send to the API. For the fixed presets it's the
  // mapped session. For "Select a Range" we pick the smallest
  // session bucket that covers the custom span, so even if the
  // backend ignores startDate/endDate the window is approximately
  // right.
  const session: SessionWindow = (() => {
    if (rangeLabel === CUSTOM_LABEL) {
      const d = customDays ?? 90;
      if (d <= 1) return 0;
      if (d <= 7) return 1;
      if (d <= 30) return 2;
      if (d <= 90) return 3;
      return 4;
    }
    return RANGES.find((r) => r.label === rangeLabel)?.session ?? 3;
  })();

  const requestedDays = (() => {
    if (rangeLabel === CUSTOM_LABEL) return customDays;
    switch (session) {
      case 0: return 1;
      case 1: return 7;
      case 2: return 30;
      case 3: return 90;
      case 4: return 365;
      default: return undefined;
    }
  })();

  const load = useCallback(async () => {
    if (!user?.email || !user.deviceId) return;
    setLoading(true); setError(null);
    try {
      const [r, s, p] = await Promise.allSettled([
        endUserApi.reportBySession({
          email: user.email,
          deviceId: user.deviceId,
          session,
          timeZone: getTimeZoneOffset(),
          timeZoneName: getTimeZoneName(),
          startDate: start || undefined,
          endDate: end || undefined,
        }),
        endUserApi.getLastSyncDate({ email: user.email, deviceId: user.deviceId }),
        endUserApi.getParameter({ email: user.email, deviceId: user.deviceId }),
      ]);
      if (r.status === "fulfilled") setData(r.value);
      else throw r.reason;
      if (s.status === "fulfilled") setSync(s.value);
      // Parameter failures should not blank the report — show an empty
      // settings block in that case.
      setParameters(p.status === "fulfilled" ? p.value : null);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load report.");
    } finally { setLoading(false); }
  }, [user, session, start, end]);

  useEffect(() => { load(); }, [load]);

  async function downloadPdf() {
    if (!user?.email || !user.deviceId) return;
    setDownloading(true); setError(null);
    try {
      const blob = await endUserApi.generatePdf({
        email: user.email,
        deviceId: user.deviceId,
        session,
        timeZone: getTimeZoneOffset(),
        timeZoneName: getTimeZoneName(),
        startDate: start || undefined,
        endDate: end || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `transcend-report-${stamp}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as ApiError).message || "Failed to generate PDF.");
    } finally { setDownloading(false); }
  }

  function handleRangeSelect(label: string) {
    if (label === CUSTOM_LABEL) {
      // Open the modal; keep rangeLabel untouched so the dropdown
      // snaps back to its previous value if the user cancels.
      setShowRangeModal(true);
      return;
    }
    setStart("");
    setEnd("");
    setRangeLabel(label);
  }

  function applyCustomRange(s: string, e: string) {
    setStart(s);
    setEnd(e);
    setRangeLabel(CUSTOM_LABEL);
    setShowRangeModal(false);
  }

  if (!ready) {
    return (<><PageHeader title="Report" /><div className="card p-8 text-center text-sm text-slate-500">Loading…</div></>);
  }

  if (!user) {
    return (
      <>
        <PageHeader title="Report" />
        <div className="card p-8 text-center text-sm text-slate-500">
          Not signed in. <a href="/login" className="text-brand-600 font-medium">Log on</a>.
        </div>
      </>
    );
  }

  if (!user.deviceId) {
    return (
      <>
        <PageHeader title="Report" subtitle="Generated from your device's event stream." />
        <div className="card p-8 text-center text-sm text-slate-500">
          No device is linked to this account yet. Sync your Transcend device from the mobile app — reports will be available once events are uploaded.
        </div>
      </>
    );
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
  const vm = data
    ? mergeParameterIntoVM(
        fromReportBySessionResult(data, {
          name: fullName,
          email: user.email,
          deviceSerial: user.deviceId,
          provider: user.provider,
          lastSyncDate: sync?.lastSyncDate ?? user.lastSyncDate,
          totalDaysOverride: requestedDays,
          datesOfReportOverride:
            rangeLabel === CUSTOM_LABEL && start && end
              ? `${formatDate(start)} to ${formatDate(end)}`
              : undefined,
        }),
        parameters,
      )
    : null;

  const customActive = rangeLabel === CUSTOM_LABEL && start && end;

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
          customRange={customActive ? (
            <button
              type="button"
              onClick={() => setShowRangeModal(true)}
              className="text-xs text-slate-600 underline-offset-2 hover:underline"
              title="Edit custom range"
            >
              {formatDate(start)} → {formatDate(end)} (Edit)
            </button>
          ) : null}
          headerActions={
            <>
              <button className="btn-secondary" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button className="btn-primary disabled:opacity-50" onClick={downloadPdf} disabled={downloading || loading}>
                <Printer className="w-4 h-4" /> {downloading ? "Generating…" : "Download PDF"}
              </button>
            </>
          }
        />
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">No data for this window yet.</div>
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
  initialStart, initialEnd, onCancel, onSubmit,
}: {
  initialStart: string;
  initialEnd: string;
  onCancel: () => void;
  onSubmit: (start: string, end: string) => void;
}) {
  const [s, setS] = useState(initialStart);
  const [e, setE] = useState(initialEnd);
  const [err, setErr] = useState<string | null>(null);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!s || !e) { setErr("Both start and end dates are required."); return; }
    if (e < s) { setErr("End date can't be before start date."); return; }
    onSubmit(s, e);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="range-modal-title"
      onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onCancel(); }}
    >
      <form onSubmit={handleSubmit} className="card p-6 w-full max-w-md">
        <h2 id="range-modal-title" className="text-lg font-semibold text-slate-900">Select a Range</h2>
        <p className="text-sm text-slate-500 mt-1">Pick the start and end date for your report.</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="range-start">Start Date <span className="text-red-500">*</span></label>
            <input id="range-start" type="date" className="input" value={s} max={e || today} onChange={(ev) => setS(ev.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="range-end">End Date <span className="text-red-500">*</span></label>
            <input id="range-end" type="date" className="input" value={e} min={s || undefined} max={today} onChange={(ev) => setE(ev.target.value)} required />
          </div>
        </div>

        {err && (
          <div role="alert" className="mt-3 p-2 rounded bg-red-50 border border-red-100 text-xs text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {err}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
}
