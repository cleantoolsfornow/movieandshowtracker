"use client";

import { useEffect, useState } from "react";

import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useHousehold } from "@/components/household/household-context";
import { PosterCard } from "@/components/library/poster-card";
import { listTitles } from "@/lib/tracker/client-api";
import type { TitleRecord } from "@/lib/tracker/types";

export default function LibraryPage() {
  const { personLabels } = useHousehold();
  const [records, setRecords] = useState<TitleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [watchedBy, setWatchedBy] = useState<"all" | "memberOne" | "memberTwo" | "together">(
    "all",
  );
  const [wantBy, setWantBy] = useState<"all" | "memberOne" | "memberTwo" | "together">("all");
  const [sort, setSort] = useState<"updated" | "release" | "alpha">("updated");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const next = await listTitles({ mediaType, watchedBy, wantBy, sort });
        if (!cancelled) {
          setRecords(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load library.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [mediaType, sort, wantBy, watchedBy]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Library</h1>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <select
            value={mediaType}
            onChange={(event) => setMediaType(event.target.value as typeof mediaType)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="all">All types</option>
            <option value="movie">Movies</option>
            <option value="tv">TV shows</option>
          </select>
          <select
            value={watchedBy}
            onChange={(event) => setWatchedBy(event.target.value as typeof watchedBy)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="all">Any watched</option>
            <option value="memberOne">Watched by {personLabels.memberOne}</option>
            <option value="memberTwo">Watched by {personLabels.memberTwo}</option>
            <option value="together">Watched together</option>
          </select>
          <select
            value={wantBy}
            onChange={(event) => setWantBy(event.target.value as typeof wantBy)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="all">Any watchlist</option>
            <option value="memberOne">Wanted by {personLabels.memberOne}</option>
            <option value="memberTwo">Wanted by {personLabels.memberTwo}</option>
            <option value="together">Want together</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="updated">Recently updated</option>
            <option value="release">Release year</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <LoadingSkeleton key={index} className="aspect-[2/3]" />
          ))}
        </div>
      ) : null}

      {!isLoading && records.length === 0 ? (
        <EmptyStateCard
          title="No titles found"
          description="Add titles from Search or relax filters in this view."
        />
      ) : null}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {records.map((record) => (
          <PosterCard key={record.title.id} record={record} />
        ))}
      </section>
    </div>
  );
}
