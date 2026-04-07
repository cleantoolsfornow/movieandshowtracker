import { describe, expect, it } from "vitest";

import { mapHouseholdMembers } from "@/components/household/household-context";
import type { HouseholdSummary } from "@/lib/tracker/client-api";

const householdFixture: HouseholdSummary = {
  id: "h1",
  name: "Home",
  inviteCode: "ABC123",
  members: [
    {
      uid: "u1",
      email: "alex@example.com",
      displayName: "Alex",
      photoURL: null,
      avatarDataUrl: null,
    },
    {
      uid: "u2",
      email: "casey@example.com",
      displayName: null,
      photoURL: "https://img.example.com/u2.jpg",
      avatarDataUrl: null,
    },
  ],
};

describe("mapHouseholdMembers", () => {
  it("maps members dynamically and marks current user as You", () => {
    const members = mapHouseholdMembers(householdFixture, {
      currentUserUid: "u1",
      currentUserEmail: "alex@example.com",
      profile: null,
    });

    expect(members).toHaveLength(2);
    expect(members[0]?.label).toBe("You");
    expect(members[0]?.isCurrentUser).toBe(true);
    expect(members[1]?.label).toBe("casey");
    expect(members[1]?.avatarUrl).toBe("https://img.example.com/u2.jpg");
  });
});
