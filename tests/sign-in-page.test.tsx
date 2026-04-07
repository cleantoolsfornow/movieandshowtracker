import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInPage from "@/app/(auth)/sign-in/page";

const replaceMock = vi.fn();
const useAuthMock = vi.fn();
let searchParamsMock = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsMock,
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/components/auth/sign-in-form", () => ({
  SignInForm: () => <div>Sign-in form</div>,
}));

describe("SignInPage", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    useAuthMock.mockReset();
    searchParamsMock = new URLSearchParams();
  });

  it("redirects signed-in users with a household to the next path when provided", async () => {
    searchParamsMock = new URLSearchParams("next=/library");
    useAuthMock.mockReturnValue({
      isLoading: false,
      user: { uid: "user-1" },
      profile: { householdId: "household-1" },
    });

    render(<SignInPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/library");
    });
  });

  it("redirects signed-in users without a household to onboarding", async () => {
    searchParamsMock = new URLSearchParams("next=/library");
    useAuthMock.mockReturnValue({
      isLoading: false,
      user: { uid: "user-1" },
      profile: { householdId: null },
    });

    render(<SignInPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/onboarding");
    });
  });
});
