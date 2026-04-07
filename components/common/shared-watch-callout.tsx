import { cn } from "@/lib/ui/cn";

export function SharedWatchCallout({
  memberCount,
  watchedTogetherAt,
  participantsKnown = false,
  participantCount = 0,
  participantLabels,
  className,
  compact = false,
}: {
  memberCount: number;
  watchedTogetherAt?: string;
  participantsKnown?: boolean;
  participantCount?: number;
  participantLabels?: string[];
  className?: string;
  compact?: boolean;
}) {
  if (memberCount <= 1) {
    return null;
  }

  const isThreePlusHousehold = memberCount >= 3;
  const title = isThreePlusHousehold
    ? "Watched together (household event)"
    : "Watched together";
  const shouldShowNames =
    participantsKnown && !compact && participantLabels && participantLabels.length > 0;
  const participantLine = participantsKnown
    ? shouldShowNames
      ? `Participants: ${participantLabels.join(", ")}.`
      : `Participants recorded: ${participantCount}.`
    : "Participants were not recorded for this shared moment.";

  return (
    <div
      className={cn(
        "shared-watch-callout shared-watch-celebrate rounded-xl",
        compact ? "p-2" : "p-3",
        className,
      )}
    >
      <p className={cn("font-semibold text-shared-watch", compact ? "text-xs" : "text-sm")}>
        Shared moment
      </p>
      <p className={cn("text-text-muted", compact ? "text-xs" : "text-sm")}>
        {title}
        {watchedTogetherAt ? ` on ${watchedTogetherAt}.` : "."}
      </p>
      {memberCount > 1 ? (
        <p className={cn("text-text-soft", compact ? "mt-1 text-[11px]" : "mt-1 text-xs")}>
          {participantLine}
        </p>
      ) : null}
    </div>
  );
}
