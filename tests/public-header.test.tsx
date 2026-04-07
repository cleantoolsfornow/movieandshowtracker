import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicHeader } from "@/components/marketing/public-header";

let pathnameMock = "/";
const useAuthMock = vi.fn();

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation",
  );

  return {
    ...actual,
    usePathname: () => pathnameMock,
  };
});

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => useAuthMock(),
}));

describe("PublicHeader", () => {
  beforeEach(() => {
    pathnameMock = "/";
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({ user: null, profile: null });
  });

  it("highlights the active nav item", () => {
    pathnameMock = "/features";

    render(<PublicHeader />);

    expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
