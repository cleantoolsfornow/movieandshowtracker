"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
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
  const { household, isLoadingHousehold, refreshHousehold } = useHousehold();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Account and household details.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as {user?.email ?? user?.displayName ?? "Unknown"}
        </p>
        <div className="mt-4 flex items-center gap-4">
          {profile?.avatarDataUrl || profile?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarDataUrl ?? profile.photoURL ?? ""}
              alt="Profile avatar"
              className="h-14 w-14 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSavingAvatar}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {isSavingAvatar ? "Uploading..." : "Upload avatar"}
            </button>
            <p className="text-xs text-slate-500">
              Images are center-cropped and compressed for a lightweight avatar.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label
            htmlFor="display-name"
            className="block text-sm text-slate-700"
          >
            Display name
          </label>
          <input
            id="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            placeholder="Your name"
          />
          <p className="text-xs text-slate-500">
            This name is shown to other members in your household.
          </p>
          <button
            type="button"
            onClick={() => void handleSaveName()}
            disabled={isSavingName}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {isSavingName ? "Saving..." : "Save name"}
          </button>
        </div>
        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      {isLoadingHousehold ? (
        <div className="space-y-2">
          <LoadingSkeleton className="h-28" />
        </div>
      ) : null}

      {!isLoadingHousehold && !household ? (
        <EmptyStateCard
          title="No household"
          description="Complete onboarding first."
        />
      ) : null}

      {household ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Household</h2>
          <p className="mt-2 text-sm text-slate-600">Name: {household.name}</p>
          <p className="mt-1 text-sm text-slate-600">
            Invite code: {household.inviteCode}
          </p>
          <h3 className="mt-4 text-sm font-semibold text-slate-800">Members</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {household.members.map((member) => (
              <li key={member.uid}>
                {member.displayName ?? member.email ?? member.uid}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
