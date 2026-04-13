import Link from "next/link";

import { Chip } from "@/components/common/chip";
import { SharedWatchCallout } from "@/components/common/shared-watch-callout";
import {
  CompactMemberList,
  getTitleMemberAvatarUrl,
  getTitleMemberLabel,
  HouseholdCountChips,
  MemberAvatar,
  StackedMemberAvatars,
} from "@/components/household/member-display";
import { cn } from "@/lib/ui/cn";
import { buildPosterUrl } from "@/lib/tracker/shared";
import type { TitleViewModel, TitleViewModelMember } from "@/lib/tracker/types";

function MemberBadge({
  member,
  currentUserId,
}: {
  member: TitleViewModelMember;
  currentUserId: string;
}) {
  const label = getTitleMemberLabel(member, currentUserId);
  const avatarUrl = getTitleMemberAvatarUrl(member);

  return (
    <Chip
      tone={member.watched ? "success" : "muted"}
      className="gap-1 px-2 py-0.5 text-xs"
      title={`${label}: ${member.watched ? "watched" : "not watched"}`}
    >
      <MemberAvatar label={label} avatarUrl={avatarUrl} size="xs" />
      {label}
    </Chip>
  );
}

function getWatchedTogetherParticipantLabels(record: TitleViewModel) {
  if (!record.household.watchedTogetherParticipantsKnown) {
    return undefined;
  }

  const labels = record.household.watchedTogetherParticipantUserIds
    ?.map((participantUserId) => {
      const member = record.members.find(
        (entry) => entry.userId === participantUserId,
      );
      return member
        ? getTitleMemberLabel(member, record.currentUser.userId)
        : undefined;
    })
    .filter((value): value is string => Boolean(value));

  return labels?.length ? labels : undefined;
}

