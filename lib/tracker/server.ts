import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import { defaultStatusFlags, mergeStatusPatch } from "@/lib/tracker/shared";
import type {
  StatusFlags,
  StatusPatch,
  TitleMetadata,
  TitleRecord,
  TitleStatus,
} from "@/lib/tracker/types";

function mapTimestamp(value: unknown): string | undefined {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  return undefined;
}

export async function getHouseholdIdForUid(uid: string): Promise<string> {
  const userDoc = await getAdminDb().collection("users").doc(uid).get();
  if (!userDoc.exists) {
    throw new Error("User profile not found.");
  }

  const householdId = userDoc.get("householdId") as string | null | undefined;
  if (!householdId) {
    throw new Error("User has no household.");
  }

  return householdId;
}

function normalizeFlags(value: unknown): StatusFlags {
  const raw = (value as Partial<StatusFlags> | undefined) ?? {};
  return {
    matt: Boolean(raw.matt),
    jessica: Boolean(raw.jessica),
    together: Boolean(raw.together),
  };
}

export function mapTitleRecord(
  titleSnapshot: FirebaseFirestore.DocumentSnapshot,
  statusSnapshot?: FirebaseFirestore.DocumentSnapshot,
): TitleRecord {
  const titleData = (titleSnapshot.data() ?? {}) as Record<string, unknown>;
  const statusData = ((statusSnapshot?.data() ?? {}) as Record<string, unknown>) ?? {};

  const title: TitleMetadata = {
    id: titleSnapshot.id,
    householdId: (titleData.householdId as string) ?? "",
    tmdbId: Number(titleData.tmdbId ?? 0),
    mediaType: (titleData.mediaType as "movie" | "tv") ?? "movie",
    title: (titleData.title as string) ?? "",
    overview: (titleData.overview as string) ?? "",
    posterPath: (titleData.posterPath as string | null | undefined) ?? null,
    backdropPath: (titleData.backdropPath as string | null | undefined) ?? null,
    releaseDate: (titleData.releaseDate as string | null | undefined) ?? null,
    releaseYear:
      typeof titleData.releaseYear === "number"
        ? titleData.releaseYear
        : titleData.releaseYear
          ? Number(titleData.releaseYear)
          : null,
    genres: Array.isArray(titleData.genres)
      ? (titleData.genres.filter((item) => typeof item === "string") as string[])
      : [],
    tmdbVoteAverage:
      typeof titleData.tmdbVoteAverage === "number"
        ? titleData.tmdbVoteAverage
        : titleData.tmdbVoteAverage
          ? Number(titleData.tmdbVoteAverage)
          : null,
    createdAt: mapTimestamp(titleData.createdAt),
    updatedAt: mapTimestamp(titleData.updatedAt),
  };

  const status: TitleStatus = {
    titleId: titleSnapshot.id,
    householdId: (statusData.householdId as string) ?? title.householdId,
    watchedBy: normalizeFlags(statusData.watchedBy),
    wantToWatchBy: normalizeFlags(statusData.wantToWatchBy),
    updatedAt: mapTimestamp(statusData.updatedAt),
  };

  return { title, status };
}

export async function getTitleRecordById(
  householdId: string,
  titleId: string,
): Promise<TitleRecord | null> {
  const titleRef = getAdminDb().collection("titles").doc(titleId);
  const statusRef = getAdminDb().collection("titleStatuses").doc(titleId);
  const [titleSnapshot, statusSnapshot] = await Promise.all([
    titleRef.get(),
    statusRef.get(),
  ]);

  if (!titleSnapshot.exists) {
    return null;
  }

  const ownerHouseholdId = titleSnapshot.get("householdId") as string | undefined;
  if (!ownerHouseholdId || ownerHouseholdId !== householdId) {
    throw new Error("Forbidden.");
  }

  return mapTitleRecord(titleSnapshot, statusSnapshot);
}

export async function applyStatusPatch(
  householdId: string,
  titleId: string,
  patch: StatusPatch,
): Promise<TitleRecord> {
  const titleRef = getAdminDb().collection("titles").doc(titleId);
  const statusRef = getAdminDb().collection("titleStatuses").doc(titleId);

  await getAdminDb().runTransaction(async (transaction) => {
    const [titleSnapshot, statusSnapshot] = await Promise.all([
      transaction.get(titleRef),
      transaction.get(statusRef),
    ]);

    if (!titleSnapshot.exists) {
      throw new Error("Title not found.");
    }

    const titleHouseholdId = titleSnapshot.get("householdId") as string | undefined;
    if (titleHouseholdId !== householdId) {
      throw new Error("Forbidden.");
    }

    const previousWatched = statusSnapshot.exists
      ? normalizeFlags(statusSnapshot.get("watchedBy"))
      : defaultStatusFlags();
    const previousWant = statusSnapshot.exists
      ? normalizeFlags(statusSnapshot.get("wantToWatchBy"))
      : defaultStatusFlags();

    const merged = mergeStatusPatch(
      { watchedBy: previousWatched, wantToWatchBy: previousWant },
      patch,
    );

    transaction.set(
      statusRef,
      {
        titleId,
        householdId,
        watchedBy: merged.watchedBy,
        wantToWatchBy: merged.wantToWatchBy,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    transaction.set(
      titleRef,
      {
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  const next = await getTitleRecordById(householdId, titleId);
  if (!next) {
    throw new Error("Title not found.");
  }

  return next;
}
