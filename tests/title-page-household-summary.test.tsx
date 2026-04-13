import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TitleDetailPage from "@/app/(app)/title/[id]/page";
import type { TitleViewModel } from "@/lib/tracker/types";

const useTitleQueryMock = vi.fn();
const setQueryDataMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const refreshTitleMetadataMock = vi.fn();
const showToastMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "h1_movie_42" }),
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

vi.mock("@/lib/tracker/queries", () => ({
  useTitleQuery: (...args: unknown[]) => useTitleQueryMock(...args),
  titleQueryKey: (titleId: string) => ["title", titleId],
  invalidateTitlesQuery: (queryClient: {
    invalidateQueries: (input: { queryKey: string[] }) => unknown;
  }) => queryClient.invalidateQueries({ queryKey: ["titles"] }),
}));

vi.mock("@/lib/tracker/client-api", () => ({
  refreshTitleMetadata: (...args: unknown[]) =>
    refreshTitleMetadataMock(...args),
}));

vi.mock("@/components/status/title-status-editor", () => ({
  TitleStatusEditor: () => <div data-testid="title-status-editor" />,
}));

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    showToast: showToastMock,
  }),
}));

function buildRecord(overrides?: Partial<TitleViewModel>): TitleViewModel {
  return {
    id: "h1_movie_42",
    householdId: "h1",
    tvdbId: 42,
    mediaType: "movie",
    name: "Dune",
    overview: "Overview",
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
    members: [
      { userId: "u1", displayName: "You", wantsToWatch: false, watched: false },
    ],
    currentUser: { userId: "u1", wantsToWatch: false, watched: false },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("Title detail household summary", () => {
  beforeEach(() => {
    setQueryDataMock.mockReset();
    invalidateQueriesMock.mockReset();
    refreshTitleMetadataMock.mockReset();
    showToastMock.mockReset();
  });

  it("shows a personal-only summary for solo households", () => {
    useTitleQueryMock.mockReturnValue({
      data: buildRecord(),
      isLoading: false,
      error: null,
    });

    render(<TitleDetailPage />);

    expect(screen.queryByText("Personal Summary")).not.toBeInTheDocument();
    expect(screen.queryByText("Household Summary")).not.toBeInTheDocument();
    expect(screen.queryByText("Watched together")).not.toBeInTheDocument();
  });

  it("shows only active personal status chips beside back button", () => {
    useTitleQueryMock.mockReturnValue({
      data: buildRecord({
        currentUser: { userId: "u1", wantsToWatch: true, watched: false },
      }),
      isLoading: false,
      error: null,
    });

    render(<TitleDetailPage />);

    expect(screen.getByText("Want to watch: Yes")).toBeInTheDocument();
    expect(screen.queryByText("Watched: Yes")).not.toBeInTheDocument();
  });

  it("keeps watchedTogether separate from allMembersWatched in two-member mode", () => {
    useTitleQueryMock.mockReturnValue({
      data: buildRecord({
        household: {
          wantsToWatch: true,
          watchedTogether: false,
          watchedTogetherAt: undefined,
          anyMembersWatched: true,
          allMembersWatched: true,
          someMembersWatched: false,
          noMembersWatched: false,
          anyMembersWantToWatch: true,
          allMembersWantToWatch: false,
          someButNotAllMembersWantToWatch: true,
          noMembersWantToWatch: false,
          someMembersWantToWatch: true,
          multipleMembersWantToWatch: false,
          watchedCount: 2,
          wantsToWatchCount: 1,
          memberCount: 2,
        },
      }),
      isLoading: false,
      error: null,
    });

    render(<TitleDetailPage />);

    expect(screen.getByText("Household Summary")).toBeInTheDocument();
    expect(screen.getByText("Watched together: No")).toBeInTheDocument();
    expect(screen.getByText("Both watched: Yes")).toBeInTheDocument();
  });

  it("uses household-event wording for 3+ households", () => {
    useTitleQueryMock.mockReturnValue({
      data: buildRecord({
        household: {
          wantsToWatch: true,
          watchedTogether: true,
          watchedTogetherAt: "2026-03-10",
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
          watchedCount: 2,
          wantsToWatchCount: 3,
          memberCount: 4,
        },
      }),
      isLoading: false,
      error: null,
    });

    render(<TitleDetailPage />);

    expect(
      screen.getAllByText(/Watched together \(household event\)/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Participants were not recorded for this shared moment.",
      ),
    ).toBeInTheDocument();
  });

  it("invalidates title lists after a successful metadata refresh", async () => {
    const nextRecord = buildRecord();
    useTitleQueryMock.mockReturnValue({
      data: buildRecord(),
      isLoading: false,
      error: null,
    });
    refreshTitleMetadataMock.mockResolvedValue(nextRecord);

    render(<TitleDetailPage />);

    fireEvent.click(screen.getByRole("button", { name: "Refresh metadata" }));

    await waitFor(() => {
      expect(setQueryDataMock).toHaveBeenCalledWith(
        ["title", nextRecord.id],
        nextRecord,
      );
      expect(invalidateQueriesMock).toHaveBeenCalledWith({
        queryKey: ["titles"],
      });
    });
  });

  it("shows metadata refresh failures with error styling and copy", async () => {
    useTitleQueryMock.mockReturnValue({
      data: buildRecord(),
      isLoading: false,
      error: null,
    });
    refreshTitleMetadataMock.mockRejectedValue(new Error("Refresh failed."));

    render(<TitleDetailPage />);

    fireEvent.click(screen.getByRole("button", { name: "Refresh metadata" }));

    expect(await screen.findByText("Refresh failed.")).toHaveClass(
      "text-rose-200",
    );
  });
});
