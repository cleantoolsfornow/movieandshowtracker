"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default function OnboardingPage() {
  const { isLoading, user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/sign-in?next=/onboarding");
      return;
    }

    if (!isLoading && user && profile?.householdId) {
      router.replace("/home");
    }
  }, [isLoading, profile?.householdId, router, user]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-slate-600">Loading account...</p>
      </main>
    );
  }

  if (!user || profile?.householdId) {
    return null;
  }

  return <OnboardingForm />;
}
