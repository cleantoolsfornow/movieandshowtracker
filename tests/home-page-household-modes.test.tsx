import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "@/components/home/dashboard-page";
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
  PosterCard: ({ record }: { record: TitleViewModel }) => (
    <div data-testid={`poster-${record.id}`}>{record.name}</div>
  ),
}));

function buildRecord(overrides?: Partial<TitleViewModel>): TitleViewModel {
  return {
    id: "h1_movie_1",
    householdId: "h1",
    tmdbId: 1,
    mediaType: "movie",
    name: "Dune",
    household: {
      wantsToWatch: false,
      watchedTogether: false,
      watchedTogetherAt: undefined,
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
    },
    members: [{ userId: "u1", displayName: "You", wantsToWatch: false, watched: false }],
    currentUser: { userId: "u1", wantsToWatch: false, watched: false },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("Home household copy", () => {
  beforeEach(() => {
    useTitlesQueryMock.mockReturnValue({
      data: [buildRecord()],
      isLoading: false,
      error: null,
    });
  });

  it("keeps solo mode personal and does not show shared-only labels", () => {
    useHouseholdMock.mockReturnValue({
      household: { name: "Solo Home" },
      memberCount: 1,
      isSoloHousehold: true,
      isTwoMemberHousehold: false,
      isThreePlusHousehold: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText("Solo household")).toBeInTheDocument();
    expect(screen.getByText("Want to watch")).toBeInTheDocument();
    expect(screen.queryByText("Shared watchlist")).not.toBeInTheDocument();
    expect(screen.queryByText("Recently watched together")).not.toBeInTheDocument();
  });

  it("uses two-member wording where appropriate", () => {
    useTitlesQueryMock.mockReturnValue({
      data: [
        buildRecord({
          household: {
            wantsToWatch: true,
            watchedTogether: true,
            watchedTogetherAt: "2026-03-10",
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
            watchedCount: 2,
            wantsToWatchCount: 2,
            memberCount: 2,
          },
        }),
      ],
      isLoading: false,
      error: null,
    });

    useHouseholdMock.mockReturnValue({
      household: { name: "Roommates" },
      memberCount: 2,
      isSoloHousehold: false,
      isTwoMemberHousehold: true,
      isThreePlusHousehold: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText("Two-member household")).toBeInTheDocument();
    expect(screen.getAllByText("Both want to watch").length).toBeGreaterThan(0);
    expect(screen.getByText("Recently watched together")).toBeInTheDocument();
  });

  it("uses group-safe 3+ wording and avoids couple framing", () => {
    useHouseholdMock.mockReturnValue({
      household: { name: "Big Home" },
      memberCount: 4,
      isSoloHousehold: false,
      isTwoMemberHousehold: false,
      isThreePlusHousehold: true,
    });

    render(<DashboardPage />);

    expect(screen.getByText("3+ member household")).toBeInTheDocument();
    expect(screen.getByText("All members watched")).toBeInTheDocument();
    expect(screen.getByText("Multiple members want")).toBeInTheDocument();
    expect(screen.queryByText("Both want to watch")).not.toBeInTheDocument();
  });
});
