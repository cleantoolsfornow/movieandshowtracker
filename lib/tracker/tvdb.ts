import type { TitleGenre, TvdbSearchResult } from "@/lib/tracker/types";

const TVDB_TOKEN_TTL_MS = 25 * 24 * 60 * 60 * 1000;

type TvdbDetailResult = Omit<TvdbSearchResult, "mediaType"> & {
  genres?: TitleGenre[];
  runtime?: number;
  numberOfSeasons?: number;
};

let cachedToken:
  | {
      token: string;
      expiresAt: number;
    }
  | undefined;

function getTvdbBaseUrl() {
  const baseUrl = process.env.TVDB_BASE_URL ?? "https://api4.thetvdb.com/v4";
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function parseTvdbId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const match = value.match(/(\d+)$/);
    if (!match) {
      return null;
    }

    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function mapTvdbMediaType(value: unknown): "movie" | "tv" | null {
  if (value === "movie") {
    return "movie";
  }

  if (value === "series") {
    return "tv";
  }

  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeGenres(value: unknown): TitleGenre[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const genres = value
    .map((genre) => {
      if (typeof genre !== "object" || genre === null) {
        return null;
      }

      const id = parseTvdbId((genre as { id?: unknown }).id);
      const name = asString((genre as { name?: unknown }).name);
      if (!id || !name) {
        return null;
      }

      return { id, name };
    })
    .filter((genre): genre is TitleGenre => Boolean(genre));

  return genres.length ? genres : undefined;
}

function getBackdropFromArtworks(
  mediaType: "movie" | "tv",
  artworks: unknown,
): string | undefined {
  if (!Array.isArray(artworks)) {
    return undefined;
  }

  const desiredTypes = mediaType === "movie" ? new Set([15]) : new Set([3]);

  const artwork = artworks.find((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const type = parseTvdbId((item as { type?: unknown }).type);
    return type !== null && desiredTypes.has(type);
  }) as { image?: unknown } | undefined;

  return asString(artwork?.image);
}

function getMovieReleaseDate(
  item: Record<string, unknown>,
): string | undefined {
  const firstRelease = item.first_release;
  if (typeof firstRelease === "object" && firstRelease !== null) {
    const date = asString((firstRelease as { date?: unknown }).date);
    if (date) {
      return date;
    }
  }

  if (!Array.isArray(item.releases)) {
    return undefined;
  }

  const dates = item.releases
    .map((release) =>
      typeof release === "object" && release !== null
        ? asString((release as { date?: unknown }).date)
        : undefined,
    )
    .filter((date): date is string => Boolean(date))
    .sort();

  return dates[0];
}

function getSeriesSeasonCount(
  item: Record<string, unknown>,
): number | undefined {
  if (!Array.isArray(item.seasons)) {
    return undefined;
  }

  const officialSeasonNumbers = item.seasons
    .map((season) => {
      if (typeof season !== "object" || season === null) {
        return null;
      }

      const number = parseTvdbId((season as { number?: unknown }).number);
      const typeId =
        typeof (season as { type?: unknown }).type === "object" &&
        (season as { type?: unknown }).type !== null
          ? parseTvdbId(
              ((season as { type: { id?: unknown } }).type as { id?: unknown })
                .id,
            )
          : null;

      if (number === null || number <= 0) {
        return null;
      }

      return typeId === 1 ? number : null;
    })
    .filter((number): number is number => number !== null);

  if (officialSeasonNumbers.length > 0) {
    return Math.max(...officialSeasonNumbers);
  }

  const anySeasonNumbers = item.seasons
    .map((season) =>
      typeof season === "object" && season !== null
        ? parseTvdbId((season as { number?: unknown }).number)
        : null,
    )
    .filter((number): number is number => number !== null && number > 0);

  return anySeasonNumbers.length ? Math.max(...anySeasonNumbers) : undefined;
}

async function createTvdbToken(): Promise<string> {
  const apiKey = process.env.TVDB_API_KEY;
  if (!apiKey) {
    throw new Error("TVDB_API_KEY is not configured.");
  }

  const response = await fetch(new URL("login", getTvdbBaseUrl()), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apikey: apiKey }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("TVDB authentication failed.");
  }

  const payload = (await response.json()) as {
    data?: { token?: unknown };
  };
  const token = asString(payload.data?.token);
  if (!token) {
    throw new Error("TVDB authentication returned an invalid token.");
  }

  cachedToken = {
    token,
    expiresAt: Date.now() + TVDB_TOKEN_TTL_MS,
  };

  return token;
}

async function getTvdbToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  return createTvdbToken();
}

