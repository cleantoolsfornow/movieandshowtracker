import { describe, expect, it } from "vitest";

import { normalizeTmdbMultiResult } from "@/lib/tracker/tmdb";

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
      title: "Inception",
      overview: "Dreams",
      posterPath: "/a.jpg",
      backdropPath: "/b.jpg",
      releaseDate: "2010-07-16",
      releaseYear: 2010,
      voteAverage: 8.8,
    });
  });

  it("returns null for unsupported types", () => {
    expect(
      normalizeTmdbMultiResult({ id: 1, media_type: "person", name: "Someone" }),
    ).toBeNull();
  });
});
