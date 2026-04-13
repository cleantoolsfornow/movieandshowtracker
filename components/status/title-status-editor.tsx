"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { ChipButton } from "@/components/common/chip";
import { SharedWatchCallout } from "@/components/common/shared-watch-callout";
import {
  getTitleMemberLabel,
  HouseholdCountChips,
} from "@/components/household/member-display";
import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";
import { patchTitleStatus } from "@/lib/tracker/client-api";
import type {
  PatchTitleAction,
  TitleViewModel,
  TitleViewModelMember,
} from "@/lib/tracker/types";
import { StatusChipGroup } from "@/components/status/status-chip-group";
import {
  invalidateTitlesQuery,
  titleQueryKey,
} from "@/lib/tracker/queries";
import { normalizeParticipantUserIds } from "@/lib/tracker/shared";

function updateMember(
  record: TitleViewModel,
  userId: string,
  updates: Partial<TitleViewModelMember>,
): TitleViewModel {
  const normalizedUpdates = { ...updates };

  if (normalizedUpdates.wantsToWatch === true) {
    normalizedUpdates.watched = false;
    normalizedUpdates.watchedAt = undefined;
  }

  if (normalizedUpdates.watched === true) {
    normalizedUpdates.wantsToWatch = false;
  }

  const members = record.members.map((member) =>
    member.userId === userId ? { ...member, ...normalizedUpdates } : member,
  );
  const currentUserMember =
    members.find((member) => member.userId === record.currentUser.userId) ??
    null;
  const memberCount = members.length;
  const watchedCount = members.filter((member) => member.watched).length;
  const wantsToWatchCount = members.filter((member) => member.wantsToWatch).length;
  const anyMembersWatched = watchedCount > 0;
  const allMembersWatched = memberCount > 0 && watchedCount === memberCount;
  const someMembersWatched = watchedCount > 0 && watchedCount < memberCount;
  const noMembersWatched = watchedCount === 0;
  const anyMembersWantToWatch = wantsToWatchCount > 0;
  const allMembersWantToWatch =
    memberCount > 0 && wantsToWatchCount === memberCount;
  const someButNotAllMembersWantToWatch =
    wantsToWatchCount > 0 && wantsToWatchCount < memberCount;
  const noMembersWantToWatch = wantsToWatchCount === 0;
  const someMembersWantToWatch = anyMembersWantToWatch;
  const multipleMembersWantToWatch = wantsToWatchCount >= 2;

  return {
    ...record,
    members,
    currentUser: currentUserMember
      ? {
          userId: currentUserMember.userId,
          wantsToWatch: currentUserMember.wantsToWatch,
          watched: currentUserMember.watched,
          watchedAt: currentUserMember.watchedAt,
          rating: currentUserMember.rating,
          notes: currentUserMember.notes,
        }
      : record.currentUser,
    household: {
      ...record.household,
      watchedCount,
      wantsToWatchCount,
      anyMembersWatched,
      allMembersWatched,
      someMembersWatched,
      noMembersWatched,
      anyMembersWantToWatch,
      allMembersWantToWatch,
      someButNotAllMembersWantToWatch,
      noMembersWantToWatch,
      someMembersWantToWatch,
      multipleMembersWantToWatch,
    },
  };
}

function buildWatchedTogetherState(
  record: TitleViewModel,
  options: {
    value: boolean;
    watchedTogetherAt?: string;
    participantUserIds?: string[];
  },
): TitleViewModel {
  const watchedTogetherParticipantUserIds = options.value
    ? normalizeParticipantUserIds(options.participantUserIds)
    : undefined;

  return {
    ...record,
    household: {
      ...record.household,
      watchedTogether: options.value,
      watchedTogetherAt: options.value ? options.watchedTogetherAt : undefined,
      watchedTogetherParticipantUserIds,
      watchedTogetherParticipantCount:
        watchedTogetherParticipantUserIds?.length ?? 0,
      watchedTogetherParticipantsKnown: Boolean(
        options.value && watchedTogetherParticipantUserIds,
      ),
    },
  };
}

