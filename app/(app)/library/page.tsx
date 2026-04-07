"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";
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

  const visibleRecords = useMemo(
    () => applyLocalLibraryFilter(records, filter),
    [filter, records],
  );
  const watchedTogetherRecords = useMemo(
    () => records.filter((record) => record.household.watchedTogether),
    [records],
  );
  const shouldShowSharedWatchCallout =
    !isSoloHousehold &&
    (filter === "watched_together" || (filter === "all" && watchedTogetherRecords.length > 0));
  const sharedWatchlistLabel = isSoloHousehold ? "My watchlist" : "Shared watchlist";
  const emptyState = emptyStateCopy();

  function filterLabel(value: DynamicFilter) {
    if (value === "all") return "All titles";
    if (value === "my_wants_to_watch") return "My watchlist";
    if (value === "my_watched") return "Watched by me";
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
        description: "Add titles from Search to start building your library.",
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
    <div className="space-y-4">
      <PageCard elevated>
        <SectionHeader
          title="Library"
          titleLevel="h1"
          titleClassName="text-2xl"
          description={
            isSoloHousehold
              ? "Browse your personal tracking views."
              : "Browse shared and personal views across your household."
          }
        />

        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-text-soft uppercase">
              Media type
            </p>
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

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-text-soft uppercase">
              Browse views
            </p>
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
                My watchlist
              </Button>
              <Button
                variant={filter === "my_watched" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter("my_watched")}
              >
                Watched by me
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
                    {isThreePlusHousehold
                      ? "Watched together (household event)"
                      : "Watched together"}
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
              ) : (
                <Button
                  variant={filter === "not_watched_by_me" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setFilter("not_watched_by_me")}
                >
                  Not watched by me
                </Button>
              )}
            </div>
          </div>

          {!isSoloHousehold && otherMembers.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-text-soft uppercase">
                Member focus
              </p>
              <div className="flex flex-wrap gap-2">
                {otherMembers.map((member) => (
                  <Button
                    key={`member-watched-${member.uid}`}
                    variant={
                      selectedMemberWatchedId === member.uid ? "primary" : "secondary"
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
                      selectedMemberWantsId === member.uid ? "primary" : "secondary"
                    }
                    size="sm"
                    onClick={() => setFilter(`member_wants:${member.uid}`)}
                  >
                    Wants to watch: {member.label}
                  </Button>
                ))}
                {isMemberSpecificFilter ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    Clear member focus
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-text-soft uppercase">
              Sort
            </p>
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

          <div className="flex flex-wrap gap-2">
            <Chip tone="muted" className="text-xs">
              View: {filterLabel(filter)}
            </Chip>
            <Chip tone="muted" className="text-xs">
              {mediaType === "all"
                ? "All media"
                : mediaType === "movie"
                  ? "Movies only"
                  : "TV only"}
            </Chip>
          </div>
        </div>
      </PageCard>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
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

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visibleRecords.map((record) => (
          <PosterCard key={record.id} record={record} />
        ))}
      </section>
    </div>
  );
}
