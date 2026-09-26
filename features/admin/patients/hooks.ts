"use client";
import { useEffect, useState } from "react";

import { homeCareApi } from "@/lib/api";
import { patientDisplayResponse, patientList } from "@/lib/admin-patients";
import type { AdminPatientsResult } from "@/lib/types.api";

export function useAdminPatientsModel() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<AdminPatientsResult>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setData(null);
    homeCareApi
      .adminPatients({ page, limit })
      .then((result) => {
        if (active) setData(patientDisplayResponse(result));
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load patients.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, limit, refresh]);
  const list = patientList(data, page, limit);
  const reload = () => setRefresh((n) => n + 1);
  return { page, setPage, limit, setLimit, data, loading, error, list, reload };
}
