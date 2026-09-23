import { expect, test } from "@playwright/test";
import { formatDate } from "../lib/format";

test("sync dates preserve the UTC calendar day across offset boundaries", () => {
  expect(formatDate("2026-09-24T04:47:00+05:30", true)).toBe("23-september-2026");
  expect(formatDate(new Date("2026-09-23T23:17:00Z"), true)).toBe("23-september-2026");
});
