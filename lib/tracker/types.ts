export type MediaType = "movie" | "tv";

export type StatusField = "watchedBy" | "wantToWatchBy";
export type StatusPerson = "memberOne" | "memberTwo" | "together";

export type StatusFlags = {
  memberOne: boolean;
  memberTwo: boolean;
  together: boolean;
};

export type TitleStatus = {
  titleId: string;
  householdId: string;
  watchedBy: StatusFlags;
  wantToWatchBy: StatusFlags;
  updatedAt?: string;
};

export type TitleMetadata = {
  id: string;
  householdId: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  genres: string[];
  tmdbVoteAverage: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TitleRecord = {
  title: TitleMetadata;
  status: TitleStatus;
};

export type TmdbSearchResult = {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  voteAverage: number | null;
};

export type StatusPatch = {
  watchedBy?: Partial<StatusFlags>;
  wantToWatchBy?: Partial<StatusFlags>;
};
