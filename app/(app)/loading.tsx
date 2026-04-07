import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageCard } from "@/components/common/page-card";

export default function AppSegmentLoading() {
  return (
    <div className="space-y-4">
      <PageCard elevated>
        <LoadingSkeleton className="h-8 w-56" rounded="xl" />
        <LoadingSkeleton className="mt-3 h-4 w-72 max-w-full" rounded="lg" />
      </PageCard>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <PageCard key={index} className="space-y-2 p-3">
            <LoadingSkeleton className="h-3 w-28" rounded="lg" />
            <LoadingSkeleton className="h-7 w-16" rounded="lg" />
            <LoadingSkeleton className="h-3 w-32" rounded="lg" />
          </PageCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <LoadingSkeleton key={index} className="aspect-[2/3]" rounded="xl" />
        ))}
      </div>
    </div>
  );
}
