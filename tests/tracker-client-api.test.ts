import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addTitle,
  getTitleById,
  listTitles,
  patchTitleStatus,
  refreshTitleMetadata,
} from "@/lib/tracker/client-api";

const getCurrentIdTokenMock = vi.fn();

vi.mock("@/lib/auth/auth-client", () => ({
  getCurrentIdToken: (...args: unknown[]) => getCurrentIdTokenMock(...args),
}));

const baseRecord = {
  id: "h1_movie_101",
  householdId: "h1",
  tvdbId: 101,
  mediaType: "movie" as const,
  name: "Arrival",
  household: {
    wantsToWatch: false,
    watchedTogether: false,
    allMembersWatched: false,
    someMembersWatched: false,
    watchedCount: 0,
    wantsToWatchCount: 0,
    memberCount: 1,
  },
  members: [],
  currentUser: {
    userId: "u1",
    wantsToWatch: false,
    watched: false,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("tracker client api", () => {
  beforeEach(() => {
    getCurrentIdTokenMock.mockReset();
    getCurrentIdTokenMock.mockResolvedValue("id-token");
    vi.restoreAllMocks();
  });

  it("addTitle sends action-based payload and returns TitleViewModel", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ record: baseRecord }), { status: 200 }),
      );

    const record = await addTitle({
      tvdbId: 101,
      mediaType: "movie",
      action: "mark_user_wants_to_watch",
      name: "Arrival",
    });

    expect(record.id).toBe("h1_movie_101");
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.action).toBe("mark_user_wants_to_watch");
    expect(requestBody.tvdbId).toBe(101);
  });

  it("listTitles uses canonical filter/sort params", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ records: [baseRecord] }), {
        status: 200,
      }),
    );

    const records = await listTitles({
      mediaType: "movie",
      filter: "my_watched",
      sort: "recently_updated",
    });

    expect(records).toHaveLength(1);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("mediaType=movie");
    expect(url).toContain("filter=my_watched");
    expect(url).toContain("sort=recently_updated");
  });

  it("patchTitleStatus posts action payload and returns TitleViewModel", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          record: {
            ...baseRecord,
            currentUser: { ...baseRecord.currentUser, watched: true },
          },
        }),
        { status: 200 },
      ),
    );

    const record = await patchTitleStatus("h1_movie_101", {
      action: "set_user_watched",
      userId: "u1",
      value: true,
      watchedAt: "2026-04-06",
    });

    expect(record.currentUser.watched).toBe(true);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/titles/h1_movie_101",
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.action).toBe("set_user_watched");
  });

  it("getTitleById and refreshTitleMetadata return TitleViewModel", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ record: baseRecord }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ record: { ...baseRecord, name: "Refreshed" } }),
          { status: 200 },
        ),
      );

    const detail = await getTitleById("h1_movie_101");
    const refreshed = await refreshTitleMetadata("h1_movie_101");

    expect(detail.id).toBe("h1_movie_101");
    expect(refreshed.name).toBe("Refreshed");
  });
});
