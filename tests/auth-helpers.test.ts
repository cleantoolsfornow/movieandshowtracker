import { describe, expect, it } from "vitest";

import { getAuthErrorMessage, getPostSignInPath } from "@/lib/auth/auth-helpers";

describe("getPostSignInPath", () => {
  it("returns home for empty values", () => {
    expect(getPostSignInPath()).toBe("/home");
    expect(getPostSignInPath(null)).toBe("/home");
  });

  it("returns home for unsafe absolute path", () => {
    expect(getPostSignInPath("//evil.example")).toBe("/home");
  });

  it("returns provided safe path", () => {
    expect(getPostSignInPath("/library")).toBe("/library");
  });
});

describe("getAuthErrorMessage", () => {
  it("maps known firebase errors", () => {
    expect(
      getAuthErrorMessage(new Error("Firebase: Error (auth/invalid-credential).")),
    ).toBe("Email or password is incorrect.");
  });

  it("falls back to generic for unknown payload", () => {
    expect(getAuthErrorMessage({ code: "oops" })).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
