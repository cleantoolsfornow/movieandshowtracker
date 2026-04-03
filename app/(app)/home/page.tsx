"use client";

import { signOutUser } from "@/lib/auth/auth-client";
import { useAuth } from "@/components/auth/auth-provider";

export default function HomePage() {
  const { user, profile } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Home</h1>
        <p className="mt-2 text-slate-600">Phase 1 foundation is complete.</p>
        <p className="mt-4 text-sm text-slate-500">
          Signed in as: {user?.email ?? user?.displayName ?? "Unknown user"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Household ID: {profile?.householdId ?? "Not set"}
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => void signOutUser()}
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
