import { beforeEach, expect, it, vi } from "vitest";
const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/http/client", () => ({
  apiFetch: fetchMock,
  qs: (value: Record<string, string | number>) =>
    "?" + new URLSearchParams(Object.entries(value).map(([k, v]) => [k, String(v)])),
}));
import { deviceWorkflowApi } from "@/features/device-management/api/device-workflow-api";
beforeEach(() => fetchMock.mockReset());
it("rejects incomplete serial verification instead of enabling claim", async () => {
  fetchMock.mockResolvedValue({
    validationId: "v1",
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    results: [{ serial: "A", outcome: "eligible", message: "OK" }],
  });
  await expect(deviceWorkflowApi.check(["A", "B"])).rejects.toThrow("every serial");
});
it("rejects inconsistent pagination and duplicate row identities", async () => {
  fetchMock.mockResolvedValue({ items: [{ id: "1" }, { id: "1" }], page: 1, limit: 25, total: 2 });
  await expect(deviceWorkflowApi.list("registry", { page: 1, limit: 25 })).rejects.toThrow(
    "pagination",
  );
});
it("passes cancellation to the transport", async () => {
  fetchMock.mockResolvedValue({ contractVersion: 1, organizationId: null, permissions: [] });
  const controller = new AbortController();
  await deviceWorkflowApi.context(controller.signal);
  expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { signal: controller.signal });
});
