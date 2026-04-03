import { NextRequest, NextResponse } from "next/server";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { logServerError } from "@/lib/server/logger";
import { normalizeTmdbMultiResult } from "@/lib/tracker/tmdb";
import type { TmdbSearchResult } from "@/lib/tracker/types";

export async function GET(request: NextRequest) {
  try {
    await requireUidFromRequest(request);

    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const baseUrl = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
    const url = new URL("/search/multi", baseUrl);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("query", query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "TMDb request failed." },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      results?: Record<string, unknown>[];
    };

    const results = (data.results ?? [])
      .map(normalizeTmdbMultiResult)
      .filter((item): item is TmdbSearchResult => Boolean(item))
      .slice(0, 20);

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    const status = message === "Missing auth token." ? 401 : 500;
    logServerError("api.tmdb.search", error, { status });
    return NextResponse.json(
      { error: status === 401 ? message : "Failed to search titles." },
      { status },
    );
  }
}
