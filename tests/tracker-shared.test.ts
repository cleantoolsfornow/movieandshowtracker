import { describe, expect, it } from "vitest";

import {
  createTitleKey,
  defaultStatusFlags,
  mergeStatusPatch,
} from "@/lib/tracker/shared";

describe("tracker shared helpers", () => {
  it("creates deterministic title key", () => {
    expect(createTitleKey("house1", "movie", 42)).toBe("house1_movie_42");
  });

  it("returns all-false defaults", () => {
    expect(defaultStatusFlags()).toEqual({
      matt: false,
      jessica: false,
      together: false,
    });
  });

  it("merges status patch without losing existing values", () => {
    const merged = mergeStatusPatch(
      {
        watchedBy: { matt: true, jessica: false, together: false },
        wantToWatchBy: { matt: false, jessica: true, together: false },
      },
      {
        watchedBy: { together: true },
      },
    );

    expect(merged).toEqual({
      watchedBy: { matt: true, jessica: false, together: true },
      wantToWatchBy: { matt: false, jessica: true, together: false },
    });
  });
});
