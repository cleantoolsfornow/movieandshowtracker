"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuth } from "@/components/auth/auth-provider";
import { getPostSignInPath } from "@/lib/auth/auth-helpers";

export default function SignInPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getPostSignInPath(searchParams.get("next"));

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(profile?.householdId ? nextPath : "/onboarding");
    }
  }, [isLoading, nextPath, profile?.householdId, router, user]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-3">
          <LoadingSkeleton className="h-12" rounded="xl" />
          <LoadingSkeleton className="h-64" rounded="xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(42,99,255,0.18),transparent_55%),radial-gradient(circle_at_85%_90%,rgba(21,122,110,0.14),transparent_50%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1fr_440px]">
        <section className="hidden space-y-4 md:block">
          <p className="app-kicker">Movie And Show Tracker</p>
          <h2 className="max-w-md text-4xl font-semibold text-foreground">
            Keep your watch decisions organized from day one.
          </h2>
          <p className="max-w-md text-sm leading-6 text-text-muted">
            Sign in to track personal picks now and expand into shared household flows when you are ready.
          </p>
        </section>
        <SignInForm />
      </div>
    </main>
  );
}
