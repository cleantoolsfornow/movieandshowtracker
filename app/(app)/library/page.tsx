"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SharedWatchCallout } from "@/components/common/shared-watch-callout";
import { useHousehold } from "@/components/household/household-context";
import { PosterCard } from "@/components/library/poster-card";
import { useTitlesQuery } from "@/lib/tracker/queries";
import type { TitleViewModel } from "@/lib/tracker/types";

type BaseFilter =
  | "all"
  | "my_wants_to_watch"
  | "my_watched"
  | "household_wants_to_watch"
  | "watched_together"
  | "all_members_watched"
  | "partially_watched"
  | "multiple_members_want_to_watch"
  | "watched_by_anyone"
  | "not_watched_by_me";

type DynamicFilter =
  | BaseFilter
  | `member_watched:${string}`
  | `member_wants:${string}`;
type ApiFilter =
  | "my_wants_to_watch"
  | "my_watched"
  | "household_wants_to_watch"
  | "watched_together"
  | "all_members_watched"
  | "watched_by_anyone"
  | "not_watched_by_me";
type MediaFilter = "all" | "movie" | "tv";
type SortFilter =
  | "recently_updated"
  | "release_date"
  | "alphabetical"
  | "recently_added";

function shouldShowInLibrary(record: TitleViewModel) {
  return (
    record.household.wantsToWatch ||
    record.household.watchedTogether ||
    record.household.watchedCount > 0 ||
    record.household.wantsToWatchCount > 0 ||
    record.currentUser.watched ||
    record.currentUser.wantsToWatch
  );
}

