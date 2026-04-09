#!/usr/bin/env node

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const dryRun = process.argv.includes("--dry-run");

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
  const snapshots = await db.collection("titleUserStatuses").get();
  let normalized = 0;
  let scanned = 0;

  for (const snapshot of snapshots.docs) {
    scanned += 1;
    const data = snapshot.data() ?? {};
    const watched = Boolean(data.watched);
    const wantsToWatch = Boolean(data.wantsToWatch);

    if (!watched || !wantsToWatch) {
      continue;
    }

    normalized += 1;

    if (dryRun) {
      console.log(
        `[dry-run] normalize ${snapshot.id} household=${data.householdId ?? "unknown"} title=${data.titleId ?? "unknown"} user=${data.userId ?? "unknown"}`,
      );
      continue;
    }

    await snapshot.ref.set(
      {
        wantsToWatch: false,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: "status-normalizer",
      },
      { merge: true },
    );
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        scanned,
        normalized,
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
