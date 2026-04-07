"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";
import { SparkIcon, UsersIcon } from "@/components/marketing/inline-icons";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth/auth-client";
import {
  getAuthErrorMessage,
  getPostSignInPath,
} from "@/lib/auth/auth-helpers";

type Mode = "sign-in" | "sign-up";

export function SignInForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode");

  const nextPath = useMemo(
    () => getPostSignInPath(searchParams.get("next")),
    [searchParams],
  );

  useEffect(() => {
    if (requestedMode === "sign-up") {
      setMode("sign-up");
      return;
    }

    setMode("sign-in");
  }, [requestedMode]);

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    setError(null);

    try {
      await signInWithGoogle();
      router.push(nextPath);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "sign-up") {
        const trimmedName = displayName.trim();
        if (!trimmedName) {
          setError("Name is required.");
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, trimmedName);
      } else {
        await signInWithEmail(email, password);
      }
      router.push(nextPath);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageCard
      className="w-full max-w-md space-y-6 rounded-[34px] border-[rgb(58,104,63,0.12)] bg-[rgba(255,251,243,0.82)] p-6 shadow-[0_24px_54px_rgba(80,88,37,0.14)] md:p-7"
      elevated
    >
      <div className="space-y-3">
        <SectionHeader
          title={
            mode === "sign-up" ? "Create your account" : "Sign in to FilmPickle"
          }
          titleLevel="h1"
          titleClassName="text-3xl text-[rgb(23,35,18)]"
          description={
            mode === "sign-up"
              ? "Start tracking movies and shows for yourself or the whole household."
              : "Jump back into your queue, your shared picks, and your next watch."
          }
          className="items-start"
        />
        <div className="flex flex-wrap gap-2">
          <Chip
            tone="muted"
            className="border-[rgb(58,104,63,0.12)] bg-[rgba(255,251,243,0.84)] text-xs text-[rgb(55,71,42)]"
          >
            <SparkIcon className="h-3.5 w-3.5" />
            Solo-friendly
          </Chip>
          <Chip
            tone="muted"
            className="border-[rgb(58,104,63,0.12)] bg-[rgba(255,251,243,0.84)] text-xs text-[rgb(55,71,42)]"
          >
            <UsersIcon className="h-3.5 w-3.5" />
            Shared household ready
          </Chip>
        </div>
      </div>

      <Button
        className="marketing-button-secondary w-full rounded-full px-4 py-3 text-sm font-semibold"
        variant="secondary"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        Continue with Google
      </Button>

      <div className="text-text-soft flex items-center gap-2 text-xs">
        <div className="bg-border-subtle h-px flex-1" />
        <span>or</span>
        <div className="bg-border-subtle h-px flex-1" />
      </div>

      <div className="grid grid-cols-2 rounded-full border border-[rgb(58,104,63,0.12)] bg-[rgba(255,249,238,0.8)] p-1 text-sm">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 font-medium transition ${
            mode === "sign-in"
              ? "rounded-full border border-[rgb(58,104,63,0.12)] bg-[rgba(255,255,255,0.88)] text-[rgb(23,35,18)] shadow-[0_10px_22px_rgba(84,90,42,0.1)]"
              : "text-[rgb(92,104,68)]"
          }`}
          onClick={() => setMode("sign-in")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 font-medium transition ${
            mode === "sign-up"
              ? "rounded-full border border-[rgb(58,104,63,0.12)] bg-[rgba(255,255,255,0.88)] text-[rgb(23,35,18)] shadow-[0_10px_22px_rgba(84,90,42,0.1)]"
              : "text-[rgb(92,104,68)]"
          }`}
          onClick={() => setMode("sign-up")}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        {mode === "sign-up" ? (
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-[rgb(55,71,42)]"
              htmlFor="display-name"
            >
              Name
            </label>
            <input
              id="display-name"
              name="display-name"
              type="text"
              autoComplete="name"
              required
              className="w-full rounded-2xl border border-[rgb(58,104,63,0.14)] bg-[rgba(255,255,255,0.86)] px-4 py-3 text-sm text-[rgb(23,35,18)]"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <p className="text-xs text-[rgb(92,104,68)]">
              This is the name shown in your account and household.
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-[rgb(55,71,42)]"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-2xl border border-[rgb(58,104,63,0.14)] bg-[rgba(255,255,255,0.86)] px-4 py-3 text-sm text-[rgb(23,35,18)]"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-[rgb(55,71,42)]"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "sign-up" ? "new-password" : "current-password"
            }
            required
            minLength={6}
            className="w-full rounded-2xl border border-[rgb(58,104,63,0.14)] bg-[rgba(255,255,255,0.86)] px-4 py-3 text-sm text-[rgb(23,35,18)]"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="marketing-button-primary w-full rounded-full px-4 py-3 text-sm font-semibold"
          disabled={isSubmitting}
        >
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-xs leading-6 text-[rgb(92,104,68)]">
        Built for solo queues, shared households, and much cleaner watch-night
        decisions.
      </p>
    </PageCard>
  );
}
