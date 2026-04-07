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

export type HouseholdMemberView = HouseholdSummary["members"][number] & {
  label: string;
  avatarUrl: string | null;
  isCurrentUser: boolean;
};

type HouseholdContextValue = {
  household: HouseholdSummary | null;
  isLoadingHousehold: boolean;
  memberCount: number;
  members: HouseholdMemberView[];
  currentMember: HouseholdMemberView | null;
  otherMembers: HouseholdMemberView[];
  isSoloHousehold: boolean;
  isTwoMemberHousehold: boolean;
  isThreePlusHousehold: boolean;
  getMemberById: (uid: string) => HouseholdMemberView | undefined;
  getMemberLabelById: (uid: string) => string;
  refreshHousehold: () => Promise<void>;
};

const HouseholdContext = createContext<HouseholdContextValue | undefined>(
  undefined,
);

function resolveName(
  member: HouseholdSummary["members"][number],
  fallback: string,
): string {
  const displayName = member.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const email = member.email?.trim();
  if (email) {
    return email.split("@")[0] ?? fallback;
  }

  return fallback;
}

function mergeCurrentUserProfile(
  member: HouseholdSummary["members"][number],
  currentUserUid: string | null,
  currentUserEmail: string | null,
  currentProfile: {
    displayName: string | null;
    avatarDataUrl: string | null;
    photoURL: string | null;
  } | null,
) {
  if (!currentProfile) {
    return member;
  }

  const normalizedMemberEmail = member.email?.trim().toLowerCase() ?? null;
  const normalizedUserEmail = currentUserEmail?.trim().toLowerCase() ?? null;
  const normalizedMemberName = member.displayName?.trim().toLowerCase() ?? null;
  const normalizedProfileName =
    currentProfile.displayName?.trim().toLowerCase() ?? null;

  const matchesCurrentUser =
    (Boolean(currentUserUid) && member.uid === currentUserUid) ||
    (Boolean(normalizedUserEmail) &&
      normalizedMemberEmail === normalizedUserEmail) ||
    (Boolean(normalizedProfileName) &&
      normalizedMemberName === normalizedProfileName);

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

export function mapHouseholdMembers(
  household: HouseholdSummary | null,
  options: {
    currentUserUid: string | null;
    currentUserEmail: string | null;
    profile: {
      displayName: string | null;
      avatarDataUrl: string | null;
      photoURL: string | null;
    } | null;
  },
): HouseholdMemberView[] {
  if (!household) {
    return [];
  }

  return household.members.map((member, index) => {
    const merged = mergeCurrentUserProfile(
      member,
      options.currentUserUid,
      options.currentUserEmail,
      options.profile,
    );
    const isCurrentUser =
      Boolean(options.currentUserUid) && merged.uid === options.currentUserUid;
    const fallback = `Member ${index + 1}`;

    return {
      ...merged,
      label: isCurrentUser ? "You" : resolveName(merged, fallback),
      avatarUrl: merged.avatarDataUrl ?? merged.photoURL ?? null,
      isCurrentUser,
    };
  });
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

  const members = useMemo(
    () =>
      mapHouseholdMembers(household, {
        currentUserUid: user?.uid ?? null,
        currentUserEmail: user?.email ?? null,
        profile,
      }),
    [household, profile, user?.email, user?.uid],
  );

  const currentMember = useMemo(
    () => members.find((member) => member.isCurrentUser) ?? null,
    [members],
  );

  const otherMembers = useMemo(
    () => members.filter((member) => !member.isCurrentUser),
    [members],
  );

  const memberById = useMemo(
    () => new Map(members.map((member) => [member.uid, member])),
    [members],
  );

  const getMemberById = useCallback(
    (uid: string) => memberById.get(uid),
    [memberById],
  );

  const getMemberLabelById = useCallback(
    (uid: string) => memberById.get(uid)?.label ?? uid,
    [memberById],
  );

  const value = useMemo<HouseholdContextValue>(
    () => ({
      household,
      isLoadingHousehold,
      memberCount: members.length,
      members,
      currentMember,
      otherMembers,
      isSoloHousehold: members.length <= 1,
      isTwoMemberHousehold: members.length === 2,
      isThreePlusHousehold: members.length >= 3,
      getMemberById,
      getMemberLabelById,
      refreshHousehold,
    }),
    [
      currentMember,
      getMemberById,
      getMemberLabelById,
      household,
      isLoadingHousehold,
      members,
      otherMembers,
      refreshHousehold,
    ],
  );

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error("useHousehold must be used within HouseholdProvider");
  }

  return context;
}
