import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { logServerError } from "@/lib/server/logger";
import { createTitleKey, createTitleUserStatusId } from "@/lib/tracker/shared";
import {
  assertUserHasHouseholdMembership,
  assertUserIsInHousehold,
  getHouseholdIdForUid,
  getTitleViewModelById,
} from "@/lib/tracker/server";

const addActionSchema = z.enum([
  "add_title_only",
  "mark_user_wants_to_watch",
  "mark_user_watched",
  "mark_household_wants_to_watch",
  "mark_watched_together",
]);

const addTitleSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  action: addActionSchema,
  targetUserId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  overview: z.string().optional(),
  posterPath: z.string().nullable().optional(),
  backdropPath: z.string().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  firstAirDate: z.string().nullable().optional(),
  genres: z
    .array(
      z.union([
        z.string().min(1),
        z.object({
          id: z.number().int(),
          name: z.string().min(1),
        }),
      ]),
    )
    .optional(),
  runtime: z.number().int().positive().optional(),
  numberOfSeasons: z.number().int().positive().optional(),
  voteAverage: z.number().optional(),
});

function normalizeGenres(
  genres: Array<string | { id: number; name: string }> | undefined,
) {
  if (!genres?.length) {
    return undefined;
  }

  return genres.map((genre) =>
    typeof genre === "string" ? { id: -1, name: genre } : genre,
  );
}

function compactObject<T extends Record<string, unknown>>(value: T) {
  const next: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) {
      next[key] = item;
    }
  }
  return next;
}

export async function POST(request: NextRequest) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);
    const parsed = addTitleSchema.parse(await request.json());
    const titleId = createTitleKey(
      householdId,
      parsed.mediaType,
      parsed.tmdbId,
    );
    const targetUserId = parsed.targetUserId ?? uid;

    await assertUserHasHouseholdMembership(uid, householdId);

    if (targetUserId !== uid) {
      await assertUserIsInHousehold(uid, targetUserId, householdId);
    }

    const titleFields = compactObject({
      householdId,
      tmdbId: parsed.tmdbId,
      mediaType: parsed.mediaType,
      name: parsed.name ?? parsed.title,
      overview: parsed.overview,
      posterPath: parsed.posterPath ?? undefined,
      backdropPath: parsed.backdropPath ?? undefined,
      releaseDate: parsed.releaseDate ?? undefined,
      firstAirDate: parsed.firstAirDate ?? undefined,
      genres: normalizeGenres(parsed.genres),
      runtime: parsed.runtime,
      numberOfSeasons: parsed.numberOfSeasons,
      voteAverage: parsed.voteAverage,
    });

    const adminDb = getAdminDb();

    await adminDb.runTransaction(async (transaction) => {
      const titleRef = adminDb.collection("titles").doc(titleId);
      const titleSnapshot = await transaction.get(titleRef);
      const now = FieldValue.serverTimestamp();
      const existingName =
        (titleSnapshot.get("name") as string | undefined) ??
        (titleSnapshot.get("title") as string | undefined);
      const titleName = parsed.name ?? parsed.title ?? existingName;

      if (!titleSnapshot.exists) {
        if (!titleName) {
          throw new Error("Title metadata requires a name for new titles.");
        }
        transaction.set(titleRef, {
          id: titleId,
          ...titleFields,
          name: titleName,
          createdAt: now,
          createdBy: uid,
          updatedAt: now,
        });
      } else {
        const titleHouseholdId = titleSnapshot.get("householdId") as
          | string
          | undefined;
        if (titleHouseholdId !== householdId) {
          throw new Error("Forbidden.");
        }

        transaction.set(
          titleRef,
          compactObject({
            ...titleFields,
            name: titleName,
            updatedAt: now,
          }),
          { merge: true },
        );
      }

      if (
        parsed.action === "mark_user_wants_to_watch" ||
        parsed.action === "mark_user_watched"
      ) {
        const statusId = createTitleUserStatusId(
          householdId,
          titleId,
          targetUserId,
        );
        const userStatusRef = adminDb
          .collection("titleUserStatuses")
          .doc(statusId);
        const userStatusSnapshot = await transaction.get(userStatusRef);

        transaction.set(
          userStatusRef,
          compactObject({
            id: statusId,
            householdId,
            titleId,
            userId: targetUserId,
            wantsToWatch:
              parsed.action === "mark_user_wants_to_watch" ? true : undefined,
            watched: parsed.action === "mark_user_watched" ? true : undefined,
            updatedAt: now,
            updatedBy: uid,
            createdAt: userStatusSnapshot.exists ? undefined : now,
          }),
          { merge: true },
        );
      }

      if (
        parsed.action === "mark_household_wants_to_watch" ||
        parsed.action === "mark_watched_together"
      ) {
        const householdStatusRef = adminDb
          .collection("titleHouseholdStatuses")
          .doc(titleId);
        const householdStatusSnapshot = await transaction.get(householdStatusRef);

        transaction.set(
          householdStatusRef,
          compactObject({
            titleId,
            householdId,
            householdWantsToWatch:
              parsed.action === "mark_household_wants_to_watch"
                ? true
                : undefined,
            watchedTogether:
              parsed.action === "mark_watched_together" ? true : undefined,
            updatedAt: now,
            updatedBy: uid,
            createdAt: householdStatusSnapshot.exists ? undefined : now,
          }),
          { merge: true },
        );
      }
    });

    const record = await getTitleViewModelById(householdId, titleId, uid);
    if (!record) {
      throw new Error("Title not found.");
    }

    return NextResponse.json({ record, titleId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save title.";
    const status =
      message === "Missing auth token."
        ? 401
        : message === "Forbidden."
          ? 403
          : message.includes("household") || message.includes("name")
            ? 400
            : 500;
    logServerError("api.titles.add", error, { status });

    return NextResponse.json(
      { error: status === 500 ? "Failed to save title." : message },
      { status },
    );
  }
}