export function TitleStatusEditor({
  record,
  onUpdated,
}: {
  record: TitleViewModel;
  onUpdated?: (next: TitleViewModel) => void;
}) {
  const queryClient = useQueryClient();
  const [local, setLocal] = useState(record);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectingParticipants, setIsSelectingParticipants] = useState(false);
  const [participantSelection, setParticipantSelection] = useState<string[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const currentMember =
    local.members.find(
      (member) => member.userId === local.currentUser.userId,
    ) ?? null;
  const isTwoMemberHousehold = local.household.memberCount === 2;
  const isThreePlusHousehold = local.household.memberCount >= 3;
  const isSoloHousehold = local.household.memberCount <= 1;
  const watchedTogetherParticipantLabels =
    local.household.watchedTogetherParticipantUserIds
      ?.map((participantUserId) => {
        const member = local.members.find(
          (entry) => entry.userId === participantUserId,
        );
        return member
          ? getTitleMemberLabel(member, local.currentUser.userId)
          : undefined;
      })
      .filter((value): value is string => Boolean(value));

  useEffect(() => {
    setLocal(record);
  }, [record]);

  useEffect(() => {
    setIsSelectingParticipants(false);
    setParticipantSelection([]);
  }, [record.id]);

  useEffect(() => {
    setRatingInput(
      currentMember?.rating === undefined ? "" : String(currentMember.rating),
    );
    setNotesInput(currentMember?.notes ?? "");
  }, [currentMember?.notes, currentMember?.rating, currentMember?.userId]);

  async function applyPatch(
    action: PatchTitleAction,
    optimistic: TitleViewModel,
  ) {
    const previous = local;
    setLocal(optimistic);
    setIsSaving(true);
    setError(null);

    try {
      const next = await patchTitleStatus(local.id, action);
      setLocal(next);
      queryClient.setQueryData(titleQueryKey(next.id), next);
      void invalidateTitlesQuery(queryClient);
      onUpdated?.(next);
    } catch (err) {
      setLocal(previous);
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleHouseholdWants(nextValue: boolean) {
    await applyPatch(
      { action: "set_household_wants_to_watch", value: nextValue },
      {
        ...local,
        household: { ...local.household, wantsToWatch: nextValue },
      },
    );
  }

  async function toggleWatchedTogether(nextValue: boolean) {
    const watchedTogetherAt = nextValue
      ? local.household.watchedTogetherAt ?? new Date().toISOString().slice(0, 10)
      : undefined;
    const participantUserIds = nextValue
      ? isTwoMemberHousehold
        ? local.members.map((member) => member.userId)
        : undefined
      : undefined;

    await applyPatch(
      {
        action: "set_watched_together",
        value: nextValue,
        watchedTogetherAt,
        participantUserIds,
      },
      buildWatchedTogetherState(local, {
        value: nextValue,
        watchedTogetherAt,
        participantUserIds,
      }),
    );
  }

  function getDefaultParticipantSelection() {
    if (
      local.household.watchedTogetherParticipantsKnown &&
      local.household.watchedTogetherParticipantUserIds
    ) {
      return local.household.watchedTogetherParticipantUserIds;
    }

    return local.currentUser.userId ? [local.currentUser.userId] : [];
  }

  function openParticipantPicker() {
    setParticipantSelection(getDefaultParticipantSelection());
    setIsSelectingParticipants(true);
    setError(null);
  }

  function toggleParticipant(userId: string) {
    setParticipantSelection((current) =>
      current.includes(userId)
        ? current.filter((value) => value !== userId)
        : [...current, userId],
    );
  }

  async function saveWatchedTogetherParticipants() {
    const participantUserIds = normalizeParticipantUserIds(participantSelection);
    if (!participantUserIds || participantUserIds.length < 2) {
      setError("Choose at least 2 household members for a shared watch.");
      return;
    }

    const watchedTogetherAt =
      local.household.watchedTogetherAt ??
      new Date().toISOString().slice(0, 10);

    await applyPatch(
      {
        action: "set_watched_together",
        value: true,
        watchedTogetherAt,
        participantUserIds,
      },
      buildWatchedTogetherState(local, {
        value: true,
        watchedTogetherAt,
        participantUserIds,
      }),
    );
    setIsSelectingParticipants(false);
  }

  async function toggleMemberWatch(
    member: TitleViewModelMember,
    nextValue: boolean,
  ) {
    await applyPatch(
      {
        action: "set_user_watched",
        userId: member.userId,
        value: nextValue,
        watchedAt: nextValue
          ? new Date().toISOString().slice(0, 10)
          : undefined,
      },
      updateMember(local, member.userId, {
        watched: nextValue,
        watchedAt: nextValue
          ? new Date().toISOString().slice(0, 10)
          : undefined,
      }),
    );
  }

  async function toggleMemberWant(
    member: TitleViewModelMember,
    nextValue: boolean,
  ) {
    await applyPatch(
      {
        action: "set_user_wants_to_watch",
        userId: member.userId,
        value: nextValue,
      },
      updateMember(local, member.userId, {
        wantsToWatch: nextValue,
      }),
    );
  }

  async function saveCurrentUserRating(value: string) {
    const numeric = value.trim() ? Number(value) : undefined;
    await applyPatch(
      {
        action: "set_user_rating",
        userId: local.currentUser.userId,
        value: Number.isFinite(numeric) ? numeric : undefined,
      },
      updateMember(local, local.currentUser.userId, {
        rating: Number.isFinite(numeric) ? numeric : undefined,
      }),
    );
  }

  async function saveCurrentUserNotes(value: string) {
    await applyPatch(
      {
        action: "set_user_notes",
        userId: local.currentUser.userId,
        value: value.trim() ? value : undefined,
      },
      updateMember(local, local.currentUser.userId, {
        notes: value.trim() ? value : undefined,
      }),
    );
  }

  return (
    <PageCard className="-mx-4 space-y-4 p-5 md:mx-0 max-md:rounded-none max-md:border-0 max-md:ring-0">
      {!isSoloHousehold ? (
        <section className="space-y-2">
          <SectionHeader
            title="Household"
            titleLevel="h3"
            description="Shared status that applies across members."
          />
          <div className="flex flex-wrap gap-2">
            <ChipButton
              aria-pressed={local.household.wantsToWatch}
              onClick={() =>
                void toggleHouseholdWants(!local.household.wantsToWatch)
              }
              disabled={isSaving}
              active={local.household.wantsToWatch}
            >
              Shared watchlist
            </ChipButton>
            <ChipButton
              aria-pressed={local.household.watchedTogether}
              onClick={() =>
                local.household.watchedTogether
                  ? void toggleWatchedTogether(false)
                  : isThreePlusHousehold
                    ? openParticipantPicker()
                    : void toggleWatchedTogether(true)
              }
              disabled={isSaving}
              active={local.household.watchedTogether}
              tone="success"
            >
              {isThreePlusHousehold
                ? local.household.watchedTogether
                  ? "Clear shared watch"
                  : "Record shared watch"
                : "Watched together"}
            </ChipButton>
            {isThreePlusHousehold && local.household.watchedTogether ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={openParticipantPicker}
                disabled={isSaving}
              >
                {local.household.watchedTogetherParticipantsKnown
                  ? "Edit participants"
                  : "Record participants"}
              </Button>
            ) : null}
          </div>

          {local.household.watchedTogether ? (
            <SharedWatchCallout
              memberCount={local.household.memberCount}
              watchedTogetherAt={local.household.watchedTogetherAt}
              participantsKnown={
                local.household.watchedTogetherParticipantsKnown
              }
              participantCount={
                local.household.watchedTogetherParticipantCount
              }
              participantLabels={watchedTogetherParticipantLabels}
              compact
            />
          ) : isThreePlusHousehold ? (
            <p className="text-xs text-text-soft">
              Shared-watch state can record a subgroup without changing each member’s watched status.
            </p>
          ) : null}

          {isSelectingParticipants ? (
            <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface-muted/70 p-3">
              <p className="text-xs font-medium text-foreground">
                Choose the members who watched together
              </p>
              <div className="flex flex-wrap gap-2">
                {local.members.map((member) => (
                  <ChipButton
                    key={member.userId}
                    active={participantSelection.includes(member.userId)}
                    onClick={() => toggleParticipant(member.userId)}
                    disabled={isSaving}
                    className="text-xs"
                  >
                    {getTitleMemberLabel(member, local.currentUser.userId)}
                  </ChipButton>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void saveWatchedTogetherParticipants()}
                  disabled={isSaving}
                  size="sm"
                >
                  {isSaving ? "Saving..." : "Save shared watch"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSelectingParticipants(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-[11px] text-text-soft">
                Pick at least 2 members. This records who watched together without changing per-member watched completion.
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Chip
              tone={local.household.allMembersWatched ? "accent" : "muted"}
              className="text-xs"
            >
              {isTwoMemberHousehold ? "Both watched" : "All members watched"}:{" "}
              {local.household.allMembersWatched ? "Yes" : "No"}
            </Chip>
            {local.household.someMembersWatched ? (
              <Chip tone="accent" className="text-xs">
                Partially watched
              </Chip>
            ) : null}
          </div>
          <HouseholdCountChips
            watchedCount={local.household.watchedCount}
            wantsToWatchCount={local.household.wantsToWatchCount}
            memberCount={local.household.memberCount}
          />
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionHeader
          title="My status"
          titleLevel="h3"
          description="Your personal status, rating, and notes."
        />
        {currentMember ? (
          <>
            <StatusChipGroup
              group="wantsToWatch"
              members={[currentMember]}
              currentUserId={local.currentUser.userId}
              disabled={isSaving}
              onToggle={(member, next) => {
                void toggleMemberWant(member, next);
              }}
            />
            <StatusChipGroup
              group="watched"
              members={[currentMember]}
              currentUserId={local.currentUser.userId}
              disabled={isSaving}
              onToggle={(member, next) => {
                void toggleMemberWatch(member, next);
              }}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-text-muted">
                My rating
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={ratingInput}
                  onChange={(event) => setRatingInput(event.currentTarget.value)}
                  onBlur={() => void saveCurrentUserRating(ratingInput)}
                  disabled={isSaving}
                  className="app-input px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-text-muted">
                My notes
                <input
                  type="text"
                  value={notesInput}
                  onChange={(event) => setNotesInput(event.currentTarget.value)}
                  onBlur={() => void saveCurrentUserNotes(notesInput)}
                  disabled={isSaving}
                  className="app-input px-2 py-1 text-sm"
                />
              </label>
            </div>
          </>
        ) : null}
      </section>

      {!isSoloHousehold ? (
        <section className="space-y-3">
          <SectionHeader
            title="Members"
            titleLevel="h3"
            description="Per-member status controls."
          />
          <StatusChipGroup
            group="wantsToWatch"
            members={local.members}
            currentUserId={local.currentUser.userId}
            disabled={isSaving}
            onToggle={(member, next) => {
              void toggleMemberWant(member, next);
            }}
          />
          <StatusChipGroup
            group="watched"
            members={local.members}
            currentUserId={local.currentUser.userId}
            disabled={isSaving}
            onToggle={(member, next) => {
              void toggleMemberWatch(member, next);
            }}
          />
        </section>
      ) : null}

      {error ? (
        <p role="alert" aria-live="polite" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </PageCard>
  );
}
