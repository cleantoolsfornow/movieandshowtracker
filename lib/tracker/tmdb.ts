import type { TmdbSearchResult } from "@/lib/tracker/types";

export function normalizeTmdbMultiResult(
  item: Record<string, unknown>,
): TmdbSearchResult | null {
  const mediaType = item.media_type;
  if (mediaType !== "movie" && mediaType !== "tv") {
    return null;
  }

  const title =
    mediaType === "movie"
      ? (item.title as string | undefined)
      : (item.name as string | undefined);

  if (!title || typeof item.id !== "number") {
    return null;
  }

  const releaseDate =
    mediaType === "movie"
      ? ((item.release_date as string | undefined) ?? null)
      : ((item.first_air_date as string | undefined) ?? null);

  const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : null;

  return {
    tmdbId: item.id,
    mediaType,
    title,
    overview: (item.overview as string | undefined) ?? "",
    posterPath: (item.poster_path as string | undefined) ?? null,
    backdropPath: (item.backdrop_path as string | undefined) ?? null,
    releaseDate,
    releaseYear: Number.isNaN(releaseYear) ? null : releaseYear,
    voteAverage:
      typeof item.vote_average === "number"
        ? Number(item.vote_average.toFixed(1))
        : null,
  };
}

export function normalizeTmdbDetailResult(
  mediaType: "movie" | "tv",
  item: Record<string, unknown>,
): Omit<TmdbSearchResult, "mediaType"> & { genres: string[] } | null {
  if (typeof item.id !== "number") {
    return null;
  }

  const title =
    mediaType === "movie"
      ? (item.title as string | undefined)
      : (item.name as string | undefined);

  if (!title) {
    return null;
  }

  const releaseDate =
    mediaType === "movie"
      ? ((item.release_date as string | undefined) ?? null)
      : ((item.first_air_date as string | undefined) ?? null);

  const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : null;

  const genres = Array.isArray(item.genres)
    ? item.genres
        .map((genre) =>
          typeof genre === "object" && genre !== null
            ? (genre as { name?: unknown }).name
            : null,
        )
        .filter((name): name is string => typeof name === "string" && name.length > 0)
    : [];

  return {
    tmdbId: item.id,
    title,
    overview: (item.overview as string | undefined) ?? "",
    posterPath: (item.poster_path as string | undefined) ?? null,
    backdropPath: (item.backdrop_path as string | undefined) ?? null,
    releaseDate,
    releaseYear: Number.isNaN(releaseYear) ? null : releaseYear,
    voteAverage:
      typeof item.vote_average === "number"
        ? Number(item.vote_average.toFixed(1))
        : null,
    genres,
  };
}
