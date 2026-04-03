import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HouseholdGuard } from "@/components/auth/household-guard";

const replaceMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/home",
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => useAuthMock(),
}));

describe("HouseholdGuard", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    useAuthMock.mockReset();
  });

  it("redirects signed-in users without household to onboarding", async () => {
    useAuthMock.mockReturnValue({
      isLoading: false,
      user: { uid: "user-1" },
      profile: { householdId: null },
    });

    render(
      <HouseholdGuard>
        <div>App</div>
      </HouseholdGuard>,
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/onboarding");
    });
  });

  it("renders children when household exists", () => {
    useAuthMock.mockReturnValue({
      isLoading: false,
      user: { uid: "user-1" },
      profile: { householdId: "household-1" },
    });

    render(
      <HouseholdGuard>
        <div>App</div>
      </HouseholdGuard>,
    );

    expect(screen.getByText("App")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
