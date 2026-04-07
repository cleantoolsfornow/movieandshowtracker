// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

let activeDb: ReturnType<typeof createFakeDb>;

vi.mock("server-only", () => ({}));
vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: () => activeDb.db,
}));

import {
  assertUserHasHouseholdMembership,
  assertUserIsInHousehold,
  getTitleViewModelById,
  listTitleViewModels,
} from "@/lib/tracker/server";

type DbState = Record<string, Record<string, Record<string, unknown>>>;

function createSnapshot(id: string, data: Record<string, unknown> | undefined) {
  return {
    id,
    exists: Boolean(data),
    data: () => data,
    get: (key: string) => data?.[key],
  };
}

function createFakeDb(state: DbState) {
  const metrics = {
    queryGets: {} as Record<string, number>,
    docGets: {} as Record<string, number>,
  };

  const createQuery = (
    name: string,
    filters: Array<[string, unknown]> = [],
  ) => ({
    where(field: string, op: string, value: unknown) {
      if (op !== "==") {
        throw new Error("Only == supported in fake query.");
      }
      return createQuery(name, [...filters, [field, value]]);
    },
    async get() {
      metrics.queryGets[name] = (metrics.queryGets[name] ?? 0) + 1;
      const docs = Object.entries(state[name] ?? {})
        .filter(([, doc]) =>
          filters.every(
            ([field, value]) =>
              (doc as Record<string, unknown>)[field] === value,
          ),
        )
        .map(([id, doc]) => createSnapshot(id, doc));
      return { docs };
    },
  });

  const db = {
    collection(name: string) {
      return {
        doc(id: string) {
          return {
            async get() {
              metrics.docGets[name] = (metrics.docGets[name] ?? 0) + 1;
              return createSnapshot(id, state[name]?.[id]);
            },
          };
        },
        where(field: string, op: string, value: unknown) {
          if (op !== "==") {
            throw new Error("Only == supported in fake query.");
          }
          return createQuery(name, [[field, value]]);
        },
      };
    },
  };

  return { db, metrics };
}

describe("tracker server read path", () => {
  beforeEach(() => {
    activeDb = createFakeDb({
      users: {
        u1: { householdId: "h1", displayName: "Alex" },
        u2: { householdId: "h1", displayName: "Casey" },
        u3: { householdId: "h2", displayName: "Jordan" },
      },
      households: {
        h1: { name: "Home", inviteCode: "ABC123", memberIds: ["u1", "u2"] },
      },
      titles: {
        t1: {
          householdId: "h1",
          tmdbId: 101,
          mediaType: "movie",
          name: "Arrival",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-10T00:00:00.000Z"),
        },
        t2: {
          householdId: "h1",
          tmdbId: 202,
          mediaType: "tv",
          name: "Andor",
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
          updatedAt: new Date("2026-01-11T00:00:00.000Z"),
        },
      },
      titleUserStatuses: {
        s1: {
          householdId: "h1",
          titleId: "t1",
          userId: "u1",
          wantsToWatch: false,
          watched: true,
        },
        s2: {
          householdId: "h1",
          titleId: "t1",
          userId: "u2",
          wantsToWatch: true,
          watched: false,
        },
      },
      titleHouseholdStatuses: {
        t1: {
          householdId: "h1",
          titleId: "t1",
          householdWantsToWatch: true,
          watchedTogether: false,
        },
      },
    });
  });

  it("lists title view models with one bulk status query per status collection", async () => {
    const records = await listTitleViewModels("h1", "u1");

    expect(records).toHaveLength(2);
    expect(activeDb.metrics.queryGets.titleUserStatuses).toBe(1);
    expect(activeDb.metrics.queryGets.titleHouseholdStatuses).toBe(1);
    expect(activeDb.metrics.docGets.titleUserStatuses ?? 0).toBe(0);
    expect(activeDb.metrics.docGets.titleHouseholdStatuses ?? 0).toBe(0);

    const first = records.find((record) => record.id === "t1");
    const second = records.find((record) => record.id === "t2");

    expect(first?.household).toMatchObject({
      wantsToWatch: true,
      watchedTogether: false,
      memberCount: 2,
      watchedCount: 1,
      wantsToWatchCount: 1,
      allMembersWatched: false,
      someMembersWatched: true,
    });

    expect(second?.household).toMatchObject({
      wantsToWatch: false,
      watchedTogether: false,
      memberCount: 2,
      watchedCount: 0,
      wantsToWatchCount: 0,
      allMembersWatched: false,
      someMembersWatched: false,
    });
    expect(second?.currentUser).toEqual({
      userId: "u1",
      wantsToWatch: false,
      watched: false,
      watchedAt: undefined,
      rating: undefined,
      notes: undefined,
    });
  });

  it("loads one title view model from normalized docs", async () => {
    const record = await getTitleViewModelById("h1", "t1", "u2");

    expect(record?.id).toBe("t1");
    expect(record?.name).toBe("Arrival");
    expect(record?.household.wantsToWatch).toBe(true);
    expect(record?.members).toHaveLength(2);
    expect(record?.currentUser).toEqual({
      userId: "u2",
      wantsToWatch: true,
      watched: false,
      watchedAt: undefined,
      rating: undefined,
      notes: undefined,
    });
  });

  it("validates both acting and target users are in the same household", async () => {
    await expect(
      assertUserHasHouseholdMembership("u1", "h1"),
    ).resolves.toBeUndefined();
    await expect(
      assertUserIsInHousehold("u1", "u2", "h1"),
    ).resolves.toBeUndefined();
    await expect(assertUserIsInHousehold("u1", "u3", "h1")).rejects.toThrow(
      "Forbidden.",
    );
  });

  it("rejects title reads when the acting user is not a current household member", async () => {
    await expect(listTitleViewModels("h1", "u3")).rejects.toThrow("Forbidden.");
    await expect(getTitleViewModelById("h1", "t1", "u3")).rejects.toThrow(
      "Forbidden.",
    );
  });
});
