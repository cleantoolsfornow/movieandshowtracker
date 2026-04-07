import type { TmdbSearchResult, TitleGenre } from "@/lib/tracker/types";

export type TmdbDetailResult = Omit<TmdbSearchResult, "mediaType"> & {
  genres?: TitleGenre[];
  runtime?: number;
  numberOfSeasons?: number;
};

export function normalizeTmdbMultiResult(
  item: Record<string, unknown>,
): TmdbSearchResult | null {
  const mediaType = item.media_type;
  if (mediaType !== "movie" && mediaType !== "tv") {
    return null;
  }

  const name =
    mediaType === "movie"
      ? (item.title as string | undefined)
      : (item.name as string | undefined);

  if (!name || typeof item.id !== "number") {
    return null;
  }

  const releaseDate = (item.release_date as string | undefined) ?? undefined;
  const firstAirDate = (item.first_air_date as string | undefined) ?? undefined;

  return {
    tmdbId: item.id,
    mediaType,
    name,
    title: name,
    overview: (item.overview as string | undefined) ?? "",
    posterPath: (item.poster_path as string | undefined) ?? undefined,
    backdropPath: (item.backdrop_path as string | undefined) ?? undefined,
    releaseDate,
    firstAirDate,
    voteAverage:
      typeof item.vote_average === "number"
        ? Number(item.vote_average.toFixed(1))
        : undefined,
  };
}

export function normalizeTmdbDetailResult(
  mediaType: "movie" | "tv",
  item: Record<string, unknown>,
): TmdbDetailResult | null {
  if (typeof item.id !== "number") {
    return null;
  }

  const name =
    mediaType === "movie"
      ? (item.title as string | undefined)
      : (item.name as string | undefined);

  if (!name) {
    return null;
  }

  const releaseDate = (item.release_date as string | undefined) ?? undefined;
  const firstAirDate = (item.first_air_date as string | undefined) ?? undefined;

  const genres = Array.isArray(item.genres)
    ? item.genres
        .map((genre) =>
          typeof genre === "object" && genre !== null
            ? {
                id:
                  typeof (genre as { id?: unknown }).id === "number"
                    ? (genre as { id: number }).id
                    : null,
                name:
                  typeof (genre as { name?: unknown }).name === "string"
                    ? (genre as { name: string }).name
                    : null,
              }
            : null,
        )
        .filter(
          (
            genre,
          ): genre is {
            id: number;
            name: string;
          } => Boolean(genre && genre.id !== null && genre.name),
        )
    : [];

  const runtime =
    mediaType === "movie"
      ? typeof item.runtime === "number" && Number.isFinite(item.runtime)
        ? item.runtime
        : undefined
      : Array.isArray(item.episode_run_time)
        ? item.episode_run_time.find(
            (value): value is number =>
              typeof value === "number" && Number.isFinite(value) && value > 0,
          )
        : undefined;

  const numberOfSeasons =
    typeof item.number_of_seasons === "number" &&
    Number.isFinite(item.number_of_seasons)
      ? item.number_of_seasons
      : undefined;

  return {
    tmdbId: item.id,
    name,
    title: name,
    overview: (item.overview as string | undefined) ?? "",
    posterPath: (item.poster_path as string | undefined) ?? undefined,
    backdropPath: (item.backdrop_path as string | undefined) ?? undefined,
    releaseDate,
    firstAirDate,
    voteAverage:
      typeof item.vote_average === "number"
        ? Number(item.vote_average.toFixed(1))
        : undefined,
    genres: genres.length ? genres : undefined,
    runtime,
    numberOfSeasons,
  };
}
