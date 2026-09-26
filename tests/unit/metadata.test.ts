import { describe, expect, it, vi, beforeEach } from "vitest";
import { parseMetadata } from "@/features/admin/metadata/schemas";
import { buildPayload, initialForm, safeLink, fingerprint } from "@/features/admin/metadata/model";
import { metadataApi } from "@/features/admin/metadata/api";
import { apiFetch } from "@/lib/http/client";
vi.mock("@/lib/http/client", () => ({ apiFetch: vi.fn() }));
const original = {
  _id: "metadata/one",
  occupation: [
    { label: "Engineer", value: 7 },
    { label: "Retired", value: 42 },
  ],
  userExpList: [{ label: "New user", value: 5 }],
  devicePurposeList: [{ label: "Travel", value: 11 }],
  devicePurchaseList: [{ label: "Provider", value: 30 }],
  clinicalMode: { delayTime: "9000", disable: true, extra: "preserve" },
  appUpdate: { forceUpdate: false, rm: true },
  verbiage: { welcome: "Hello" },
  showPopUp: true,
};
beforeEach(() => vi.mocked(apiFetch).mockReset());
describe("metadata contracts and domain", () => {
  it("accepts numeric identifiers, legacy strings and read-only additions", () => {
    expect(parseMetadata({ ...original, gender: ["Other"], extra: { flag: true } })).toMatchObject(
      original,
    );
  });
  it.each([
    [],
    "invalid",
    undefined,
    { occupation: [{ label: 7 }] },
    { clinicalMode: { disable: "false" } },
    { appUpdate: { forceUpdate: "true" } },
  ])("rejects malformed metadata instead of enabling writes", (value) => {
    expect(() => parseMetadata(value)).toThrow("invalid metadata");
  });
  it("recognizes only explicit empty success responses", () => {
    expect(parseMetadata(null)).toBeNull();
    expect(parseMetadata({})).toBeNull();
  });
  it("preserves IDs and never reuses a removed ID during an edit", () => {
    const form = initialForm(original);
    form.lists.occupation.splice(1, 1);
    form.lists.occupation[0].label = "Engineering";
    form.lists.occupation.push({ label: "Teacher", value: undefined });
    expect(buildPayload(form, original, "occupation").occupation).toEqual([
      { label: "Engineering", value: 7 },
      { label: "Teacher", value: 43 },
    ]);
  });
  it("preserves unrelated fields exactly and omits server-owned and read-only fields", () => {
    const input = { ...original, gender: ["Other"], unknown: { keep: true } };
    const form = initialForm(input);
    form.lists.occupation[0].label = "Engineering";
    const result = buildPayload(form, input, "occupation");
    expect(result.appUpdate).toEqual({ forceUpdate: false, rm: true });
    expect(result.clinicalMode).toEqual(original.clinicalMode);
    expect(result.userExpList).toEqual(original.userExpList);
    expect(result.verbiage).toEqual(original.verbiage);
    expect(result).not.toHaveProperty("_id");
    expect(result).not.toHaveProperty("gender");
    expect(result).not.toHaveProperty("unknown");
  });
  it("does not invent missing settings when editing a list", () => {
    const input = { _id: "one", occupation: [{ label: "One", value: 9 }] };
    const form = initialForm(input);
    form.lists.occupation[0].label = "Renamed";
    expect(buildPayload(form, input, "occupation")).toEqual({
      occupation: [{ label: "Renamed", value: 9 }],
    });
  });
  it("retains legacy string and code-based identities", () => {
    const input = { _id: "one", occupation: ["Other", { name: "Engineer", code: "ENG" }] };
    const form = initialForm(input);
    form.lists.occupation[1].label = "Engineering";
    expect(buildPayload(form, input, "occupation").occupation).toEqual([
      "Other",
      { name: "Engineering", code: "ENG" },
    ]);
  });
  it("validates all four lists when creating", () => {
    expect(() => buildPayload(initialForm(null), null)).toThrow("needs a label");
  });
  it("rejects duplicate labels and duplicate stable values", () => {
    const form = initialForm(original);
    form.lists.occupation[1].label = " engineer ";
    expect(() => buildPayload(form, original, "occupation")).toThrow("unique");
    form.lists.occupation[1].label = "Retired";
    form.lists.occupation[1].value = 7;
    expect(() => buildPayload(form, original, "occupation")).toThrow("duplicate option values");
  });
  it.each(["-1", "1.5", "bad", "9007199254740992"])("rejects invalid delay %s", (delay) => {
    const form = initialForm(original);
    form.delayTime = delay;
    expect(() => buildPayload(form, original, "clinicalMode")).toThrow("whole number");
  });
  it("requires a version for force updates", () => {
    const form = initialForm(original);
    form.appUpdate.forceUpdate = true;
    expect(() => buildPayload(form, original, "appUpdate")).toThrow("latest version");
  });
  it("rejects unsafe store links in payload and display", () => {
    for (const url of [
      "javascript:alert(1)",
      "http://example.test",
      "https://user:secret@example.test",
    ]) {
      const form = initialForm(original);
      form.playStoreUrl = url;
      expect(() => buildPayload(form, original, "other")).toThrow("HTTPS");
      expect(safeLink(url)).toBeNull();
    }
    expect(safeLink("https://apps.apple.com/app/one")).toBe("https://apps.apple.com/app/one");
  });
  it("compares data independent of object key order", () => {
    expect(fingerprint({ b: 2, a: 1 })).toBe(fingerprint({ a: 1, b: 2 }));
  });
});
describe("metadata API boundary", () => {
  it("forwards cancellation and preserves authorization defaults", async () => {
    const signal = new AbortController().signal;
    vi.mocked(apiFetch).mockResolvedValueOnce(original);
    await metadataApi.read(signal);
    expect(apiFetch).toHaveBeenCalledWith("/metadata", { signal });
  });
  it("blocks stale update, delete, and duplicate create without sending a mutation", async () => {
    for (const operation of [
      () => metadataApi.save(original, {}),
      () => metadataApi.remove(original),
      () => metadataApi.save(null, {}),
    ]) {
      vi.mocked(apiFetch)
        .mockReset()
        .mockResolvedValue({ ...original, showPopUp: false });
      await expect(operation()).rejects.toMatchObject({ statusCode: 409 });
      expect(apiFetch).toHaveBeenCalledTimes(1);
    }
  });
  it("encodes record IDs and uses PATCH for updates", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(original).mockResolvedValueOnce(undefined);
    await metadataApi.save(original, { showPopUp: false });
    expect(apiFetch).toHaveBeenLastCalledWith("/metadata/update/metadata%2Fone", {
      method: "PATCH",
      body: '{"showPopUp":false}',
    });
  });
  it("does not mistake authorization or routing errors for empty metadata", async () => {
    const error = new Error("Not found");
    vi.mocked(apiFetch).mockRejectedValueOnce(error);
    await expect(metadataApi.read()).rejects.toBe(error);
  });
});

it("maps clinical enable state explicitly and preserves nested backend fields", () => {
  const form = initialForm(original);
  form.clinicalOn = true;
  form.delayTime = "0";
  expect(buildPayload(form, original, "clinicalMode").clinicalMode).toEqual({
    delayTime: "0",
    disable: false,
    extra: "preserve",
  });
});
