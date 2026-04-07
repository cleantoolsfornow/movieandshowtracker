import Link from "next/link";

import { buildPosterUrl } from "@/lib/tracker/shared";
import type { TitleViewModel, TitleViewModelMember } from "@/lib/tracker/types";

function MemberBadge({ member }: { member: TitleViewModelMember }) {
  const label = member.displayName?.trim() || member.userId;
  const avatarUrl = member.avatarDataUrl ?? member.photoURL ?? null;
  const initial = label.slice(0, 1).toUpperCase() || "?";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
        member.watched
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-200 text-slate-500"
      }`}
      title={`${label}: ${member.watched ? "watched" : "not watched"}`}
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

export function PosterCard({ record }: { record: TitleViewModel }) {
  const posterUrl = buildPosterUrl(record.posterPath ?? null);
  const memberCount = record.household.memberCount;
  const showMemberBadges = memberCount <= 2;
  const year = record.releaseDate
    ? new Date(record.releaseDate).getUTCFullYear()
    : record.firstAirDate
      ? new Date(record.firstAirDate).getUTCFullYear()
      : null;

  return (
    <Link
      href={`/title/${record.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[2/3] bg-slate-200">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={record.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No poster
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-slate-900">
          {record.name}
        </p>
        <p className="text-xs text-slate-500">
          {record.mediaType.toUpperCase()} · {year ?? "-"}
        </p>
        <div className="flex flex-wrap gap-1">
          {showMemberBadges ? (
            record.members.map((member) => (
              <MemberBadge key={member.userId} member={member} />
            ))
          ) : (
            <>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                Watched: {record.household.watchedCount}/{memberCount}
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                Wants: {record.household.wantsToWatchCount}/{memberCount}
              </span>
            </>
          )}
          {record.household.watchedTogether ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
              Watched together
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
