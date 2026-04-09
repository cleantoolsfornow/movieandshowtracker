import type {
  HouseholdMemberProfile,
  MediaType,
  TitleDerivedSummary,
  TitleHouseholdStatusDocument,
  TitleUserStatusDocument,
  TitleViewModelMember,
} from "@/lib/tracker/types";

export function createTitleKey(
  householdId: string,
  mediaType: MediaType,
  tmdbId: number,
): string {
  return `${householdId}_${mediaType}_${tmdbId}`;
}

export function createTitleUserStatusId(
  householdId: string,
  titleId: string,
  userId: string,
): string {
  return `${householdId}_${titleId}_${userId}`;
}

export function normalizeHouseholdStatus(
  status?: Partial<TitleHouseholdStatusDocument> | null,
): Pick<
  TitleHouseholdStatusDocument,
  | "householdWantsToWatch"
  | "watchedTogether"
  | "watchedTogetherAt"
  | "watchedTogetherParticipantUserIds"
> {
  const value = status ?? {};
  const watchedTogetherParticipantUserIds = normalizeParticipantUserIds(
    value.watchedTogetherParticipantUserIds,
  );

  return {
    householdWantsToWatch: Boolean(value.householdWantsToWatch),
    watchedTogether: Boolean(value.watchedTogether),
    watchedTogetherAt: value.watchedTogetherAt,
    watchedTogetherParticipantUserIds,
  };
}

export function normalizeParticipantUserIds(
  participantUserIds?: string[] | null,
): string[] | undefined {
  if (!Array.isArray(participantUserIds)) {
    return undefined;
  }

  const normalized = Array.from(
    new Set(
      participantUserIds
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  ).sort();

  return normalized.length ? normalized : undefined;
}

export function normalizeUserStatus(
  status?: Partial<TitleUserStatusDocument> | null,
): Pick<
  TitleUserStatusDocument,
  "wantsToWatch" | "watched" | "watchedAt" | "rating" | "notes"
> {
  const value = status ?? {};
  const watched = Boolean(value.watched);
  const wantsToWatch = watched ? false : Boolean(value.wantsToWatch);

  return {
    wantsToWatch,
    watched,
    watchedAt: watched ? value.watchedAt : undefined,
    rating: value.rating,
    notes: value.notes,
  };
}

export function buildPosterUrl(path: string | null, size = "w342") {
  if (!path) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getWatchedTogetherParticipantState(
  status?: Pick<
    TitleHouseholdStatusDocument,
    "watchedTogether" | "watchedTogetherParticipantUserIds"
  > | null,
) {
  const watchedTogether = Boolean(status?.watchedTogether);
  const watchedTogetherParticipantUserIds = watchedTogether
    ? normalizeParticipantUserIds(status?.watchedTogetherParticipantUserIds)
    : undefined;

  return {
    watchedTogetherParticipantUserIds,
    watchedTogetherParticipantCount:
      watchedTogetherParticipantUserIds?.length ?? 0,
    watchedTogetherParticipantsKnown: Boolean(
      watchedTogether && watchedTogetherParticipantUserIds,
    ),
  };
}

export function computeDerivedSummary(
  members: HouseholdMemberProfile[],
  userStatusesByUserId: Map<string, Partial<TitleUserStatusDocument>>,
): TitleDerivedSummary {
  const memberCount = members.length;

  let watchedCount = 0;
  let wantsToWatchCount = 0;

  for (const member of members) {
    const status = normalizeUserStatus(userStatusesByUserId.get(member.uid));
    if (status.watched) {
      watchedCount += 1;
    }
    if (status.wantsToWatch) {
      wantsToWatchCount += 1;
    }
  }

  const anyMembersWatched = watchedCount > 0;
  const allMembersWatched = memberCount > 0 && watchedCount === memberCount;
  const someMembersWatched = watchedCount > 0 && watchedCount < memberCount;
  const noMembersWatched = watchedCount === 0;
  const anyMembersWantToWatch = wantsToWatchCount > 0;
  const allMembersWantToWatch =
    memberCount > 0 && wantsToWatchCount === memberCount;
  const someButNotAllMembersWantToWatch =
    wantsToWatchCount > 0 && wantsToWatchCount < memberCount;
  const noMembersWantToWatch = wantsToWatchCount === 0;
  const someMembersWantToWatch = anyMembersWantToWatch;
  const multipleMembersWantToWatch = wantsToWatchCount >= 2;

  return {
    memberCount,
    watchedCount,
    wantsToWatchCount,
    anyMembersWatched,
    allMembersWatched,
    someMembersWatched,
    noMembersWatched,
    anyMembersWantToWatch,
    allMembersWantToWatch,
    someButNotAllMembersWantToWatch,
    noMembersWantToWatch,
    someMembersWantToWatch,
    multipleMembersWantToWatch,
  };
}

export function mapMembersToTitleViewModelMembers(
  members: HouseholdMemberProfile[],
  userStatusesByUserId: Map<string, Partial<TitleUserStatusDocument>>,
): TitleViewModelMember[] {
  return members.map((member) => {
    const status = normalizeUserStatus(userStatusesByUserId.get(member.uid));

    return {
      userId: member.uid,
      displayName: member.displayName,
      photoURL: member.photoURL,
      avatarDataUrl: member.avatarDataUrl,
      wantsToWatch: status.wantsToWatch,
      watched: status.watched,
      watchedAt: status.watchedAt,
      rating: status.rating,
      notes: status.notes,
    };
  });
}

export function extractCurrentUserMemberStatus(
  currentUserId: string,
  members: TitleViewModelMember[],
) {
  const existing = members.find((member) => member.userId === currentUserId);
  if (existing) {
    return {
      userId: existing.userId,
      wantsToWatch: existing.wantsToWatch,
      watched: existing.watched,
      watchedAt: existing.watchedAt,
      rating: existing.rating,
      notes: existing.notes,
    };
  }

  const status = normalizeUserStatus(undefined);
  return {
    userId: currentUserId,
    wantsToWatch: status.wantsToWatch,
    watched: status.watched,
    watchedAt: status.watchedAt,
    rating: status.rating,
    notes: status.notes,
  };
}
