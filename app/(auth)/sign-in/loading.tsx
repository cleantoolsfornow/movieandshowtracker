import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export default function SignInLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-3">
        <LoadingSkeleton className="h-12" rounded="xl" />
        <LoadingSkeleton className="h-72" rounded="xl" />
      </div>
    </main>
  );
}
