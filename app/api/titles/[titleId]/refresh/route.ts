import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { logServerError } from "@/lib/server/logger";
import {
  assertUserHasHouseholdMembership,
  getHouseholdIdForUid,
  getTitleViewModelById,
} from "@/lib/tracker/server";
import { normalizeTmdbDetailResult } from "@/lib/tracker/tmdb";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ titleId: string }> },
) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);
    const { titleId } = await context.params;

    await assertUserHasHouseholdMembership(uid, householdId);

    const existing = await getTitleViewModelById(householdId, titleId, uid);
    if (!existing) {
      return NextResponse.json({ error: "Title not found." }, { status: 404 });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const baseUrl = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const detailPath =
      existing.mediaType === "movie"
        ? `movie/${existing.tmdbId}`
        : `tv/${existing.tmdbId}`;
    const url = new URL(detailPath, normalizedBaseUrl);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "en-US");

    const tmdbResponse = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!tmdbResponse.ok) {
      return NextResponse.json(
        { error: "TMDb request failed." },
        { status: tmdbResponse.status },
      );
    }

    const detail = normalizeTmdbDetailResult(
      existing.mediaType,
      (await tmdbResponse.json()) as Record<string, unknown>,
    );
    if (!detail) {
      return NextResponse.json(
        { error: "TMDb payload was invalid." },
        { status: 502 },
      );
    }

    await getAdminDb()
      .collection("titles")
      .doc(titleId)
      .set(
        {
          name: detail.name,
          overview: detail.overview,
          posterPath: detail.posterPath ?? undefined,
          backdropPath: detail.backdropPath ?? undefined,
          releaseDate: detail.releaseDate ?? undefined,
          firstAirDate: detail.firstAirDate ?? undefined,
          genres: detail.genres ?? undefined,
          runtime: detail.runtime ?? undefined,
          numberOfSeasons: detail.numberOfSeasons ?? undefined,
          voteAverage: detail.voteAverage ?? undefined,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    const record = await getTitleViewModelById(householdId, titleId, uid);
    if (!record) {
      throw new Error("Title not found.");
    }
    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to refresh metadata.";
    const status =
      message === "Missing auth token."
        ? 401
        : message === "Forbidden."
          ? 403
          : 500;
    logServerError("api.titles.refresh", error, { status });

    return NextResponse.json(
      { error: status === 500 ? "Failed to refresh metadata." : message },
      { status },
    );
  }
}
