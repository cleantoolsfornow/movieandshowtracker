import { describe, expect, it } from "vitest";

import { applyLocalLibraryFilter } from "@/app/(app)/library/page";
import type { TitleViewModel } from "@/lib/tracker/types";

function record(
  id: string,
  overrides: Partial<TitleViewModel>,
): TitleViewModel {
  return {
    id,
    householdId: "h1",
    tmdbId: Number(id.replace(/\D/g, "")) || 1,
    mediaType: "movie",
    name: id,
    household: {
      wantsToWatch: false,
      watchedTogether: false,
      allMembersWatched: false,
      someMembersWatched: false,
      watchedCount: 0,
      wantsToWatchCount: 0,
      memberCount: 2,
    },
    members: [
      {
        userId: "u1",
        displayName: "Alex",
        wantsToWatch: false,
        watched: false,
      },
      {
        userId: "u2",
        displayName: "Casey",
        wantsToWatch: false,
        watched: false,
      },
    ],
    currentUser: { userId: "u1", wantsToWatch: false, watched: false },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("applyLocalLibraryFilter", () => {
  it("filters by watched status for a specific member", () => {
    const records = [
      record("r1", {
        members: [
          { userId: "u1", wantsToWatch: false, watched: false },
          { userId: "u2", wantsToWatch: false, watched: true },
        ],
      }),
      record("r2", {
        members: [
          { userId: "u1", wantsToWatch: false, watched: false },
          { userId: "u2", wantsToWatch: false, watched: false },
        ],
      }),
    ];

    const filtered = applyLocalLibraryFilter(records, "member_watched:u2");
    expect(filtered.map((item) => item.id)).toEqual(["r1"]);
  });
});
