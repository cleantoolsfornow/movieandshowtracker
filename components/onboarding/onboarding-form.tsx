"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";
import { formatInviteCode, normalizeInviteCode } from "@/lib/households/invite";
import {
  createHouseholdViaApi,
  joinHouseholdViaApi,
} from "@/lib/households/client-api";
import { signOutUser } from "@/lib/auth/auth-client";
import { useAuth } from "@/components/auth/auth-provider";

export const CREATED_HOUSEHOLD_INVITE_CODE_KEY =
  "tracker_created_household_invite_code";
export const CREATED_HOUSEHOLD_QUERY_VALUE = "1";

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
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(
    null,
  );
  const [inviteActionMessage, setInviteActionMessage] = useState<string | null>(
    null,
  );

  const formattedInviteCode = useMemo(
    () => (createdInviteCode ? formatInviteCode(createdInviteCode) : null),
    [createdInviteCode],
  );
  const formattedInviteCodeInput = useMemo(
    () => (inviteCode ? formatInviteCode(inviteCode) : ""),
    [inviteCode],
  );

  useEffect(() => {
    try {
      const storedInviteCode = window.sessionStorage.getItem(
        CREATED_HOUSEHOLD_INVITE_CODE_KEY,
      );
      if (storedInviteCode) {
        setCreatedInviteCode(storedInviteCode);
      }
    } catch {
      // ignore sessionStorage access errors
    }
  }, []);

  function clearCreatedHouseholdInviteCode() {
    try {
      window.sessionStorage.removeItem(CREATED_HOUSEHOLD_INVITE_CODE_KEY);
    } catch {
      // ignore sessionStorage access errors
    }
  }

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
      try {
        window.sessionStorage.setItem(
          CREATED_HOUSEHOLD_INVITE_CODE_KEY,
          result.inviteCode,
        );
      } catch {
        // ignore sessionStorage access errors
      }
      setCreatedInviteCode(result.inviteCode);
      setInviteActionMessage("Household created. Share your invite code when ready.");
      setHouseholdName("");
      router.replace(`/onboarding?created=${CREATED_HOUSEHOLD_QUERY_VALUE}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create household.",
      );
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
      clearCreatedHouseholdInviteCode();
      await joinHouseholdViaApi(inviteCode);
      router.replace("/home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to join household.",
      );
    } finally {
      setIsJoining(false);
    }
  }

  async function copyCreatedInviteCode() {
    if (!formattedInviteCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formattedInviteCode);
      setInviteActionMessage("Invite code copied.");
    } catch {
      setInviteActionMessage("Could not copy invite code.");
    }
  }

  async function shareCreatedInviteCode() {
    if (!formattedInviteCode) {
      return;
    }

    const message = `Join my household in Movie and Show Tracker with invite code: ${formattedInviteCode}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Household invite code",
          text: message,
        });
        setInviteActionMessage("Invite code shared.");
        return;
      } catch {
        // Fall back to clipboard flow below.
      }
    }

    try {
      await navigator.clipboard.writeText(message);
      setInviteActionMessage("Share message copied.");
    } catch {
      setInviteActionMessage("Could not share invite code.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <PageCard elevated>
        <div className="flex items-start justify-between gap-3">
          <SectionHeader
            title="Set up your household"
            titleLevel="h1"
            titleClassName="text-3xl"
            description="Start solo now, then invite more members whenever you want."
          />
          <Button
            onClick={() => {
              clearCreatedHouseholdInviteCode();
              void signOutUser();
            }}
            variant="secondary"
            size="sm"
          >
            Sign out
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip tone="muted" className="text-xs">
            Works for solo households
          </Chip>
          <Chip tone="muted" className="text-xs">
            Invite more members later
          </Chip>
        </div>
      </PageCard>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      {inviteActionMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {inviteActionMessage}
        </p>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        <form
          className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft"
          onSubmit={handleCreateHousehold}
        >
          <SectionHeader
            title="Create household"
            titleLevel="h2"
            description="Best for starting fresh. You can invite people after setup."
          />

          <label htmlFor="household-name" className="block text-sm text-text-muted">
            Household name
          </label>
          <input
            id="household-name"
            value={householdName}
            onChange={(event) => setHouseholdName(event.target.value)}
            required
            className="w-full rounded-xl border border-border-strong/45 bg-surface px-3 py-2 text-sm text-foreground"
            placeholder="Household name"
          />
          <p className="text-xs text-text-soft">
            Solo setup is fully supported. Add members when you are ready.
          </p>

          <Button
            type="submit"
            disabled={isCreating || isJoining}
            className="w-full"
          >
            {isCreating ? "Creating..." : "Create household"}
          </Button>

          {formattedInviteCode ? (
            <div className="space-y-2 rounded-xl border border-border-subtle bg-surface-muted p-3">
              <p className="text-xs font-semibold tracking-wide text-text-soft uppercase">
                Invite code
              </p>
              <p className="font-mono text-sm tracking-wide text-foreground">
                {formattedInviteCode}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void copyCreatedInviteCode()}
                >
                  Copy code
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void shareCreatedInviteCode()}
                >
                  Share invite
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    clearCreatedHouseholdInviteCode();
                    router.replace("/home");
                  }}
                >
                  Continue to Home
                </Button>
              </div>
            </div>
          ) : null}
        </form>

        <form
          className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft"
          onSubmit={handleJoinHousehold}
        >
          <SectionHeader
            title="Join household"
            titleLevel="h2"
            description="Use an invite code from an existing member."
          />

          <label htmlFor="invite-code" className="block text-sm text-text-muted">
            Invite code
          </label>
          <input
            id="invite-code"
            value={formattedInviteCodeInput}
            onChange={(event) =>
              setInviteCode(normalizeInviteCode(event.target.value))
            }
            required
            className="w-full rounded-xl border border-border-strong/45 bg-surface px-3 py-2 font-mono text-sm tracking-wide text-foreground"
            placeholder="ABCD1234EFGH"
            maxLength={18}
          />
          <p className="text-xs text-text-soft">
            Codes are case-insensitive. Spaces and dashes are optional.
          </p>

          <Button
            type="submit"
            disabled={isJoining || isCreating}
            variant="secondary"
            className="w-full"
          >
            {isJoining ? "Joining..." : "Join household"}
          </Button>
        </form>
      </section>
    </main>
  );
}
