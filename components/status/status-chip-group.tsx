"use client";

import type { StatusFlags } from "@/lib/tracker/types";

type GroupKey = "watchedBy" | "wantToWatchBy";
type PersonKey = keyof StatusFlags;

const LABELS: Record<GroupKey, string> = {
  watchedBy: "Watched",
  wantToWatchBy: "Want to watch",
};

const PERSON_LABELS: Record<PersonKey, string> = {
  memberOne: "Member 1",
  memberTwo: "Member 2",
  together: "Together",
};

export function StatusChipGroup({
  group,
  values,
  onToggle,
  disabled,
  personLabels,
  personAvatars,
}: {
  group: GroupKey;
  values: StatusFlags;
  onToggle: (group: GroupKey, person: PersonKey, value: boolean) => void;
  disabled?: boolean;
  personLabels?: Partial<Record<PersonKey, string>>;
  personAvatars?: Partial<Record<PersonKey, string | null>>;
}) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {LABELS[group]}
      </h4>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(values) as PersonKey[]).map((person) => {
          const active = values[person];
          const label = personLabels?.[person] ?? PERSON_LABELS[person];
          const avatarUrl = personAvatars?.[person] ?? null;
          const fallbackInitial = label.trim().slice(0, 1).toUpperCase() || "?";
          return (
            <button
              key={person}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onToggle(group, person, !active)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="inline-flex items-center gap-1.5">
                {person !== "together" ? (
                  avatarUrl ? (
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
                  )
                ) : null}
                <span>{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
