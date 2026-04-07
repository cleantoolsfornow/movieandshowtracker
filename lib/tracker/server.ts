import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import { buildTitleViewModel } from "@/lib/tracker/view-model";
import type {
  HouseholdMemberProfile,
  MediaType,
  TimestampLike,
  TitleDocument,
  TitleHouseholdStatusDocument,
  TitleUserStatusDocument,
  TitleViewModel,
} from "@/lib/tracker/types";

type HouseholdDocument = {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function asTimestampLike(value: unknown): TimestampLike {
  if (!value) {
    return undefined;
  }
  if (
    typeof value === "string" ||
    value instanceof Date ||
    value instanceof Timestamp
  ) {
    return value;
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return value as { toDate: () => Date };
  }
  return undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const next = value.filter(
    (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
  );

  return next.length ? next : undefined;
}

function mapGenres(
  value: unknown,
): Array<{ id: number; name: string }> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized: Array<{ id: number; name: string }> = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      normalized.push({ id: -1, name: item });
      continue;
    }

    if (typeof item !== "object" || item === null) {
      continue;
    }

    const id = asNumber((item as { id?: unknown }).id);
    const name = asString((item as { name?: unknown }).name);
    if (typeof id === "number" && name) {
      normalized.push({ id, name });
    }
  }

  return normalized.length ? normalized : undefined;
}

function mapTitleDocument(
  snapshot: FirebaseFirestore.DocumentSnapshot,
): TitleDocument {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  const mediaType = asString(data.mediaType);
  const name = asString(data.name) ?? asString(data.title) ?? "";

  return {
    id: snapshot.id,
    householdId: asString(data.householdId) ?? "",
    tmdbId: asNumber(data.tmdbId) ?? 0,
    mediaType: mediaType === "tv" ? "tv" : "movie",
    name,
    originalName: asString(data.originalName),
    overview: asString(data.overview),
    posterPath: asString(data.posterPath),
    backdropPath: asString(data.backdropPath),
    releaseDate: asString(data.releaseDate),
    firstAirDate: asString(data.firstAirDate),
    genres: mapGenres(data.genres),
    runtime: asNumber(data.runtime),
    numberOfSeasons: asNumber(data.numberOfSeasons),
    voteAverage: asNumber(data.voteAverage) ?? asNumber(data.tmdbVoteAverage),
    createdAt: asTimestampLike(data.createdAt),
    createdBy: asString(data.createdBy),
    updatedAt: asTimestampLike(data.updatedAt),
  };
}

function mapTitleUserStatusDocument(
  snapshot: FirebaseFirestore.DocumentSnapshot,
): TitleUserStatusDocument {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;

  return {
    id: snapshot.id,
    householdId: asString(data.householdId) ?? "",
    titleId: asString(data.titleId) ?? "",
    userId: asString(data.userId) ?? "",
    wantsToWatch: Boolean(data.wantsToWatch),
    watched: Boolean(data.watched),
    watchedAt: asString(data.watchedAt),
    rating: asNumber(data.rating),
    notes: asString(data.notes),
    createdAt: asTimestampLike(data.createdAt),
    updatedAt: asTimestampLike(data.updatedAt),
    updatedBy: asString(data.updatedBy),
  };
}

function mapTitleHouseholdStatusDocument(
  snapshot: FirebaseFirestore.DocumentSnapshot,
): TitleHouseholdStatusDocument {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;

  return {
    titleId: asString(data.titleId) ?? snapshot.id,
    householdId: asString(data.householdId) ?? "",
    householdWantsToWatch: Boolean(data.householdWantsToWatch),
    watchedTogether: Boolean(data.watchedTogether),
    watchedTogetherAt: asString(data.watchedTogetherAt),
    watchedTogetherParticipantUserIds: asStringArray(
      data.watchedTogetherParticipantUserIds,
    ),
    createdAt: asTimestampLike(data.createdAt),
    updatedAt: asTimestampLike(data.updatedAt),
    updatedBy: asString(data.updatedBy),
  };
}

