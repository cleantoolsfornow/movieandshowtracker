import { beforeEach, describe, expect, it, vi } from "vitest";

const createUserWithEmailAndPasswordMock = vi.fn();
const updateProfileMock = vi.fn();
const getFirebaseAuthMock = vi.fn(() => "auth-instance");
const ensureUserProfileMock = vi.fn();

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: updateProfileMock,
}));

vi.mock("@/lib/firebase/auth", () => ({
  getFirebaseAuth: getFirebaseAuthMock,
  getGoogleProvider: vi.fn(),
}));

vi.mock("@/lib/firestore/users", () => ({
  ensureUserProfile: ensureUserProfileMock,
}));

describe("signUpWithEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists the trimmed display name into auth and the app profile", async () => {
    const authUser = {
      uid: "user-1",
      displayName: null,
      email: "alex@example.com",
    };

    createUserWithEmailAndPasswordMock.mockResolvedValue({ user: authUser });
    updateProfileMock.mockImplementation(
      async (
        user: { displayName: string | null },
        payload: { displayName: string },
      ) => {
        user.displayName = payload.displayName;
      },
    );
    ensureUserProfileMock.mockResolvedValue(undefined);

    const { signUpWithEmail } = await import("@/lib/auth/auth-client");

    await signUpWithEmail("alex@example.com", "hunter2", "  Alex  ");

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(
      "auth-instance",
      "alex@example.com",
      "hunter2",
    );
    expect(updateProfileMock).toHaveBeenCalledWith(authUser, {
      displayName: "Alex",
    });
    expect(ensureUserProfileMock).toHaveBeenCalledWith(authUser);
  });
});
