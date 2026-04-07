"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/ui/cn";

const baseClass =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition";

const primaryClass =
  "border-accent bg-accent text-accent-contrast hover:border-accent-strong hover:bg-accent-strong";

const secondaryClass =
  "border-border-strong/45 bg-surface text-text-muted hover:bg-surface-muted hover:text-foreground";

type HomeCtaRowProps = {
  className?: string;
  includeFeaturesLink?: boolean;
};

export function HomeCtaRow({
  className,
  includeFeaturesLink = true,
}: HomeCtaRowProps) {
  const { user, profile } = useAuth();
  const openAppHref = profile?.householdId ? "/home" : "/onboarding";

  if (user) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <Link className={cn(baseClass, primaryClass)} href={openAppHref}>
          Open app
        </Link>
        {includeFeaturesLink ? (
          <Link className="text-sm font-medium text-accent hover:text-accent-strong" href="/features">
            See features
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Link className={cn(baseClass, primaryClass)} href="/sign-in?mode=sign-up">
        Create account
      </Link>
      <Link className={cn(baseClass, secondaryClass)} href="/sign-in">
        Sign in
      </Link>
      {includeFeaturesLink ? (
        <Link className="text-sm font-medium text-accent hover:text-accent-strong" href="/features">
          See features
        </Link>
      ) : null}
    </div>
  );
}
