import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TitleStatusEditor } from "@/components/status/title-status-editor";
import type { TitleRecord } from "@/lib/tracker/types";

const patchTitleStatusMock = vi.fn();

vi.mock("@/lib/tracker/client-api", () => ({
  patchTitleStatus: (...args: unknown[]) => patchTitleStatusMock(...args),
}));

vi.mock("@/components/household/household-context", () => ({
  useHousehold: () => ({
    personLabels: {
      memberOne: "Member 1",
      memberTwo: "Member 2",
      together: "Together",
    },
  }),
}));

function buildRecord(): TitleRecord {
  return {
    title: {
      id: "household-1_movie_550",
      householdId: "household-1",
      tmdbId: 550,
      mediaType: "movie",
      title: "Fight Club",
      overview: "desc",
      posterPath: null,
      backdropPath: null,
      releaseDate: "1999-10-15",
      releaseYear: 1999,
      genres: [],
      tmdbVoteAverage: 8.4,
    },
    status: {
      titleId: "household-1_movie_550",
      householdId: "household-1",
      watchedBy: {
        memberOne: false,
        memberTwo: false,
        together: false,
      },
      wantToWatchBy: {
        memberOne: false,
        memberTwo: false,
        together: false,
      },
    },
  };
}

describe("TitleStatusEditor", () => {
  beforeEach(() => {
    patchTitleStatusMock.mockReset();
  });

  it("rolls back optimistic toggle when status update fails", async () => {
    patchTitleStatusMock.mockRejectedValue(new Error("Network failed."));

    render(<TitleStatusEditor record={buildRecord()} />);

    const watchedHeading = screen.getByRole("heading", { name: "Watched" });
    const watchedSection = watchedHeading.closest("section");
    if (!watchedSection) {
      throw new Error("Watched section should exist");
    }

    const memberOneButton = within(watchedSection).getByRole("button", {
      name: "Member 1",
    });
    expect(memberOneButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(memberOneButton);
    expect(memberOneButton).toHaveAttribute("aria-pressed", "true");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network failed.");
      expect(memberOneButton).toHaveAttribute("aria-pressed", "false");
    });
  });
});
