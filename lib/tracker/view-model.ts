import {
  computeDerivedSummary,
  extractCurrentUserMemberStatus,
  getWatchedTogetherParticipantState,
  mapMembersToTitleViewModelMembers,
  normalizeHouseholdStatus,
} from "@/lib/tracker/shared";
import type {
  HouseholdMemberProfile,
  TimestampLike,
  TitleDocument,
  TitleHouseholdStatusDocument,
  TitleUserStatusDocument,
  TitleViewModel,
} from "@/lib/tracker/types";

function toIsoString(value: TimestampLike): string {
  if (!value) {
    return new Date(0).toISOString();
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value.toDate().toISOString();
}

type BuildTitleViewModelInput = {
  title: TitleDocument;
  currentUserId: string;
  members: HouseholdMemberProfile[];
  userStatuses: TitleUserStatusDocument[];
  householdStatus?: TitleHouseholdStatusDocument | null;
};

export function buildTitleViewModel({
  title,
  currentUserId,
  members,
  userStatuses,
  householdStatus,
}: BuildTitleViewModelInput): TitleViewModel {
  const userStatusesByUserId = new Map<string, TitleUserStatusDocument>();
  for (const status of userStatuses) {
    userStatusesByUserId.set(status.userId, status);
  }

  const household = normalizeHouseholdStatus(householdStatus);
  const watchedTogetherParticipants =
    getWatchedTogetherParticipantState(household);
  const membersView = mapMembersToTitleViewModelMembers(
    members,
    userStatusesByUserId,
  );
  const derived = computeDerivedSummary(members, userStatusesByUserId);
  const currentUser = extractCurrentUserMemberStatus(
    currentUserId,
    membersView,
  );

  return {
    id: title.id,
    householdId: title.householdId,
    tvdbId: title.tvdbId,
    mediaType: title.mediaType,
    name: title.name,
    overview: title.overview,
    posterPath: title.posterPath,
    backdropPath: title.backdropPath,
    releaseDate: title.releaseDate,
    firstAirDate: title.firstAirDate,
    genres: title.genres,
    runtime: title.runtime,
    numberOfSeasons: title.numberOfSeasons,
    voteAverage: title.voteAverage,
    household: {
      wantsToWatch: household.householdWantsToWatch,
      watchedTogether: household.watchedTogether,
      watchedTogetherAt: household.watchedTogetherAt,
      watchedTogetherParticipantUserIds:
        watchedTogetherParticipants.watchedTogetherParticipantUserIds,
      watchedTogetherParticipantCount:
        watchedTogetherParticipants.watchedTogetherParticipantCount,
      watchedTogetherParticipantsKnown:
        watchedTogetherParticipants.watchedTogetherParticipantsKnown,
      anyMembersWatched: derived.anyMembersWatched,
      allMembersWatched: derived.allMembersWatched,
      someMembersWatched: derived.someMembersWatched,
      noMembersWatched: derived.noMembersWatched,
      anyMembersWantToWatch: derived.anyMembersWantToWatch,
      allMembersWantToWatch: derived.allMembersWantToWatch,
      someButNotAllMembersWantToWatch: derived.someButNotAllMembersWantToWatch,
      noMembersWantToWatch: derived.noMembersWantToWatch,
      someMembersWantToWatch: derived.someMembersWantToWatch,
      multipleMembersWantToWatch: derived.multipleMembersWantToWatch,
      watchedCount: derived.watchedCount,
      wantsToWatchCount: derived.wantsToWatchCount,
      memberCount: derived.memberCount,
    },
    members: membersView,
    currentUser,
    createdAt: toIsoString(title.createdAt),
    updatedAt: toIsoString(title.updatedAt),
  };
}
