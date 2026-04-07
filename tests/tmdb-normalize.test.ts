import { describe, expect, it } from "vitest";

import {
  normalizeTmdbDetailResult,
  normalizeTmdbMultiResult,
} from "@/lib/tracker/tmdb";

describe("normalizeTmdbMultiResult", () => {
  it("normalizes movie payload", () => {
    const result = normalizeTmdbMultiResult({
      id: 10,
      media_type: "movie",
      title: "Inception",
      overview: "Dreams",
      poster_path: "/a.jpg",
      backdrop_path: "/b.jpg",
      release_date: "2010-07-16",
      vote_average: 8.75,
    });

    expect(result).toEqual({
      tmdbId: 10,
      mediaType: "movie",
      name: "Inception",
      title: "Inception",
      overview: "Dreams",
      posterPath: "/a.jpg",
      backdropPath: "/b.jpg",
      releaseDate: "2010-07-16",
      firstAirDate: undefined,
      voteAverage: 8.8,
    });
  });

  it("returns null for unsupported types", () => {
    expect(
      normalizeTmdbMultiResult({
        id: 1,
        media_type: "person",
        name: "Someone",
      }),
    ).toBeNull();
  });

  it("normalizes detail payload with genre ids and richer metadata", () => {
    const result = normalizeTmdbDetailResult("tv", {
      id: 20,
      name: "Andor",
      overview: "Rebellion",
      poster_path: "/tv-a.jpg",
      backdrop_path: "/tv-b.jpg",
      first_air_date: "2022-09-21",
      vote_average: 8.41,
      number_of_seasons: 2,
      episode_run_time: [47],
      genres: [{ id: 10765, name: "Sci-Fi & Fantasy" }],
    });

    expect(result).toEqual({
      tmdbId: 20,
      name: "Andor",
      title: "Andor",
      overview: "Rebellion",
      posterPath: "/tv-a.jpg",
      backdropPath: "/tv-b.jpg",
      releaseDate: undefined,
      firstAirDate: "2022-09-21",
      voteAverage: 8.4,
      runtime: 47,
      numberOfSeasons: 2,
      genres: [{ id: 10765, name: "Sci-Fi & Fantasy" }],
    });
  });
});
