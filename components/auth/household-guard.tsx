"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

export function HouseholdGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname || "/home")}`);
      return;
    }

    if (!isLoading && user && !profile?.householdId) {
      router.replace("/onboarding");
    }
  }, [isLoading, pathname, profile?.householdId, router, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading session...
      </div>
    );
  }

  if (!user || !profile?.householdId) {
    return null;
  }

  return <>{children}</>;
}
