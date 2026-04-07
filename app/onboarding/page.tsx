"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import {
  CREATED_HOUSEHOLD_INVITE_CODE_KEY,
  CREATED_HOUSEHOLD_QUERY_VALUE,
  OnboardingForm,
} from "@/components/onboarding/onboarding-form";

export default function OnboardingPage() {
  const { isLoading, user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCreatedInviteCode = (() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return Boolean(
        window.sessionStorage.getItem(CREATED_HOUSEHOLD_INVITE_CODE_KEY),
      );
    } catch {
      return false;
    }
  })();
  const shouldStayOnCreatedHouseholdFlow =
    searchParams.get("created") === CREATED_HOUSEHOLD_QUERY_VALUE &&
    hasCreatedInviteCode === true;

  useEffect(() => {
    if (profile?.householdId && hasCreatedInviteCode === null) {
      return;
    }

    if (!isLoading && !user) {
      router.replace("/sign-in?next=/onboarding");
      return;
    }

    if (
      !isLoading &&
      user &&
      profile?.householdId &&
      !shouldStayOnCreatedHouseholdFlow
    ) {
      router.replace("/dashboard");
    }
  }, [
    hasCreatedInviteCode,
    isLoading,
    profile?.householdId,
    router,
    shouldStayOnCreatedHouseholdFlow,
    user,
  ]);

  if (isLoading || (profile?.householdId && hasCreatedInviteCode === null)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-slate-600">Loading account...</p>
      </main>
    );
  }

  if (!user || (profile?.householdId && !shouldStayOnCreatedHouseholdFlow)) {
    return null;
  }

  return <OnboardingForm />;
}
