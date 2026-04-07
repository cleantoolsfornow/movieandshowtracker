"use client";

import type { TitleViewModelMember } from "@/lib/tracker/types";

type GroupField = "wantsToWatch" | "watched";

const GROUP_LABELS: Record<GroupField, string> = {
  wantsToWatch: "Wants To Watch",
  watched: "Watched",
};

function getMemberLabel(member: TitleViewModelMember, currentUserId: string) {
  if (member.userId === currentUserId) {
    return "You";
  }
  return member.displayName?.trim() || member.userId;
}

export function StatusChipGroup({
  group,
  members,
  currentUserId,
  onToggle,
  disabled,
}: {
  group: GroupField;
  members: TitleViewModelMember[];
  currentUserId: string;
  onToggle: (member: TitleViewModelMember, nextValue: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {GROUP_LABELS[group]}
      </h4>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const active = Boolean(member[group]);
          const label = getMemberLabel(member, currentUserId);
          const avatarUrl = member.avatarDataUrl ?? member.photoURL ?? null;
          const fallbackInitial = label.trim().slice(0, 1).toUpperCase() || "?";
          return (
            <button
              key={member.userId}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onToggle(member, !active)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="inline-flex items-center gap-1.5">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full object-cover ring-1 ring-slate-300"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-300"
                  >
                    {fallbackInitial}
                  </span>
                )}
                <span>{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
