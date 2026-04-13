import { getCurrentIdToken } from "@/lib/auth/auth-client";
import type {
  AddTitleRequest,
  PatchTitleAction,
  TvdbSearchResult,
  TitleViewModel,
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

export async function searchTvdb(query: string): Promise<TvdbSearchResult[]> {
  const params = new URLSearchParams({ q: query });
  const data = await authedFetch<{ results: TvdbSearchResult[] }>(
    `/api/tvdb/search?${params.toString()}`,
    { method: "GET" },
  );
  return data.results;
}

export type AddTitleClientRequest = AddTitleRequest & {
  name?: string;
  title?: string;
  overview?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  firstAirDate?: string | null;
  genres?: Array<string | { id: number; name: string }>;
  runtime?: number;
  numberOfSeasons?: number;
  voteAverage?: number | null;
  participantUserIds?: string[];
};

export async function addTitle(
  input: AddTitleClientRequest,
): Promise<TitleViewModel> {
  const data = await authedFetch<{ record: TitleViewModel }>(
    "/api/titles/add",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return data.record;
}

export async function listTitles(filters?: {
  mediaType?: "movie" | "tv" | "all";
  filter?:
    | "my_wants_to_watch"
    | "my_watched"
    | "household_wants_to_watch"
    | "watched_together"
    | "all_members_watched"
    | "watched_by_anyone"
    | "not_watched_by_me";
  sort?:
    | "recently_added"
    | "recently_updated"
    | "alphabetical"
    | "release_date";
}): Promise<TitleViewModel[]> {
  const params = new URLSearchParams();
  if (filters?.mediaType) {
    params.set("mediaType", filters.mediaType);
  }
  if (filters?.filter) {
    params.set("filter", filters.filter);
  }
  if (filters?.sort) {
    params.set("sort", filters.sort);
  }

  const data = await authedFetch<{ records: TitleViewModel[] }>(
    `/api/titles/list${params.size ? `?${params.toString()}` : ""}`,
    { method: "GET" },
  );

  return data.records;
}

export async function getTitleById(titleId: string): Promise<TitleViewModel> {
  const data = await authedFetch<{ record: TitleViewModel }>(
    `/api/titles/${titleId}`,
    {
      method: "GET",
    },
  );

  return data.record;
}

export async function patchTitleStatus(
  titleId: string,
  patch: PatchTitleAction,
): Promise<TitleViewModel> {
  const data = await authedFetch<{ record: TitleViewModel }>(
    `/api/titles/${titleId}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
  );

  return data.record;
}

export async function refreshTitleMetadata(
  titleId: string,
): Promise<TitleViewModel> {
  const data = await authedFetch<{ record: TitleViewModel }>(
    `/api/titles/${titleId}/refresh`,
    {
      method: "POST",
    },
  );

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
    avatarDataUrl: string | null;
  }>;
};

export async function getHouseholdSummary(): Promise<HouseholdSummary> {
  const data = await authedFetch<{ household: HouseholdSummary }>(
    "/api/households/me",
    {
      method: "GET",
    },
  );

  return data.household;
}
