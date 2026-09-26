"use client";
import { useEffect, useState } from "react";
import { deviceWorkflowApi } from "../api/device-workflow-api";
import { workflowError } from "../domain/errors";
import type { WorkflowArea, WorkflowRow, PageResult } from "../domain/types";
import { permissionFor, type Mode, type FormKind } from "../domain/directory-config";
import { useWorkflowContext } from "./use-workflow-context";
export function useWorkflowDirectory(area: WorkflowArea, mode: Mode) {
  const { context, error: contextError, retry } = useWorkflowContext();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<PageResult<WorkflowRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<{ kind: FormKind; row?: WorkflowRow } | null>(null);
  const allowed = (kind: FormKind) => context?.permissions.includes(permissionFor(kind, area));
  const refresh = () => setRevision((n) => n + 1);
  useEffect(() => {
    if (!context) return;
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);
    deviceWorkflowApi
      .list(area, { page, limit, search: query, status }, controller.signal)
      .then((result) => {
        if (
          !Array.isArray(result.items) ||
          !Number.isInteger(result.total) ||
          result.total < 0 ||
          result.page !== page ||
          result.limit !== limit
        )
          throw new Error("Could not read the device list. Please contact Transcend support.");
        if (active) setData(result);
      })
      .catch((e) => {
        if (active) setError(workflowError(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [context, area, page, limit, query, status, revision]);
  const create: FormKind | null =
    mode === "admin" && area === "registry"
      ? "import"
      : mode === "admin" && area === "allocations"
        ? "allocate"
        : mode === "provider" && area === "claim-requests"
          ? "request"
          : area === "transfers"
            ? "transfer"
            : null;
  const open = (kind: FormKind, row?: WorkflowRow) => {
    setMessage(null);
    setForm({ kind, row });
  };
  const createLabel =
    create === "import"
      ? "Register devices"
      : create === "allocate"
        ? "Allocate devices"
        : create === "request"
          ? "Request approval"
          : "Request transfer";

  return {
    context,
    contextError,
    retry,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    setQuery,
    status,
    setStatus,
    data,
    loading,
    error,
    message,
    setMessage,
    form,
    setForm,
    allowed,
    refresh,
    create,
    createLabel,
    open,
  };
}
