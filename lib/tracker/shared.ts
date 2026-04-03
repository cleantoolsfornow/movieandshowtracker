import type { MediaType, StatusFlags, StatusPatch } from "@/lib/tracker/types";

export function createTitleKey(
  householdId: string,
  mediaType: MediaType,
  tmdbId: number,
): string {
  return `${householdId}_${mediaType}_${tmdbId}`;
}

export function defaultStatusFlags(): StatusFlags {
  return {
    matt: false,
    jessica: false,
    together: false,
  };
}

export function buildPosterUrl(path: string | null, size = "w342") {
  if (!path) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function mergeStatusPatch(
  current: { watchedBy: StatusFlags; wantToWatchBy: StatusFlags },
  patch: StatusPatch,
) {
  return {
    watchedBy: { ...current.watchedBy, ...(patch.watchedBy ?? {}) },
    wantToWatchBy: { ...current.wantToWatchBy, ...(patch.wantToWatchBy ?? {}) },
  };
}
