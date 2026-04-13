import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LibraryPage, { applyLocalLibraryFilter } from "@/app/(app)/library/page";
import type { TitleViewModel } from "@/lib/tracker/types";

const useHouseholdMock = vi.fn();
const useTitlesQueryMock = vi.fn();

vi.mock("@/components/household/household-context", () => ({
  useHousehold: () => useHouseholdMock(),
}));

vi.mock("@/lib/tracker/queries", () => ({
  useTitlesQuery: (...args: unknown[]) => useTitlesQueryMock(...args),
}));

vi.mock("@/components/library/poster-card", () => ({
  PosterCard: ({ record }: { record: TitleViewModel }) =>
    createElement("div", { "data-testid": `poster-${record.id}` }, record.name),
}));

function record(
  id: string,
  overrides: Partial<TitleViewModel>,
): TitleViewModel {
  return {
    id,
    householdId: "h1",
    tvdbId: Number(id.replace(/\D/g, "")) || 1,
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

describe("LibraryPage browse views", () => {
  it("shows simpler personal filters for solo households", () => {
    useHouseholdMock.mockReturnValue({
      otherMembers: [],
      memberCount: 1,
      isSoloHousehold: true,
      isThreePlusHousehold: false,
    });
    useTitlesQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(createElement(LibraryPage));

    expect(
      screen.getByRole("button", { name: "All titles" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Want to watch" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Watched" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Watched by me" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Not watched by me" }),
    ).not.toBeInTheDocument();
  });
});