export function PosterCard({ record }: { record: TitleViewModel }) {
  const posterUrl = buildPosterUrl(record.posterPath ?? null);
  const memberCount = record.household.memberCount;
  const isSoloHousehold = memberCount <= 1;
  const isTwoMemberHousehold = memberCount === 2;
  const isThreePlusHousehold = memberCount >= 3;
  const hasSharedWatchMoment =
    !isSoloHousehold && record.household.watchedTogether;
  const year = record.releaseDate
    ? new Date(record.releaseDate).getUTCFullYear()
    : record.firstAirDate
      ? new Date(record.firstAirDate).getUTCFullYear()
      : null;
  const watchedLabel = isTwoMemberHousehold ? "Both watched" : "All members watched";
  const watchedTogetherParticipantLabels =
    getWatchedTogetherParticipantLabels(record);

  function renderHouseholdStateChips() {
    const watchedTogetherLabel =
      record.household.watchedTogetherParticipantsKnown &&
      record.household.watchedTogetherParticipantCount >= 2
        ? isTwoMemberHousehold
          ? "Watched together"
          : `${record.household.watchedTogetherParticipantCount} watched together`
        : isThreePlusHousehold
          ? "Watched together (unknown participants)"
          : "Watched together";

    return (
      <div className="flex flex-wrap gap-1">
        {record.household.watchedTogether ? (
          <Chip tone="success" className="px-2 py-0.5 text-xs">
            {watchedTogetherLabel}
          </Chip>
        ) : null}

        {record.household.allMembersWatched ? (
          <Chip tone="accent" className="px-2 py-0.5 text-xs">
            {watchedLabel}
          </Chip>
        ) : record.household.someMembersWatched ? (
          <Chip tone="muted" className="px-2 py-0.5 text-xs">
            {record.household.watchedCount} watched
          </Chip>
        ) : null}

        {record.household.wantsToWatch ? (
          <Chip tone="muted" className="px-2 py-0.5 text-xs">
            Shared watchlist
          </Chip>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href={`/title/${record.id}`}
      className={cn(
        "app-interactive group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-soft ring-1 ring-white/45 transition hover:-translate-y-0.5 hover:shadow-elevated md:rounded-3xl",
        hasSharedWatchMoment ? "border-shared-watch/35 ring-1 ring-shared-watch/25" : "",
      )}
    >
      <div className="relative aspect-[2/3] bg-surface-muted">
        {posterUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl}
              alt={record.name}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent opacity-80 transition group-hover:opacity-95" />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,rgba(42,99,255,0.22),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(21,122,110,0.18),transparent_55%)] p-3 text-center">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-surface text-sm font-semibold text-text-muted shadow-soft">
              {record.name.slice(0, 1).toUpperCase()}
            </span>
            <p className="text-xs font-medium text-text-muted">Poster unavailable</p>
            <p className="text-[11px] text-text-soft">Metadata still available</p>
          </div>
        )}
        {hasSharedWatchMoment ? (
          <span className="shared-watch-celebrate absolute top-2 left-2 rounded-full border border-shared-watch/40 bg-surface-strong px-2 py-1 text-[11px] font-semibold text-shared-watch">
            Shared moment
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 md:gap-2 md:p-4">
        <p className="line-clamp-2 text-xs leading-[1.2] font-semibold text-foreground sm:text-sm sm:leading-5">
          {record.name}
        </p>
        <p className="text-[11px] leading-[1.15] text-text-soft sm:text-xs sm:leading-normal">
          {record.mediaType.toUpperCase()} · {year ?? "-"}
        </p>

        {isSoloHousehold ? (
          <div className="mt-auto">
            <div className="-mx-3 -mb-3 mt-1.5 flex overflow-hidden rounded-b-2xl md:mx-0 md:mb-0 md:mt-0 md:flex-wrap md:gap-1 md:overflow-visible md:rounded-none">
              {record.currentUser.watched ? (
                <Chip
                  tone="success"
                  className="flex-1 justify-center rounded-none border-0 px-1 py-1 text-[10px] leading-4 md:flex-none md:rounded-full md:border md:px-2 md:py-0.5 md:text-xs"
                >
                  Watched
                </Chip>
              ) : null}
              {record.currentUser.wantsToWatch ? (
                <Chip
                  tone="accent"
                  className={cn(
                    "flex-1 justify-center rounded-none border-0 border-[#a6bc46]/90 bg-[linear-gradient(140deg,#bfd45c,#95ae36)] px-1 py-1 text-[10px] leading-4 text-[#1f2e12] md:flex-none md:rounded-full md:border md:px-2 md:py-0.5 md:text-xs",
                    record.currentUser.watched
                      ? "border-l border-white/20 md:border-l-0"
                      : "",
                  )}
                >
                  Want to watch
                </Chip>
              ) : null}
            </div>
          </div>
        ) : null}

        {isTwoMemberHousehold ? (
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
              {record.members.map((member) => (
                <MemberBadge
                  key={member.userId}
                  member={member}
                  currentUserId={record.currentUser.userId}
                />
              ))}
            </div>
            {renderHouseholdStateChips()}
            {hasSharedWatchMoment ? (
              <SharedWatchCallout
                memberCount={memberCount}
                watchedTogetherAt={record.household.watchedTogetherAt}
                participantsKnown={
                  record.household.watchedTogetherParticipantsKnown
                }
                participantCount={
                  record.household.watchedTogetherParticipantCount
                }
                participantLabels={watchedTogetherParticipantLabels}
                compact
              />
            ) : null}
          </div>
        ) : null}

        {isThreePlusHousehold ? (
          <div className="space-y-1.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StackedMemberAvatars
                  members={record.members}
                  currentUserId={record.currentUser.userId}
                />
                <span className="text-xs text-text-soft">
                  {memberCount} members
                </span>
              </div>
              <HouseholdCountChips
                watchedCount={record.household.watchedCount}
                wantsToWatchCount={record.household.wantsToWatchCount}
                memberCount={memberCount}
              />
              <CompactMemberList
                members={record.members}
              />
            </div>
            {renderHouseholdStateChips()}
            {hasSharedWatchMoment ? (
              <SharedWatchCallout
                memberCount={memberCount}
                watchedTogetherAt={record.household.watchedTogetherAt}
                participantsKnown={
                  record.household.watchedTogetherParticipantsKnown
                }
                participantCount={
                  record.household.watchedTogetherParticipantCount
                }
                participantLabels={watchedTogetherParticipantLabels}
                compact
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
