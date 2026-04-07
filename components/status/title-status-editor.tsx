"use client";

import { useEffect, useState } from "react";

import { patchTitleStatus } from "@/lib/tracker/client-api";
import type {
  PatchTitleAction,
  TitleViewModel,
  TitleViewModelMember,
} from "@/lib/tracker/types";
import { StatusChipGroup } from "@/components/status/status-chip-group";

function updateMember(
  record: TitleViewModel,
  userId: string,
  updates: Partial<TitleViewModelMember>,
): TitleViewModel {
  const members = record.members.map((member) =>
    member.userId === userId ? { ...member, ...updates } : member,
  );
  const currentUserMember =
    members.find((member) => member.userId === record.currentUser.userId) ??
    null;

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
      watchedCount: members.filter((member) => member.watched).length,
      wantsToWatchCount: members.filter((member) => member.wantsToWatch).length,
      allMembersWatched:
        members.length > 0 && members.every((member) => member.watched),
      someMembersWatched:
        members.some((member) => member.watched) &&
        !members.every((member) => member.watched),
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
  const [local, setLocal] = useState(record);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const currentMember =
    local.members.find(
      (member) => member.userId === local.currentUser.userId,
    ) ?? null;
  const isSoloHousehold = local.household.memberCount <= 1;

  useEffect(() => {
    setLocal(record);
  }, [record]);

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
    await applyPatch(
      {
        action: "set_watched_together",
        value: nextValue,
        watchedTogetherAt: nextValue
          ? new Date().toISOString().slice(0, 10)
          : undefined,
      },
      {
        ...local,
        household: {
          ...local.household,
          watchedTogether: nextValue,
          watchedTogetherAt: nextValue
            ? new Date().toISOString().slice(0, 10)
            : undefined,
        },
      },
    );
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
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Household</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={local.household.wantsToWatch}
            onClick={() =>
              void toggleHouseholdWants(!local.household.wantsToWatch)
            }
            disabled={isSaving}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              local.household.wantsToWatch
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            } disabled:opacity-60`}
          >
            In household watchlist
          </button>
          {!isSoloHousehold ? (
            <button
              type="button"
              aria-pressed={local.household.watchedTogether}
              onClick={() =>
                void toggleWatchedTogether(!local.household.watchedTogether)
              }
              disabled={isSaving}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                local.household.watchedTogether
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              } disabled:opacity-60`}
            >
              Watched together
            </button>
          ) : null}
        </div>
        <p className="text-xs text-slate-500">
          All members watched:{" "}
          {local.household.allMembersWatched ? "Yes" : "No"}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Current User</h3>
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
              <label className="flex flex-col gap-1 text-xs text-slate-600">
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
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                My notes
                <input
                  type="text"
                  value={notesInput}
                  onChange={(event) => setNotesInput(event.currentTarget.value)}
                  onBlur={() => void saveCurrentUserNotes(notesInput)}
                  disabled={isSaving}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
            </div>
          </>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Members</h3>
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

      {error ? (
        <p role="alert" aria-live="polite" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
