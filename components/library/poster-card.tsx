import Link from "next/link";

import { useHousehold } from "@/components/household/household-context";
import { buildPosterUrl } from "@/lib/tracker/shared";
import type { TitleRecord } from "@/lib/tracker/types";

function SummaryBadge({
  label,
  active,
  avatarUrl,
}: {
  label: string;
  active: boolean;
  avatarUrl?: string | null;
}) {
  const initial = label.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
      }`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          aria-hidden="true"
          className="h-3.5 w-3.5 rounded-full object-cover ring-1 ring-slate-300"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/70 text-[9px] font-semibold text-slate-600 ring-1 ring-slate-300"
        >
          {initial}
        </span>
      )}
      {label}
    </span>
  );
}

export function PosterCard({ record }: { record: TitleRecord }) {
  const { personLabels, personAvatars } = useHousehold();
  const posterUrl = buildPosterUrl(record.title.posterPath);

  return (
    <Link
      href={`/title/${record.title.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[2/3] bg-slate-200">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={record.title.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No poster
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-slate-900">{record.title.title}</p>
        <p className="text-xs text-slate-500">
          {record.title.mediaType.toUpperCase()} · {record.title.releaseYear ?? "-"}
        </p>
        <div className="flex flex-wrap gap-1">
          <SummaryBadge
            label={`${personLabels.memberOne} watched`}
            active={record.status.watchedBy.memberOne}
            avatarUrl={personAvatars.memberOne}
          />
          <SummaryBadge
            label={`${personLabels.memberTwo} watched`}
            active={record.status.watchedBy.memberTwo}
            avatarUrl={personAvatars.memberTwo}
          />
          <SummaryBadge
            label="Together"
            active={record.status.watchedBy.together}
          />
        </div>
      </div>
    </Link>
  );
}
