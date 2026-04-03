import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { logServerError } from "@/lib/server/logger";
import {
  createTitleKey,
  defaultStatusFlags,
  mergeStatusPatch,
} from "@/lib/tracker/shared";
import { getHouseholdIdForUid, getTitleRecordById } from "@/lib/tracker/server";
import type { MediaType } from "@/lib/tracker/types";

const addTitleSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1),
  overview: z.string().optional().default(""),
  posterPath: z.string().nullable().optional().default(null),
  backdropPath: z.string().nullable().optional().default(null),
  releaseDate: z.string().nullable().optional().default(null),
  releaseYear: z.number().nullable().optional().default(null),
  genres: z.array(z.string()).optional().default([]),
  voteAverage: z.number().nullable().optional().default(null),
  statusPatch: z
    .object({
      watchedBy: z
        .object({
          matt: z.boolean().optional(),
          jessica: z.boolean().optional(),
          together: z.boolean().optional(),
        })
        .optional(),
      wantToWatchBy: z
        .object({
          matt: z.boolean().optional(),
          jessica: z.boolean().optional(),
          together: z.boolean().optional(),
        })
        .optional(),
    })
    .optional()
    .default({}),
});

export async function POST(request: NextRequest) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);

    const parsed = addTitleSchema.parse(await request.json());
    const titleId = createTitleKey(
      householdId,
      parsed.mediaType as MediaType,
      parsed.tmdbId,
    );

    const adminDb = getAdminDb();
    await adminDb.runTransaction(async (transaction) => {
      const titleRef = adminDb.collection("titles").doc(titleId);
      const statusRef = adminDb.collection("titleStatuses").doc(titleId);
      const titleSnapshot = await transaction.get(titleRef);
      const now = FieldValue.serverTimestamp();

      if (!titleSnapshot.exists) {
        transaction.set(titleRef, {
          householdId,
          tmdbId: parsed.tmdbId,
          mediaType: parsed.mediaType,
          title: parsed.title,
          overview: parsed.overview,
          posterPath: parsed.posterPath,
          backdropPath: parsed.backdropPath,
          releaseDate: parsed.releaseDate,
          releaseYear: parsed.releaseYear,
          genres: parsed.genres,
          tmdbVoteAverage: parsed.voteAverage,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        transaction.set(
          titleRef,
          {
            title: parsed.title,
            overview: parsed.overview,
            posterPath: parsed.posterPath,
            backdropPath: parsed.backdropPath,
            releaseDate: parsed.releaseDate,
            releaseYear: parsed.releaseYear,
            genres: parsed.genres,
            tmdbVoteAverage: parsed.voteAverage,
            updatedAt: now,
          },
          { merge: true },
        );
      }

      const statusSnapshot = await transaction.get(statusRef);
      const existingWatched = statusSnapshot.exists
        ? ((statusSnapshot.get("watchedBy") as Record<string, boolean> | undefined) ??
          defaultStatusFlags())
        : defaultStatusFlags();
      const existingWant = statusSnapshot.exists
        ? ((statusSnapshot.get("wantToWatchBy") as
            | Record<string, boolean>
            | undefined) ?? defaultStatusFlags())
        : defaultStatusFlags();

      const merged = mergeStatusPatch(
        {
          watchedBy: {
            matt: Boolean(existingWatched.matt),
            jessica: Boolean(existingWatched.jessica),
            together: Boolean(existingWatched.together),
          },
          wantToWatchBy: {
            matt: Boolean(existingWant.matt),
            jessica: Boolean(existingWant.jessica),
            together: Boolean(existingWant.together),
          },
        },
        parsed.statusPatch,
      );

      transaction.set(
        statusRef,
        {
          titleId,
          householdId,
          watchedBy: merged.watchedBy,
          wantToWatchBy: merged.wantToWatchBy,
          updatedAt: now,
        },
        { merge: true },
      );
    });

    const record = await getTitleRecordById(householdId, titleId);
    return NextResponse.json({ record, titleId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save title.";
    const status =
      message === "Missing auth token."
        ? 401
        : message.includes("household")
          ? 400
          : 500;
    logServerError("api.titles.add", error, { status });

    return NextResponse.json(
      { error: status === 500 ? "Failed to save title." : message },
      { status },
    );
  }
}
