"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { endUserApi, ApiError } from "@/lib/api";
import { getCurrentEndUser, getRefreshToken, setSession } from "@/lib/auth";

import { getTimeZoneName, getTimeZoneOffset } from "@/lib/timezone";
import type {
  DataBySessionResult,
  EndUser,
  LastSyncResult,
  SessionQuery,
  SessionWindow,
} from "@/lib/types.api";
import { normaliseBarChart, Charts, EMPTY_CHARTS } from "./model";

export function usePatientDashboardModel() {
  const [user, setUser] = useState<EndUser | null>(null);
  const [ready, setReady] = useState(false);
  const [session, setSessionWindow] = useState<SessionWindow>(1);
  const [data, setData] = useState<DataBySessionResult | null>(null);
  const [sync, setSync] = useState<LastSyncResult | null>(null);
  const [charts, setCharts] = useState<Charts>(EMPTY_CHARTS);
  const [loading, setLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        /* keep cached user; surface errors only when the data call fails */
      });
  }, []);
  const baseQuery = useMemo<SessionQuery | null>(() => {
    if (!user?.email || !user?.deviceId) return null;
    return {
      email: user.email,
      deviceId: user.deviceId,
      session,
      timeZone: getTimeZoneOffset(),
      timeZoneName: getTimeZoneName(),
    };
  }, [user, session]);
  const load = useCallback(async () => {
    if (!baseQuery) return;
    setLoading(true);
    setChartsLoading(true);
    setError(null);
    try {
      const [d, s] = await Promise.allSettled([
        endUserApi.getDataBySession(baseQuery),
        endUserApi.getLastSyncDate({ email: baseQuery.email, deviceId: baseQuery.deviceId }),
      ]);
      if (d.status === "fulfilled") setData(d.value);
      else throw d.reason;
      if (s.status === "fulfilled") setSync(s.value);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load data.");
    } finally {
      setLoading(false);
    }

    // Fire all five trend charts in parallel; failures degrade to empty arrays.
    try {
      const [usage, leak, ahi, sleep, mask] = await Promise.allSettled([
        endUserApi.getAverageTime(baseQuery),
        endUserApi.getAverageLeak(baseQuery),
        endUserApi.getAverageAHI(baseQuery),
        endUserApi.getAverageSleepScore(baseQuery),
        endUserApi.getAverageMaskRemoved(baseQuery),
      ]);
      setCharts({
        usage: usage.status === "fulfilled" ? normaliseBarChart(usage.value) : [],
        leak: leak.status === "fulfilled" ? normaliseBarChart(leak.value) : [],
        ahi: ahi.status === "fulfilled" ? normaliseBarChart(ahi.value) : [],
        sleep: sleep.status === "fulfilled" ? normaliseBarChart(sleep.value) : [],
        mask: mask.status === "fulfilled" ? normaliseBarChart(mask.value) : [],
      });
    } finally {
      setChartsLoading(false);
    }
  }, [baseQuery]);
  useEffect(() => {
    load();
  }, [load]);
  const first = user?.firstName || user?.email.split("@")[0] || "";
  return {
    user,
    ready,
    session,
    setSessionWindow,
    data,
    sync,
    charts,
    loading,
    chartsLoading,
    error,
    load,
    first,
  };
}
