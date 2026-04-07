"use client";

import Link from "next/link";
import { useMemo } from "react";

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

function Section({
  title,
  description,
  records,
}: {
  title: string;
  description?: string;
  records: TitleViewModel[];
}) {
  if (records.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <SectionHeader title={title} titleLevel="h2" description={description} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {records.slice(0, 6).map((record) => (
          <PosterCard key={record.id} record={record} />
        ))}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <PageCard className="space-y-1 p-3">
      <p className="text-xs font-semibold tracking-wide text-text-soft uppercase">
        {label}
      </p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-text-muted">{hint}</p>
    </PageCard>
  );
}

export default function HomePage() {
  const {
    household,
    memberCount,
    isSoloHousehold,
    isTwoMemberHousehold,
    isThreePlusHousehold,
  } = useHousehold();
  const { data, isLoading, error } = useTitlesQuery({
    sort: "recently_updated",
  });
  const records = useMemo(() => data ?? [], [data]);

  const recentlyAdded = useMemo(() => records.slice(0, 8), [records]);
  const myWatchlist = useMemo(
    () => records.filter((record) => record.currentUser.wantsToWatch),
    [records],
  );
  const recentlyWatchedByMe = useMemo(
    () => records.filter((record) => record.currentUser.watched),
    [records],
  );
  const householdWatchlist = useMemo(
    () => records.filter((record) => record.household.wantsToWatch),
    [records],
  );
  const watchedTogether = useMemo(
    () => records.filter((record) => record.household.watchedTogether),
    [records],
  );
  const allMembersWatched = useMemo(
    () => records.filter((record) => record.household.allMembersWatched),
    [records],
  );
  const partiallyWatched = useMemo(
    () => records.filter((record) => record.household.someMembersWatched),
    [records],
  );
  const bothWantToWatch = useMemo(
    () =>
      records.filter(
        (record) => isTwoMemberHousehold && record.household.wantsToWatchCount === 2,
      ),
    [isTwoMemberHousehold, records],
  );
  const multipleMembersWantToWatch = useMemo(
    () =>
      records.filter((record) => record.household.multipleMembersWantToWatch),
    [records],
  );
  const householdName = household?.name?.trim() || "Household";

  return (
    <div className="space-y-6">
      <PageCard elevated>
        <SectionHeader
          title={
            isSoloHousehold
              ? "Welcome back"
              : `Welcome back to ${householdName}`
          }
          titleLevel="h1"
          titleClassName="text-3xl"
          description={
            isSoloHousehold
              ? "Your tracker, organized for quick decisions."
              : `A shared snapshot for ${memberCount} members.`
          }
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip tone="muted" className="text-xs">
            {isSoloHousehold
              ? "Solo household"
              : isTwoMemberHousehold
                ? "Two-member household"
                : "3+ member household"}
          </Chip>
          {!isSoloHousehold ? (
            <Chip tone="muted" className="text-xs">
              Shared watchlist + personal tracking
            </Chip>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/search"
            className="rounded-xl border border-accent bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast hover:border-accent-strong hover:bg-accent-strong"
          >
            Quick add
          </Link>
          <Link
            href="/library"
            className="rounded-xl border border-border-strong/45 bg-surface px-3.5 py-2 text-sm font-medium text-text-muted hover:bg-surface-muted hover:text-foreground"
          >
            Browse library
          </Link>
        </div>
      </PageCard>

      {!isSoloHousehold && watchedTogether.length > 0 ? (
        <SharedWatchCallout
          memberCount={memberCount}
          watchedTogetherAt={watchedTogether[0]?.household.watchedTogetherAt}
        />
      ) : null}

      {!isLoading ? (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {isSoloHousehold ? (
            <>
              <SummaryCard
                label="My watchlist"
                value={myWatchlist.length}
                hint="Titles you marked to watch."
              />
              <SummaryCard
                label="Watched by me"
                value={recentlyWatchedByMe.length}
                hint="Personal watched titles."
              />
              <SummaryCard
                label="Recently added"
                value={recentlyAdded.length}
                hint="Most recent additions."
              />
              <SummaryCard
                label="Library total"
                value={records.length}
                hint="All titles in your household library."
              />
            </>
          ) : isTwoMemberHousehold ? (
            <>
              <SummaryCard
                label="Both want to watch"
                value={bothWantToWatch.length}
                hint="Both members marked want to watch."
              />
              <SummaryCard
                label="Shared watchlist"
                value={householdWatchlist.length}
                hint="Titles in the household watchlist."
              />
              <SummaryCard
                label="Watched together"
                value={watchedTogether.length}
                hint="Explicit together-watch household events."
              />
              <SummaryCard
                label="Partially watched"
                value={partiallyWatched.length}
                hint="One member watched, one has not."
              />
            </>
          ) : (
            <>
              <SummaryCard
                label="Shared watchlist"
                value={householdWatchlist.length}
                hint="Titles in the household watchlist."
              />
              <SummaryCard
                label="All members watched"
                value={allMembersWatched.length}
                hint="Every member has watched."
              />
              <SummaryCard
                label="Partially watched"
                value={partiallyWatched.length}
                hint="At least one watched, not all members."
              />
              <SummaryCard
                label="Multiple members want"
                value={multipleMembersWantToWatch.length}
                hint="Two or more members want to watch."
              />
            </>
          )}
        </section>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error instanceof Error ? error.message : "Failed to load home."}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="aspect-[2/3]" rounded="xl" />
          ))}
        </div>
      ) : null}

      {!isLoading && records.length === 0 ? (
        <EmptyStateCard
          title="No titles yet"
          description="Start by adding a movie or show from the Search page."
          actionLabel="Go to Search"
          actionHref="/search"
          actionVariant="primary"
        />
      ) : null}

      {isTwoMemberHousehold ? (
        <>
          <Section
            title="Both want to watch"
            description="Titles both members marked want to watch."
            records={bothWantToWatch}
          />
          <Section
            title="Shared watchlist"
            description="Household-level saved titles."
            records={householdWatchlist}
          />
          <Section
            title="Recently watched together"
            description="Explicit shared-watch events."
            records={watchedTogether}
          />
        </>
      ) : null}

      {isThreePlusHousehold ? (
        <>
          <Section title="Shared watchlist" records={householdWatchlist} />
          <Section title="All members watched" records={allMembersWatched} />
          <Section title="Partially watched" records={partiallyWatched} />
          <Section
            title="Recent household watch events"
            description="Watched together is tracked as a household event. Participants are not tracked yet."
            records={watchedTogether}
          />
        </>
      ) : null}

      <Section title="My watchlist" records={myWatchlist} />
      <Section title="Recently watched" records={recentlyWatchedByMe} />
      <Section title="Recently added" records={recentlyAdded} />
    </div>
  );
}
