"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-100">
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600">
            An unexpected error occurred. You can retry this action.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
