"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TitleStatusEditor } from "@/components/status/title-status-editor";
import { getTitleById } from "@/lib/tracker/client-api";
import { buildPosterUrl } from "@/lib/tracker/shared";
import type { TitleRecord } from "@/lib/tracker/types";

export default function TitleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<TitleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const next = await getTitleById(id);
        if (!cancelled) {
          setRecord(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load title.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (id) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton className="h-12" />
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!record) {
    return (
      <EmptyStateCard
        title="Title not found"
        description="This title may have been removed."
      />
    );
  }

  const posterUrl = buildPosterUrl(record.title.posterPath, "w500");

  return (
    <div className="space-y-4">
      <Link href="/library" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to library
      </Link>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[220px_1fr]">
        <div className="overflow-hidden rounded-lg bg-slate-200">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={record.title.title}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">{record.title.title}</h1>
          <p className="text-sm text-slate-500">
            {record.title.mediaType.toUpperCase()} · {record.title.releaseYear ?? "-"}
          </p>
          <p className="text-sm leading-6 text-slate-700">{record.title.overview}</p>
          {record.title.genres.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {record.title.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-600"
                >
                  {genre}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <TitleStatusEditor record={record} onUpdated={setRecord} />
    </div>
  );
}
