import { z } from "zod";
import { apiFetch, qs } from "@/lib/http/client";
import { ApiError } from "@/lib/http/errors";
import {
  contextSchema,
  workflowRowSchema,
  pageSchema,
  choiceSchema,
  claimCheckSchema,
  mutationResultSchema,
} from "../domain/schemas";
import type { WorkflowArea } from "../domain/types";
const ROOT = "/home-care/device-management";
function decode<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new ApiError(
      "The server returned an invalid device-management response. Please contact support.",
      502,
    );
  return result.data;
}
export const deviceWorkflowApi = {
  context: async (signal?: AbortSignal) =>
    decode(contextSchema, await apiFetch<unknown>(`${ROOT}/context`, { signal })),
  list: async (
    area: WorkflowArea,
    params: { page: number; limit: number; search?: string; status?: string },
    signal?: AbortSignal,
  ) => {
    const result = decode(
      pageSchema(workflowRowSchema),
      await apiFetch<unknown>(`${ROOT}/${area}${qs(params)}`, { signal }),
    );
    if (
      result.page !== params.page ||
      result.limit !== params.limit ||
      new Set(result.items.map((item) => item.id)).size !== result.items.length
    )
      throw new ApiError("The server returned inconsistent pagination.", 502);
    return result;
  },
  choices: async (kind: "organizations" | "patients", search: string, signal?: AbortSignal) =>
    decode(
      pageSchema(choiceSchema),
      await apiFetch<unknown>(`${ROOT}/${kind}${qs({ search, page: 1, limit: 25 })}`, { signal }),
    ),
  check: async (serials: string[], signal?: AbortSignal) => {
    const result = decode(
      claimCheckSchema,
      await apiFetch<unknown>(`${ROOT}/claim-checks`, {
        method: "POST",
        body: JSON.stringify({ serials }),
        signal,
      }),
    );
    const returned = new Set(result.results.map((item) => item.serial));
    if (
      Date.parse(result.expiresAt) <= Date.now() ||
      returned.size !== serials.length ||
      result.results.length !== serials.length ||
      serials.some((serial) => !returned.has(serial))
    )
      throw new ApiError(
        "The server did not return a valid result for every serial. Please verify again.",
        502,
      );
    return result;
  },
  mutate: async (path: string, payload: Record<string, unknown>, idempotencyKey: string) => {
    const result = decode(
      mutationResultSchema,
      await apiFetch<unknown>(`${ROOT}/${path}`, {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(payload),
      }),
    );
    if (path === "claims") {
      const serials = payload.serials as string[];
      const returned = new Set(result.results?.map((item) => item.serial));
      if (
        !result.results ||
        result.results.length !== serials.length ||
        returned.size !== serials.length ||
        serials.some((serial) => !returned.has(serial))
      )
        throw new ApiError(
          "The server did not confirm every claim. Check your inventory before retrying.",
          502,
        );
    }
    return result;
  },
};
