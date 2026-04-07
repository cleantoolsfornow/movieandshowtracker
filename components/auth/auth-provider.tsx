"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "firebase/auth";

import { subscribeToAuthState } from "@/lib/auth/auth-client";
import {
  ensureUserProfile,
  subscribeToUserProfile,
  type UserProfile,
} from "@/lib/firestore/users";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isLoadingAuth: boolean;
  isLoadingProfile: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profileState, setProfileState] = useState<
    UserProfile | null | undefined
  >(undefined);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((authUser) => {
      setUser(authUser);
      setProfileState(authUser ? undefined : null);
      setIsLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    void ensureUserProfile(user).catch((error: unknown) => {
      console.error("Failed to ensure user profile:", error);
    });

    const unsubscribe = subscribeToUserProfile(user.uid, (nextProfile) => {
      if (!isMounted) {
        return;
      }

      setProfileState(nextProfile);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  const profile = profileState ?? null;
  const isLoadingProfile = Boolean(user) && typeof profileState === "undefined";
  const isLoading = isLoadingAuth || (Boolean(user) && isLoadingProfile);

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoadingAuth,
      isLoadingProfile,
      isLoading,
    }),
    [isLoading, isLoadingAuth, isLoadingProfile, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
