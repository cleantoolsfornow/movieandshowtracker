"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/common/button";
import { ChipButton } from "@/components/common/chip";
import {
  getTitleMemberAvatarUrl,
  getTitleMemberLabel,
  MemberAvatar,
} from "@/components/household/member-display";
import type { TitleViewModelMember } from "@/lib/tracker/types";

type GroupField = "wantsToWatch" | "watched";

const GROUP_LABELS: Record<GroupField, string> = {
  wantsToWatch: "Wants To Watch",
  watched: "Watched",
};

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
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = members.length >= 4;
  const activeCount = useMemo(
    () => members.filter((member) => Boolean(member[group])).length,
    [group, members],
  );
  const visibleMembers = useMemo(
    () => (expanded || !hasOverflow ? members : members.slice(0, 3)),
    [expanded, hasOverflow, members],
  );

  return (
    <section>
      <h4 className="mb-2 text-xs font-semibold tracking-wide text-text-soft uppercase">
        {GROUP_LABELS[group]}
      </h4>
      <p className="mb-2 text-xs text-text-soft">
        {activeCount} of {members.length} members
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleMembers.map((member) => {
          const active = Boolean(member[group]);
          const label = getTitleMemberLabel(member, currentUserId);
          const avatarUrl = getTitleMemberAvatarUrl(member);
          return (
            <ChipButton
              key={member.userId}
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onToggle(member, !active)}
              active={active}
            >
              <span className="inline-flex items-center gap-1.5">
                <MemberAvatar label={label} avatarUrl={avatarUrl} size="xs" />
                <span>{label}</span>
              </span>
            </ChipButton>
          );
        })}
      </div>
      {hasOverflow ? (
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpanded((value) => !value)}
            disabled={disabled}
          >
            {expanded
              ? "Show compact"
              : `Show all members (${members.length})`}
          </Button>
          {!expanded ? (
            <span className="text-xs text-text-soft">
              Showing 3 of {members.length} members.
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
