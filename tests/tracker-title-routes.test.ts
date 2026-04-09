// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUidFromRequestMock = vi.fn();
const getHouseholdIdForUidMock = vi.fn();
const getHouseholdByIdMock = vi.fn();
const getTitleViewModelByIdMock = vi.fn();
const assertUserHasHouseholdMembershipMock = vi.fn();
const assertUserIsInHouseholdMock = vi.fn();

let activeDb: {
  db: {
    collection: (name: string) => {
      doc: (id: string) => {
        id: string;
        _collection: string;
        set: (data: unknown, options?: unknown) => Promise<void>;
      };
    };
    runTransaction: (cb: (tx: unknown) => Promise<void>) => Promise<void>;
  };
  setCalls: Array<{
    ref: { _collection: string; id: string };
    data: unknown;
    options?: unknown;
  }>;
  runTransactionMock: ReturnType<typeof vi.fn>;
};

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/server-auth", () => ({
  requireUidFromRequest: (...args: unknown[]) =>
    requireUidFromRequestMock(...args),
}));
vi.mock("@/lib/server/logger", () => ({ logServerError: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: () => activeDb.db,
}));
vi.mock("@/lib/tracker/server", () => ({
  getHouseholdIdForUid: (...args: unknown[]) =>
    getHouseholdIdForUidMock(...args),
  getHouseholdById: (...args: unknown[]) => getHouseholdByIdMock(...args),
  getTitleViewModelById: (...args: unknown[]) =>
    getTitleViewModelByIdMock(...args),
  assertUserHasHouseholdMembership: (...args: unknown[]) =>
    assertUserHasHouseholdMembershipMock(...args),
  assertUserIsInHousehold: (...args: unknown[]) =>
    assertUserIsInHouseholdMock(...args),
}));

import { POST as addTitlePost } from "@/app/api/titles/add/route";
import {
  GET as getTitleGet,
  PATCH as patchTitlePatch,
} from "@/app/api/titles/[titleId]/route";
import { POST as refreshTitlePost } from "@/app/api/titles/[titleId]/refresh/route";

function createDb(options?: {
  titleExists?: boolean;
  titleHouseholdId?: string;
  userStatusExists?: boolean;
  householdStatusExists?: boolean;
}) {
  const titleExists = options?.titleExists ?? true;
  const titleHouseholdId = options?.titleHouseholdId ?? "h1";
  const userStatusExists = options?.userStatusExists ?? false;
  const householdStatusExists = options?.householdStatusExists ?? false;
  const setCalls: Array<{
    ref: { _collection: string; id: string };
    data: unknown;
    options?: unknown;
  }> = [];
  let hasWritten = false;

  const transaction = {
    get: vi.fn(async (ref?: { _collection?: string }) => {
      if (hasWritten) {
        throw new Error(
          "Firestore transactions require all reads to be executed before all writes.",
        );
      }
      const collection = ref?._collection;
      const exists =
        collection === "titles"
          ? titleExists
          : collection === "titleUserStatuses"
            ? userStatusExists
            : collection === "titleHouseholdStatuses"
              ? householdStatusExists
              : false;
      return {
        exists,
        get: (key: string) =>
          key === "householdId" && collection === "titles"
            ? titleHouseholdId
            : undefined,
      };
    }),
    set: vi.fn((ref, data, options) => {
      hasWritten = true;
      setCalls.push({
        ref: ref as { _collection: string; id: string },
        data,
        options,
      });
    }),
  };

  const runTransactionMock = vi.fn(
    async (cb: (tx: typeof transaction) => Promise<void>) => {
      await cb(transaction);
    },
  );

  const db = {
    collection(name: string) {
      return {
        doc(id: string) {
          return {
            id,
            _collection: name,
            async set(data: unknown, options?: unknown) {
              setCalls.push({ ref: { _collection: name, id }, data, options });
            },
          };
        },
      };
    },
    runTransaction: runTransactionMock,
  };

  return { db, setCalls, runTransactionMock };
}

