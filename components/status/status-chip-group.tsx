"use client";

import type { StatusFlags } from "@/lib/tracker/types";

type GroupKey = "watchedBy" | "wantToWatchBy";
type PersonKey = keyof StatusFlags;

const LABELS: Record<GroupKey, string> = {
  watchedBy: "Watched",
  wantToWatchBy: "Want to watch",
};

const PERSON_LABELS: Record<PersonKey, string> = {
  matt: "Matt",
  jessica: "Jessica",
  together: "Together",
};

export function StatusChipGroup({
  group,
  values,
  onToggle,
  disabled,
}: {
  group: GroupKey;
  values: StatusFlags;
  onToggle: (group: GroupKey, person: PersonKey, value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {LABELS[group]}
      </h4>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(values) as PersonKey[]).map((person) => {
          const active = values[person];
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
              {PERSON_LABELS[person]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
