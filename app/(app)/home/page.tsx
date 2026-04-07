"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useHousehold } from "@/components/household/household-context";
import { PosterCard } from "@/components/library/poster-card";
import { listTitles } from "@/lib/tracker/client-api";
import type { TitleViewModel } from "@/lib/tracker/types";

function Section({
  title,
  records,
}: {
  title: string;
  records: TitleViewModel[];
}) {
  if (records.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {records.slice(0, 6).map((record) => (
          <PosterCard key={record.id} record={record} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { isSoloHousehold } = useHousehold();
  const [records, setRecords] = useState<TitleViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const next = await listTitles({ sort: "recently_updated" });
        if (!cancelled) {
          setRecords(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load home.");
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

  const recentlyAdded = useMemo(() => records.slice(0, 8), [records]);
  const myWatchlist = useMemo(
    () => records.filter((record) => record.currentUser.wantsToWatch),
    [records],
  );
  const recentlyWatchedByMe = useMemo(
    () => records.filter((record) => record.currentUser.watched),
    [records],
  );
  const householdWatchlist = useMemo(
    () => records.filter((record) => record.household.wantsToWatch),
    [records],
  );
  const watchedTogether = useMemo(
    () => records.filter((record) => record.household.watchedTogether),
    [records],
  );

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Home</h1>
        <p className="mt-1 text-sm text-slate-600">
          Quick overview and shortcuts.
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/search"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700"
          >
            Quick add
          </Link>
          <Link
            href="/library"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Browse library
          </Link>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="aspect-[2/3]" />
          ))}
        </div>
      ) : null}

      {!isLoading && records.length === 0 ? (
        <EmptyStateCard
          title="No titles yet"
          description="Start by adding a movie or show from the Search page."
        />
      ) : null}

      {!isSoloHousehold ? (
        <>
          <Section title="Household watchlist" records={householdWatchlist} />
          <Section
            title="Recently watched together"
            records={watchedTogether}
          />
        </>
      ) : null}
      <Section title="My watchlist" records={myWatchlist} />
      <Section title="Recently watched" records={recentlyWatchedByMe} />
      <Section title="Recently added" records={recentlyAdded} />
    </div>
  );
}
