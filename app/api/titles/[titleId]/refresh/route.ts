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
import { fetchTvdbDetail, normalizeTvdbDetailResult } from "@/lib/tracker/tvdb";

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

    const payload = await fetchTvdbDetail(existing.mediaType, existing.tvdbId);
    if (!payload) {
      return NextResponse.json(
        { error: "TVDB payload was invalid." },
        { status: 502 },
      );
    }

    const detail = normalizeTvdbDetailResult(existing.mediaType, payload);
    if (!detail) {
      return NextResponse.json(
        { error: "TVDB payload was invalid." },
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
          : message === "TVDB title not found."
            ? 404
            : 500;
    logServerError("api.titles.refresh", error, { status });

    return NextResponse.json(
      { error: status === 500 ? "Failed to refresh metadata." : message },
      { status },
    );
  }
}
