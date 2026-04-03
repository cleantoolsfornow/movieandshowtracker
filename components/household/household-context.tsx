"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  getHouseholdSummary,
  type HouseholdSummary,
} from "@/lib/tracker/client-api";

type PersonLabels = {
  memberOne: string;
  memberTwo: string;
  together: string;
};

type PersonAvatars = {
  memberOne: string | null;
  memberTwo: string | null;
};

type HouseholdContextValue = {
  household: HouseholdSummary | null;
  isLoadingHousehold: boolean;
  personLabels: PersonLabels;
  personAvatars: PersonAvatars;
  refreshHousehold: () => Promise<void>;
};

const defaultLabels: PersonLabels = {
  memberOne: "Member 1",
  memberTwo: "Member 2",
  together: "Together",
};

const defaultAvatars: PersonAvatars = {
  memberOne: null,
  memberTwo: null,
};

const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined);

function resolveName(
  member: HouseholdSummary["members"][number] | undefined,
  fallback: string,
): string {
  const displayName = member?.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const email = member?.email?.trim();
  if (email) {
    return email.split("@")[0] ?? fallback;
  }

  return fallback;
}

function mergeCurrentUserProfile(
  member: HouseholdSummary["members"][number] | undefined,
  currentUserUid: string | null,
  currentUserEmail: string | null,
  currentProfile: { displayName: string | null; avatarDataUrl: string | null; photoURL: string | null } | null,
) {
  if (!member || !currentProfile) {
    return member;
  }

  const normalizedMemberEmail = member.email?.trim().toLowerCase() ?? null;
  const normalizedUserEmail = currentUserEmail?.trim().toLowerCase() ?? null;
  const normalizedMemberName = member.displayName?.trim().toLowerCase() ?? null;
  const normalizedProfileName = currentProfile.displayName?.trim().toLowerCase() ?? null;

  const matchesCurrentUser =
    (Boolean(currentUserUid) && member.uid === currentUserUid) ||
    (Boolean(normalizedUserEmail) && normalizedMemberEmail === normalizedUserEmail) ||
    (Boolean(normalizedProfileName) && normalizedMemberName === normalizedProfileName);

  if (!matchesCurrentUser) {
    return member;
  }

  return {
    ...member,
    displayName: currentProfile.displayName ?? member.displayName,
    avatarDataUrl: currentProfile.avatarDataUrl ?? member.avatarDataUrl,
    photoURL: currentProfile.photoURL ?? member.photoURL,
  };
}

export function HouseholdProvider({ children }: PropsWithChildren) {
  const { user, profile } = useAuth();
  const [household, setHousehold] = useState<HouseholdSummary | null>(null);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(true);

  const refreshHousehold = useCallback(async () => {
    if (!user || !profile?.householdId) {
      setHousehold(null);
      setIsLoadingHousehold(false);
      return;
    }

    setIsLoadingHousehold(true);
    try {
      const next = await getHouseholdSummary();
      setHousehold(next);
    } finally {
      setIsLoadingHousehold(false);
    }
  }, [profile?.householdId, user]);

  useEffect(() => {
    void refreshHousehold().catch(() => {
      setHousehold(null);
      setIsLoadingHousehold(false);
    });
  }, [refreshHousehold]);

  const personLabels = useMemo<PersonLabels>(() => {
    if (!household) {
      return defaultLabels;
    }

    const memberOne = mergeCurrentUserProfile(
      household.members[0],
      user?.uid ?? null,
      user?.email ?? null,
      profile,
    );
    const memberTwo = mergeCurrentUserProfile(
      household.members[1],
      user?.uid ?? null,
      user?.email ?? null,
      profile,
    );

    return {
      memberOne: resolveName(memberOne, "Member 1"),
      memberTwo: resolveName(memberTwo, "Member 2"),
      together: "Together",
    };
  }, [household, profile, user?.email, user?.uid]);

  const personAvatars = useMemo<PersonAvatars>(() => {
    if (!household) {
      return defaultAvatars;
    }

    const first = mergeCurrentUserProfile(
      household.members[0],
      user?.uid ?? null,
      user?.email ?? null,
      profile,
    );
    const second = mergeCurrentUserProfile(
      household.members[1],
      user?.uid ?? null,
      user?.email ?? null,
      profile,
    );

    return {
      memberOne: first?.avatarDataUrl ?? first?.photoURL ?? null,
      memberTwo: second?.avatarDataUrl ?? second?.photoURL ?? null,
    };
  }, [household, profile, user?.email, user?.uid]);

  const value = useMemo<HouseholdContextValue>(
    () => ({
      household,
      isLoadingHousehold,
      personLabels,
      personAvatars,
      refreshHousehold,
    }),
    [household, isLoadingHousehold, personLabels, personAvatars, refreshHousehold],
  );

  return (
    <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error("useHousehold must be used within HouseholdProvider");
  }

  return context;
}
