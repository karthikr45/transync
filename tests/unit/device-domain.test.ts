import { describe, expect, it } from "vitest";
import {
  buildWorkflowCommand,
  type WorkflowActionInput,
} from "@/features/device-management/domain/commands";
import { parseSerials } from "@/features/device-management/domain/serials";
import {
  contextSchema,
  workflowRowSchema,
  pageSchema,
} from "@/features/device-management/domain/schemas";
const input: WorkflowActionInput = {
  kind: "allocate",
  area: "allocations",
  serials: "Test-1\nTest-1",
  model: "Mini",
  organizationId: "org1",
  patientId: "p1",
  reference: "ORDER-1",
  reason: "Verified",
  date: "2026-09-26T10:00",
  confirmed: true,
};
describe("workflow domain", () => {
  it("builds a deduplicated allocation command without inventing serial casing", () => {
    expect(buildWorkflowCommand(input)).toEqual({
      path: "allocations",
      payload: {
        serials: ["Test-1"],
        organizationId: "org1",
        reference: "ORDER-1",
        reason: "Verified",
      },
    });
    expect(parseSerials("ABC abc").serials).toEqual(["ABC", "abc"]);
  });
  it.each([{ confirmed: false }, { organizationId: "" }, { reason: " " }, { reference: "" }])(
    "requires allocation evidence and confirmation (%o)",
    (change) => {
      expect(() => buildWorkflowCommand({ ...input, ...change })).toThrow();
    },
  );
  it("does not allow a bulk transfer or an assignment without a patient", () => {
    expect(() => buildWorkflowCommand({ ...input, kind: "transfer", serials: "A B" })).toThrow(
      "one device",
    );
    expect(() =>
      buildWorkflowCommand({ ...input, kind: "assign", patientId: "", row: { id: "d1" } }),
    ).toThrow("patient");
  });
  it("encodes record identifiers and separates review from claim", () => {
    expect(
      buildWorkflowCommand({
        ...input,
        kind: "approve",
        area: "claim-requests",
        row: { id: "request/1" },
      }).path,
    ).toBe("claim-requests/request%2F1/review");
  });
  it("fails closed for unsupported context versions and actions", () => {
    expect(
      contextSchema.safeParse({ contractVersion: 2, organizationId: null, permissions: [] })
        .success,
    ).toBe(false);
    expect(workflowRowSchema.safeParse({ id: "1", allowedActions: ["take_over"] }).success).toBe(
      false,
    );
    expect(
      pageSchema(workflowRowSchema).safeParse({ items: [], total: -1, page: 1, limit: 25 }).success,
    ).toBe(false);
  });
});
