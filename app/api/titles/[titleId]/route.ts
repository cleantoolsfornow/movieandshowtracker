import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { logServerError } from "@/lib/server/logger";
import { createTitleUserStatusId } from "@/lib/tracker/shared";
import {
  assertUserHasHouseholdMembership,
  assertUserIsInHousehold,
  getHouseholdById,
  getHouseholdIdForUid,
  getTitleViewModelById,
} from "@/lib/tracker/server";
import { normalizeParticipantUserIds } from "@/lib/tracker/shared";

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set_user_wants_to_watch"),
    userId: z.string().min(1),
    value: z.boolean(),
  }),
  z.object({
    action: z.literal("set_user_watched"),
    userId: z.string().min(1),
    value: z.boolean(),
    watchedAt: z.string().optional(),
  }),
  z.object({
    action: z.literal("set_household_wants_to_watch"),
    value: z.boolean(),
  }),
  z.object({
    action: z.literal("set_watched_together"),
    value: z.boolean(),
    watchedTogetherAt: z.string().optional(),
    participantUserIds: z.array(z.string().min(1)).optional(),
  }),
  z.object({
    action: z.literal("set_user_rating"),
    userId: z.string().min(1),
    value: z.number().optional(),
  }),
  z.object({
    action: z.literal("set_user_notes"),
    userId: z.string().min(1),
    value: z.string().optional(),
  }),
]);

function compactObject<T extends Record<string, unknown>>(value: T) {
  const next: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) {
      next[key] = item;
    }
  }
  return next;
}

function buildExclusiveUserPatchFields(
  patch:
    | Extract<z.infer<typeof patchSchema>, { action: "set_user_wants_to_watch" }>
    | Extract<z.infer<typeof patchSchema>, { action: "set_user_watched" }>,
) {
  if (patch.action === "set_user_wants_to_watch") {
    return {
      wantsToWatch: patch.value,
      ...(patch.value
        ? {
            watched: false,
            watchedAt: FieldValue.delete(),
          }
        : {}),
    };
  }

  return {
    watched: patch.value,
    watchedAt: patch.value ? patch.watchedAt : FieldValue.delete(),
    ...(patch.value
      ? {
          wantsToWatch: false,
        }
      : {}),
  };
}

function getPatchErrorStatus(message: string) {
  if (message === "Missing auth token.") {
    return 401;
  }
  if (message === "Forbidden.") {
    return 403;
  }
  if (message === "Title not found.") {
    return 404;
  }
  if (message.includes("participant")) {
    return 400;
  }
  return 500;
}

async function getValidatedParticipantUserIds(
  householdId: string,
  participantUserIds?: string[],
) {
  const normalizedParticipantUserIds = normalizeParticipantUserIds(
    participantUserIds,
  );

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ titleId: string }> },
) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);
    const { titleId } = await context.params;
    await assertUserHasHouseholdMembership(uid, householdId);

    const record = await getTitleViewModelById(householdId, titleId, uid);
    if (!record) {
      return NextResponse.json({ error: "Title not found." }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load title.";
    const status = getPatchErrorStatus(message);
    logServerError("api.titles.get", error, { status });
    return NextResponse.json(
      { error: status === 500 ? "Failed to load title." : message },
      { status },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ titleId: string }> },
) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);
    const { titleId } = await context.params;
    const patch = patchSchema.parse(await request.json());
    const adminDb = getAdminDb();

    await assertUserHasHouseholdMembership(uid, householdId);

    if (
      patch.action === "set_user_wants_to_watch" ||
      patch.action === "set_user_watched"
    ) {
      await assertUserIsInHousehold(uid, patch.userId, householdId);
    }
    if (
      (patch.action === "set_user_rating" ||
        patch.action === "set_user_notes") &&
      patch.userId !== uid
    ) {
      throw new Error("Forbidden.");
    }

    const participantUserIds =
      patch.action === "set_watched_together" && patch.value
        ? await getValidatedParticipantUserIds(
            householdId,
            patch.participantUserIds,
          )
        : undefined;

    await adminDb.runTransaction(async (transaction) => {
      const titleRef = adminDb.collection("titles").doc(titleId);
      const titleSnapshot = await transaction.get(titleRef);
      if (!titleSnapshot.exists) {
        throw new Error("Title not found.");
      }

      const titleHouseholdId = titleSnapshot.get("householdId") as
        | string
        | undefined;
      if (titleHouseholdId !== householdId) {
        throw new Error("Forbidden.");
      }

      const now = FieldValue.serverTimestamp();

      if (
        patch.action === "set_user_wants_to_watch" ||
        patch.action === "set_user_watched"
      ) {
        const statusId = createTitleUserStatusId(
          householdId,
          titleId,
          patch.userId,
        );
        const userStatusRef = adminDb
          .collection("titleUserStatuses")
          .doc(statusId);
        const userStatusSnapshot = await transaction.get(userStatusRef);
        const userStatusFields = buildExclusiveUserPatchFields(patch);

        transaction.set(
          userStatusRef,
          compactObject({
            id: statusId,
            householdId,
            titleId,
            userId: patch.userId,
            ...userStatusFields,
            updatedAt: now,
            updatedBy: uid,
            createdAt: userStatusSnapshot.exists ? undefined : now,
          }),
          { merge: true },
        );
      } else if (
        patch.action === "set_household_wants_to_watch" ||
        patch.action === "set_watched_together"
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
            ...(patch.action === "set_household_wants_to_watch"
              ? { householdWantsToWatch: patch.value }
                : {
                  watchedTogether: patch.value,
                  watchedTogetherAt: patch.value
                    ? patch.watchedTogetherAt
                    : FieldValue.delete(),
                  watchedTogetherParticipantUserIds: patch.value
                    ? participantUserIds ?? FieldValue.delete()
                    : FieldValue.delete(),
                }),
            updatedAt: now,
            updatedBy: uid,
            createdAt: householdStatusSnapshot.exists ? undefined : now,
          }),
          { merge: true },
        );
      } else if (
        patch.action === "set_user_rating" ||
        patch.action === "set_user_notes"
      ) {
        const statusId = createTitleUserStatusId(
          householdId,
          titleId,
          patch.userId,
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
            userId: patch.userId,
            ...(patch.action === "set_user_rating"
              ? { rating: patch.value ?? FieldValue.delete() }
              : { notes: patch.value ?? FieldValue.delete() }),
            updatedAt: now,
            updatedBy: uid,
            createdAt: userStatusSnapshot.exists ? undefined : now,
          }),
          { merge: true },
        );
      }

      transaction.set(
        titleRef,
        {
          updatedAt: now,
        },
        { merge: true },
      );
    });

    const record = await getTitleViewModelById(householdId, titleId, uid);
    if (!record) {
      throw new Error("Title not found.");
    }

    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update status.";
    const status = getPatchErrorStatus(message);
    logServerError("api.titles.patch", error, { status });

    return NextResponse.json(
      { error: status === 500 ? "Failed to update status." : message },
      { status },
    );
  }
}
