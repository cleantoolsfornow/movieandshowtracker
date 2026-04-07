#!/usr/bin/env node

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const dryRun = process.argv.includes("--dry-run");
const batchSizeArg = process.argv.find((arg) =>
  arg.startsWith("--batch-size="),
);
const batchSize = batchSizeArg ? Number(batchSizeArg.split("=")[1]) : 200;

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
  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    throw new Error("Invalid --batch-size value");
  }

  const db = getDb();
  let deleted = 0;

  while (true) {
    const snapshot = await db
      .collection("titleStatuses")
      .limit(batchSize)
      .get();
    if (snapshot.empty) {
      break;
    }

    if (!dryRun) {
      const batch = db.batch();
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
      }
      await batch.commit();
    }

    deleted += snapshot.size;
    console.log(
      `[progress] ${dryRun ? "would delete" : "deleted"} ${deleted} legacy docs`,
    );
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        deleted,
        batchSize,
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
