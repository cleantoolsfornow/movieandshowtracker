import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageCard } from "@/components/common/page-card";

export default function OnboardingLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <PageCard elevated>
        <LoadingSkeleton className="h-10 w-64" rounded="xl" />
        <LoadingSkeleton className="mt-3 h-4 w-80 max-w-full" rounded="lg" />
      </PageCard>

      <section className="grid gap-6 md:grid-cols-2">
        <PageCard className="space-y-3">
          <LoadingSkeleton className="h-7 w-44" rounded="xl" />
          <LoadingSkeleton className="h-4 w-60 max-w-full" rounded="lg" />
          <LoadingSkeleton className="h-10 w-full" rounded="xl" />
          <LoadingSkeleton className="h-10 w-full" rounded="xl" />
        </PageCard>
        <PageCard className="space-y-3">
          <LoadingSkeleton className="h-7 w-44" rounded="xl" />
          <LoadingSkeleton className="h-4 w-60 max-w-full" rounded="lg" />
          <LoadingSkeleton className="h-10 w-full" rounded="xl" />
          <LoadingSkeleton className="h-10 w-full" rounded="xl" />
        </PageCard>
      </section>
    </main>
  );
}
