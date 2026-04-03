import Link from "next/link";

import { buildPosterUrl } from "@/lib/tracker/shared";
import type { TitleRecord } from "@/lib/tracker/types";

function SummaryBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
      }`}
    >
      {label}
    </span>
  );
}

export function PosterCard({ record }: { record: TitleRecord }) {
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
          <SummaryBadge label="M watched" active={record.status.watchedBy.matt} />
          <SummaryBadge
            label="J watched"
            active={record.status.watchedBy.jessica}
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
