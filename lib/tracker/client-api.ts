import { getCurrentIdToken } from "@/lib/auth/auth-client";
import type {
  StatusPatch,
  TmdbSearchResult,
  TitleRecord,
} from "@/lib/tracker/types";

type ApiError = { error?: string };

async function authedFetch<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const idToken = await getCurrentIdToken();

  const response = await fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const data = (await response.json()) as T | ApiError;
  if (!response.ok) {
    throw new Error((data as ApiError).error ?? "Request failed.");
  }

  return data as T;
}

export async function searchTmdb(query: string): Promise<TmdbSearchResult[]> {
  const params = new URLSearchParams({ q: query });
  const data = await authedFetch<{ results: TmdbSearchResult[] }>(
    `/api/tmdb/search?${params.toString()}`,
    { method: "GET" },
  );
  return data.results;
}

export async function addTitle(input: {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  voteAverage: number | null;
  genres?: string[];
  statusPatch?: StatusPatch;
}): Promise<TitleRecord> {
  const data = await authedFetch<{ record: TitleRecord }>("/api/titles/add", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.record;
}

export async function listTitles(filters?: {
  mediaType?: "movie" | "tv" | "all";
  watchedBy?: "matt" | "jessica" | "together" | "all";
  wantBy?: "matt" | "jessica" | "together" | "all";
  sort?: "updated" | "release" | "alpha";
}): Promise<TitleRecord[]> {
  const params = new URLSearchParams();
  if (filters?.mediaType) {
    params.set("mediaType", filters.mediaType);
  }
  if (filters?.watchedBy) {
    params.set("watchedBy", filters.watchedBy);
  }
  if (filters?.wantBy) {
    params.set("wantBy", filters.wantBy);
  }
  if (filters?.sort) {
    params.set("sort", filters.sort);
  }

  const data = await authedFetch<{ records: TitleRecord[] }>(
    `/api/titles/list${params.size ? `?${params.toString()}` : ""}`,
    { method: "GET" },
  );

  return data.records;
}

export async function getTitleById(titleId: string): Promise<TitleRecord> {
  const data = await authedFetch<{ record: TitleRecord }>(`/api/titles/${titleId}`, {
    method: "GET",
  });

  return data.record;
}

export async function patchTitleStatus(
  titleId: string,
  patch: StatusPatch,
): Promise<TitleRecord> {
  const data = await authedFetch<{ record: TitleRecord }>(`/api/titles/${titleId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

  return data.record;
}

export type HouseholdSummary = {
  id: string;
  name: string;
  inviteCode: string;
  members: Array<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }>;
};

export async function getHouseholdSummary(): Promise<HouseholdSummary> {
  const data = await authedFetch<{ household: HouseholdSummary }>("/api/households/me", {
    method: "GET",
  });

  return data.household;
}
