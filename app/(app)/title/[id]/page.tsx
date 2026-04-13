"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";
import { SharedWatchCallout } from "@/components/common/shared-watch-callout";
import { TitleStatusEditor } from "@/components/status/title-status-editor";
import { refreshTitleMetadata } from "@/lib/tracker/client-api";
import {
  invalidateTitlesQuery,
  titleQueryKey,
  useTitleQuery,
} from "@/lib/tracker/queries";
import { buildPosterUrl } from "@/lib/tracker/shared";
import { getTitleMemberLabel } from "@/components/household/member-display";

export default function TitleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: record, isLoading, error } = useTitleQuery(id);
  const [isRefreshingMetadata, setIsRefreshingMetadata] = useState(false);
  const [refreshSuccessMessage, setRefreshSuccessMessage] = useState<
    string | null
  >(null);
  const [refreshErrorMessage, setRefreshErrorMessage] = useState<string | null>(
    null,
  );
  const [isPosterLightboxOpen, setIsPosterLightboxOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton className="h-12" rounded="xl" />
        <LoadingSkeleton className="h-64" rounded="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error instanceof Error ? error.message : "Failed to load title."}
      </p>
    );
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
  const backdropUrl = buildPosterUrl(record.backdropPath ?? null, "w780");
  const titleYear = record.releaseDate
    ? new Date(record.releaseDate).getUTCFullYear()
    : record.firstAirDate
      ? new Date(record.firstAirDate).getUTCFullYear()
      : null;
  const isSoloHousehold = record.household.memberCount <= 1;
  const isTwoMemberHousehold = record.household.memberCount === 2;
  const isThreePlusHousehold = record.household.memberCount >= 3;
  const watchedTogetherParticipantLabels =
    record.household.watchedTogetherParticipantUserIds
      ?.map((participantUserId) => {
        const member = record.members.find(
          (entry) => entry.userId === participantUserId,
        );
        return member
          ? getTitleMemberLabel(member, record.currentUser.userId)
          : undefined;
      })
      .filter((value): value is string => Boolean(value));

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isPosterLightboxOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPosterLightboxOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isPosterLightboxOpen]);

  async function handleRefreshMetadata() {
    if (!record) {
      return;
    }

    setIsRefreshingMetadata(true);
    setRefreshSuccessMessage(null);
    setRefreshErrorMessage(null);

    try {
      const next = await refreshTitleMetadata(record.id);
      queryClient.setQueryData(titleQueryKey(record.id), next);
      void invalidateTitlesQuery(queryClient);
      setRefreshSuccessMessage("Metadata refreshed.");
    } catch (err) {
      setRefreshErrorMessage(
        err instanceof Error ? err.message : "Failed to refresh metadata.",
      );
    } finally {
      setIsRefreshingMetadata(false);
    }
  }

  return (
    <div className="space-y-5 max-md:-mt-3 max-md:space-y-2">
      <Button asChild variant="secondary" size="sm">
        <Link href="/library">← Back to library</Link>
      </Button>

      <PageCard className="-mx-4 relative overflow-hidden p-0 md:mx-0 max-md:rounded-none max-md:border-0 max-md:ring-0">
        {backdropUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backdropUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/70 to-slate-900/35" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(42,99,255,0.28),transparent_55%),radial-gradient(circle_at_90%_95%,rgba(21,122,110,0.2),transparent_60%)]" />
        )}
        <div className="relative grid gap-4 p-4 md:grid-cols-[220px_1fr] md:p-6">
          {posterUrl ? (
            <button
              type="button"
              onClick={() => setIsPosterLightboxOpen(true)}
              className="overflow-hidden rounded-xl border border-white/15 bg-surface-muted text-left shadow-elevated"
              aria-label="Open poster full screen"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterUrl}
                alt={record.name}
                className="w-full max-md:max-h-[200px] max-md:object-contain md:h-full md:w-full md:object-cover"
              />
            </button>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/15 bg-surface-muted shadow-elevated">
              <div className="flex h-full min-h-72 flex-col items-center justify-center gap-2 bg-surface-muted text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-surface text-base font-semibold text-text-muted">
                  {record.name.slice(0, 1).toUpperCase()}
                </span>
                <p className="text-sm text-text-muted">Poster unavailable</p>
              </div>
            </div>
          )}
          <div className="space-y-3 text-white">
            <SectionHeader
              title={record.name}
              titleLevel="h1"
              titleClassName="text-3xl text-white md:text-4xl"
            />
            <p className="text-sm text-white/75">
              {record.mediaType.toUpperCase()} · {titleYear ?? "-"}
            </p>
            <p className="text-sm leading-6 text-white/90">{record.overview}</p>

            <div className="flex flex-wrap gap-2">
              {typeof record.runtime === "number" ? (
                <Chip tone="muted" className="border-white/20 bg-white/10 text-xs text-white">
                  Runtime: {record.runtime} min
                </Chip>
              ) : null}
              {typeof record.numberOfSeasons === "number" ? (
                <Chip tone="muted" className="border-white/20 bg-white/10 text-xs text-white">
                  Seasons: {record.numberOfSeasons}
                </Chip>
              ) : null}
              {typeof record.voteAverage === "number" ? (
                <Chip tone="muted" className="border-white/20 bg-white/10 text-xs text-white">
                  TMDB: {record.voteAverage.toFixed(1)}
                </Chip>
              ) : null}
              {record.releaseDate ? (
                <Chip tone="muted" className="border-white/20 bg-white/10 text-xs text-white">
                  Released: {record.releaseDate}
                </Chip>
              ) : null}
            </div>

            {record.genres && record.genres.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {record.genres.map((genre) => (
                  <Chip
                    key={`${genre.id}-${genre.name}`}
                    tone="muted"
                    className="border-white/20 bg-white/10 text-xs text-white"
                  >
                    {genre.name}
                  </Chip>
                ))}
              </div>
            ) : null}

            <div className="pt-1">
              <Button
                onClick={() => void handleRefreshMetadata()}
                disabled={isRefreshingMetadata}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/15 hover:text-white"
              >
                {isRefreshingMetadata
                  ? "Refreshing metadata..."
                  : "Refresh metadata"}
              </Button>
              {refreshSuccessMessage ? (
                <p className="mt-1 text-xs text-emerald-200">
                  {refreshSuccessMessage}
                </p>
              ) : null}
              {refreshErrorMessage ? (
                <p className="mt-1 text-xs text-rose-200">
                  {refreshErrorMessage}
                </p>
              ) : null}
            </div>

            <a
              href="https://www.themoviedb.org/about/logos-attribution?language=en-GB"
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-col items-start gap-1 text-[11px] text-white/70 hover:text-white/90"
            >
              {/* Official TMDB attribution logo from themoviedb.org */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB"
                className="h-3 w-auto opacity-90"
              />
              <span>Uses TMDB data; not endorsed or certified by TMDB.</span>
            </a>
          </div>
        </div>
      </PageCard>

      {isSoloHousehold ? (
        <PageCard className="-mx-4 p-5 md:mx-0 max-md:rounded-none max-md:border-0 max-md:ring-0">
          <SectionHeader
            title="Personal Summary"
            titleLevel="h2"
            titleClassName="app-kicker text-sm"
            description="Your current status for this title."
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip tone={record.currentUser.watched ? "success" : "muted"} className="text-xs">
              Watched by me: {record.currentUser.watched ? "Yes" : "No"}
            </Chip>
            <Chip tone={record.currentUser.wantsToWatch ? "accent" : "muted"} className="text-xs">
              Want to watch: {record.currentUser.wantsToWatch ? "Yes" : "No"}
            </Chip>
          </div>
        </PageCard>
      ) : (
        <PageCard className="-mx-4 p-5 md:mx-0 max-md:rounded-none max-md:border-0 max-md:ring-0">
          <SectionHeader
            title="Household Summary"
            titleLevel="h2"
            titleClassName="app-kicker text-sm"
            description="Shared state is separate from per-member completion."
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip
              tone={record.household.wantsToWatch ? "accent" : "muted"}
              className="text-xs"
            >
              Shared watchlist: {record.household.wantsToWatch ? "Yes" : "No"}
            </Chip>
            <Chip
              tone={record.household.watchedTogether ? "success" : "muted"}
              className="text-xs"
            >
              {record.household.watchedTogetherParticipantsKnown &&
              record.household.watchedTogetherParticipantCount >= 2
                ? isTwoMemberHousehold
                  ? "Watched together"
                  : `${record.household.watchedTogetherParticipantCount} watched together`
                : isThreePlusHousehold
                  ? "Watched together (unknown participants)"
                  : "Watched together"}
              : {record.household.watchedTogether ? "Yes" : "No"}
            </Chip>
            <Chip
              tone={record.household.allMembersWatched ? "accent" : "muted"}
              className="text-xs"
            >
              {isTwoMemberHousehold ? "Both watched" : "All members watched"}:{" "}
              {record.household.allMembersWatched ? "Yes" : "No"}
            </Chip>
            {record.household.someMembersWatched ? (
              <Chip tone="accent" className="text-xs">
                Partially watched
              </Chip>
            ) : null}
          </div>
          {record.household.watchedTogether ? (
            <SharedWatchCallout
              memberCount={record.household.memberCount}
              watchedTogetherAt={record.household.watchedTogetherAt}
              participantsKnown={
                record.household.watchedTogetherParticipantsKnown
              }
              participantCount={
                record.household.watchedTogetherParticipantCount
              }
              participantLabels={watchedTogetherParticipantLabels}
              className="mt-3"
            />
          ) : isThreePlusHousehold ? (
            <p className="mt-1 text-xs text-text-soft">
              For 3+ households, watched together stays separate from all-members-watched and may still have legacy rows without recorded participants.
            </p>
          ) : null}
        </PageCard>
      )}

      <TitleStatusEditor
        record={record}
        onUpdated={(next) => {
          queryClient.setQueryData(titleQueryKey(next.id), next);
        }}
      />

      {posterUrl && isPosterLightboxOpen && isClient
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${record.name} poster`}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-2 sm:p-4"
              onClick={() => setIsPosterLightboxOpen(false)}
            >
              <button
                type="button"
                className="absolute top-3 right-3 rounded-full border border-white/35 bg-black/45 px-3 py-1 text-sm font-semibold text-white hover:bg-black/65"
                onClick={() => setIsPosterLightboxOpen(false)}
                aria-label="Close poster lightbox"
              >
                Close
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterUrl}
                alt={record.name}
                className="max-h-[100dvh] max-w-[100vw] object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
