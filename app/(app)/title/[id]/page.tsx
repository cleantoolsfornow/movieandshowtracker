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
import { useToast } from "@/components/common/toast";
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
  const { showToast } = useToast();
  const { data: record, isLoading, error } = useTitleQuery(id);
  const [isRefreshingMetadata, setIsRefreshingMetadata] = useState(false);
  const [refreshErrorMessage, setRefreshErrorMessage] = useState<string | null>(
    null,
  );
  const [isPosterLightboxOpen, setIsPosterLightboxOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
  const activePersonalStatusChips = [
    record.currentUser.watched
      ? { label: "Watched", tone: "success" as const }
      : null,
    record.currentUser.wantsToWatch
      ? { label: "Want to watch", tone: "accent" as const }
      : null,
  ].filter((value): value is { label: string; tone: "success" | "accent" } =>
    Boolean(value),
  );

  async function handleRefreshMetadata() {
    if (!record) {
      return;
    }

    setIsRefreshingMetadata(true);
    setRefreshErrorMessage(null);

    try {
      const next = await refreshTitleMetadata(record.id);
      queryClient.setQueryData(titleQueryKey(record.id), next);
      void invalidateTitlesQuery(queryClient);
      showToast("Metadata refreshed.");
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/library">← Back to library</Link>
        </Button>
        {activePersonalStatusChips.length > 0 ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {activePersonalStatusChips.map((chip) => (
              <Chip key={chip.label} tone={chip.tone} className="text-xs">
                {chip.label}: Yes
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      <PageCard className="relative -mx-4 overflow-hidden p-0 ring-black/28 [background:none] max-md:rounded-none max-md:border-0 max-md:ring-0 md:mx-0">
        {backdropUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backdropUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover brightness-[0.58] saturate-[1.18]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(106deg,rgba(10,17,31,0.95)_0%,rgba(12,20,36,0.88)_46%,rgba(16,28,45,0.72)_72%,rgba(22,34,51,0.44)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-black/26" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(58,122,255,0.34),transparent_52%),radial-gradient(circle_at_88%_94%,rgba(25,150,125,0.28),transparent_58%),linear-gradient(120deg,rgba(12,20,36,0.95),rgba(18,31,48,0.88))]" />
        )}
        <div className="relative grid gap-4 p-4 md:grid-cols-[220px_1fr] md:p-6">
          {posterUrl ? (
            <button
              type="button"
              onClick={() => setIsPosterLightboxOpen(true)}
              className="bg-surface-muted shadow-elevated overflow-hidden rounded-xl border border-white/15 text-left"
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
            <div className="bg-surface-muted shadow-elevated overflow-hidden rounded-xl border border-white/15">
              <div className="bg-surface-muted flex h-full min-h-72 flex-col items-center justify-center gap-2 text-center">
                <span className="border-border-subtle bg-surface text-text-muted inline-flex h-12 w-12 items-center justify-center rounded-full border text-base font-semibold">
                  {record.name.slice(0, 1).toUpperCase()}
                </span>
                <p className="text-text-muted text-sm">Poster unavailable</p>
              </div>
            </div>
          )}
          <div className="space-y-3 text-slate-100">
            <SectionHeader
              title={record.name}
              titleLevel="h1"
              titleClassName="text-3xl text-slate-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] md:text-4xl"
            />
            <p className="text-sm text-slate-200/90">
              {record.mediaType.toUpperCase()} · {titleYear ?? "-"}
            </p>
            <p className="max-w-3xl text-sm leading-6 text-slate-100/92">
              {record.overview}
            </p>

            <div className="flex flex-wrap gap-2">
              {typeof record.runtime === "number" ? (
                <Chip
                  tone="muted"
                  className="border-white/20 bg-white/10 text-xs text-white"
                >
                  Runtime: {record.runtime} min
                </Chip>
              ) : null}
              {typeof record.numberOfSeasons === "number" ? (
                <Chip
                  tone="muted"
                  className="border-white/20 bg-white/10 text-xs text-white"
                >
                  Seasons: {record.numberOfSeasons}
                </Chip>
              ) : null}
              {record.releaseDate ? (
                <Chip
                  tone="muted"
                  className="border-white/20 bg-white/10 text-xs text-white"
                >
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

            <a
              href="https://thetvdb.com/api-information"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-start gap-1 text-[11px] text-slate-200/86 hover:text-white"
            >
              <span>Uses data from TheTVDB.</span>
            </a>
            <div>
              <button
                type="button"
                onClick={() => void handleRefreshMetadata()}
                disabled={isRefreshingMetadata}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-200/90 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 ${isRefreshingMetadata ? "animate-spin" : ""}`}
                >
                  <path
                    d="M16.024 7.976A5.5 5.5 0 0 0 6.5 12M7.976 16.024A5.5 5.5 0 0 0 17.5 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16.5 4.5v3.5H13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 19.5V16H11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  {isRefreshingMetadata
                    ? "Refreshing metadata..."
                    : "Refresh metadata"}
                </span>
              </button>
              {refreshErrorMessage ? (
                <p className="mt-1 text-xs text-rose-200">
                  {refreshErrorMessage}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </PageCard>

      {!isSoloHousehold ? (
        <PageCard className="-mx-4 p-5 max-md:rounded-none max-md:border-0 max-md:ring-0 md:mx-0">
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
            <p className="text-text-soft mt-1 text-xs">
              For 3+ households, watched together stays separate from
              all-members-watched and may still have legacy rows without
              recorded participants.
            </p>
          ) : null}
        </PageCard>
      ) : null}

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
