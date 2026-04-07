import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TitleStatusEditor } from "@/components/status/title-status-editor";
import type { TitleViewModel } from "@/lib/tracker/types";

const patchTitleStatusMock = vi.fn();

vi.mock("@/lib/tracker/client-api", () => ({
  patchTitleStatus: (...args: unknown[]) => patchTitleStatusMock(...args),
}));

function buildRecord(): TitleViewModel {
  return {
    id: "household-1_movie_550",
    householdId: "household-1",
    tmdbId: 550,
    mediaType: "movie",
    name: "Fight Club",
    overview: "desc",
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
        displayName: "You",
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
    currentUser: {
      userId: "u1",
      wantsToWatch: false,
      watched: false,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("TitleStatusEditor", () => {
  beforeEach(() => {
    patchTitleStatusMock.mockReset();
  });

  it("rolls back optimistic member toggle when update fails", async () => {
    patchTitleStatusMock.mockRejectedValue(new Error("Network failed."));

    render(<TitleStatusEditor record={buildRecord()} />);

    const watchedHeadings = screen.getAllByRole("heading", { name: "Watched" });
    const watchedSection =
      watchedHeadings[watchedHeadings.length - 1]?.closest("section");
    if (!watchedSection) {
      throw new Error("Watched section should exist");
    }

    const youButton = within(watchedSection).getByRole("button", {
      name: "You",
    });
    expect(youButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(youButton);
    expect(youButton).toHaveAttribute("aria-pressed", "true");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network failed.");
      expect(youButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("sends cross-user watched action from member controls", async () => {
    patchTitleStatusMock.mockResolvedValue(buildRecord());

    render(<TitleStatusEditor record={buildRecord()} />);

    const watchedHeadings = screen.getAllByRole("heading", { name: "Watched" });
    const membersWatchedSection =
      watchedHeadings[watchedHeadings.length - 1]?.closest("section");
    if (!membersWatchedSection) {
      throw new Error("Members watched section should exist");
    }

    const caseyButton = within(membersWatchedSection).getByRole("button", {
      name: "Casey",
    });
    fireEvent.click(caseyButton);

    await waitFor(() => {
      expect(patchTitleStatusMock).toHaveBeenCalledWith(
        "household-1_movie_550",
        expect.objectContaining({
          action: "set_user_watched",
          userId: "u2",
          value: true,
        }),
      );
    });
  });

  it("restores rating and notes inputs after a failed save", async () => {
    patchTitleStatusMock.mockRejectedValue(new Error("Network failed."));

    render(<TitleStatusEditor record={buildRecord()} />);

    const ratingInput = screen.getByLabelText("My rating");
    const notesInput = screen.getByLabelText("My notes");

    fireEvent.change(ratingInput, { target: { value: "8.5" } });
    fireEvent.blur(ratingInput);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network failed.");
      expect(ratingInput).toHaveValue(null);
    });

    fireEvent.change(notesInput, { target: { value: "Great movie" } });
    fireEvent.blur(notesInput);

    await waitFor(() => {
      expect(notesInput).toHaveValue("");
    });
  });
});
