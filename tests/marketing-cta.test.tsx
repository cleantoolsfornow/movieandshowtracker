import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import { PublicAuthCta } from "@/components/marketing/public-auth-cta";

const useAuthMock = vi.fn();

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => useAuthMock(),
}));

describe("Marketing CTAs", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("shows sign-in and create-account actions for signed-out users", () => {
    useAuthMock.mockReturnValue({ user: null, profile: null });

    render(<PublicAuthCta />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/sign-in?mode=sign-up",
    );
  });

  it("routes signed-in users without a household to onboarding", () => {
    useAuthMock.mockReturnValue({
      user: { uid: "user-1" },
      profile: { householdId: null },
    });

    render(<HomeCtaRow includeFeaturesLink={false} />);

    expect(screen.getByRole("link", { name: "Open app" })).toHaveAttribute(
      "href",
      "/onboarding",
    );
  });

  it("routes signed-in users with household membership to home", () => {
    useAuthMock.mockReturnValue({
      user: { uid: "user-1" },
      profile: { householdId: "household-1" },
    });

    render(<HomeCtaRow includeFeaturesLink={false} />);

    expect(screen.getByRole("link", { name: "Open app" })).toHaveAttribute(
      "href",
      "/home",
    );
  });

  it("uses onboarding as the header CTA target for signed-in users without household", () => {
    useAuthMock.mockReturnValue({
      user: { uid: "user-1" },
      profile: { householdId: null },
    });

    render(<PublicAuthCta />);

    expect(screen.getByRole("link", { name: "Open app" })).toHaveAttribute(
      "href",
      "/onboarding",
    );
  });
});
