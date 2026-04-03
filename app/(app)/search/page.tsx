"use client";

import { useEffect, useMemo, useState } from "react";

import { SearchResultCard } from "@/components/search/search-result-card";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { searchTmdb } from "@/lib/tracker/client-api";
import type { TmdbSearchResult } from "@/lib/tracker/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [normalizedQuery]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Search & Add</h1>
        <p className="mt-1 text-sm text-slate-600">
          Search TMDb and add titles with one tap or a quick status action.
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search movies and shows..."
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
        </div>
      ) : null}

      {!isLoading && normalizedQuery && results.length === 0 ? (
        <EmptyStateCard
          title="No results"
          description="Try another title, year, or shorter query."
        />
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        {results.map((result) => (
          <SearchResultCard key={`${result.mediaType}_${result.tmdbId}`} item={result} />
        ))}
      </section>
    </div>
  );
}
