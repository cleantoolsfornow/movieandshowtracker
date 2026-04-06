import { describe, expect, it } from "vitest";

import {
  computeDerivedSummary,
  createTitleKey,
  createTitleUserStatusId,
  extractCurrentUserMemberStatus,
  mapMembersToTitleViewModelMembers,
  normalizeHouseholdStatus,
  normalizeUserStatus,
} from "@/lib/tracker/shared";

describe("tracker shared helpers", () => {
  it("creates deterministic title key", () => {
    expect(createTitleKey("house1", "movie", 42)).toBe("house1_movie_42");
  });

  it("creates deterministic title user status key", () => {
    expect(createTitleUserStatusId("house1", "house1_movie_42", "user1")).toBe(
      "house1_house1_movie_42_user1",
    );
  });

  it("normalizes missing user and household status documents", () => {
    expect(normalizeUserStatus(undefined)).toEqual({
      wantsToWatch: false,
      watched: false,
      watchedAt: undefined,
      rating: undefined,
      notes: undefined,
    });

    expect(normalizeHouseholdStatus(undefined)).toEqual({
      householdWantsToWatch: false,
      watchedTogether: false,
      watchedTogetherAt: undefined,
    });
  });

  it("maps member docs to view-model members and extracts current user", () => {
    const members = [
      { uid: "u1", displayName: "Alex" },
      { uid: "u2", displayName: "Casey" },
    ];
    const statuses = new Map([
      ["u1", { wantsToWatch: true, watched: false }],
      ["u2", { wantsToWatch: false, watched: true, rating: 8 }],
    ]);

    const mapped = mapMembersToTitleViewModelMembers(members, statuses);
    const currentUser = extractCurrentUserMemberStatus("u2", mapped);

    expect(mapped).toEqual([
      {
        userId: "u1",
        displayName: "Alex",
        photoURL: undefined,
        avatarDataUrl: undefined,
        wantsToWatch: true,
        watched: false,
        watchedAt: undefined,
        rating: undefined,
        notes: undefined,
      },
      {
        userId: "u2",
        displayName: "Casey",
        photoURL: undefined,
        avatarDataUrl: undefined,
        wantsToWatch: false,
        watched: true,
        watchedAt: undefined,
        rating: 8,
        notes: undefined,
      },
    ]);
    expect(currentUser).toEqual({
      userId: "u2",
      wantsToWatch: false,
      watched: true,
      watchedAt: undefined,
      rating: 8,
      notes: undefined,
    });
  });

  it("computes derived summary counts from current members", () => {
    const members = [{ uid: "u1" }, { uid: "u2" }, { uid: "u3" }];
    const statuses = new Map([
      ["u1", { watched: true, wantsToWatch: false }],
      ["u2", { watched: false, wantsToWatch: true }],
      ["u3", { watched: false, wantsToWatch: true }],
    ]);

    expect(computeDerivedSummary(members, statuses)).toEqual({
      memberCount: 3,
      watchedCount: 1,
      wantsToWatchCount: 2,
      allMembersWatched: false,
      someMembersWatched: true,
      noMembersWatched: false,
      someMembersWantToWatch: true,
      multipleMembersWantToWatch: true,
    });
  });
});