export function applyLocalLibraryFilter(
  records: TitleViewModel[],
  filter: DynamicFilter,
) {
  if (filter === "partially_watched") {
    return records.filter((record) => record.household.someMembersWatched);
  }
  if (filter === "multiple_members_want_to_watch") {
    return records.filter((record) => record.household.multipleMembersWantToWatch);
  }
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
  if (filter === "partially_watched") return undefined;
  if (filter === "multiple_members_want_to_watch") return undefined;
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
  const { otherMembers, memberCount, isSoloHousehold, isThreePlusHousehold } =
    useHousehold();

  const [mediaType, setMediaType] = useState<MediaFilter>("all");
  const [filter, setFilter] = useState<DynamicFilter>("all");
  const [sort, setSort] = useState<SortFilter>("recently_updated");

  const isMemberSpecificFilter =
    filter.startsWith("member_watched:") || filter.startsWith("member_wants:");
  const selectedMemberWatchedId = filter.startsWith("member_watched:")
    ? filter.slice("member_watched:".length)
    : null;
  const selectedMemberWantsId = filter.startsWith("member_wants:")
    ? filter.slice("member_wants:".length)
    : null;
  const memberFocusLabel = useMemo(() => {
    if (selectedMemberWatchedId) {
      const member = otherMembers.find((item) => item.uid === selectedMemberWatchedId);
      return `Watched by ${member?.label ?? "member"}`;
    }
    if (selectedMemberWantsId) {
      const member = otherMembers.find((item) => item.uid === selectedMemberWantsId);
      return `Wants to watch: ${member?.label ?? "member"}`;
    }
    return null;
  }, [otherMembers, selectedMemberWatchedId, selectedMemberWantsId]);

  const {
    data,
    isLoading,
    error,
  } = useTitlesQuery({
    mediaType,
    sort,
    filter: toApiFilter(filter, isMemberSpecificFilter),
  });
  const records = useMemo(() => data ?? [], [data]);
  const statusTrackedRecords = useMemo(
    () => records.filter(shouldShowInLibrary),
    [records],
  );

  const visibleRecords = useMemo(
    () => applyLocalLibraryFilter(statusTrackedRecords, filter),
    [filter, statusTrackedRecords],
  );
  const watchedTogetherRecords = useMemo(
    () =>
      statusTrackedRecords.filter((record) => record.household.watchedTogether),
    [statusTrackedRecords],
  );
  const hasCustomSelection =
    mediaType !== "all" || filter !== "all" || sort !== "recently_updated";
  const mediaLabel =
    mediaType === "all"
      ? "All media"
      : mediaType === "movie"
        ? "Movies only"
        : "TV only";
  const sortLabel =
    sort === "recently_updated"
      ? "Recently updated"
      : sort === "recently_added"
        ? "Recently added"
        : sort === "release_date"
          ? "Release date"
          : "Alphabetical";
  const shouldShowSharedWatchCallout =
    !isSoloHousehold &&
    (filter === "watched_together" || (filter === "all" && watchedTogetherRecords.length > 0));
  const sharedWatchlistLabel = isSoloHousehold ? "Want to watch" : "Shared watchlist";
  const emptyState = emptyStateCopy();

  function filterLabel(value: DynamicFilter) {
    if (value === "all") return "All titles";
    if (value === "my_wants_to_watch") return "Want to watch";
    if (value === "my_watched") return isSoloHousehold ? "Watched" : "Watched by me";
    if (value === "household_wants_to_watch") return sharedWatchlistLabel;
    if (value === "watched_together") {
      return isThreePlusHousehold
        ? "Watched together (household event)"
        : "Watched together";
    }
    if (value === "all_members_watched") {
      return memberCount === 2 ? "Both watched" : "All members watched";
    }
    if (value === "partially_watched") return "Partially watched";
    if (value === "multiple_members_want_to_watch") return "Multiple members want";
    if (value === "watched_by_anyone") return "Watched by anyone";
    if (value === "not_watched_by_me") return "Not watched by me";
    if (value.startsWith("member_watched:")) return memberFocusLabel ?? "Watched by member";
    if (value.startsWith("member_wants:")) return memberFocusLabel ?? "Wants to watch: member";
    return "Filtered";
  }

  function emptyStateCopy() {
    const selectedLabel = filterLabel(filter);
    if (filter === "all") {
      return {
        title: "No titles yet",
        description: "Save titles from Search to start building your library.",
      };
    }
    if (isSoloHousehold) {
      return {
        title: "No matches in this view",
        description: `${selectedLabel} has no titles yet. Try another filter or add a title from Search.`,
      };
    }
    return {
      title: "No matches for this filter",
      description: `${selectedLabel} has no titles right now. Try another filter, sort order, or member focus.`,
    };
  }

  return (
    <div className="space-y-5">
      <div className="-mx-4 -mt-6 md:mx-0 md:mt-0">
        <details className="group rounded-none border-0 bg-surface/72 px-3 py-2 shadow-soft md:rounded-2xl md:border md:border-border-subtle/85 md:p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="hidden text-[11px] font-semibold tracking-[0.18em] text-text-soft uppercase sm:block">
                Filters
              </p>
              <Chip tone="muted" className="text-xs">
                <span className="hidden sm:inline">View: </span>
                {filterLabel(filter)}
              </Chip>
              <Chip tone="muted" className="text-xs">
                {mediaLabel}
              </Chip>
              <Chip tone="muted" className="text-xs">
                <span className="hidden sm:inline">Sort: </span>
                {sortLabel}
              </Chip>
            </div>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle/70 text-text-soft transition-colors group-hover:border-border-subtle">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 ease-out group-open:rotate-180"
              >
                <path
                  d="M5 8l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </summary>

          <div className="mt-3 space-y-3 border-t border-border-subtle/70 pt-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-start">
              <div className="min-w-0 md:w-28">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-text-soft uppercase">
                  Media
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["all", "All types"],
                  ["movie", "Movies"],
                  ["tv", "TV shows"],
                ] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    variant={mediaType === value ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setMediaType(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t border-border-subtle/70 pt-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start">
                <div className="min-w-0 md:w-28">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-text-soft uppercase">
                    View
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filter === "all" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All titles
                  </Button>
                  <Button
                    variant={filter === "my_wants_to_watch" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilter("my_wants_to_watch")}
                  >
                    Want to watch
                  </Button>
                  <Button
                    variant={filter === "my_watched" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilter("my_watched")}
                  >
                    {isSoloHousehold ? "Watched" : "Watched by me"}
                  </Button>
                  {!isSoloHousehold ? (
                    <>
                      <Button
                        variant={filter === "household_wants_to_watch" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setFilter("household_wants_to_watch")}
                      >
                        Shared watchlist
                      </Button>
                      <Button
                        variant={filter === "watched_together" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setFilter("watched_together")}
                      >
                        Watched together
                      </Button>
                      <Button
                        variant={filter === "all_members_watched" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setFilter("all_members_watched")}
                      >
                        {memberCount === 2 ? "Both watched" : "All members watched"}
                      </Button>
                      <Button
                        variant={filter === "partially_watched" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setFilter("partially_watched")}
                      >
                        Partially watched
                      </Button>
                      <Button
                        variant={
                          filter === "multiple_members_want_to_watch"
                            ? "primary"
                            : "secondary"
                        }
                        size="sm"
                        onClick={() => setFilter("multiple_members_want_to_watch")}
                      >
                        Multiple members want
                      </Button>
                      <Button
                        variant={filter === "watched_by_anyone" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setFilter("watched_by_anyone")}
                      >
                        Watched by anyone
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {!isSoloHousehold && otherMembers.length > 0 ? (
              <div className="border-t border-border-subtle/70 pt-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-start">
                  <div className="min-w-0 md:w-28">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-text-soft uppercase">
                      Members
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {otherMembers.map((member) => (
                      <Button
                        key={`member-watched-${member.uid}`}
                        variant={
                          selectedMemberWatchedId === member.uid
                            ? "primary"
                            : "secondary"
                        }
                        size="sm"
                        onClick={() => setFilter(`member_watched:${member.uid}`)}
                      >
                        Watched by {member.label}
                      </Button>
                    ))}
                    {otherMembers.map((member) => (
                      <Button
                        key={`member-wants-${member.uid}`}
                        variant={
                          selectedMemberWantsId === member.uid
                            ? "primary"
                            : "secondary"
                        }
                        size="sm"
                        onClick={() => setFilter(`member_wants:${member.uid}`)}
                      >
                        Wants: {member.label}
                      </Button>
                    ))}
                    {isMemberSpecificFilter ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilter("all")}
                      >
                        Clear focus
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="border-t border-border-subtle/70 pt-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start">
                <div className="min-w-0 md:w-28">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-text-soft uppercase">
                    Sort
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    ["recently_updated", "Recently updated"],
                    ["recently_added", "Recently added"],
                    ["release_date", "Release date"],
                    ["alphabetical", "Alphabetical"],
                  ] as const).map(([value, label]) => (
                    <Button
                      key={value}
                      variant={sort === value ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setSort(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {hasCustomSelection ? (
              <div className="border-t border-border-subtle/70 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMediaType("all");
                    setFilter("all");
                    setSort("recently_updated");
                  }}
                >
                  Reset filters
                </Button>
              </div>
            ) : null}
          </div>
        </details>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200/85 bg-red-50/80 p-3 text-sm text-red-700">
          {error instanceof Error ? error.message : "Failed to load library."}
        </p>
      ) : null}

      {shouldShowSharedWatchCallout ? (
        <SharedWatchCallout
          memberCount={memberCount}
          watchedTogetherAt={watchedTogetherRecords[0]?.household.watchedTogetherAt}
        />
      ) : null}

      {isLoading ? (
        <div className="app-stagger grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <LoadingSkeleton key={index} className="aspect-[2/3]" rounded="xl" />
          ))}
        </div>
      ) : null}

      {!isLoading && visibleRecords.length === 0 ? (
        <EmptyStateCard
          title={emptyState.title}
          description={emptyState.description}
          actionLabel="Go to Search"
          actionHref="/search"
          actionVariant="secondary"
        />
      ) : null}

      <section className="app-stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visibleRecords.map((record) => (
          <PosterCard key={record.id} record={record} />
        ))}
      </section>
    </div>
  );
}
