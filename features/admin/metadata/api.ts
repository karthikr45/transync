import { apiFetch } from "@/lib/http/client";
import { ApiError } from "@/lib/http/errors";
import { parseMetadata, type MetadataDocument } from "./schemas";
import { fingerprint, type MetadataPayload } from "./model";
function documentPath(id: string, action: "update" | "delete") {
  if (!id.trim()) throw new Error("Metadata has no identifier. Refresh before making changes.");
  return `/metadata/${action}/${encodeURIComponent(id)}`;
}
export const metadataApi = {
  async read(signal?: AbortSignal) {
    // Admin reads use the current session. Public signup keeps its existing public service.
    return parseMetadata(await apiFetch<unknown>("/metadata", { signal }));
  },
  async assertCurrent(original: MetadataDocument | null) {
    const current = await metadataApi.read();
    if (fingerprint(current) !== fingerprint(original))
      throw new ApiError(
        "Metadata changed since you opened it. Cancel and refresh before saving or deleting.",
        409,
      );
  },
  async save(original: MetadataDocument | null, payload: MetadataPayload) {
    await metadataApi.assertCurrent(original);
    await apiFetch<unknown>(
      original ? documentPath(original._id ?? "", "update") : "/metadata/save",
      { method: original ? "PATCH" : "POST", body: JSON.stringify(payload) },
    );
  },
  async remove(original: MetadataDocument) {
    await metadataApi.assertCurrent(original);
    await apiFetch<unknown>(documentPath(original._id ?? "", "delete"), { method: "DELETE" });
  },
};
