import { describe, expect, it } from "vitest";
import { unwrapResponse } from "@/lib/http/response";
import { ApiError } from "@/lib/http/errors";
import { parseApiBaseUrl } from "@/lib/env";

describe("HTTP response boundary", () => {
  it("unwraps only the API envelope, preserving domain status fields", () => {
    expect(unwrapResponse({ status: "Success", result: { id: "1" } })).toEqual({ id: "1" });
    expect(unwrapResponse({ status: "approved", id: "1" })).toEqual({
      status: "approved",
      id: "1",
    });
  });
  it("rejects malformed and failure envelopes", () => {
    expect(() => unwrapResponse({ status: "Success" })).toThrow(ApiError);
    expect(() => unwrapResponse({ status: "Failure", message: "Denied" })).toThrow("Denied");
  });
  it("uses HTTP status as authority and preserves validated field errors", () => {
    try {
      unwrapResponse(
        {
          statusCode: 200,
          error: "Validation Failed",
          message: { email: ["Invalid email"], unsafe: 7 },
        },
        422,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(422);
      expect((error as ApiError).fieldErrors).toEqual({ email: ["Invalid email"] });
    }
  });
});
describe("public environment", () => {
  it("allows TLS upstreams and localhost development", () => {
    expect(parseApiBaseUrl("https://api.example.test/")).toBe("https://api.example.test");
    expect(parseApiBaseUrl("http://127.0.0.1:3100")).toBe("http://127.0.0.1:3100");
  });
  it.each([
    "http://api.example.test",
    "https://user:password@api.example.test",
    "https://api.example.test?token=secret",
    "javascript:alert(1)",
  ])("rejects unsafe configuration %s", (value) => {
    expect(() => parseApiBaseUrl(value)).toThrow();
  });
});
