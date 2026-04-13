import { describe, expect, it } from "vitest";

import { buildTitleViewModel } from "@/lib/tracker/view-model";
import type { TitleDocument } from "@/lib/tracker/types";

function baseTitle(overrides: Partial<TitleDocument> = {}): TitleDocument {
  return {
    id: "house1_movie_42",
    householdId: "house1",
    tvdbId: 42,
    mediaType: "movie",
    name: "Dune",
    overview: "A test overview",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

describe("buildTitleViewModel", () => {
  it("builds a canonical view model for a solo household", () => {
    const viewModel = buildTitleViewModel({
      title: baseTitle(),
      currentUserId: "u1",
      members: [{ uid: "u1", displayName: "Solo User" }],
      userStatuses: [],
      householdStatus: null,
    });

    expect(viewModel.household).toEqual({
      wantsToWatch: false,
      watchedTogether: false,
      watchedTogetherAt: undefined,
      watchedTogetherParticipantUserIds: undefined,
      watchedTogetherParticipantCount: 0,
      watchedTogetherParticipantsKnown: false,
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
      watchedCount: 0,
      wantsToWatchCount: 0,
      memberCount: 1,
    });
    expect(viewModel.currentUser).toEqual({
      userId: "u1",
      wantsToWatch: false,
      watched: false,
      watchedAt: undefined,
      rating: undefined,
      notes: undefined,
    });
    expect(viewModel.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(viewModel.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("computes two-member derived flags without inferring watchedTogether", () => {
    const viewModel = buildTitleViewModel({
      title: baseTitle(),
      currentUserId: "u1",
      members: [
        { uid: "u1", displayName: "Alex" },
        { uid: "u2", displayName: "Casey" },
      ],
      userStatuses: [
        {
          id: "house1_house1_movie_42_u1",
          householdId: "house1",
          titleId: "house1_movie_42",
          userId: "u1",
          wantsToWatch: false,
          watched: true,
        },
        {
          id: "house1_house1_movie_42_u2",
          householdId: "house1",
          titleId: "house1_movie_42",
          userId: "u2",
          wantsToWatch: true,
          watched: true,
        },
      ],
      householdStatus: {
        titleId: "house1_movie_42",
        householdId: "house1",
        householdWantsToWatch: true,
        watchedTogether: false,
      },
    });

    expect(viewModel.household.allMembersWatched).toBe(true);
    expect(viewModel.household.someMembersWatched).toBe(false);
    expect(viewModel.household.noMembersWatched).toBe(false);
    expect(viewModel.household.anyMembersWatched).toBe(true);
    expect(viewModel.household.anyMembersWantToWatch).toBe(false);
    expect(viewModel.household.allMembersWantToWatch).toBe(false);
    expect(viewModel.household.someButNotAllMembersWantToWatch).toBe(false);
    expect(viewModel.household.noMembersWantToWatch).toBe(true);
    expect(viewModel.household.someMembersWantToWatch).toBe(false);
    expect(viewModel.household.multipleMembersWantToWatch).toBe(false);
    expect(viewModel.household.watchedCount).toBe(2);
    expect(viewModel.household.wantsToWatchCount).toBe(0);
    expect(viewModel.household.wantsToWatch).toBe(true);
    expect(viewModel.household.watchedTogether).toBe(false);
  });

  it("supports 3+ members with aggregate summaries", () => {
    const viewModel = buildTitleViewModel({
      title: baseTitle({ mediaType: "tv", name: "Andor" }),
      currentUserId: "u3",
      members: [{ uid: "u1" }, { uid: "u2" }, { uid: "u3" }],
      userStatuses: [
        {
          id: "s1",
          householdId: "house1",
          titleId: "house1_movie_42",
          userId: "u1",
          wantsToWatch: true,
          watched: true,
        },
        {
          id: "s2",
          householdId: "house1",
          titleId: "house1_movie_42",
          userId: "u2",
          wantsToWatch: true,
          watched: false,
        },
      ],
      householdStatus: {
        titleId: "house1_movie_42",
        householdId: "house1",
        householdWantsToWatch: false,
        watchedTogether: true,
        watchedTogetherAt: "2026-01-15",
        watchedTogetherParticipantUserIds: ["u1", "u3"],
      },
    });

    expect(viewModel.household.memberCount).toBe(3);
    expect(viewModel.household.watchedCount).toBe(1);
    expect(viewModel.household.wantsToWatchCount).toBe(1);
    expect(viewModel.household.anyMembersWantToWatch).toBe(true);
    expect(viewModel.household.allMembersWantToWatch).toBe(false);
    expect(viewModel.household.someButNotAllMembersWantToWatch).toBe(true);
    expect(viewModel.household.noMembersWantToWatch).toBe(false);
    expect(viewModel.household.someMembersWantToWatch).toBe(true);
    expect(viewModel.household.multipleMembersWantToWatch).toBe(false);
    expect(viewModel.household.anyMembersWatched).toBe(true);
    expect(viewModel.household.noMembersWatched).toBe(false);
    expect(viewModel.household.allMembersWatched).toBe(false);
    expect(viewModel.household.someMembersWatched).toBe(true);
    expect(viewModel.household.watchedTogether).toBe(true);
    expect(viewModel.household.watchedTogetherAt).toBe("2026-01-15");
    expect(viewModel.household.watchedTogetherParticipantUserIds).toEqual([
      "u1",
      "u3",
    ]);
    expect(viewModel.household.watchedTogetherParticipantCount).toBe(2);
    expect(viewModel.household.watchedTogetherParticipantsKnown).toBe(true);
    expect(viewModel.currentUser).toEqual({
      userId: "u3",
      wantsToWatch: false,
      watched: false,
      watchedAt: undefined,
      rating: undefined,
      notes: undefined,
    });
  });

  it("supports 4+ households with partial watched and partial wants derived states", () => {
    const viewModel = buildTitleViewModel({
      title: baseTitle({ mediaType: "movie", name: "Arrival" }),
      currentUserId: "u4",
      members: [{ uid: "u1" }, { uid: "u2" }, { uid: "u3" }, { uid: "u4" }],
      userStatuses: [
        {
          id: "s1",
          householdId: "house1",
          titleId: "house1_movie_42",
          userId: "u1",
          wantsToWatch: true,
          watched: true,
        },
        {
          id: "s2",
          householdId: "house1",
          titleId: "house1_movie_42",
          userId: "u2",
          wantsToWatch: false,
          watched: true,
        },
        {
          id: "s3",
          householdId: "house1",
          titleId: "house1_movie_42",
          userId: "u3",
          wantsToWatch: true,
          watched: false,
        },
      ],
      householdStatus: {
        titleId: "house1_movie_42",
        householdId: "house1",
        householdWantsToWatch: false,
        watchedTogether: false,
      },
    });

    expect(viewModel.household.memberCount).toBe(4);
    expect(viewModel.household.watchedCount).toBe(2);
    expect(viewModel.household.anyMembersWatched).toBe(true);
    expect(viewModel.household.someMembersWatched).toBe(true);
    expect(viewModel.household.allMembersWatched).toBe(false);
    expect(viewModel.household.noMembersWatched).toBe(false);

    expect(viewModel.household.wantsToWatchCount).toBe(1);
    expect(viewModel.household.anyMembersWantToWatch).toBe(true);
    expect(viewModel.household.someMembersWantToWatch).toBe(true);
    expect(viewModel.household.multipleMembersWantToWatch).toBe(false);
    expect(viewModel.household.someButNotAllMembersWantToWatch).toBe(true);
    expect(viewModel.household.allMembersWantToWatch).toBe(false);
    expect(viewModel.household.noMembersWantToWatch).toBe(false);

    expect(viewModel.household.watchedTogether).toBe(false);
    expect(viewModel.household.allMembersWatched).toBe(false);
  });
});
