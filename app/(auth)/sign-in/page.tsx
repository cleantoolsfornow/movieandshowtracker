"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuth } from "@/components/auth/auth-provider";

export default function SignInPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(profile?.householdId ? "/home" : "/onboarding");
    }
  }, [isLoading, profile?.householdId, router, user]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-slate-600">Loading session...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <SignInForm />
    </main>
  );
}
