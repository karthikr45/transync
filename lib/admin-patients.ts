import type { ApiJson } from "./types.api";

type JsonObject = { [key: string]: ApiJson };
const isObject = (value: ApiJson): value is JsonObject =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const count = (value: ApiJson | undefined): number | undefined =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : undefined;

/** Hide database IDs and email hashes in both rows and expanded details. */
export function patientDisplayResponse(value: ApiJson): ApiJson {
  if (Array.isArray(value)) return value.map(patientDisplayResponse);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !["id", "emailhashed", "hashedemail", "emailhash"].includes(key.replace(/[_-]/g, "").toLowerCase()))
    .map(([key, field]) => [key, patientDisplayResponse(field)]));
}

/** Accept common list envelopes without discarding any of the source response. */
export function patientList(response: ApiJson, page: number, limit: number) {
  const layers: JsonObject[] = [];
  let value = response;
  for (let depth = 0; depth < 4 && isObject(value); depth++) {
    layers.push(value);
    const next = value.patients ?? value.users ?? value.items ?? value.data ?? value.result;
    if (next === undefined) break;
    value = next;
  }
  const rows = Array.isArray(value) && value.every(isObject) ? value : null;
  const metadata = layers.flatMap((layer) => [
    layer,
    ...(isObject(layer.pagination ?? null) ? [layer.pagination as JsonObject] : []),
    ...(isObject(layer.meta ?? null) ? [layer.meta as JsonObject] : []),
  ]);
  const total = metadata.map((m) => count(m.total) ?? count(m.totalCount) ?? count(m.totalPatients)).find((n) => n !== undefined);
  const totalPages = metadata.map((m) => count(m.totalPages)).find((n) => n !== undefined)
    ?? (total !== undefined ? Math.ceil(total / limit) : undefined);
  const hasNext = metadata.map((m) => m.hasNextPage ?? m.hasNext).find((n) => typeof n === "boolean");
  return {
    rows,
    columns: rows ? Array.from(new Set(rows.flatMap((row) => Object.keys(row)))) : [],
    total,
    totalPages,
    hasNext: rows !== null && rows.length > 0 && (typeof hasNext === "boolean" ? hasNext
      : totalPages !== undefined ? page < totalPages : rows.length >= limit),
  };
}

export function patientFieldLabel(key: string): string {
  if (key === "_id") return "ID";
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