export async function fetchTvdbJson(
  path: string,
  init?: {
    searchParams?: Record<string, string | number | boolean | undefined>;
    revalidate?: number;
  },
) {
  const url = new URL(path, getTvdbBaseUrl());
  for (const [key, value] of Object.entries(init?.searchParams ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  async function makeRequest(token: string) {
    return fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next:
        typeof init?.revalidate === "number"
          ? { revalidate: init.revalidate }
          : undefined,
    });
  }

  let response = await makeRequest(await getTvdbToken());

  if (response.status === 401) {
    cachedToken = undefined;
    response = await makeRequest(await createTvdbToken());
  }

  if (!response.ok) {
    const message =
      response.status === 404
        ? "TVDB title not found."
        : "TVDB request failed.";
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const payload = (await response.json()) as {
    data?: unknown;
  };

  return payload.data;
}

export async function fetchTvdbSearchResults(query: string) {
  const data = await fetchTvdbJson("search", {
    searchParams: { query, limit: 20 },
    revalidate: 120,
  });

  return Array.isArray(data) ? data : [];
}

export async function fetchTvdbDetail(
  mediaType: "movie" | "tv",
  tvdbId: number,
) {
  const path =
    mediaType === "movie"
      ? `movies/${tvdbId}/extended`
      : `series/${tvdbId}/extended`;

  const data = await fetchTvdbJson(path, { revalidate: 120 });
  return typeof data === "object" && data !== null
    ? (data as Record<string, unknown>)
    : null;
}

export function normalizeTvdbSearchResult(
  item: Record<string, unknown>,
): TvdbSearchResult | null {
  const mediaType = mapTvdbMediaType(item.type ?? item.primary_type);
  const tvdbId = parseTvdbId(item.tvdb_id ?? item.id);
  const name =
    asString(item.name) ??
    asString(item.title) ??
    asString(item.name_translated);

  if (!mediaType || tvdbId === null || !name) {
    return null;
  }

  const date = asString(item.first_air_time);

  return {
    tvdbId,
    mediaType,
    name,
    title: name,
    overview: asString(item.overview) ?? "",
    posterPath:
      asString(item.image_url) ??
      asString(item.poster) ??
      asString(item.thumbnail),
    backdropPath: undefined,
    releaseDate: mediaType === "movie" ? date : undefined,
    firstAirDate: mediaType === "tv" ? date : undefined,
    voteAverage: undefined,
  };
}

export function normalizeTvdbDetailResult(
  mediaType: "movie" | "tv",
  item: Record<string, unknown>,
): TvdbDetailResult | null {
  const tvdbId = parseTvdbId(item.id);
  const name = asString(item.name) ?? asString(item.title);

  if (tvdbId === null || !name) {
    return null;
  }

  return {
    tvdbId,
    name,
    title: name,
    overview: asString(item.overview) ?? "",
    posterPath: asString(item.image),
    backdropPath: getBackdropFromArtworks(mediaType, item.artworks),
    releaseDate: mediaType === "movie" ? getMovieReleaseDate(item) : undefined,
    firstAirDate: mediaType === "tv" ? asString(item.firstAired) : undefined,
    voteAverage: undefined,
    genres: normalizeGenres(item.genres),
    runtime:
      mediaType === "movie"
        ? (parseTvdbId(item.runtime) ?? undefined)
        : (parseTvdbId(item.averageRuntime) ?? undefined),
    numberOfSeasons:
      mediaType === "tv" ? getSeriesSeasonCount(item) : undefined,
  };
}
