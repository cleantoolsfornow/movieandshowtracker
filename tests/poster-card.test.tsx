import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PosterCard } from "@/components/library/poster-card";
import type { TitleViewModel } from "@/lib/tracker/types";

function buildRecord(overrides: Partial<TitleViewModel> = {}): TitleViewModel {
  return {
    id: "h1_movie_1",
    householdId: "h1",
    tmdbId: 1,
    mediaType: "movie",
    name: "Dune",
    household: {
      wantsToWatch: false,
      watchedTogether: false,
      allMembersWatched: false,
      someMembersWatched: false,
      watchedCount: 1,
      wantsToWatchCount: 1,
      memberCount: 2,
    },
    members: [
      { userId: "u1", displayName: "Alex", wantsToWatch: true, watched: true },
      {
        userId: "u2",
        displayName: "Casey",
        wantsToWatch: false,
        watched: false,
      },
    ],
    currentUser: { userId: "u1", wantsToWatch: true, watched: true },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("PosterCard", () => {
  it("shows concise per-member badges for 1-2 member households", () => {
    render(<PosterCard record={buildRecord()} />);

    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Casey")).toBeInTheDocument();
    expect(screen.queryByText("Watched: 1/2")).not.toBeInTheDocument();
  });

  it("shows aggregate summaries for 3+ member households", () => {
    render(
      <PosterCard
        record={buildRecord({
          household: {
            wantsToWatch: false,
            watchedTogether: false,
            allMembersWatched: false,
            someMembersWatched: true,
            watchedCount: 2,
            wantsToWatchCount: 3,
            memberCount: 4,
          },
          members: [
            {
              userId: "u1",
              displayName: "Alex",
              wantsToWatch: true,
              watched: true,
            },
            {
              userId: "u2",
              displayName: "Casey",
              wantsToWatch: false,
              watched: true,
            },
            {
              userId: "u3",
              displayName: "Jordan",
              wantsToWatch: true,
              watched: false,
            },
            {
              userId: "u4",
              displayName: "Taylor",
              wantsToWatch: true,
              watched: false,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("Watched: 2/4")).toBeInTheDocument();
    expect(screen.getByText("Wants: 3/4")).toBeInTheDocument();
    expect(screen.queryByText("Alex")).not.toBeInTheDocument();
  });
});
