import { NextRequest, NextResponse } from "next/server";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { logServerError } from "@/lib/server/logger";
import {
  fetchTvdbSearchResults,
  normalizeTvdbSearchResult,
} from "@/lib/tracker/tvdb";
import type { TvdbSearchResult } from "@/lib/tracker/types";

export async function GET(request: NextRequest) {
  try {
    await requireUidFromRequest(request);

    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const payload = await fetchTvdbSearchResults(query);
    const results = payload
      .map((item) =>
        typeof item === "object" && item !== null
          ? normalizeTvdbSearchResult(item as Record<string, unknown>)
          : null,
      )
      .filter((item): item is TvdbSearchResult => Boolean(item))
      .slice(0, 20);

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    const status =
      message === "Missing auth token."
        ? 401
        : error instanceof Error && "status" in error
          ? Number((error as Error & { status?: number }).status) || 500
          : 500;
    logServerError("api.tvdb.search", error, { status });

    return NextResponse.json(
      {
        error:
          status === 401
            ? message
            : status === 500
              ? "Failed to search titles."
              : message,
      },
      { status },
    );
  }
}
