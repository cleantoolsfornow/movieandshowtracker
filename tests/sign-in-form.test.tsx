import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignInForm } from "@/components/auth/sign-in-form";

const pushMock = vi.fn();
let searchParamsMock = new URLSearchParams();

const signInWithGoogleMock = vi.fn();
const signInWithEmailMock = vi.fn();
const signUpWithEmailMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParamsMock,
}));

vi.mock("@/lib/auth/auth-client", () => ({
  signInWithGoogle: (...args: unknown[]) => signInWithGoogleMock(...args),
  signInWithEmail: (...args: unknown[]) => signInWithEmailMock(...args),
  signUpWithEmail: (...args: unknown[]) => signUpWithEmailMock(...args),
}));

describe("SignInForm", () => {
  beforeEach(() => {
    searchParamsMock = new URLSearchParams();
    pushMock.mockReset();
    signInWithGoogleMock.mockReset();
    signInWithEmailMock.mockReset();
    signUpWithEmailMock.mockReset();

    signInWithGoogleMock.mockResolvedValue({});
    signInWithEmailMock.mockResolvedValue({});
    signUpWithEmailMock.mockResolvedValue({});
  });

  it("renders auth controls", () => {
    render(<SignInForm />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("calls google sign in when google button is clicked", async () => {
    render(<SignInForm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    await waitFor(() => {
      expect(signInWithGoogleMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("submits email sign in", async () => {
    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });

    const form = screen.getByLabelText("Email").closest("form");
    if (!form) {
      throw new Error("Sign-in form should exist");
    }

    fireEvent.click(within(form).getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(signInWithEmailMock).toHaveBeenCalledWith(
        "test@example.com",
        "secret123",
      );
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("requires a name when signing up with email", async () => {
    render(<SignInForm />);

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alex" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });

    const form = screen.getByLabelText("Email").closest("form");
    if (!form) {
      throw new Error("Sign-up form should exist");
    }

    fireEvent.click(
      within(form).getByRole("button", { name: "Create account" }),
    );

    await waitFor(() => {
      expect(signUpWithEmailMock).toHaveBeenCalledWith(
        "alex@example.com",
        "secret123",
        "Alex",
      );
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("initializes in sign-up mode from the mode query param", () => {
    searchParamsMock = new URLSearchParams("mode=sign-up");

    render(<SignInForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("preserves next redirect behavior for sign-up mode", async () => {
    searchParamsMock = new URLSearchParams("mode=sign-up&next=/library");

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alex" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });

    const form = screen.getByLabelText("Email").closest("form");
    if (!form) {
      throw new Error("Sign-up form should exist");
    }

    fireEvent.click(
      within(form).getByRole("button", { name: "Create account" }),
    );

    await waitFor(() => {
      expect(signUpWithEmailMock).toHaveBeenCalledWith(
        "alex@example.com",
        "secret123",
        "Alex",
      );
      expect(pushMock).toHaveBeenCalledWith("/library");
    });
  });
});
