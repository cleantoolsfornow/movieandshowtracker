"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuth } from "@/components/auth/auth-provider";
import { ArrowRightIcon, UsersIcon } from "@/components/marketing/inline-icons";
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
      <main className="marketing-shell mx-auto flex min-h-screen w-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-3">
          <LoadingSkeleton className="h-12" rounded="xl" />
          <LoadingSkeleton className="h-64" rounded="xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="marketing-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(219,241,158,0.34),transparent_44%),radial-gradient(circle_at_85%_90%,rgba(244,188,70,0.18),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(40,117,66,0.12),transparent_30%)]" />
      <div className="marketing-dot-pattern pointer-events-none absolute top-24 left-10 h-40 w-40 rounded-full opacity-50" />
      <div className="marketing-dot-pattern pointer-events-none absolute right-10 bottom-10 h-56 w-56 rounded-full opacity-40" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-5 lg:grid-cols-[1.04fr_460px]">
        <section className="space-y-7">
          <div className="flex flex-wrap gap-2">
            <span className="marketing-pill text-xs font-semibold tracking-[0.2em] uppercase">
              Sign in
            </span>
            <span className="marketing-pill text-sm">
              Pick up where you left off
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-5xl leading-[0.98] font-semibold text-balance text-[rgb(23,35,18)] md:text-6xl">
              Your queue, your shared picks, and your next watch are waiting.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[rgb(69,84,53)]">
              Sign in to get back to the shortlist, the saved recommendations,
              and the household context that make deciding what to watch feel
              much easier.
            </p>
          </div>

          <div className="rounded-[34px] border border-[rgb(58,104,63,0.12)] bg-[rgba(255,251,243,0.72)] p-5 shadow-[0_22px_46px_rgba(84,90,42,0.1)] md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-[rgb(58,104,63,0.08)] pb-4">
              <div>
                <p className="app-kicker">Preview</p>
                <p className="mt-2 text-2xl font-semibold text-[rgb(23,35,18)]">
                  What you are signing back into
                </p>
              </div>
              <UsersIcon className="h-5 w-5 text-[rgb(36,103,58)]" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[28px] bg-[linear-gradient(160deg,rgba(36,67,52,0.96),rgba(18,36,27,0.94))] p-5 text-[rgb(245,252,236)]">
                <p className="text-xs font-semibold tracking-[0.18em] text-[rgba(245,252,236,0.66)] uppercase">
                  Tonight&apos;s shortlist
                </p>
                <p className="mt-3 text-3xl leading-tight font-semibold">
                  Three strong options already lined up.
                </p>
                <div className="mt-5 space-y-2">
                  {["Severance", "Paddington in Peru", "Dune: Part Two"].map(
                    (title) => (
                      <div
                        key={title}
                        className="flex items-center justify-between rounded-2xl bg-[rgba(255,255,255,0.1)] px-3 py-2.5"
                      >
                        <span className="font-medium">{title}</span>
                        <ArrowRightIcon className="h-4 w-4 text-[rgba(245,252,236,0.72)]" />
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[26px] bg-[rgba(255,255,255,0.72)] p-4">
                  <p className="app-kicker">Household pulse</p>
                  <p className="mt-2 text-2xl font-semibold text-[rgb(23,35,18)]">
                    Shared context is already sorted.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[rgb(69,84,53)]">
                    No need to remember who wanted what or which titles still
                    have momentum.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-[rgba(255,255,255,0.72)] p-4">
                    <p className="app-kicker">Saved</p>
                    <p className="mt-2 text-3xl font-semibold text-[rgb(23,35,18)]">
                      34
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-[rgba(255,255,255,0.72)] p-4">
                    <p className="app-kicker">Ready tonight</p>
                    <p className="mt-2 text-3xl font-semibold text-[rgb(23,35,18)]">
                      3
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SignInForm />
      </div>
    </main>
  );
}
