"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { ArrowRightIcon } from "@/components/marketing/inline-icons";
import { cn } from "@/lib/ui/cn";

const sharedButtonClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition";

const secondaryClass = "marketing-button-secondary";

const primaryClass = "marketing-button-primary";

type PublicAuthCtaProps = {
  className?: string;
};

export function PublicAuthCta({ className }: PublicAuthCtaProps) {
  const { user, profile } = useAuth();
  const openAppHref = profile?.householdId ? "/dashboard" : "/onboarding";

  if (user) {
    return (
      <Link
        className={cn(sharedButtonClass, primaryClass, className)}
        href={openAppHref}
      >
        Open app
        <ArrowRightIcon className="h-4 w-4" />
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
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
