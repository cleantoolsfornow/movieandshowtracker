"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/common/button";
import { SearchResultCard } from "@/components/search/search-result-card";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";
import { useTitlesQuery } from "@/lib/tracker/queries";
import { searchTmdb } from "@/lib/tracker/client-api";
import type { TmdbSearchResult } from "@/lib/tracker/types";

const RECENT_SEARCHES_KEY = "tracker_recent_searches_v1";
const QUICK_SUGGESTIONS = [
  "Dune",
  "The Last of Us",
  "Interstellar",
  "Severance",
  "Arrival",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const normalizedQuery = useMemo(() => query.trim(), [query]);
  const hasQuery = normalizedQuery.length > 0;
  const { data: trackedTitles = [] } = useTitlesQuery();
  const trackedTitleLookup = useMemo(
    () =>
      new Map(
        trackedTitles.map((record) => [
          `${record.mediaType}_${record.tmdbId}`,
          record,
        ]),
      ),
    [trackedTitles],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentSearches(
          parsed.filter((value): value is string => typeof value === "string"),
        );
      }
    } catch {
      // ignore localStorage parsing errors
    }
  }, []);

  useEffect(() => {
    if (!normalizedQuery) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextResults = await searchTmdb(normalizedQuery);
        setResults(nextResults);
        setRecentSearches((previous) => {
          const next = [
            normalizedQuery,
            ...previous.filter(
              (item) => item.toLowerCase() !== normalizedQuery.toLowerCase(),
            ),
          ].slice(0, 6);

          try {
            window.localStorage.setItem(
              RECENT_SEARCHES_KEY,
              JSON.stringify(next),
            );
          } catch {
            // ignore localStorage write errors
          }

          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [normalizedQuery]);

  return (
    <div className="space-y-5">
      <PageCard elevated className="app-hero p-5 md:p-6">
        <SectionHeader
          title="Search & Save"
          titleLevel="h1"
          titleClassName="text-3xl"
          description="Find titles fast, then save with a status in one tap."
        />
        <div className="mt-5 flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies and shows..."
            className="app-input w-full px-3 py-2 text-sm"
          />
          {hasQuery ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery("");
                setSuccessMessage(null);
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>

        {!hasQuery ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold tracking-wide text-text-soft uppercase">
              Quick suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {!hasQuery && recentSearches.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold tracking-wide text-text-soft uppercase">
              Recent searches
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((recent) => (
                <Button
                  key={recent}
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery(recent)}
                >
                  {recent}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </PageCard>

      {successMessage ? (
        <p className="rounded-xl border border-emerald-200/85 bg-emerald-50/80 p-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200/85 bg-red-50/80 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="app-stagger grid gap-3 md:grid-cols-2">
          <LoadingSkeleton className="h-32" rounded="xl" />
          <LoadingSkeleton className="h-32" rounded="xl" />
          <LoadingSkeleton className="h-32" rounded="xl" />
          <LoadingSkeleton className="h-32" rounded="xl" />
        </div>
      ) : null}

      {!isLoading && hasQuery && results.length === 0 ? (
        <EmptyStateCard
          title="No results"
          description="Try another title, year, or shorter query. You can also try a broader franchise name."
          actionLabel="Clear search"
          actionHref="/search"
          actionVariant="secondary"
        />
      ) : null}

      {!isLoading && hasQuery && results.length > 0 ? (
        <PageCard className="p-3">
          <p className="text-sm text-text-muted">
            Found <span className="font-semibold text-foreground">{results.length}</span>{" "}
            results for <span className="font-semibold text-foreground">“{normalizedQuery}”</span>
          </p>
        </PageCard>
      ) : null}

      <section className="app-stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {results.map((result) => (
          <SearchResultCard
            key={`${result.mediaType}_${result.tmdbId}`}
            item={result}
            existingRecord={trackedTitleLookup.get(
              `${result.mediaType}_${result.tmdbId}`,
            )}
            onAdded={(record) => {
              setSuccessMessage(`Saved “${record.name}”.`);
            }}
          />
        ))}
      </section>
    </div>
  );
}
