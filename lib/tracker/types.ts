export type MediaType = "movie" | "tv";

export type TitleGenre = {
  id: number;
  name: string;
};

export type TimestampLike =
  | string
  | Date
  | { toDate: () => Date }
  | null
  | undefined;

export type TitleDocument = {
  id: string;
  householdId: string;
  tvdbId: number;
  mediaType: MediaType;
  name: string;
  originalName?: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  firstAirDate?: string;
  genres?: TitleGenre[];
  runtime?: number;
  numberOfSeasons?: number;
  voteAverage?: number;
  createdAt?: TimestampLike;
  createdBy?: string;
  updatedAt?: TimestampLike;
};

export type TitleUserStatusDocument = {
  id: string;
  householdId: string;
  titleId: string;
  userId: string;
  wantsToWatch: boolean;
  watched: boolean;
  watchedAt?: string;
  rating?: number;
  notes?: string;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  updatedBy?: string;
};

export type TitleHouseholdStatusDocument = {
  titleId: string;
  householdId: string;
  householdWantsToWatch: boolean;
  watchedTogether: boolean;
  watchedTogetherAt?: string;
  watchedTogetherParticipantUserIds?: string[];
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  updatedBy?: string;
};

export type TitleDerivedSummary = {
  memberCount: number;
  watchedCount: number;
  wantsToWatchCount: number;
  anyMembersWatched: boolean;
  allMembersWatched: boolean;
  someMembersWatched: boolean;
  noMembersWatched: boolean;
  anyMembersWantToWatch: boolean;
  allMembersWantToWatch: boolean;
  someButNotAllMembersWantToWatch: boolean;
  noMembersWantToWatch: boolean;
  someMembersWantToWatch: boolean;
  multipleMembersWantToWatch: boolean;
};

export type HouseholdMemberProfile = {
  uid: string;
  displayName?: string;
  photoURL?: string;
  avatarDataUrl?: string;
};

export type TitleViewModelMember = {
  userId: string;
  displayName?: string;
  photoURL?: string;
  avatarDataUrl?: string;
  wantsToWatch: boolean;
  watched: boolean;
  watchedAt?: string;
  rating?: number;
  notes?: string;
};

export type TitleViewModel = {
  id: string;
  householdId: string;
  tvdbId: number;
  mediaType: MediaType;
  name: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  firstAirDate?: string;
  genres?: TitleGenre[];
  runtime?: number;
  numberOfSeasons?: number;
  voteAverage?: number;
  household: {
    wantsToWatch: boolean;
    watchedTogether: boolean;
    watchedTogetherAt?: string;
    watchedTogetherParticipantUserIds?: string[];
    watchedTogetherParticipantCount: number;
    watchedTogetherParticipantsKnown: boolean;
    anyMembersWatched: boolean;
    allMembersWatched: boolean;
    someMembersWatched: boolean;
    noMembersWatched: boolean;
    anyMembersWantToWatch: boolean;
    allMembersWantToWatch: boolean;
    someButNotAllMembersWantToWatch: boolean;
    noMembersWantToWatch: boolean;
    someMembersWantToWatch: boolean;
    multipleMembersWantToWatch: boolean;
    watchedCount: number;
    wantsToWatchCount: number;
    memberCount: number;
  };
  members: TitleViewModelMember[];
  currentUser: {
    userId: string;
    wantsToWatch: boolean;
    watched: boolean;
    watchedAt?: string;
    rating?: number;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type TvdbSearchResult = {
  tvdbId: number;
  mediaType: MediaType;
  name: string;
  originalName?: string;
  title?: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage?: number;
};

export type AddTitleAction =
  | "mark_user_wants_to_watch"
  | "mark_user_watched"
  | "mark_household_wants_to_watch"
  | "mark_watched_together";

export type AddTitleRequest = {
  tvdbId: number;
  mediaType: MediaType;
  action: AddTitleAction;
  targetUserId?: string;
  participantUserIds?: string[];
};

export type PatchTitleAction =
  | {
      action: "set_user_wants_to_watch";
      userId: string;
      value: boolean;
    }
  | {
      action: "set_user_watched";
      userId: string;
      value: boolean;
      watchedAt?: string;
    }
  | {
      action: "set_household_wants_to_watch";
      value: boolean;
    }
  | {
      action: "set_watched_together";
      value: boolean;
      watchedTogetherAt?: string;
      participantUserIds?: string[];
    }
  | {
      action: "set_user_rating";
      userId: string;
      value?: number;
    }
  | {
      action: "set_user_notes";
      userId: string;
      value?: string;
    };
