"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { formatInviteCode, normalizeInviteCode } from "@/lib/households/invite";
import {
  createHouseholdViaApi,
  joinHouseholdViaApi,
} from "@/lib/households/client-api";
import { useAuth } from "@/components/auth/auth-provider";

export function OnboardingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState(
    normalizeInviteCode(searchParams.get("invite") ?? ""),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);

  const formattedInviteCode = useMemo(
    () => (createdInviteCode ? formatInviteCode(createdInviteCode) : null),
    [createdInviteCode],
  );

  async function handleCreateHousehold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError("You must be signed in.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await createHouseholdViaApi(householdName);
      setCreatedInviteCode(result.inviteCode);
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create household.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoinHousehold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError("You must be signed in.");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      await joinHouseholdViaApi(inviteCode);
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join household.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Set up your household</h1>
        <p className="text-slate-600">
          Create a new household or join one using an invite code.
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        <form
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleCreateHousehold}
        >
          <h2 className="text-xl font-semibold text-slate-900">Create household</h2>
          <p className="text-sm text-slate-600">
            Use this if you are the first person setting up the app.
          </p>

          <label htmlFor="household-name" className="block text-sm text-slate-700">
            Household name
          </label>
          <input
            id="household-name"
            value={householdName}
            onChange={(event) => setHouseholdName(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            placeholder="Matt & Jessica"
          />

          <button
            type="submit"
            disabled={isCreating || isJoining}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "Create household"}
          </button>

          {formattedInviteCode ? (
            <p className="text-sm text-slate-600">
              Invite code: <span className="font-semibold text-slate-900">{formattedInviteCode}</span>
            </p>
          ) : null}
        </form>

        <form
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleJoinHousehold}
        >
          <h2 className="text-xl font-semibold text-slate-900">Join household</h2>
          <p className="text-sm text-slate-600">
            Paste the invite code from your partner.
          </p>

          <label htmlFor="invite-code" className="block text-sm text-slate-700">
            Invite code
          </label>
          <input
            id="invite-code"
            value={inviteCode}
            onChange={(event) => setInviteCode(normalizeInviteCode(event.target.value))}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tracking-wide text-slate-900"
            placeholder="ABCD1234EFGH"
            maxLength={18}
          />

          <button
            type="submit"
            disabled={isJoining || isCreating}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isJoining ? "Joining..." : "Join household"}
          </button>
        </form>
      </section>
    </main>
  );
}