function mapHouseholdDocument(
  snapshot: FirebaseFirestore.DocumentSnapshot,
): HouseholdDocument {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  const rawMemberIds = Array.isArray(data.memberIds) ? data.memberIds : [];
  const memberIds = rawMemberIds.filter(
    (value): value is string => typeof value === "string",
  );

  return {
    id: snapshot.id,
    name: asString(data.name) ?? "",
    inviteCode: asString(data.inviteCode) ?? "",
    memberIds,
  };
}

function mapMemberProfile(
  snapshot: FirebaseFirestore.DocumentSnapshot,
): HouseholdMemberProfile {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;

  return {
    uid: snapshot.id,
    displayName: asString(data.displayName),
    photoURL: asString(data.photoURL),
    avatarDataUrl: asString(data.avatarDataUrl),
  };
}

function groupUserStatusesByTitleId(
  userStatuses: TitleUserStatusDocument[],
): Map<string, TitleUserStatusDocument[]> {
  const grouped = new Map<string, TitleUserStatusDocument[]>();
  for (const status of userStatuses) {
    if (!status.titleId) {
      continue;
    }
    const existing = grouped.get(status.titleId) ?? [];
    existing.push(status);
    grouped.set(status.titleId, existing);
  }
  return grouped;
}

function groupHouseholdStatusesByTitleId(
  householdStatuses: TitleHouseholdStatusDocument[],
): Map<string, TitleHouseholdStatusDocument> {
  return new Map(householdStatuses.map((status) => [status.titleId, status]));
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

export async function getHouseholdById(
  householdId: string,
): Promise<HouseholdDocument | null> {
  const snapshot = await getAdminDb()
    .collection("households")
    .doc(householdId)
    .get();
  if (!snapshot.exists) {
    return null;
  }

  return mapHouseholdDocument(snapshot);
}

export async function assertUserHasHouseholdMembership(
  uid: string,
  householdId: string,
): Promise<void> {
  const household = await getHouseholdById(householdId);
  if (!household) {
    throw new Error("Household not found.");
  }

  if (!household.memberIds.includes(uid)) {
    throw new Error("Forbidden.");
  }
}

export async function listHouseholdMembers(
  householdId: string,
): Promise<HouseholdMemberProfile[]> {
  const household = await getHouseholdById(householdId);
  if (!household) {
    throw new Error("Household not found.");
  }

  const userSnapshots = await Promise.all(
    household.memberIds.map((memberId) =>
      getAdminDb().collection("users").doc(memberId).get(),
    ),
  );

  return userSnapshots
    .filter((snapshot) => snapshot.exists)
    .map(mapMemberProfile);
}

export async function listTitlesByHousehold(
  householdId: string,
): Promise<TitleDocument[]> {
  const snapshots = await getAdminDb()
    .collection("titles")
    .where("householdId", "==", householdId)
    .get();

  return snapshots.docs.map(mapTitleDocument);
}

export async function listTitleUserStatusesByHousehold(
  householdId: string,
): Promise<TitleUserStatusDocument[]> {
  const snapshots = await getAdminDb()
    .collection("titleUserStatuses")
    .where("householdId", "==", householdId)
    .get();

  return snapshots.docs.map(mapTitleUserStatusDocument);
}

export async function listTitleHouseholdStatusesByHousehold(
  householdId: string,
): Promise<TitleHouseholdStatusDocument[]> {
  const snapshots = await getAdminDb()
    .collection("titleHouseholdStatuses")
    .where("householdId", "==", householdId)
    .get();

  return snapshots.docs.map(mapTitleHouseholdStatusDocument);
}

export async function assertUserIsInHousehold(
  actingUserId: string,
  targetUserId: string,
  householdId: string,
): Promise<void> {
  await assertUserHasHouseholdMembership(actingUserId, householdId);
  await assertUserHasHouseholdMembership(targetUserId, householdId);
}

export async function getTitleViewModelById(
  householdId: string,
  titleId: string,
  currentUserId: string,
): Promise<TitleViewModel | null> {
  await assertUserHasHouseholdMembership(currentUserId, householdId);

  const titleSnapshot = await getAdminDb()
    .collection("titles")
    .doc(titleId)
    .get();
  if (!titleSnapshot.exists) {
    return null;
  }

  const title = mapTitleDocument(titleSnapshot);
  if (!title.householdId || title.householdId !== householdId) {
    throw new Error("Forbidden.");
  }

  const [members, titleUserStatusSnapshots, titleHouseholdStatusSnapshot] =
    await Promise.all([
      listHouseholdMembers(householdId),
      getAdminDb()
        .collection("titleUserStatuses")
        .where("householdId", "==", householdId)
        .where("titleId", "==", titleId)
        .get(),
      getAdminDb().collection("titleHouseholdStatuses").doc(titleId).get(),
    ]);

  const userStatuses = titleUserStatusSnapshots.docs.map(
    mapTitleUserStatusDocument,
  );
  const householdStatus =
    titleHouseholdStatusSnapshot.exists &&
    titleHouseholdStatusSnapshot.get("householdId") === householdId
      ? mapTitleHouseholdStatusDocument(titleHouseholdStatusSnapshot)
      : undefined;

  return buildTitleViewModel({
    title,
    currentUserId,
    members,
    userStatuses,
    householdStatus,
  });
}

export async function listTitleViewModels(
  householdId: string,
  currentUserId: string,
): Promise<TitleViewModel[]> {
  await assertUserHasHouseholdMembership(currentUserId, householdId);

  const [members, titles, userStatuses, householdStatuses] = await Promise.all([
    listHouseholdMembers(householdId),
    listTitlesByHousehold(householdId),
    listTitleUserStatusesByHousehold(householdId),
    listTitleHouseholdStatusesByHousehold(householdId),
  ]);

  const userStatusesByTitleId = groupUserStatusesByTitleId(userStatuses);
  const householdStatusesByTitleId =
    groupHouseholdStatusesByTitleId(householdStatuses);

  return titles.map((title) =>
    buildTitleViewModel({
      title,
      currentUserId,
      members,
      userStatuses: userStatusesByTitleId.get(title.id) ?? [],
      householdStatus: householdStatusesByTitleId.get(title.id),
    }),
  );
}

export function filterTitleViewModels(
  records: TitleViewModel[],
  options: {
    mediaType?: MediaType | "all";
    filter?:
      | "my_wants_to_watch"
      | "my_watched"
      | "household_wants_to_watch"
      | "watched_together"
      | "all_members_watched"
      | "watched_by_anyone"
      | "not_watched_by_me";
  },
): TitleViewModel[] {
  return records.filter((record) => {
    if (
      options.mediaType &&
      options.mediaType !== "all" &&
      record.mediaType !== options.mediaType
    ) {
      return false;
    }

    switch (options.filter) {
      case "my_wants_to_watch":
        return record.currentUser.wantsToWatch;
      case "my_watched":
        return record.currentUser.watched;
      case "household_wants_to_watch":
        return record.household.wantsToWatch;
      case "watched_together":
        return record.household.watchedTogether;
      case "all_members_watched":
        return record.household.allMembersWatched;
      case "watched_by_anyone":
        return record.household.watchedCount > 0;
      case "not_watched_by_me":
        return !record.currentUser.watched;
      default:
        return true;
    }
  });
}

export function sortTitleViewModels(
  records: TitleViewModel[],
  sortBy:
    | "recently_added"
    | "recently_updated"
    | "alphabetical"
    | "release_date"
    | null,
): TitleViewModel[] {
  const copied = [...records];

  switch (sortBy) {
    case "alphabetical":
      copied.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "release_date":
      copied.sort((a, b) =>
        (b.releaseDate ?? b.firstAirDate ?? "").localeCompare(
          a.releaseDate ?? a.firstAirDate ?? "",
        ),
      );
      break;
    case "recently_added":
      copied.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "recently_updated":
    default:
      copied.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
  }

  return copied;
}
