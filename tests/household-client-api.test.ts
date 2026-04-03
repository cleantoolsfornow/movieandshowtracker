import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentIdTokenMock = vi.fn();

vi.mock("@/lib/auth/auth-client", () => ({
  getCurrentIdToken: () => getCurrentIdTokenMock(),
}));

import {
  createHouseholdViaApi,
  joinHouseholdViaApi,
} from "@/lib/households/client-api";

describe("household client api", () => {
  beforeEach(() => {
    getCurrentIdTokenMock.mockReset();
    getCurrentIdTokenMock.mockResolvedValue("token-123");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("sends auth header for create", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ householdId: "h1", inviteCode: "ABCD1234EFGH" }), {
        status: 200,
      }),
    );

    const result = await createHouseholdViaApi("Our Home");

    expect(result.householdId).toBe("h1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/households/create",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      }),
    );
  });

  it("throws backend error on join failure", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Invite code not found." }), {
        status: 404,
      }),
    );

    await expect(joinHouseholdViaApi("BADCODE")).rejects.toThrow(
      "Invite code not found.",
    );
  });
});
