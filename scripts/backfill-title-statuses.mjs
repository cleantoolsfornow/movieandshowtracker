#!/usr/bin/env node

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const dryRun = process.argv.includes("--dry-run");

function createTitleUserStatusId(householdId, titleId, userId) {
  return `${householdId}_${titleId}_${userId}`;
}

function buildLegacyBackfillPlan({ householdId, titleId, memberIds, status }) {
  const memberOneId = memberIds[0];
  const memberTwoId = memberIds[1];
  const userStatusMap = new Map();
  const skippedReasons = [];

  function upsertUser(userId, update) {
    const previous = userStatusMap.get(userId);
    if (previous) {
      userStatusMap.set(userId, { ...previous, ...update });
      return;
    }
    userStatusMap.set(userId, {
      id: createTitleUserStatusId(householdId, titleId, userId),
      householdId,
      titleId,
      userId,
      ...update,
    });
  }

  if (status.watchedBy?.memberOne === true) {
    if (memberOneId) upsertUser(memberOneId, { watched: true });
    else
      skippedReasons.push(
        "memberOne watched=true but household.memberIds[0] is missing",
      );
  }
  if (status.watchedBy?.memberTwo === true) {
    if (memberTwoId) upsertUser(memberTwoId, { watched: true });
    else
      skippedReasons.push(
        "memberTwo watched=true but household.memberIds[1] is missing",
      );
  }
  if (status.wantToWatchBy?.memberOne === true) {
    if (memberOneId) upsertUser(memberOneId, { wantsToWatch: true });
    else
      skippedReasons.push(
        "memberOne wantsToWatch=true but household.memberIds[0] is missing",
      );
  }
  if (status.wantToWatchBy?.memberTwo === true) {
    if (memberTwoId) upsertUser(memberTwoId, { wantsToWatch: true });
    else
      skippedReasons.push(
        "memberTwo wantsToWatch=true but household.memberIds[1] is missing",
      );
  }

  const householdStatus =
    status.watchedBy?.together === true ||
    status.wantToWatchBy?.together === true
      ? {
          titleId,
          householdId,
          watchedTogether:
            status.watchedBy?.together === true ? true : undefined,
          householdWantsToWatch:
            status.wantToWatchBy?.together === true ? true : undefined,
        }
      : undefined;

  return {
    userStatuses: [...userStatusMap.values()],
    householdStatus,
    skippedReasons,
  };
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

function getDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: requireEnv("FIREBASE_ADMIN_PROJECT_ID"),
        clientEmail: requireEnv("FIREBASE_ADMIN_CLIENT_EMAIL"),
        privateKey: requireEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(
          /\\n/g,
          "\n",
        ),
      }),
    });
  }
  return getFirestore();
}

async function main() {
  const db = getDb();

  const householdSnapshots = await db.collection("households").get();
  let migratedTitles = 0;
  let migratedUserStatuses = 0;
  let migratedHouseholdStatuses = 0;
  let skipped = 0;

  for (const householdSnapshot of householdSnapshots.docs) {
    const householdId = householdSnapshot.id;
    const memberIds = Array.isArray(householdSnapshot.get("memberIds"))
      ? householdSnapshot
          .get("memberIds")
          .filter((value) => typeof value === "string")
      : [];

    const legacyStatusSnapshots = await db
      .collection("titleStatuses")
      .where("householdId", "==", householdId)
      .get();

    for (const legacySnapshot of legacyStatusSnapshots.docs) {
      const raw = legacySnapshot.data() ?? {};
      const titleId =
        typeof raw.titleId === "string" && raw.titleId.trim()
          ? raw.titleId
          : legacySnapshot.id;

      if (!titleId) {
        skipped += 1;
        console.warn(
          `[skip] household=${householdId} legacyStatus=${legacySnapshot.id}: missing titleId`,
        );
        continue;
      }

      const plan = buildLegacyBackfillPlan({
        householdId,
        titleId,
        memberIds,
        status: {
          titleId,
          watchedBy:
            typeof raw.watchedBy === "object" && raw.watchedBy !== null
              ? raw.watchedBy
              : undefined,
          wantToWatchBy:
            typeof raw.wantToWatchBy === "object" && raw.wantToWatchBy !== null
              ? raw.wantToWatchBy
              : undefined,
        },
      });

      for (const reason of plan.skippedReasons) {
        skipped += 1;
        console.warn(
          `[skip] household=${householdId} title=${titleId} legacyStatus=${legacySnapshot.id}: ${reason}`,
        );
      }

      if (plan.userStatuses.length === 0 && !plan.householdStatus) {
        continue;
      }

      migratedTitles += 1;

      if (!dryRun) {
        const now = FieldValue.serverTimestamp();

        for (const userStatus of plan.userStatuses) {
          await db
            .collection("titleUserStatuses")
            .doc(userStatus.id)
            .set(
              {
                id: userStatus.id,
                householdId: userStatus.householdId,
                titleId: userStatus.titleId,
                userId: userStatus.userId,
                wantsToWatch:
                  userStatus.wantsToWatch === true ? true : undefined,
                watched: userStatus.watched === true ? true : undefined,
                createdAt: now,
                updatedAt: now,
                updatedBy: "legacy-backfill",
              },
              { merge: true },
            );
          migratedUserStatuses += 1;
        }

        if (plan.householdStatus) {
          await db
            .collection("titleHouseholdStatuses")
            .doc(titleId)
            .set(
              {
                titleId,
                householdId,
                householdWantsToWatch:
                  plan.householdStatus.householdWantsToWatch === true
                    ? true
                    : undefined,
                watchedTogether:
                  plan.householdStatus.watchedTogether === true
                    ? true
                    : undefined,
                createdAt: now,
                updatedAt: now,
                updatedBy: "legacy-backfill",
              },
              { merge: true },
            );
          migratedHouseholdStatuses += 1;
        }
      } else {
        migratedUserStatuses += plan.userStatuses.length;
        migratedHouseholdStatuses += plan.householdStatus ? 1 : 0;
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        householdsScanned: householdSnapshots.size,
        titlesWithMigrations: migratedTitles,
        userStatusesUpserted: migratedUserStatuses,
        householdStatusesUpserted: migratedHouseholdStatuses,
        skipped,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