const viewModelFixture = {
  id: "h1_movie_101",
  householdId: "h1",
  tmdbId: 101,
  mediaType: "movie" as const,
  name: "Arrival",
  household: {
    wantsToWatch: false,
    watchedTogether: false,
    allMembersWatched: false,
    someMembersWatched: false,
    watchedCount: 0,
    wantsToWatchCount: 0,
    memberCount: 2,
  },
  members: [],
  currentUser: { userId: "u1", wantsToWatch: false, watched: false },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("title mutation/read routes", () => {
  beforeEach(() => {
    requireUidFromRequestMock.mockReset();
    getHouseholdIdForUidMock.mockReset();
    getHouseholdByIdMock.mockReset();
    getTitleViewModelByIdMock.mockReset();
    assertUserHasHouseholdMembershipMock.mockReset();
    assertUserIsInHouseholdMock.mockReset();

    requireUidFromRequestMock.mockResolvedValue("u1");
    getHouseholdIdForUidMock.mockResolvedValue("h1");
    getHouseholdByIdMock.mockResolvedValue({
      id: "h1",
      name: "Home",
      inviteCode: "ABC123",
      memberIds: ["u1", "u2", "u3"],
    });
    getTitleViewModelByIdMock.mockResolvedValue(viewModelFixture);
    assertUserHasHouseholdMembershipMock.mockResolvedValue(undefined);
    assertUserIsInHouseholdMock.mockResolvedValue(undefined);

    activeDb = createDb({ titleExists: true, titleHouseholdId: "h1" });
  });

  it("POST /api/titles/add uses action semantics and writes normalized user status", async () => {
    activeDb = createDb({ titleExists: false });

    const response = await addTitlePost(
      new Request("http://localhost/api/titles/add", {
        method: "POST",
        body: JSON.stringify({
          tmdbId: 101,
          mediaType: "movie",
          action: "mark_user_wants_to_watch",
          targetUserId: "u2",
          name: "Arrival",
        }),
      }) as never,
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.record.id).toBe("h1_movie_101");
    expect(assertUserHasHouseholdMembershipMock).toHaveBeenCalledWith("u1", "h1");
    expect(assertUserIsInHouseholdMock).toHaveBeenCalledWith("u1", "u2", "h1");
    expect(
      activeDb.setCalls.some(
        (call) => call.ref._collection === "titleStatuses",
      ),
    ).toBe(false);
    expect(
      activeDb.setCalls.some(
        (call) =>
          call.ref._collection === "titleUserStatuses" &&
          (call.data as Record<string, unknown>).wantsToWatch === true,
      ),
    ).toBe(true);
    expect(
      activeDb.setCalls.some(
        (call) =>
          call.ref._collection === "titleUserStatuses" &&
          (call.data as Record<string, unknown>).watched === false,
      ),
    ).toBe(true);
  });

  it("POST /api/titles/add clears wants-to-watch when marking a title watched", async () => {
    activeDb = createDb({ titleExists: true, titleHouseholdId: "h1" });

    const response = await addTitlePost(
      new Request("http://localhost/api/titles/add", {
        method: "POST",
        body: JSON.stringify({
          tmdbId: 101,
          mediaType: "movie",
          action: "mark_user_watched",
        }),
      }) as never,
    );

    expect(response.status).toBe(200);
    const userStatusWrite = activeDb.setCalls.find(
      (call) => call.ref._collection === "titleUserStatuses",
    );
    expect((userStatusWrite?.data as Record<string, unknown>).wantsToWatch).toBe(
      false,
    );
    expect((userStatusWrite?.data as Record<string, unknown>).watched).toBe(
      true,
    );
  });

  it("POST /api/titles/add accepts action-only payload when title already exists", async () => {
    activeDb = createDb({ titleExists: true, titleHouseholdId: "h1" });

    const response = await addTitlePost(
      new Request("http://localhost/api/titles/add", {
        method: "POST",
        body: JSON.stringify({
          tmdbId: 101,
          mediaType: "movie",
          action: "mark_user_watched",
        }),
      }) as never,
    );

    expect(response.status).toBe(200);
  });

  it("POST /api/titles/add accepts null voteAverage from search results", async () => {
    activeDb = createDb({ titleExists: false, titleHouseholdId: "h1" });

    const response = await addTitlePost(
      new Request("http://localhost/api/titles/add", {
        method: "POST",
        body: JSON.stringify({
          tmdbId: 101,
          mediaType: "movie",
          action: "mark_user_wants_to_watch",
          name: "Arrival",
          voteAverage: null,
        }),
      }) as never,
    );

    expect(response.status).toBe(200);
    const titleWrite = activeDb.setCalls.find(
      (call) => call.ref._collection === "titles",
    );
    expect(titleWrite).toBeDefined();
    expect(
      Object.prototype.hasOwnProperty.call(
        (titleWrite?.data as Record<string, unknown>) ?? {},
        "voteAverage",
      ),
    ).toBe(false);
  });

  it("POST /api/titles/add requires name for new titles", async () => {
    activeDb = createDb({ titleExists: false, titleHouseholdId: "h1" });

    const response = await addTitlePost(
      new Request("http://localhost/api/titles/add", {
        method: "POST",
        body: JSON.stringify({
          tmdbId: 101,
          mediaType: "movie",
          action: "mark_user_watched",
        }),
      }) as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Title metadata requires a name for new titles.",
    });
  });

  it("PATCH allows cross-user watched updates but blocks cross-user notes edits", async () => {
    const allowedResponse = await patchTitlePatch(
      new Request("http://localhost/api/titles/h1_movie_101", {
        method: "PATCH",
        body: JSON.stringify({
          action: "set_user_watched",
          userId: "u2",
          value: true,
          watchedAt: "2026-04-06",
        }),
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    expect(allowedResponse.status).toBe(200);
    expect(assertUserIsInHouseholdMock).toHaveBeenCalledWith("u1", "u2", "h1");

    const forbiddenResponse = await patchTitlePatch(
      new Request("http://localhost/api/titles/h1_movie_101", {
        method: "PATCH",
        body: JSON.stringify({
          action: "set_user_notes",
          userId: "u2",
          value: "Nope",
        }),
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    expect(forbiddenResponse.status).toBe(403);
  });

  it("PATCH persists normalized watchedTogether participants when provided", async () => {
    const response = await patchTitlePatch(
      new Request("http://localhost/api/titles/h1_movie_101", {
        method: "PATCH",
        body: JSON.stringify({
          action: "set_watched_together",
          value: true,
          watchedTogetherAt: "2026-04-06",
          participantUserIds: ["u3", "u1", "u3"],
        }),
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    expect(response.status).toBe(200);
    const householdStatusWrite = activeDb.setCalls.find(
      (call) => call.ref._collection === "titleHouseholdStatuses",
    );
    expect(householdStatusWrite).toBeDefined();
    expect(
      (householdStatusWrite?.data as Record<string, unknown>)
        .watchedTogetherParticipantUserIds,
    ).toEqual(["u1", "u3"]);
  });

  it("PATCH rejects watchedTogether participants outside the household", async () => {
    const response = await patchTitlePatch(
      new Request("http://localhost/api/titles/h1_movie_101", {
        method: "PATCH",
        body: JSON.stringify({
          action: "set_watched_together",
          value: true,
          watchedTogetherAt: "2026-04-06",
          participantUserIds: ["u1", "u999"],
        }),
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "watchedTogether participants must belong to the household.",
    });
  });

  it("does not rewrite createdAt for existing user status docs", async () => {
    activeDb = createDb({
      titleExists: true,
      titleHouseholdId: "h1",
      userStatusExists: true,
    });

    const response = await patchTitlePatch(
      new Request("http://localhost/api/titles/h1_movie_101", {
        method: "PATCH",
        body: JSON.stringify({
          action: "set_user_wants_to_watch",
          userId: "u1",
          value: true,
        }),
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    expect(response.status).toBe(200);
    const userStatusWrite = activeDb.setCalls.find(
      (call) => call.ref._collection === "titleUserStatuses",
    );
    expect(userStatusWrite).toBeDefined();
    expect(
      Object.prototype.hasOwnProperty.call(
        (userStatusWrite?.data as Record<string, unknown>) ?? {},
        "createdAt",
      ),
    ).toBe(false);
  });

  it("PATCH clears watched when setting wants-to-watch to true", async () => {
    const response = await patchTitlePatch(
      new Request("http://localhost/api/titles/h1_movie_101", {
        method: "PATCH",
        body: JSON.stringify({
          action: "set_user_wants_to_watch",
          userId: "u1",
          value: true,
        }),
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    expect(response.status).toBe(200);
    const userStatusWrite = activeDb.setCalls.find(
      (call) => call.ref._collection === "titleUserStatuses",
    );
    expect((userStatusWrite?.data as Record<string, unknown>).wantsToWatch).toBe(
      true,
    );
    expect((userStatusWrite?.data as Record<string, unknown>).watched).toBe(
      false,
    );
  });

  it("PATCH clears wants-to-watch when setting watched to true", async () => {
    const response = await patchTitlePatch(
      new Request("http://localhost/api/titles/h1_movie_101", {
        method: "PATCH",
        body: JSON.stringify({
          action: "set_user_watched",
          userId: "u1",
          value: true,
          watchedAt: "2026-04-09",
        }),
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    expect(response.status).toBe(200);
    const userStatusWrite = activeDb.setCalls.find(
      (call) => call.ref._collection === "titleUserStatuses",
    );
    expect((userStatusWrite?.data as Record<string, unknown>).watched).toBe(
      true,
    );
    expect((userStatusWrite?.data as Record<string, unknown>).wantsToWatch).toBe(
      false,
    );
  });

  it("GET /api/titles/[titleId] returns canonical TitleViewModel record", async () => {
    const response = await getTitleGet(
      new Request("http://localhost/api/titles/h1_movie_101", {
        method: "GET",
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.record).toMatchObject({
      id: "h1_movie_101",
      mediaType: "movie",
      householdId: "h1",
    });
  });

  it("POST /api/titles/[titleId]/refresh updates title metadata and returns TitleViewModel", async () => {
    const originalFetch = global.fetch;
    process.env.TMDB_API_KEY = "test-key";

    getTitleViewModelByIdMock
      .mockResolvedValueOnce({
        ...viewModelFixture,
        tmdbId: 101,
        mediaType: "movie",
      })
      .mockResolvedValueOnce({
        ...viewModelFixture,
        name: "Updated Arrival",
      });

    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      async json() {
        return {
          id: 101,
          title: "Updated Arrival",
          overview: "Updated overview",
          poster_path: "/poster.jpg",
          backdrop_path: "/backdrop.jpg",
          release_date: "2026-01-01",
          runtime: 116,
          vote_average: 7.2,
          genres: [{ id: 1, name: "Sci-Fi" }],
        };
      },
    })) as typeof fetch;

    const response = await refreshTitlePost(
      new Request("http://localhost/api/titles/h1_movie_101/refresh", {
        method: "POST",
      }) as never,
      { params: Promise.resolve({ titleId: "h1_movie_101" }) },
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.record.name).toBe("Updated Arrival");
    expect(
      activeDb.setCalls.some(
        (call) =>
          call.ref._collection === "titles" &&
          (call.data as Record<string, unknown>).name === "Updated Arrival" &&
          (call.data as Record<string, unknown>).runtime === 116,
      ),
    ).toBe(true);
    expect(
      activeDb.setCalls.some(
        (call) =>
          call.ref._collection === "titles" &&
          JSON.stringify((call.data as Record<string, unknown>).genres) ===
            JSON.stringify([{ id: 1, name: "Sci-Fi" }]),
      ),
    ).toBe(true);

    global.fetch = originalFetch;
  });
});
