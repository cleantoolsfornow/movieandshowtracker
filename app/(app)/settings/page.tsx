"use client";

import { useEffect, useState } from "react";

import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useAuth } from "@/components/auth/auth-provider";
import { getHouseholdSummary } from "@/lib/tracker/client-api";

export default function SettingsPage() {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Awaited<ReturnType<typeof getHouseholdSummary>> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const next = await getHouseholdSummary();
        if (!cancelled) {
          setHousehold(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load settings.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Account and household details.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as {user?.email ?? user?.displayName ?? "Unknown"}
        </p>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <LoadingSkeleton className="h-28" />
          <LoadingSkeleton className="h-28" />
        </div>
      ) : null}

      {!isLoading && !household ? (
        <EmptyStateCard title="No household" description="Complete onboarding first." />
      ) : null}

      {household ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Household</h2>
          <p className="mt-2 text-sm text-slate-600">Name: {household.name}</p>
          <p className="mt-1 text-sm text-slate-600">Invite code: {household.inviteCode}</p>
          <h3 className="mt-4 text-sm font-semibold text-slate-800">Members</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {household.members.map((member) => (
              <li key={member.uid}>
                {member.displayName ?? member.email ?? member.uid}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
