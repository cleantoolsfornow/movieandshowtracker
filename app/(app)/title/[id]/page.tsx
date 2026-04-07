"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TitleStatusEditor } from "@/components/status/title-status-editor";
import { getTitleById, refreshTitleMetadata } from "@/lib/tracker/client-api";
import { buildPosterUrl } from "@/lib/tracker/shared";
import type { TitleViewModel } from "@/lib/tracker/types";

export default function TitleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<TitleViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingMetadata, setIsRefreshingMetadata] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const next = await getTitleById(id);
        if (!cancelled) {
          setRecord(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load title.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (id) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton className="h-12" />
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!record) {
    return (
      <EmptyStateCard
        title="Title not found"
        description="This title may have been removed."
      />
    );
  }

  const posterUrl = buildPosterUrl(record.posterPath ?? null, "w500");
  const titleYear = record.releaseDate
    ? new Date(record.releaseDate).getUTCFullYear()
    : record.firstAirDate
      ? new Date(record.firstAirDate).getUTCFullYear()
      : null;
  const isSoloHousehold = record.household.memberCount <= 1;

  async function handleRefreshMetadata() {
    if (!record) {
      return;
    }

    setIsRefreshingMetadata(true);
    setRefreshMessage(null);
    setError(null);

    try {
      const next = await refreshTitleMetadata(record.id);
      setRecord(next);
      setRefreshMessage("Metadata refreshed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh metadata.",
      );
    } finally {
      setIsRefreshingMetadata(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/library"
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to library
      </Link>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[220px_1fr]">
        <div className="overflow-hidden rounded-lg bg-slate-200">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={record.name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">
            {record.name}
          </h1>
          <p className="text-sm text-slate-500">
            {record.mediaType.toUpperCase()} · {titleYear ?? "-"}
          </p>
          <p className="text-sm leading-6 text-slate-700">{record.overview}</p>
          {record.genres && record.genres.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {record.genres.map((genre) => (
                <span
                  key={`${genre.id}-${genre.name}`}
                  className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-600"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          ) : null}
          <div className="pt-1">
            <a
              href="https://www.themoviedb.org/about/logos-attribution?language=en-GB"
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-col items-start gap-1 text-[11px] text-slate-400 hover:text-slate-500"
            >
              {/* Official TMDB attribution logo from themoviedb.org */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB"
                className="h-3 w-auto opacity-80"
              />
              <span>Uses TMDB data; not endorsed or certified by TMDB.</span>
            </a>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => void handleRefreshMetadata()}
              disabled={isRefreshingMetadata}
              className="text-xs text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700 disabled:opacity-60"
            >
              {isRefreshingMetadata
                ? "Refreshing metadata..."
                : "Refresh metadata"}
            </button>
            {refreshMessage ? (
              <p className="mt-1 text-xs text-emerald-700">{refreshMessage}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Household Summary
        </h2>
        <div className="mt-2 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <p>
            Household watchlist: {record.household.wantsToWatch ? "Yes" : "No"}
          </p>
          <p>
            Watched together:{" "}
            {isSoloHousehold
              ? "Hidden for solo household"
              : record.household.watchedTogether
                ? "Yes"
                : "No"}
          </p>
          <p>
            All members watched:{" "}
            {record.household.allMembersWatched ? "Yes" : "No"}
          </p>
        </div>
      </section>

      <TitleStatusEditor record={record} onUpdated={setRecord} />
    </div>
  );
}
