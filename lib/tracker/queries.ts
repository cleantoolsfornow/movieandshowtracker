"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { getTitleById, listTitles } from "@/lib/tracker/client-api";

type ListTitleFilters = Parameters<typeof listTitles>[0];

export const titlesQueryKey = ["titles"] as const;

export function titleQueryKey(titleId: string) {
  return ["title", titleId] as const;
}

export function invalidateTitlesQuery(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: titlesQueryKey });
}

export function useTitlesQuery(filters?: ListTitleFilters) {
  return useQuery({
    queryKey: [...titlesQueryKey, filters ?? {}],
    queryFn: () => listTitles(filters),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useTitleQuery(titleId: string) {
  return useQuery({
    queryKey: titleQueryKey(titleId),
    queryFn: () => getTitleById(titleId),
    enabled: Boolean(titleId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
