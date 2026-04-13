"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";
import { useAuth } from "@/components/auth/auth-provider";
import { useHousehold } from "@/components/household/household-context";
import {
  signOutUser,
  updateCurrentUserDisplayName,
} from "@/lib/auth/auth-client";
import {
  updateUserAvatarDataUrl,
  updateUserDisplayName,
} from "@/lib/firestore/users";
import { compressAvatarToDataUrl } from "@/lib/profile/avatar";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const {
    household,
    isLoadingHousehold,
    refreshHousehold,
    members,
    memberCount,
    isSoloHousehold,
    isThreePlusHousehold,
  } = useHousehold();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof profile?.displayName !== "undefined") {
      setDisplayName(profile?.displayName ?? "");
    }
  }, [profile?.displayName]);

  async function handleSaveName() {
    if (!user) {
      setError("You must be signed in.");
      return;
    }

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }

    setIsSavingName(true);
    setError(null);
    setSuccess(null);

    try {
      await Promise.all([
        updateCurrentUserDisplayName(trimmed),
        updateUserDisplayName(user.uid, trimmed),
      ]);
      await refreshHousehold();
      setSuccess("Name updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name.");
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleAvatarSelected(event: ChangeEvent<HTMLInputElement>) {
    if (!user) {
      setError("You must be signed in.");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    setIsSavingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const avatarDataUrl = await compressAvatarToDataUrl(file);
      await updateUserAvatarDataUrl(user.uid, avatarDataUrl);
      await refreshHousehold();
      setSuccess("Avatar updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update avatar.");
    } finally {
      setIsSavingAvatar(false);
      event.target.value = "";
    }
  }

  async function copyInviteCode() {
    if (!household?.inviteCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setInviteMessage("Invite code copied.");
    } catch {
      setInviteMessage("Could not copy invite code.");
    }
  }

  async function shareInviteCode() {
    if (!household?.inviteCode) {
      return;
    }

    const message = `Join my household in Movie and Show Tracker with invite code: ${household.inviteCode}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Household invite code",
          text: message,
        });
        setInviteMessage("Invite code shared.");
        return;
      } catch {
        // Fall back to clipboard path.
      }
    }

    try {
      await navigator.clipboard.writeText(message);
      setInviteMessage("Share message copied.");
    } catch {
      setInviteMessage("Could not share invite code.");
    }
  }

  return (
    <div className="space-y-5">
      <PageCard
        elevated
        className="-mx-4 -mt-6 app-hero p-5 md:mx-0 md:mt-0 md:p-6 max-md:rounded-none max-md:border-0 max-md:px-4 max-md:py-2 max-md:ring-0"
      >
        <div className="flex flex-wrap gap-2">
          <Chip tone="muted" className="text-xs">
            {isSoloHousehold
              ? "Solo household"
              : isThreePlusHousehold
                ? "3+ member household"
                : "Two-member household"}
          </Chip>
          <Chip tone="muted" className="text-xs">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </Chip>
        </div>
      </PageCard>

      <PageCard className="-mx-4 p-5 md:mx-0 max-md:rounded-none max-md:border-0 max-md:ring-0">
        <SectionHeader title="Account" titleLevel="h2" />
        <p className="mt-2 text-sm text-text-muted">
          Signed in as {user?.email ?? user?.displayName ?? "Unknown"}
        </p>
        <div className="mt-4 flex items-center gap-4">
          {profile?.avatarDataUrl || profile?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarDataUrl ?? profile.photoURL ?? ""}
              alt="Profile avatar"
              className="h-14 w-14 rounded-full border border-border-subtle object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-surface-muted text-sm font-semibold text-text-muted">
              {displayName.trim().slice(0, 1).toUpperCase() || "U"}
            </div>
          )}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleAvatarSelected(event)}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSavingAvatar}
              variant="secondary"
              size="sm"
            >
              {isSavingAvatar ? "Uploading..." : "Upload avatar"}
            </Button>
            <p className="text-xs text-text-soft">
              Images are center-cropped and compressed for a lightweight avatar.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label
            htmlFor="display-name"
            className="block text-sm text-text-muted"
          >
            Display name
          </label>
          <input
            id="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="app-input w-full max-w-sm px-3 py-2 text-sm"
            placeholder="Your name"
          />
          <p className="text-xs text-text-soft">
            {isSoloHousehold
              ? "This name appears in your account and will be used if you invite others later."
              : "This name appears to other members in your household."}
          </p>
          <Button
            onClick={() => void handleSaveName()}
            disabled={isSavingName}
          >
            {isSavingName ? "Saving..." : "Save name"}
          </Button>
        </div>
        <div className="mt-6 border-t border-border-subtle pt-4">
          <Button
            onClick={() => void signOutUser()}
            variant="secondary"
          >
            Sign out
          </Button>
        </div>
      </PageCard>

      {error ? (
        <p className="rounded-xl border border-red-200/85 bg-red-50/80 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-200/85 bg-emerald-50/80 p-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}
      {inviteMessage ? (
        <p className="rounded-xl border border-emerald-200/85 bg-emerald-50/80 p-3 text-sm text-emerald-700">
          {inviteMessage}
        </p>
      ) : null}

      {isLoadingHousehold ? (
        <div className="space-y-2">
          <LoadingSkeleton className="h-28" rounded="xl" />
        </div>
      ) : null}

      {!isLoadingHousehold && !household ? (
        <EmptyStateCard
          title="No household"
          description="Complete onboarding first."
        />
      ) : null}

      {household ? (
        <PageCard className="-mx-4 p-5 md:mx-0 max-md:rounded-none max-md:border-0 max-md:ring-0">
          <SectionHeader
            title="Household"
            titleLevel="h2"
            description={
              isSoloHousehold
                ? "You can keep this solo or invite more members anytime."
                : "Manage invites and member identities."
            }
          />
          <p className="mt-2 text-sm text-text-muted">Name: {household.name}</p>

          <div className="mt-3 rounded-xl border border-border-subtle bg-surface-muted p-3">
            <p className="text-xs font-semibold tracking-wide text-text-soft uppercase">
              Invite code
            </p>
            <p className="mt-1 font-mono text-sm tracking-wide text-foreground">
              {household.inviteCode}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void copyInviteCode()}
              >
                Copy code
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void shareInviteCode()}
              >
                Share invite
              </Button>
            </div>
          </div>

          <h3 className="mt-4 text-sm font-semibold text-foreground">
            {memberCount === 1 ? "Member" : "Members"}
          </h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {members.map((member) => (
              <article
                key={member.uid}
                className="rounded-xl border border-border-subtle bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatarUrl}
                      alt=""
                      aria-hidden="true"
                      className="h-10 w-10 rounded-full border border-border-subtle object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-muted text-xs font-semibold text-text-muted">
                      {member.label.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {member.label}
                    </p>
                    <p className="truncate text-xs text-text-soft">
                      {member.email ?? member.uid}
                    </p>
                  </div>
                  {member.isCurrentUser ? (
                    <Chip tone="muted" className="ml-auto text-[11px]">
                      You
                    </Chip>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </PageCard>
      ) : null}
    </div>
  );
}
