"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/ui/cn";

const sharedButtonClass =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-medium transition";

const secondaryClass =
  "border-border-strong/45 bg-surface text-text-muted hover:bg-surface-muted hover:text-foreground";

const primaryClass =
  "border-accent bg-accent text-accent-contrast hover:border-accent-strong hover:bg-accent-strong";

type PublicAuthCtaProps = {
  className?: string;
};

export function PublicAuthCta({ className }: PublicAuthCtaProps) {
  const { user, profile } = useAuth();
  const openAppHref = profile?.householdId ? "/home" : "/onboarding";

  if (user) {
    return (
      <Link className={cn(sharedButtonClass, primaryClass, className)} href={openAppHref}>
        Open app
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link className={cn(sharedButtonClass, secondaryClass)} href="/sign-in">
        Sign in
      </Link>
      <Link
        className={cn(sharedButtonClass, primaryClass)}
        href="/sign-in?mode=sign-up"
      >
        Create account
      </Link>
    </div>
  );
}
