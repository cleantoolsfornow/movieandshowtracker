"use client";

import { useState } from "react";

import { patchTitleStatus } from "@/lib/tracker/client-api";
import type { StatusField, StatusPerson, TitleRecord } from "@/lib/tracker/types";
import { useHousehold } from "@/components/household/household-context";
import { StatusChipGroup } from "@/components/status/status-chip-group";

export function TitleStatusEditor({
  record,
  onUpdated,
}: {
  record: TitleRecord;
  onUpdated?: (next: TitleRecord) => void;
}) {
  const { personLabels, personAvatars } = useHousehold();
  const [local, setLocal] = useState(record);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(
    group: StatusField,
    person: StatusPerson,
    value: boolean,
  ) {
    const optimistic = {
      ...local,
      status: {
        ...local.status,
        [group]: {
          ...local.status[group],
          [person]: value,
        },
      },
    };

    setLocal(optimistic);
    setIsSaving(true);
    setError(null);

    try {
      const next = await patchTitleStatus(local.title.id, {
        [group]: { [person]: value },
      });
      setLocal(next);
      onUpdated?.(next);
    } catch (err) {
      setLocal(local);
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <StatusChipGroup
        group="watchedBy"
        values={local.status.watchedBy}
        onToggle={handleToggle}
        disabled={isSaving}
        personLabels={personLabels}
        personAvatars={personAvatars}
      />
      <StatusChipGroup
        group="wantToWatchBy"
        values={local.status.wantToWatchBy}
        onToggle={handleToggle}
        disabled={isSaving}
        personLabels={personLabels}
        personAvatars={personAvatars}
      />
      {error ? (
        <p role="alert" aria-live="polite" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {local.status.watchedBy.together ? (
        <p aria-live="polite" className="text-sm font-medium text-emerald-700 transition">
          Watched together - nice.
        </p>
      ) : null}
    </div>
  );
}
