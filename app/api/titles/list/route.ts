import { NextRequest, NextResponse } from "next/server";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { logServerError } from "@/lib/server/logger";
import {
  filterTitleViewModels,
  getHouseholdIdForUid,
  listTitleViewModels,
  sortTitleViewModels,
} from "@/lib/tracker/server";
import type { MediaType } from "@/lib/tracker/types";

function normalizeSort(sortBy: string | null) {
  switch (sortBy) {
    case "recently_added":
      return "recently_added" as const;
    case "recently_updated":
    case "alphabetical":
    case "release_date":
      return sortBy;
    default:
      return "recently_updated" as const;
  }
}

function normalizeFilter(searchParams: URLSearchParams): {
  mediaType?: MediaType | "all";
  filter?:
    | "my_wants_to_watch"
    | "my_watched"
    | "household_wants_to_watch"
    | "watched_together"
    | "all_members_watched"
    | "watched_by_anyone"
    | "not_watched_by_me";
} {
  const mediaTypeParam = searchParams.get("mediaType");
  const mediaType: MediaType | "all" | undefined =
    mediaTypeParam === "movie" ||
    mediaTypeParam === "tv" ||
    mediaTypeParam === "all"
      ? mediaTypeParam
      : undefined;

  const filterParam = searchParams.get("filter");

  const filter =
    filterParam === "my_wants_to_watch" ||
    filterParam === "my_watched" ||
    filterParam === "household_wants_to_watch" ||
    filterParam === "watched_together" ||
    filterParam === "all_members_watched" ||
    filterParam === "watched_by_anyone" ||
    filterParam === "not_watched_by_me"
      ? filterParam
      : undefined;

  return { mediaType, filter };
}

export async function GET(request: NextRequest) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);

    const records = await listTitleViewModels(householdId, uid);
    const filtered = filterTitleViewModels(
      records,
      normalizeFilter(request.nextUrl.searchParams),
    );
    const sorted = sortTitleViewModels(
      filtered,
      normalizeSort(request.nextUrl.searchParams.get("sort")),
    );

    return NextResponse.json({ records: sorted });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load titles.";
    const status = message === "Missing auth token." ? 401 : 500;
    logServerError("api.titles.list", error, { status });
    return NextResponse.json(
      { error: status === 401 ? message : "Failed to load titles." },
      { status },
    );
  }
}
