import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SettingsPage from "@/app/(app)/settings/page";

const useAuthMock = vi.fn();
const useHouseholdMock = vi.fn();

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/components/household/household-context", () => ({
  useHousehold: () => useHouseholdMock(),
}));

describe("Settings household-aware copy", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({
      user: { uid: "u1", email: "alex@example.com", displayName: "Alex" },
      profile: { displayName: "Alex", avatarDataUrl: null, photoURL: null },
    });
  });

  it("uses solo-safe wording and singular member heading", () => {
    useHouseholdMock.mockReturnValue({
      household: {
        id: "h1",
        name: "Solo House",
        inviteCode: "ABCD1234EFGH",
      },
      members: [
        {
          uid: "u1",
          label: "You",
          email: "alex@example.com",
          avatarUrl: null,
          isCurrentUser: true,
        },
      ],
      memberCount: 1,
      isSoloHousehold: true,
      isThreePlusHousehold: false,
      isLoadingHousehold: false,
      refreshHousehold: vi.fn(),
    });

    render(<SettingsPage />);

    expect(screen.getByText("Solo household")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This name appears in your account and will be used if you invite others later.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Member" })).toBeInTheDocument();
  });

  it("uses scalable 3+ wording and members heading", () => {
    useHouseholdMock.mockReturnValue({
      household: {
        id: "h1",
        name: "Big House",
        inviteCode: "ABCD1234EFGH",
      },
      members: [
        {
          uid: "u1",
          label: "You",
          email: "alex@example.com",
          avatarUrl: null,
          isCurrentUser: true,
        },
        {
          uid: "u2",
          label: "Casey",
          email: "casey@example.com",
          avatarUrl: null,
          isCurrentUser: false,
        },
        {
          uid: "u3",
          label: "Jordan",
          email: "jordan@example.com",
          avatarUrl: null,
          isCurrentUser: false,
        },
      ],
      memberCount: 3,
      isSoloHousehold: false,
      isThreePlusHousehold: true,
      isLoadingHousehold: false,
      refreshHousehold: vi.fn(),
    });

    render(<SettingsPage />);

    expect(screen.getByText("3+ member household")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Members" })).toBeInTheDocument();
    expect(screen.getByText("Casey")).toBeInTheDocument();
    expect(screen.getByText("Jordan")).toBeInTheDocument();
  });
});
