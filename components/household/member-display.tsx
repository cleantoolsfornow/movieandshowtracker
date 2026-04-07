import { Chip } from "@/components/common/chip";
import { cn } from "@/lib/ui/cn";
import type { TitleViewModelMember } from "@/lib/tracker/types";

export function getTitleMemberLabel(
  member: TitleViewModelMember,
  currentUserId?: string,
) {
  if (currentUserId && member.userId === currentUserId) {
    return "You";
  }

  return member.displayName?.trim() || member.userId;
}

export function getTitleMemberAvatarUrl(member: TitleViewModelMember) {
  return member.avatarDataUrl ?? member.photoURL ?? null;
}

export function MemberAvatar({
  label,
  avatarUrl,
  size = "sm",
  className,
}: {
  label: string;
  avatarUrl: string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClass =
    size === "xs" ? "h-4 w-4 text-[9px]" : size === "md" ? "h-7 w-7 text-xs" : "h-5 w-5 text-[10px]";
  const initial = label.trim().slice(0, 1).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        aria-hidden="true"
        className={cn(
          "rounded-full object-cover ring-1 ring-border-strong/40",
          sizeClass,
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-surface-muted font-semibold text-text-muted ring-1 ring-border-strong/40",
        sizeClass,
        className,
      )}
    >
      {initial}
    </span>
  );
}

export function StackedMemberAvatars({
  members,
  currentUserId,
  maxVisible = 4,
}: {
  members: TitleViewModelMember[];
  currentUserId?: string;
  maxVisible?: number;
}) {
  const visible = members.slice(0, maxVisible);
  const overflow = Math.max(members.length - maxVisible, 0);

  return (
    <div className="inline-flex items-center">
      <div className="flex items-center">
        {visible.map((member, index) => {
          const label = getTitleMemberLabel(member, currentUserId);
          return (
            <MemberAvatar
              key={member.userId}
              label={label}
              avatarUrl={getTitleMemberAvatarUrl(member)}
              size="sm"
              className={index > 0 ? "-ml-2" : ""}
            />
          );
        })}
      </div>
      {overflow > 0 ? (
        <span className="-ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-subtle bg-surface text-[10px] font-semibold text-text-muted">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export function HouseholdCountChips({
  watchedCount,
  wantsToWatchCount,
  memberCount,
  className,
}: {
  watchedCount: number;
  wantsToWatchCount: number;
  memberCount: number;
  className?: string;
}) {
  if (memberCount <= 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      <Chip tone="muted" className="px-2 py-0.5 text-xs">
        Watched: {watchedCount}/{memberCount}
      </Chip>
      <Chip tone="muted" className="px-2 py-0.5 text-xs">
        Wants: {wantsToWatchCount}/{memberCount}
      </Chip>
    </div>
  );
}

export function CompactMemberList({
  members,
}: {
  members: TitleViewModelMember[];
}) {
  if (members.length <= 2) {
    return null;
  }

  return (
    <details className="group">
      <summary className="cursor-pointer text-xs text-text-soft hover:text-text-muted">
        Member details
      </summary>
      <p className="mt-1 text-xs text-text-muted">
        Open this title for full per-member status details.
      </p>
    </details>
  );
}
