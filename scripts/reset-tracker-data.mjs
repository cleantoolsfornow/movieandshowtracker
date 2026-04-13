#!/usr/bin/env node

import nextEnv from "@next/env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const { loadEnvConfig } = nextEnv;

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--yes");
const collections = [
  "titleHouseholdStatuses",
  "titleUserStatuses",
  "titles",
  "titleStatuses",
  "households",
  "users",
];

loadEnvConfig(process.cwd());

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

async function deleteCollection(db, collectionName) {
  let deletedCount = 0;

  while (true) {
    const snapshot = await db.collection(collectionName).limit(200).get();
    if (snapshot.empty) {
      break;
    }

    deletedCount += snapshot.size;

    if (!dryRun) {
      const batch = db.batch();
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
      }
      await batch.commit();
    }
  }

  return deletedCount;
}

async function main() {
  if (!force) {
    throw new Error(
      "Refusing to wipe Firestore data without --yes. Use --dry-run to preview.",
    );
  }

  const db = getDb();
  let totalDeleted = 0;

  for (const collectionName of collections) {
    const deletedCount = await deleteCollection(db, collectionName);
    totalDeleted += deletedCount;
    const prefix = dryRun ? "[dry-run]" : "[deleted]";
    console.log(`${prefix} ${collectionName}: ${deletedCount}`);
  }

  console.log(
    `${dryRun ? "Previewed" : "Deleted"} ${totalDeleted} Firestore documents across ${collections.length} collections.`,
  );
  console.log("Firebase Auth users were not deleted.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
