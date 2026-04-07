import { describe, expect, it } from "vitest";

import {
  getAuthErrorMessage,
  getPostSignInPath,
} from "@/lib/auth/auth-helpers";

describe("getPostSignInPath", () => {
  it("returns dashboard for empty values", () => {
    expect(getPostSignInPath()).toBe("/dashboard");
    expect(getPostSignInPath(null)).toBe("/dashboard");
  });

  it("returns dashboard for unsafe absolute path", () => {
    expect(getPostSignInPath("//evil.example")).toBe("/dashboard");
  });

  it("returns provided safe path", () => {
    expect(getPostSignInPath("/library")).toBe("/library");
  });
});

describe("getAuthErrorMessage", () => {
  it("maps known firebase errors", () => {
    expect(
      getAuthErrorMessage(
        new Error("Firebase: Error (auth/invalid-credential)."),
      ),
    ).toBe("Email or password is incorrect.");
  });

  it("falls back to generic for unknown payload", () => {
    expect(getAuthErrorMessage({ code: "oops" })).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
