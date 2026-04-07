"use client";

import { useState } from "react";

import { addTitle } from "@/lib/tracker/client-api";
import { useHousehold } from "@/components/household/household-context";
import { buildPosterUrl } from "@/lib/tracker/shared";
import type {
  AddTitleAction,
  TmdbSearchResult,
  TitleViewModel,
} from "@/lib/tracker/types";

export function SearchResultCard({
  item,
  onAdded,
}: {
  item: TmdbSearchResult;
  onAdded?: (record: TitleViewModel) => void;
}) {
  const { household } = useHousehold();
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSoloHousehold = (household?.members?.length ?? 1) <= 1;
  const titleName = item.name ?? item.title ?? "Untitled";
  const dateLabel = item.releaseDate ?? item.firstAirDate ?? null;
  const yearLabel = dateLabel ? new Date(dateLabel).getUTCFullYear() : null;
  const posterUrl = buildPosterUrl(item.posterPath ?? null);
  const actions = [
    { label: "Add title only", action: "add_title_only" as const },
    {
      label: "Add to my watchlist",
      action: "mark_user_wants_to_watch" as const,
    },
    { label: "Mark as watched", action: "mark_user_watched" as const },
    {
      label: "Add to household watchlist",
      action: "mark_household_wants_to_watch" as const,
    },
    ...(!isSoloHousehold
      ? ([
          {
            label: "Mark watched together",
            action: "mark_watched_together" as const,
          },
        ] as const)
      : []),
  ] as const;

  async function handleAdd(action: AddTitleAction) {
    setIsSaving(true);
    setError(null);

    try {
      const record = await addTitle({
        tmdbId: item.tmdbId,
        mediaType: item.mediaType,
        action,
        name: titleName,
        title: titleName,
        overview: item.overview,
        posterPath: item.posterPath ?? null,
        backdropPath: item.backdropPath ?? null,
        releaseDate: item.releaseDate ?? null,
        firstAirDate: item.firstAirDate ?? null,
        voteAverage: item.voteAverage ?? null,
      });
      onAdded?.(record);
      setExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add title.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded bg-slate-200">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={titleName}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
            {titleName}
          </h3>
          <p className="text-xs text-slate-500">
            {item.mediaType.toUpperCase()} · {yearLabel ?? "-"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
            {item.overview ?? ""}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void handleAdd("add_title_only")}
              disabled={isSaving}
              className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              Quick actions
            </button>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => void handleAdd(action.action)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </article>
  );
}
