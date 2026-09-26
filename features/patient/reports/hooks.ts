"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { type Tab } from "@/components/MobileReport";
import { endUserApi, ApiError } from "@/lib/api";
import { getCurrentEndUser, getRefreshToken, setSession } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getLocale } from "@/lib/i18n";
import { getTimeZoneName, getTimeZoneOffset } from "@/lib/timezone";
import type {
  EndUser,
  GeneratePdfDto,
  ParameterResult,
  ReportBySessionResult,
  ReportType,
  SessionWindow,
} from "@/lib/types.api";
import { fromReportBySessionResult, mergeParameterIntoVM } from "@/lib/report-vm";
import { CUSTOM_LABEL, RANGES } from "./model";

export function usePatientReportsModel() {
  const [user, setUser] = useState<EndUser | null>(null);
  const [ready, setReady] = useState(false);
  const [rangeLabel, setRangeLabel] = useState("90 Days");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [data, setData] = useState<ReportBySessionResult | null>(null);
  const [parameters, setParameters] = useState<ParameterResult | null>(null);
  const [tab, setTab] = useState<Tab>("standard");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!downloadMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!downloadMenuRef.current?.contains(e.target as Node)) setDownloadMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [downloadMenuOpen]);
  useEffect(() => {
    const cached = getCurrentEndUser();
    setUser(cached);
    setReady(true);
    if (!cached?.email) return;
    endUserApi
      .getByEmail(cached.email)
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
      .catch(() => {
        /* keep cached user */
      });
  }, []);
  const customDays = (() => {
    if (rangeLabel !== CUSTOM_LABEL || !start || !end) return undefined;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (!Number.isFinite(ms)) return undefined;
    return Math.max(1, Math.round(ms / 86_400_000) + 1);
  })();
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
      case 0:
        return 1;
      case 1:
        return 7;
      case 2:
        return 30;
      case 3:
        return 90;
      case 4:
        return 365;
      default:
        return undefined;
    }
  })();
  const load = useCallback(async () => {
    if (!user?.email || !user.deviceId) return;
    setLoading(true);
    setError(null);
    try {
      const [r, p] = await Promise.allSettled([
        endUserApi.reportBySession({
          email: user.email,
          deviceId: user.deviceId,
          session,
          timeZone: getTimeZoneOffset(),
          timeZoneName: getTimeZoneName(),
          startDate: start || undefined,
          endDate: end || undefined,
        }),
        endUserApi.getParameter({ email: user.email, deviceId: user.deviceId }),
      ]);
      if (r.status === "fulfilled") setData(r.value);
      else throw r.reason;
      // Parameter failures should not blank the report — show an empty
      // settings block in that case.
      setParameters(p.status === "fulfilled" ? p.value : null);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [user, session, start, end]);
  useEffect(() => {
    load();
  }, [load]);
  function buildPdfDto(): GeneratePdfDto | null {
    if (!user?.email || !user.deviceId) return null;
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "";
    return {
      email: user.email,
      deviceId: user.deviceId,
      session,
      name: fullName,
      provider: user.provider,
      timeZone: getTimeZoneOffset(),
      timeZoneName: getTimeZoneName(),
      language: getLocale(),
      type: tab.toUpperCase() as ReportType,
      startDate: start || undefined,
      endDate: end || undefined,
    };
  }
  async function viewPdf(dailyLog: boolean) {
    const dto = buildPdfDto();
    if (!dto) return;
    setDownloadMenuOpen(false);
    // Open while the click still has browser activation; awaiting the API
    // first can cause the browser to block the PDF tab as a popup.
    const pdfWindow = window.open("about:blank", "_blank");
    if (!pdfWindow) {
      setError("Allow popups for this site to view the PDF.");
      return;
    }
    pdfWindow.opener = null;
    setDownloading(true);
    setError(null);
    try {
      const url = dailyLog
        ? await endUserApi.getReportWithDailyLog(dto)
        : await endUserApi.generatePdf(dto);
      const pdfUrl = new URL(url);
      if (pdfUrl.protocol !== "https:" && pdfUrl.protocol !== "http:") {
        throw new Error("The server returned an invalid PDF URL.");
      }
      pdfWindow.location.replace(pdfUrl.href);
    } catch (e) {
      pdfWindow.close();
      setError((e as ApiError).message || "Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
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
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "";
  const vm =
    data && user
      ? mergeParameterIntoVM(
          fromReportBySessionResult(data, {
            name: fullName,
            email: user.email,
            deviceSerial: user.deviceId,
            provider: user.provider,
            lastSyncDate: user.lastSyncDate,
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
  return {
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
  };
}

export function useRangeModalModel({
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
  const [s, setS] = useState(initialStart);
  const [e, setE] = useState(initialEnd);
  const [err, setErr] = useState<string | null>(null);
  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!s || !e) {
      setErr("Both start and end dates are required.");
      return;
    }
    if (e < s) {
      setErr("End date can't be before start date.");
      return;
    }
    onSubmit(s, e);
  }
  const today = new Date().toISOString().slice(0, 10);
  return { s, setS, e, setE, err, handleSubmit, today };
}
