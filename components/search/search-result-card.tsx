"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { addTitle } from "@/lib/tracker/client-api";
import { Button } from "@/components/common/button";
import { Chip, ChipButton } from "@/components/common/chip";
import { PageCard } from "@/components/common/page-card";
import { useHousehold } from "@/components/household/household-context";
import { LibraryIcon } from "@/components/marketing/inline-icons";
import { invalidateTitlesQuery, titleQueryKey } from "@/lib/tracker/queries";
import {
  buildPosterUrl,
  normalizeParticipantUserIds,
} from "@/lib/tracker/shared";
import { cn } from "@/lib/ui/cn";
import type {
  AddTitleAction,
  TvdbSearchResult,
  TitleViewModel,
} from "@/lib/tracker/types";

export function SearchResultCard({
  item,
  existingRecord,
  onAdded,
}: {
  item: TvdbSearchResult;
  existingRecord?: TitleViewModel;
  onAdded?: (record: TitleViewModel) => void;
}) {
  const queryClient = useQueryClient();
  const {
    household,
    currentMember,
    memberCount,
    members,
    isSoloHousehold,
    isTwoMemberHousehold,
  } = useHousehold();
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isSelectingParticipants, setIsSelectingParticipants] = useState(false);
  const [participantSelection, setParticipantSelection] = useState<string[]>(
    [],
  );
  const [trackedRecord, setTrackedRecord] = useState<TitleViewModel | null>(
    existingRecord ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  const isThreePlusHousehold = memberCount >= 3;
  const titleName = item.name ?? item.title ?? "Untitled";
  const dateLabel = item.releaseDate ?? item.firstAirDate ?? null;
  const yearLabel = dateLabel ? new Date(dateLabel).getUTCFullYear() : null;
  const posterUrl = buildPosterUrl(item.posterPath ?? null);
  const householdName = household?.name?.trim() || "Household";
  const sharedActions = [
    {
      label: "Save to shared watchlist",
      action: "mark_household_wants_to_watch" as const,
    },
    {
      label: isThreePlusHousehold
        ? "Mark watched together (household event)"
        : "Mark watched together",
      action: "mark_watched_together" as const,
    },
  ] as const;

  useEffect(() => {
    setTrackedRecord(existingRecord ?? null);
  }, [existingRecord]);

  function getDefaultParticipantSelection() {
    if (isTwoMemberHousehold) {
      return members.map((member) => member.uid);
    }

    return currentMember ? [currentMember.uid] : [];
  }

  function toggleParticipant(userId: string) {
    setParticipantSelection((current) =>
      current.includes(userId)
        ? current.filter((value) => value !== userId)
        : [...current, userId],
    );
  }

  function openParticipantPicker() {
    setParticipantSelection(getDefaultParticipantSelection());
    setIsSelectingParticipants(true);
    setError(null);
  }

  async function handleAdd(
    action: AddTitleAction,
    participantUserIds?: string[],
  ) {
    setIsSaving(true);
    setError(null);

    try {
      const record = await addTitle({
        tvdbId: item.tvdbId,
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
        participantUserIds,
      });
      queryClient.setQueryData(titleQueryKey(record.id), record);
      void invalidateTitlesQuery(queryClient);
      setTrackedRecord(record);
      onAdded?.(record);
      setExpanded(false);
      setIsSelectingParticipants(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add title.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleWatchedTogetherAction() {
    if (isThreePlusHousehold) {
      openParticipantPicker();
      return;
    }

    const participantUserIds = isTwoMemberHousehold
      ? members.map((member) => member.uid)
      : undefined;
    await handleAdd("mark_watched_together", participantUserIds);
  }

  async function submitParticipantSelection() {
    const participantUserIds =
      normalizeParticipantUserIds(participantSelection);
    if (!participantUserIds || participantUserIds.length < 2) {
      setError("Choose at least 2 household members for a shared watch.");
      return;
    }

    await handleAdd("mark_watched_together", participantUserIds);
  }

  const hasTrackedRecord = Boolean(trackedRecord);
  const currentUserWantsToWatch =
    trackedRecord?.currentUser.wantsToWatch ?? false;
  const currentUserWatched = trackedRecord?.currentUser.watched ?? false;
  const currentLibraryStatusChips = trackedRecord
    ? [
        {
          label: "In library",
          tone: "neutral" as const,
          withLibraryIcon: true,
        },
        ...(trackedRecord.currentUser.wantsToWatch
          ? [{ label: "Want to watch", tone: "accent" as const }]
          : []),
        ...(trackedRecord.currentUser.watched
          ? [{ label: "Watched", tone: "success" as const }]
          : []),
        ...(!isSoloHousehold && trackedRecord.household.wantsToWatch
          ? [{ label: "Shared watchlist", tone: "muted" as const }]
          : []),
        ...(!isSoloHousehold &&
        !trackedRecord.currentUser.wantsToWatch &&
        !trackedRecord.household.wantsToWatch &&
        trackedRecord.household.someMembersWantToWatch
          ? [
              {
                label:
                  trackedRecord.household.wantsToWatchCount === 1
                    ? "1 member wants to watch"
                    : `${trackedRecord.household.wantsToWatchCount} members want to watch`,
                tone: "muted" as const,
              },
            ]
          : []),
        ...(!isSoloHousehold && trackedRecord.household.watchedTogether
          ? [{ label: "Watched together", tone: "success" as const }]
          : []),
        ...(!isSoloHousehold &&
        !trackedRecord.currentUser.watched &&
        !trackedRecord.household.watchedTogether &&
        trackedRecord.household.allMembersWatched
          ? [
              {
                label: isTwoMemberHousehold
                  ? "Both watched"
                  : "All members watched",
                tone: "success" as const,
              },
            ]
          : !isSoloHousehold &&
              !trackedRecord.currentUser.watched &&
              !trackedRecord.household.watchedTogether &&
              trackedRecord.household.someMembersWatched
            ? [
                {
                  label:
                    trackedRecord.household.watchedCount === 1
                      ? "1 member watched"
                      : `${trackedRecord.household.watchedCount} members watched`,
                  tone: "muted" as const,
                },
              ]
            : []),
      ]
    : [];

  return (
    <PageCard
      as="article"
      className="app-interactive hover:shadow-elevated p-3 transition hover:-translate-y-[1px] max-md:rounded-none max-md:!border-0 max-md:shadow-none max-md:!ring-0 max-md:hover:translate-y-0 max-md:hover:shadow-none"
    >
      <div className="flex gap-3">
        <div className="border-border-subtle/80 bg-surface-muted h-24 w-16 shrink-0 overflow-hidden rounded-lg border">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={titleName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-text-soft flex h-full items-center justify-center bg-[radial-gradient(circle_at_20%_10%,rgba(42,99,255,0.2),transparent_65%),radial-gradient(circle_at_100%_100%,rgba(21,122,110,0.15),transparent_65%)] text-[10px] font-semibold">
              NO IMAGE
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground line-clamp-1 text-sm font-semibold tracking-[-0.01em]">
            {titleName}
          </h3>
          <p className="text-text-soft text-xs">
            {item.mediaType.toUpperCase()} · {yearLabel ?? "-"}
          </p>
          <p className="text-text-muted mt-1 line-clamp-2 text-xs">
            {item.overview ?? ""}
          </p>
          <p className="text-text-soft mt-1 text-[11px]">
            {isSoloHousehold
              ? "Personal actions only."
              : isTwoMemberHousehold
                ? "Personal buttons + shared actions."
                : `${householdName}: together actions can record which members were there.`}
          </p>
          {hasTrackedRecord ? (
            <div
              className="mt-2 flex flex-wrap gap-1"
              aria-label="Current library status"
            >
              {currentLibraryStatusChips.map((chip) => (
                <Chip
                  key={chip.label}
                  tone={chip.tone}
                  className="px-2 py-0.5 text-[11px]"
                >
                  {chip.withLibraryIcon ? (
                    <span className="inline-flex items-center gap-1">
                      <LibraryIcon className="h-3.5 w-3.5" />
                      <span>{chip.label}</span>
                    </span>
                  ) : (
                    chip.label
                  )}
                </Chip>
              ))}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant={currentUserWantsToWatch ? "primary" : "secondary"}
              onClick={() => void handleAdd("mark_user_wants_to_watch")}
              disabled={isSaving}
              size="sm"
              aria-pressed={currentUserWantsToWatch}
              className={cn(
                currentUserWantsToWatch
                  ? "ring-accent/20 ring-2 ring-offset-1 ring-offset-transparent"
                  : "",
              )}
            >
              {isSaving
                ? "Saving..."
                : currentUserWantsToWatch
                  ? "On your list"
                  : "Want to watch"}
            </Button>
            <Button
              variant={currentUserWatched ? "primary" : "secondary"}
              onClick={() => void handleAdd("mark_user_watched")}
              disabled={isSaving}
              size="sm"
              aria-pressed={currentUserWatched}
              className={cn(
                currentUserWatched
                  ? "border-shared-watch/80 hover:border-shared-watch ring-shared-watch/15 bg-[linear-gradient(140deg,var(--shared-watch),#2b5f4f)] text-white shadow-[0_10px_24px_rgb(43_95_79_/_0.28)] ring-2 ring-offset-1 ring-offset-transparent hover:brightness-105"
                  : "",
              )}
            >
              {isSaving
                ? "Saving..."
                : currentUserWatched
                  ? "Already watched"
                  : "Watched"}
            </Button>
            {!isSoloHousehold ? (
              <Button
                variant="secondary"
                onClick={() => setExpanded((value) => !value)}
                disabled={isSaving}
                size="sm"
              >
                Shared actions
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {!isSoloHousehold && expanded ? (
        <div className="mt-3 grid grid-cols-1 gap-2">
          {sharedActions.map((action) => (
            <Button
              key={action.label}
              onClick={() =>
                action.action === "mark_watched_together"
                  ? void handleWatchedTogetherAction()
                  : void handleAdd(action.action)
              }
              disabled={isSaving}
              variant="secondary"
              className="justify-start text-left"
              size="sm"
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}

      {isThreePlusHousehold && expanded && !isSelectingParticipants ? (
        <p className="text-text-soft mt-2 text-[11px]">
          Shared-watch actions can record which household members watched
          together.
        </p>
      ) : null}

      {isSelectingParticipants ? (
        <div className="border-border-subtle bg-surface-muted/70 mt-3 space-y-3 rounded-2xl border p-3">
          <p className="text-foreground text-xs font-medium">
            Choose the members who watched together
          </p>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <ChipButton
                key={member.uid}
                active={participantSelection.includes(member.uid)}
                onClick={() => toggleParticipant(member.uid)}
                disabled={isSaving}
                className="text-xs"
              >
                {member.label}
              </ChipButton>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void submitParticipantSelection()}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? "Saving..." : "Save shared watch"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsSelectingParticipants(false)}
              disabled={isSaving}
              size="sm"
            >
              Cancel
            </Button>
          </div>
          <p className="text-text-soft text-[11px]">
            Pick at least 2 members. This records the shared-watch participants
            without changing each person’s watched status.
          </p>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </PageCard>
  );
}
