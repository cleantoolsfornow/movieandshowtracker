import { describe, expect, it } from "vitest";

import {
  formatInviteCode,
  isValidInviteCode,
  normalizeInviteCode,
} from "@/lib/households/invite";

describe("invite helpers", () => {
  it("normalizes casing and separators", () => {
    expect(normalizeInviteCode("ab cd-12_34-zz99")).toBe("ABCD1234ZZ99");
  });

  it("validates expected format", () => {
    expect(isValidInviteCode("ABCD2345EFGH")).toBe(true);
    expect(isValidInviteCode("abcd-2345-efgh")).toBe(true);
    expect(isValidInviteCode("ABC123")).toBe(false);
  });

  it("formats code in grouped display", () => {
    expect(formatInviteCode("ABCD1234EFGH")).toBe("ABCD-1234-EFGH");
  });
});
