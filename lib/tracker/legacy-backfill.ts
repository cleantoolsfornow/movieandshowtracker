import { createTitleUserStatusId } from "@/lib/tracker/shared";

type LegacyStatusFlags = {
  memberOne?: boolean;
  memberTwo?: boolean;
  together?: boolean;
};

export type LegacyTitleStatus = {
  titleId?: string;
  watchedBy?: LegacyStatusFlags;
  wantToWatchBy?: LegacyStatusFlags;
};

export type BackfillPlanInput = {
  householdId: string;
  titleId: string;
  memberIds: string[];
  status: LegacyTitleStatus;
};

export type UserStatusWritePlan = {
  id: string;
  householdId: string;
  titleId: string;
  userId: string;
  watched?: true;
  wantsToWatch?: true;
};

export type HouseholdStatusWritePlan = {
  titleId: string;
  householdId: string;
  watchedTogether?: true;
  householdWantsToWatch?: true;
};

export type LegacyBackfillPlan = {
  userStatuses: UserStatusWritePlan[];
  householdStatus?: HouseholdStatusWritePlan;
  skippedReasons: string[];
};

export function buildLegacyBackfillPlan({
  householdId,
  titleId,
  memberIds,
  status,
}: BackfillPlanInput): LegacyBackfillPlan {
  const memberOneId = memberIds[0];
  const memberTwoId = memberIds[1];
  const userStatusMap = new Map<string, UserStatusWritePlan>();
  const skippedReasons: string[] = [];

  function upsertUser(
    userId: string,
    update: { watched?: true; wantsToWatch?: true },
  ) {
    const previous = userStatusMap.get(userId);
    const next = previous
      ? { ...previous, ...update }
      : {
          id: createTitleUserStatusId(householdId, titleId, userId),
          householdId,
          titleId,
          userId,
          ...update,
        };

    if (next.watched === true) {
      delete next.wantsToWatch;
    }

    userStatusMap.set(userId, next);
  }

  if (status.watchedBy?.memberOne === true) {
    if (memberOneId) {
      upsertUser(memberOneId, { watched: true });
    } else {
      skippedReasons.push(
        "memberOne watched=true but household.memberIds[0] is missing",
      );
    }
  }
  if (status.watchedBy?.memberTwo === true) {
    if (memberTwoId) {
      upsertUser(memberTwoId, { watched: true });
    } else {
      skippedReasons.push(
        "memberTwo watched=true but household.memberIds[1] is missing",
      );
    }
  }
  if (status.wantToWatchBy?.memberOne === true) {
    if (memberOneId) {
      upsertUser(memberOneId, { wantsToWatch: true });
    } else {
      skippedReasons.push(
        "memberOne wantsToWatch=true but household.memberIds[0] is missing",
      );
    }
  }
  if (status.wantToWatchBy?.memberTwo === true) {
    if (memberTwoId) {
      upsertUser(memberTwoId, { wantsToWatch: true });
    } else {
      skippedReasons.push(
        "memberTwo wantsToWatch=true but household.memberIds[1] is missing",
      );
    }
  }

  const householdStatus: HouseholdStatusWritePlan | undefined =
    status.watchedBy?.together === true ||
    status.wantToWatchBy?.together === true
      ? {
          titleId,
          householdId,
          watchedTogether:
            status.watchedBy?.together === true ? true : undefined,
          householdWantsToWatch:
            status.wantToWatchBy?.together === true ? true : undefined,
        }
      : undefined;

  return {
    userStatuses: [...userStatusMap.values()],
    householdStatus,
    skippedReasons,
  };
}
