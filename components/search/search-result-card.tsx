"use client";

import { useState } from "react";

import { addTitle } from "@/lib/tracker/client-api";
import { buildPosterUrl } from "@/lib/tracker/shared";
import type {
  StatusPatch,
  TmdbSearchResult,
  TitleRecord,
} from "@/lib/tracker/types";

const ACTIONS = [
  { label: "Watched by Matt", patch: { watchedBy: { matt: true } } },
  { label: "Watched by Jessica", patch: { watchedBy: { jessica: true } } },
  { label: "Watched together", patch: { watchedBy: { together: true } } },
  { label: "Want Matt", patch: { wantToWatchBy: { matt: true } } },
  { label: "Want Jessica", patch: { wantToWatchBy: { jessica: true } } },
  { label: "Want together", patch: { wantToWatchBy: { together: true } } },
] as const;

export function SearchResultCard({
  item,
  onAdded,
}: {
  item: TmdbSearchResult;
  onAdded?: (record: TitleRecord) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const posterUrl = buildPosterUrl(item.posterPath);

  async function handleAdd(statusPatch: StatusPatch) {
    setIsSaving(true);
    setError(null);

    try {
      const record = await addTitle({
        ...item,
        voteAverage: item.voteAverage,
        statusPatch,
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
            <img src={posterUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{item.title}</h3>
          <p className="text-xs text-slate-500">
            {item.mediaType.toUpperCase()} · {item.releaseYear ?? "-"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.overview}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void handleAdd({})}
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
          {ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => void handleAdd(action.patch)}
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
