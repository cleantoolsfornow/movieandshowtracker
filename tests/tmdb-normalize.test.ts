import { describe, expect, it } from "vitest";

import {
  normalizeTvdbDetailResult,
  normalizeTvdbSearchResult,
} from "@/lib/tracker/tvdb";

describe("normalizeTvdbSearchResult", () => {
  it("normalizes movie payload", () => {
    const result = normalizeTvdbSearchResult({
      type: "movie",
      tvdb_id: "219",
      name: "Arrival",
      overview: "Dreams",
      image_url: "https://artworks.thetvdb.com/poster.jpg",
      first_air_time: "2010-07-16",
    });

    expect(result).toEqual({
      tvdbId: 219,
      mediaType: "movie",
      name: "Arrival",
      title: "Arrival",
      overview: "Dreams",
      posterPath: "https://artworks.thetvdb.com/poster.jpg",
      backdropPath: undefined,
      releaseDate: "2010-07-16",
      firstAirDate: undefined,
      voteAverage: undefined,
    });
  });

  it("returns null for unsupported types", () => {
    expect(
      normalizeTvdbSearchResult({
        id: 1,
        type: "person",
        name: "Someone",
      }),
    ).toBeNull();
  });

  it("normalizes detail payload with genre ids and richer metadata", () => {
    const result = normalizeTvdbDetailResult("tv", {
      id: 393189,
      name: "Andor",
      overview: "Rebellion",
      image: "https://artworks.thetvdb.com/poster.jpg",
      firstAired: "2022-09-21",
      averageRuntime: 47,
      genres: [{ id: 10765, name: "Sci-Fi & Fantasy" }],
      artworks: [{ type: 3, image: "https://artworks.thetvdb.com/bg.jpg" }],
      seasons: [
        { number: 0, type: { id: 1 } },
        { number: 1, type: { id: 1 } },
        { number: 2, type: { id: 1 } },
      ],
    });

    expect(result).toEqual({
      tvdbId: 393189,
      name: "Andor",
      title: "Andor",
      overview: "Rebellion",
      posterPath: "https://artworks.thetvdb.com/poster.jpg",
      backdropPath: "https://artworks.thetvdb.com/bg.jpg",
      releaseDate: undefined,
      firstAirDate: "2022-09-21",
      voteAverage: undefined,
      runtime: 47,
      numberOfSeasons: 2,
      genres: [{ id: 10765, name: "Sci-Fi & Fantasy" }],
    });
  });
});
