"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useHousehold } from "@/components/household/household-context";
import { PosterCard } from "@/components/library/poster-card";
import { listTitles } from "@/lib/tracker/client-api";
import type { TitleViewModel } from "@/lib/tracker/types";

type BaseFilter =
  | "all"
  | "my_wants_to_watch"
  | "my_watched"
  | "household_wants_to_watch"
  | "watched_together"
  | "all_members_watched"
  | "watched_by_anyone"
  | "not_watched_by_me";

type DynamicFilter =
  | BaseFilter
  | `member_watched:${string}`
  | `member_wants:${string}`;
type ApiFilter = Exclude<BaseFilter, "all">;

export function applyLocalLibraryFilter(
  records: TitleViewModel[],
  filter: DynamicFilter,
) {
  if (filter.startsWith("member_watched:")) {
    const userId = filter.slice("member_watched:".length);
    return records.filter(
      (record) =>
        record.members.find((member) => member.userId === userId)?.watched,
    );
  }
  if (filter.startsWith("member_wants:")) {
    const userId = filter.slice("member_wants:".length);
    return records.filter(
      (record) =>
        record.members.find((member) => member.userId === userId)?.wantsToWatch,
    );
  }
  return records;
}

function toApiFilter(
  filter: DynamicFilter,
  isMemberSpecificFilter: boolean,
): ApiFilter | undefined {
  if (isMemberSpecificFilter || filter === "all") {
    return undefined;
  }
  if (filter === "my_wants_to_watch") return filter;
  if (filter === "my_watched") return filter;
  if (filter === "household_wants_to_watch") return filter;
  if (filter === "watched_together") return filter;
  if (filter === "all_members_watched") return filter;
  if (filter === "watched_by_anyone") return filter;
  if (filter === "not_watched_by_me") return filter;
  return undefined;
}

export default function LibraryPage() {
  const { otherMembers, members } = useHousehold();
  const [records, setRecords] = useState<TitleViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [filter, setFilter] = useState<DynamicFilter>("all");
  const [sort, setSort] = useState<
    "recently_updated" | "release_date" | "alphabetical" | "recently_added"
  >("recently_updated");

  const isCompactHousehold = members.length <= 2;
  const isMemberSpecificFilter =
    filter.startsWith("member_watched:") || filter.startsWith("member_wants:");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const next = await listTitles({
          mediaType,
          sort,
          filter: toApiFilter(filter, isMemberSpecificFilter),
        });
        if (!cancelled) {
          setRecords(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load library.",
          );
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
  }, [filter, isMemberSpecificFilter, mediaType, sort]);

  const visibleRecords = useMemo(
    () => applyLocalLibraryFilter(records, filter),
    [filter, records],
  );

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Library</h1>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <select
            value={mediaType}
            onChange={(event) =>
              setMediaType(event.target.value as typeof mediaType)
            }
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="all">All types</option>
            <option value="movie">Movies</option>
            <option value="tv">TV shows</option>
          </select>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as DynamicFilter)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="all">All titles</option>
            <option value="my_wants_to_watch">My watchlist</option>
            <option value="my_watched">Watched by me</option>
            <option value="household_wants_to_watch">
              Household watchlist
            </option>
            <option value="watched_together">Watched together</option>
            <option value="all_members_watched">All members watched</option>
            <option value="watched_by_anyone">Watched by anyone</option>
            <option value="not_watched_by_me">Not watched by me</option>
            {isCompactHousehold
              ? otherMembers.flatMap((member) => [
                  <option
                    key={`w-${member.uid}`}
                    value={`member_watched:${member.uid}`}
                  >
                    Watched by {member.label}
                  </option>,
                  <option
                    key={`x-${member.uid}`}
                    value={`member_wants:${member.uid}`}
                  >
                    Wants to watch: {member.label}
                  </option>,
                ])
              : null}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="recently_updated">Recently updated</option>
            <option value="recently_added">Recently added</option>
            <option value="release_date">Release date</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <LoadingSkeleton key={index} className="aspect-[2/3]" />
          ))}
        </div>
      ) : null}

      {!isLoading && visibleRecords.length === 0 ? (
        <EmptyStateCard
          title="No titles found"
          description="Add titles from Search or relax filters in this view."
        />
      ) : null}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visibleRecords.map((record) => (
          <PosterCard key={record.id} record={record} />
        ))}
      </section>
    </div>
  );
}
