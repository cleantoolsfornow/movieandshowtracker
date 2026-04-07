"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { ArrowRightIcon } from "@/components/marketing/inline-icons";
import { cn } from "@/lib/ui/cn";

const baseClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border px-5 py-3 text-sm font-semibold transition";

const primaryClass = "marketing-button-primary";

const secondaryClass = "marketing-button-secondary";

type HomeCtaRowProps = {
  className?: string;
  includeFeaturesLink?: boolean;
};

export function HomeCtaRow({
  className,
  includeFeaturesLink = true,
}: HomeCtaRowProps) {
  const { user, profile } = useAuth();
  const openAppHref = profile?.householdId ? "/dashboard" : "/onboarding";

  if (user) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <Link className={cn(baseClass, primaryClass)} href={openAppHref}>
          Open app
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        {includeFeaturesLink ? (
          <Link
            className="marketing-link text-sm font-semibold"
            href="/features"
          >
            See features
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Link
        className={cn(baseClass, primaryClass)}
        href="/sign-in?mode=sign-up"
      >
        Create account
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
      <Link className={cn(baseClass, secondaryClass)} href="/sign-in">
        Sign in
      </Link>
      {includeFeaturesLink ? (
        <Link className="marketing-link text-sm font-semibold" href="/features">
          See features
        </Link>
      ) : null}
    </div>
  );
}
