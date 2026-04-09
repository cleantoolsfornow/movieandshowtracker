import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SearchResultCard } from "@/components/search/search-result-card";
import type { TitleViewModel } from "@/lib/tracker/types";

const addTitleMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const setQueryDataMock = vi.fn();
const useHouseholdMock = vi.fn();

vi.mock("@/lib/tracker/client-api", () => ({
  addTitle: (...args: unknown[]) => addTitleMock(...args),
}));

vi.mock("@/components/household/household-context", () => ({
  useHousehold: () => useHouseholdMock(),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: invalidateQueriesMock,
      setQueryData: setQueryDataMock,
    }),
  };
});

function buildRecord(): TitleViewModel {
  return {
    id: "h1_movie_42",
    householdId: "h1",
    tmdbId: 42,
    mediaType: "movie",
    name: "Dune",
    overview: "Overview",
    household: {
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
      memberCount: 2,
    },
    members: [
      { userId: "u1", displayName: "You", wantsToWatch: false, watched: false },
      { userId: "u2", displayName: "Casey", wantsToWatch: false, watched: false },
    ],
    currentUser: { userId: "u1", wantsToWatch: false, watched: false },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

const item = {
  tmdbId: 42,
  mediaType: "movie" as const,
  name: "Dune",
  overview: "Overview",
  posterPath: "/poster.jpg",
  releaseDate: "2024-01-01",
};

describe("SearchResultCard", () => {
  beforeEach(() => {
    addTitleMock.mockReset();
    invalidateQueriesMock.mockReset();
    setQueryDataMock.mockReset();
  });

  it("keeps solo households on personal-only actions", () => {
    useHouseholdMock.mockReturnValue({
      household: { name: "Solo Space" },
      currentMember: { uid: "u1", label: "You" },
      memberCount: 1,
      members: [{ uid: "u1", label: "You" }],
      isSoloHousehold: true,
      isTwoMemberHousehold: false,
    });

    render(<SearchResultCard item={item} />);

    expect(screen.getByText("Personal actions only.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Want to watch" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Watched" })).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Save to shared watchlist" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark watched together" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Shared actions" }),
    ).not.toBeInTheDocument();
  });

  it("shows existing solo-library status on the card", () => {
    useHouseholdMock.mockReturnValue({
      household: { name: "Solo Space" },
      currentMember: { uid: "u1", label: "You" },
      memberCount: 1,
      members: [{ uid: "u1", label: "You" }],
      isSoloHousehold: true,
      isTwoMemberHousehold: false,
    });

    const existingRecord = {
      ...buildRecord(),
      household: {
        ...buildRecord().household,
        memberCount: 1,
      },
      members: [{ userId: "u1", displayName: "You", wantsToWatch: true, watched: false }],
      currentUser: { userId: "u1", wantsToWatch: true, watched: false },
    };

    render(<SearchResultCard item={item} existingRecord={existingRecord} />);

    const statusRow = screen.getByLabelText("Current library status");
    expect(within(statusRow).getByText("In library")).toBeInTheDocument();
    expect(within(statusRow).getByText("Want to watch")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "On your list" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(statusRow).queryByText("Shared watchlist"),
    ).not.toBeInTheDocument();
  });

  it("highlights watched when the current user already watched the title", () => {
    useHouseholdMock.mockReturnValue({
      household: { name: "Solo Space" },
      currentMember: { uid: "u1", label: "You" },
      memberCount: 1,
      members: [{ uid: "u1", label: "You" }],
      isSoloHousehold: true,
      isTwoMemberHousehold: false,
    });

    const existingRecord = {
      ...buildRecord(),
      household: {
        ...buildRecord().household,
        memberCount: 1,
      },
      members: [{ userId: "u1", displayName: "You", wantsToWatch: false, watched: true }],
      currentUser: { userId: "u1", wantsToWatch: false, watched: true },
    };

    render(<SearchResultCard item={item} existingRecord={existingRecord} />);

    expect(
      screen.getByRole("button", { name: "Already watched" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows household library signals when another member already has the title", () => {
    useHouseholdMock.mockReturnValue({
      household: { name: "Movie Club" },
      currentMember: { uid: "u1", label: "You" },
      memberCount: 2,
      members: [
        { uid: "u1", label: "You" },
        { uid: "u2", label: "Casey" },
      ],
      isSoloHousehold: false,
      isTwoMemberHousehold: true,
    });

    const existingRecord = {
      ...buildRecord(),
      household: {
        ...buildRecord().household,
        someMembersWantToWatch: true,
        wantsToWatchCount: 1,
        noMembersWantToWatch: false,
      },
      members: [
        { userId: "u1", displayName: "You", wantsToWatch: false, watched: false },
        { userId: "u2", displayName: "Casey", wantsToWatch: true, watched: false },
      ],
      currentUser: { userId: "u1", wantsToWatch: false, watched: false },
    };

    render(<SearchResultCard item={item} existingRecord={existingRecord} />);

    const statusRow = screen.getByLabelText("Current library status");
    expect(within(statusRow).getByText("In library")).toBeInTheDocument();
    expect(
      within(statusRow).getByText("1 member wants to watch"),
    ).toBeInTheDocument();
  });

  it("uses household-event wording for 3+ households", () => {
    useHouseholdMock.mockReturnValue({
      household: { name: "Movie Club" },
      currentMember: { uid: "u1", label: "You" },
      memberCount: 4,
      members: [
        { uid: "u1", label: "You" },
        { uid: "u2", label: "Casey" },
        { uid: "u3", label: "Jordan" },
        { uid: "u4", label: "Taylor" },
      ],
      isSoloHousehold: false,
      isTwoMemberHousehold: false,
    });

    render(<SearchResultCard item={item} />);

    expect(
      screen.getByText(
        "Movie Club: together actions can record which members were there.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Shared actions" }));

    expect(
      screen.getByRole("button", {
        name: "Mark watched together (household event)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Shared-watch actions can record which household members watched together.",
      ),
    ).toBeInTheDocument();
  });

  it("updates the title cache and invalidates title lists after a successful status save", async () => {
    const nextRecord = buildRecord();
    useHouseholdMock.mockReturnValue({
      household: { name: "Movie Club" },
      currentMember: { uid: "u1", label: "You" },
      memberCount: 2,
      members: [
        { uid: "u1", label: "You" },
        { uid: "u2", label: "Casey" },
      ],
      isSoloHousehold: false,
      isTwoMemberHousehold: true,
    });
    addTitleMock.mockResolvedValue(nextRecord);

    render(<SearchResultCard item={item} />);

    fireEvent.click(screen.getByRole("button", { name: "Want to watch" }));

    await waitFor(() => {
      expect(addTitleMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "mark_user_wants_to_watch",
        }),
      );
      expect(setQueryDataMock).toHaveBeenCalledWith(
        ["title", nextRecord.id],
        nextRecord,
      );
      expect(invalidateQueriesMock).toHaveBeenCalledWith({
        queryKey: ["titles"],
      });
    });
  });

  it("saves watched status from the primary buttons", async () => {
    const nextRecord = buildRecord();
    useHouseholdMock.mockReturnValue({
      household: { name: "Movie Club" },
      currentMember: { uid: "u1", label: "You" },
      memberCount: 2,
      members: [
        { uid: "u1", label: "You" },
        { uid: "u2", label: "Casey" },
      ],
      isSoloHousehold: false,
      isTwoMemberHousehold: true,
    });
    addTitleMock.mockResolvedValue(nextRecord);

    render(<SearchResultCard item={item} />);

    fireEvent.click(screen.getByRole("button", { name: "Watched" }));

    await waitFor(() => {
      expect(addTitleMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "mark_user_watched",
        }),
      );
    });
  });

  it("collects participant IDs before saving a shared watch in 3+ households", async () => {
    const nextRecord = buildRecord();
    useHouseholdMock.mockReturnValue({
      household: { name: "Movie Club" },
      currentMember: { uid: "u1", label: "You" },
      memberCount: 4,
      members: [
        { uid: "u1", label: "You" },
        { uid: "u2", label: "Casey" },
        { uid: "u3", label: "Jordan" },
        { uid: "u4", label: "Taylor" },
      ],
      isSoloHousehold: false,
      isTwoMemberHousehold: false,
    });
    addTitleMock.mockResolvedValue(nextRecord);

    render(<SearchResultCard item={item} />);

    fireEvent.click(screen.getByRole("button", { name: "Shared actions" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Mark watched together (household event)",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Casey" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Save shared watch" }),
    );

    await waitFor(() => {
      expect(addTitleMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "mark_watched_together",
          participantUserIds: ["u1", "u2"],
        }),
      );
    });
  });
});
