"use client";
import Link from "next/link";
import { RefreshCw, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { formatDateTime } from "@/lib/format";
import type { WorkflowArea } from "../domain/types";
import { outcomeLabel } from "../domain/serials";
import { columns, titles, descriptions, statuses, type Mode } from "../domain/directory-config";
import { useWorkflowDirectory } from "../hooks/use-workflow-directory";
import { ErrorNotice } from "./error-notice";
import { WorkflowActionForm as ActionForm } from "./workflow-action-form";
export default function WorkflowDirectory({ area, mode }: { area: WorkflowArea; mode: Mode }) {
  const {
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
  } = useWorkflowDirectory(area, mode);
  return (
    <>
      <PageHeader
        title={titles[area]}
        subtitle={descriptions[area]}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary disabled:opacity-50"
              onClick={refresh}
              disabled={!context || loading || !!form}
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            {area === "inventory" && context?.permissions.includes("claims:write") && (
              <Link href="/provider/devices/claim" className="btn-primary">
                Verify & claim
              </Link>
            )}
            {create && allowed(create) && (
              <button
                type="button"
                className="btn-primary"
                disabled={!!form}
                onClick={() => open(create)}
              >
                <Plus className="w-4 h-4" /> {createLabel}
              </button>
            )}
          </div>
        }
      />
      {contextError ? (
        <ErrorNotice message={contextError} retry={retry} />
      ) : !context ? (
        <p role="status" className="card p-6">
          Loading device management…
        </p>
      ) : (
        <>
          {message && (
            <div
              role="status"
              className="card p-4 mb-4 border-green-200 bg-green-50 text-green-800"
            >
              {message}
            </div>
          )}
          {form && (
            <ActionForm
              key={`${form.kind}:${form.row?.id ?? "new"}`}
              kind={form.kind}
              row={form.row}
              area={area}
              onCancel={() => setForm(null)}
              onDone={(msg) => {
                setForm(null);
                setMessage(msg);
                refresh();
              }}
            />
          )}
          <form
            className="card p-3 mb-4 flex flex-wrap gap-3 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQuery(search.trim());
            }}
          >
            <label className="text-sm flex-1 min-w-[180px]">
              Search
              <input
                className="input mt-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Serial or reference…"
              />
            </label>
            {!!statuses[area].length && (
              <label className="text-sm">
                Status
                <select
                  className="input mt-1"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {statuses[area].map((s) => (
                    <option key={s} value={s}>
                      {outcomeLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button className="btn-secondary" type="submit">
              Search
            </button>
          </form>
          {error && <ErrorNotice message={error} retry={refresh} />}
          <div className="card overflow-x-auto" aria-busy={loading}>
            {loading ? (
              <p role="status" className="p-8 text-center text-slate-500">
                Loading…
              </p>
            ) : (
              !error &&
              data &&
              (data.items.length ? (
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    {titles[area]}, page {page}
                  </caption>
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      {columns[area].map((c) => (
                        <th
                          scope="col"
                          key={c.key}
                          className="px-4 py-3 text-left font-medium whitespace-nowrap"
                        >
                          {c.label}
                        </th>
                      ))}
                      {area !== "audit" && (
                        <th scope="col" className="px-4 py-3 text-left">
                          Details / actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        {columns[area].map((c) => (
                          <td key={c.key} className="px-4 py-3 align-top max-w-xs break-words">
                            {c.date ? (
                              formatDateTime(row[c.key] as string) || "—"
                            ) : c.key === "status" ? (
                              <span className="badge badge-slate">
                                {outcomeLabel(row.status ?? "Unknown")}
                              </span>
                            ) : Array.isArray(row[c.key]) ? (
                              (row[c.key] as string[]).join(", ")
                            ) : (
                              row[c.key] || "—"
                            )}
                          </td>
                        ))}
                        {area !== "audit" && (
                          <td className="px-4 py-3 min-w-[180px]">
                            {(row.reason || row.reviewReason) && (
                              <details className="mb-2">
                                <summary className="cursor-pointer text-brand-600">
                                  Request details
                                </summary>
                                <p className="mt-2 whitespace-pre-wrap">{row.reason}</p>
                                {row.reviewReason && (
                                  <p className="mt-2">Decision: {row.reviewReason}</p>
                                )}
                              </details>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {(row.allowedActions ?? [])
                                .filter((action) => allowed(action))
                                .map((action) => (
                                  <button
                                    key={action}
                                    type="button"
                                    className="btn-secondary text-xs"
                                    disabled={!!form}
                                    onClick={() => open(action, row)}
                                  >
                                    {outcomeLabel(action)}
                                  </button>
                                ))}
                            </div>
                            {!row.allowedActions?.length && !row.reason && !row.reviewReason && (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-8 text-center text-slate-500">
                  No {titles[area].toLowerCase()} match these filters.
                </p>
              ))
            )}
          </div>
          <nav
            aria-label={`${titles[area]} pagination`}
            className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"
          >
            <span>
              Page {page}
              {data
                ? ` of ${Math.max(1, Math.ceil(data.total / limit))} · ${data.total} records`
                : ""}
            </span>
            <label>
              Per page{" "}
              <select
                className="input !w-auto"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                disabled={loading || page === 1}
                onClick={() => setPage((n) => n - 1)}
              >
                Previous
              </button>
              <button
                className="btn-secondary"
                disabled={loading || !!error || !data || page * limit >= data.total}
                onClick={() => setPage((n) => n + 1)}
              >
                Next
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
