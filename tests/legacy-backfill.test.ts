import { describe, expect, it } from "vitest";

import { buildLegacyBackfillPlan } from "@/lib/tracker/legacy-backfill";

describe("buildLegacyBackfillPlan", () => {
  it("maps memberOne/memberTwo flags to household memberIds[0]/[1]", () => {
    const plan = buildLegacyBackfillPlan({
      householdId: "h1",
      titleId: "t1",
      memberIds: ["u1", "u2"],
      status: {
        watchedBy: { memberOne: true, memberTwo: true },
        wantToWatchBy: { memberOne: true },
      },
    });

    expect(plan.userStatuses).toEqual([
      {
        id: "h1_t1_u1",
        householdId: "h1",
        titleId: "t1",
        userId: "u1",
        watched: true,
        wantsToWatch: true,
      },
      {
        id: "h1_t1_u2",
        householdId: "h1",
        titleId: "t1",
        userId: "u2",
        watched: true,
      },
    ]);
  });

  it("maps together flags only when explicitly true", () => {
    const plan = buildLegacyBackfillPlan({
      householdId: "h1",
      titleId: "t1",
      memberIds: ["u1"],
      status: {
        watchedBy: { together: true },
        wantToWatchBy: { together: true },
      },
    });

    expect(plan.householdStatus).toEqual({
      titleId: "t1",
      householdId: "h1",
      watchedTogether: true,
      householdWantsToWatch: true,
    });
  });

  it("skips and logs ambiguous records when household slots are missing", () => {
    const plan = buildLegacyBackfillPlan({
      householdId: "h1",
      titleId: "t1",
      memberIds: [],
      status: {
        watchedBy: { memberOne: true },
        wantToWatchBy: { memberTwo: true },
      },
    });

    expect(plan.userStatuses).toEqual([]);
    expect(plan.skippedReasons).toEqual([
      "memberOne watched=true but household.memberIds[0] is missing",
      "memberTwo wantsToWatch=true but household.memberIds[1] is missing",
    ]);
  });
});
