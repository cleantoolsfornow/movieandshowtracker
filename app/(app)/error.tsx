"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Protected app error:", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-900">This page failed to load</h2>
      <p className="mt-2 text-sm text-red-700">Please retry or return to Home.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
}
