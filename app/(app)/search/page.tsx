"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/common/button";
import { SearchResultCard } from "@/components/search/search-result-card";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageCard } from "@/components/common/page-card";
import { useToast } from "@/components/common/toast";
import { useTitlesQuery } from "@/lib/tracker/queries";
import { searchTvdb } from "@/lib/tracker/client-api";
import type { TvdbSearchResult } from "@/lib/tracker/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TvdbSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const normalizedQuery = useMemo(() => query.trim(), [query]);
  const hasQuery = normalizedQuery.length > 0;
  const { data: trackedTitles = [] } = useTitlesQuery();
  const trackedTitleLookup = useMemo(
    () =>
      new Map(
        trackedTitles.map((record) => [
          `${record.mediaType}_${record.tvdbId}`,
          record,
        ]),
      ),
    [trackedTitles],
  );

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
        const nextResults = await searchTvdb(normalizedQuery);
        setResults(nextResults);
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
      <div className="-mx-4 -mt-6 max-md:sticky max-md:top-[5.875rem] max-md:z-10 md:mx-0 md:mt-0">
        <PageCard
          elevated
          className="app-hero p-5 max-md:rounded-none max-md:border-0 max-md:p-2 max-md:shadow-none max-md:ring-0 md:p-6"
        >
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search movies and shows..."
              className="app-input w-full px-3 py-2 text-sm max-md:rounded-none max-md:border-0 max-md:shadow-none max-md:focus-visible:border-0 max-md:focus-visible:shadow-none"
            />
            {hasQuery ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery("");
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </PageCard>
      </div>

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
        <p className="text-text-muted text-sm">
          Found{" "}
          <span className="text-foreground font-semibold">
            {results.length}
          </span>{" "}
          results for{" "}
          <span className="text-foreground font-semibold">
            “{normalizedQuery}”
          </span>
        </p>
      ) : null}

      <section className="app-stagger -mx-4 grid gap-0 md:mx-0 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
        {results.map((result, index) => (
          <div
            key={`${result.mediaType}_${result.tvdbId}`}
            className={
              index > 0 ? "max-md:border-border-subtle/70 max-md:border-t" : ""
            }
          >
            <SearchResultCard
              item={result}
              existingRecord={trackedTitleLookup.get(
                `${result.mediaType}_${result.tvdbId}`,
              )}
              onAdded={(record) => {
                showToast(`Saved “${record.name}”.`);
              }}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
