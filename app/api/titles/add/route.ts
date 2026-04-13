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
  getHouseholdById,
  getHouseholdIdForUid,
  getTitleViewModelById,
} from "@/lib/tracker/server";
import { normalizeParticipantUserIds } from "@/lib/tracker/shared";

const addActionSchema = z.enum([
  "mark_user_wants_to_watch",
  "mark_user_watched",
  "mark_household_wants_to_watch",
  "mark_watched_together",
]);

const addTitleSchema = z.object({
  tvdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  action: addActionSchema,
  targetUserId: z.string().min(1).optional(),
  participantUserIds: z.array(z.string().min(1)).optional(),
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
  voteAverage: z.number().nullable().optional(),
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

function buildExclusiveUserStatusFields(
  action: z.infer<typeof addActionSchema>,
) {
  if (action === "mark_user_wants_to_watch") {
    return {
      wantsToWatch: true,
      watched: false,
      watchedAt: FieldValue.delete(),
    };
  }

  if (action === "mark_user_watched") {
    return {
      wantsToWatch: false,
      watched: true,
    };
  }

  return {};
}

async function getValidatedParticipantUserIds(
  householdId: string,
  participantUserIds?: string[],
) {
  const normalizedParticipantUserIds =
    normalizeParticipantUserIds(participantUserIds);

  if (!normalizedParticipantUserIds) {
    return undefined;
  }

  if (normalizedParticipantUserIds.length < 2) {
    throw new Error(
      "watchedTogether participants must include at least 2 household members.",
    );
  }

  const household = await getHouseholdById(householdId);
  if (!household) {
    throw new Error("Household not found.");
  }

  const hasOutsideParticipant = normalizedParticipantUserIds.some(
    (participantUserId) => !household.memberIds.includes(participantUserId),
  );
  if (hasOutsideParticipant) {
    throw new Error(
      "watchedTogether participants must belong to the household.",
    );
  }

  return normalizedParticipantUserIds;
}

export async function POST(request: NextRequest) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);
    const parsed = addTitleSchema.parse(await request.json());
    const titleId = createTitleKey(
      householdId,
      parsed.mediaType,
      parsed.tvdbId,
    );
    const targetUserId = parsed.targetUserId ?? uid;

    await assertUserHasHouseholdMembership(uid, householdId);

    if (targetUserId !== uid) {
      await assertUserIsInHousehold(uid, targetUserId, householdId);
    }

    const participantUserIds =
      parsed.action === "mark_watched_together"
        ? await getValidatedParticipantUserIds(
            householdId,
            parsed.participantUserIds,
          )
        : undefined;

    const titleFields = compactObject({
      householdId,
      tvdbId: parsed.tvdbId,
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
      voteAverage: parsed.voteAverage ?? undefined,
    });

    const adminDb = getAdminDb();

    await adminDb.runTransaction(async (transaction) => {
      const titleRef = adminDb.collection("titles").doc(titleId);
      const titleSnapshot = await transaction.get(titleRef);
      const shouldWriteUserStatus =
        parsed.action === "mark_user_wants_to_watch" ||
        parsed.action === "mark_user_watched";
      const shouldWriteHouseholdStatus =
        parsed.action === "mark_household_wants_to_watch" ||
        parsed.action === "mark_watched_together";
      const userStatusRef = shouldWriteUserStatus
        ? adminDb
            .collection("titleUserStatuses")
            .doc(createTitleUserStatusId(householdId, titleId, targetUserId))
        : null;
      const householdStatusRef = shouldWriteHouseholdStatus
        ? adminDb.collection("titleHouseholdStatuses").doc(titleId)
        : null;
      const userStatusSnapshot = userStatusRef
        ? await transaction.get(userStatusRef)
        : null;
      const householdStatusSnapshot = householdStatusRef
        ? await transaction.get(householdStatusRef)
        : null;
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

      if (shouldWriteUserStatus && userStatusRef) {
        const userStatusFields = buildExclusiveUserStatusFields(parsed.action);
        transaction.set(
          userStatusRef,
          compactObject({
            id: userStatusRef.id,
            householdId,
            titleId,
            userId: targetUserId,
            ...userStatusFields,
            updatedAt: now,
            updatedBy: uid,
            createdAt: userStatusSnapshot?.exists ? undefined : now,
          }),
          { merge: true },
        );
      }

      if (shouldWriteHouseholdStatus && householdStatusRef) {
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
            watchedTogetherParticipantUserIds:
              parsed.action === "mark_watched_together"
                ? (participantUserIds ?? FieldValue.delete())
                : undefined,
            updatedAt: now,
            updatedBy: uid,
            createdAt: householdStatusSnapshot?.exists ? undefined : now,
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
      error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Invalid title payload.")
        : error instanceof Error
          ? error.message
          : "Failed to save title.";
    const isDev = process.env.NODE_ENV !== "production";
    const status =
      message === "Missing auth token."
        ? 401
        : message === "Forbidden."
          ? 403
          : error instanceof z.ZodError
            ? 400
            : message.includes("household") ||
                message.includes("name") ||
                message.includes("participant")
              ? 400
              : 500;
    logServerError("api.titles.add", error, { status });

    return NextResponse.json(
      { error: status === 500 && !isDev ? "Failed to save title." : message },
      { status },
    );
  }
}
