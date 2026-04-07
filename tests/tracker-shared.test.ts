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

  it("computes derived summary counts from current members (3-member case)", () => {
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
      anyMembersWatched: true,
      allMembersWatched: false,
      someMembersWatched: true,
      noMembersWatched: false,
      anyMembersWantToWatch: true,
      allMembersWantToWatch: false,
      someButNotAllMembersWantToWatch: true,
      noMembersWantToWatch: false,
      someMembersWantToWatch: true,
      multipleMembersWantToWatch: true,
    });
  });

  it("computes correct solo (1-member) summaries", () => {
    const members = [{ uid: "u1" }];
    const statuses = new Map<string, { watched: boolean; wantsToWatch: boolean }>([
      ["u1", { watched: false, wantsToWatch: false }],
    ]);

    expect(computeDerivedSummary(members, statuses)).toMatchObject({
      memberCount: 1,
      watchedCount: 0,
      wantsToWatchCount: 0,
      anyMembersWatched: false,
      allMembersWatched: false,
      someMembersWatched: false,
      noMembersWatched: true,
      anyMembersWantToWatch: false,
      allMembersWantToWatch: false,
      someButNotAllMembersWantToWatch: false,
      noMembersWantToWatch: true,
      someMembersWantToWatch: false,
      multipleMembersWantToWatch: false,
    });
  });

  it("computes correct two-member summaries when everyone watched and wants", () => {
    const members = [{ uid: "u1" }, { uid: "u2" }];
    const statuses = new Map<string, { watched: boolean; wantsToWatch: boolean }>([
      ["u1", { watched: true, wantsToWatch: true }],
      ["u2", { watched: true, wantsToWatch: true }],
    ]);

    expect(computeDerivedSummary(members, statuses)).toMatchObject({
      memberCount: 2,
      watchedCount: 2,
      wantsToWatchCount: 2,
      anyMembersWatched: true,
      allMembersWatched: true,
      someMembersWatched: false,
      noMembersWatched: false,
      anyMembersWantToWatch: true,
      allMembersWantToWatch: true,
      someButNotAllMembersWantToWatch: false,
      noMembersWantToWatch: false,
      someMembersWantToWatch: true,
      multipleMembersWantToWatch: true,
    });
  });

  it("computes correct four-member summaries for mixed participation", () => {
    const members = [{ uid: "u1" }, { uid: "u2" }, { uid: "u3" }, { uid: "u4" }];
    const statuses = new Map<string, { watched: boolean; wantsToWatch: boolean }>([
      ["u1", { watched: true, wantsToWatch: true }],
      ["u2", { watched: true, wantsToWatch: false }],
      ["u3", { watched: false, wantsToWatch: true }],
      ["u4", { watched: false, wantsToWatch: false }],
    ]);

    expect(computeDerivedSummary(members, statuses)).toMatchObject({
      memberCount: 4,
      watchedCount: 2,
      wantsToWatchCount: 2,
      anyMembersWatched: true,
      allMembersWatched: false,
      someMembersWatched: true,
      noMembersWatched: false,
      anyMembersWantToWatch: true,
      allMembersWantToWatch: false,
      someButNotAllMembersWantToWatch: true,
      noMembersWantToWatch: false,
      someMembersWantToWatch: true,
      multipleMembersWantToWatch: true,
    });
  });
});
