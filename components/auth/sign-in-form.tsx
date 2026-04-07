"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";
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
    <PageCard className="w-full max-w-md space-y-5 p-6" elevated>
      <div className="space-y-3">
        <SectionHeader
          title={mode === "sign-up" ? "Create your account" : "Welcome back"}
          titleLevel="h1"
          titleClassName="text-2xl"
          description={
            mode === "sign-up"
              ? "Start tracking movies and shows for yourself or your household."
              : "Track movies and shows for your household, including just you."
          }
        />
        <div className="flex flex-wrap gap-2">
          <Chip tone="muted" className="text-xs">
            Solo-friendly
          </Chip>
          <Chip tone="muted" className="text-xs">
            Shared household ready
          </Chip>
        </div>
      </div>

      <Button
        className="w-full"
        variant="secondary"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        Continue with Google
      </Button>

      <div className="flex items-center gap-2 text-xs text-text-soft">
        <div className="h-px flex-1 bg-border-subtle" />
        <span>or</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <div className="grid grid-cols-2 rounded-xl border border-border-subtle bg-surface-muted p-1 text-sm">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 font-medium transition ${
            mode === "sign-in"
              ? "border border-border-subtle bg-surface text-foreground shadow-soft"
              : "text-text-muted"
          }`}
          onClick={() => setMode("sign-in")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 font-medium transition ${
            mode === "sign-up"
              ? "border border-border-subtle bg-surface text-foreground shadow-soft"
              : "text-text-muted"
          }`}
          onClick={() => setMode("sign-up")}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-3">
        {mode === "sign-up" ? (
          <>
            <label className="block text-sm text-text-muted" htmlFor="display-name">
              Name
            </label>
            <input
              id="display-name"
              name="display-name"
              type="text"
              autoComplete="name"
              required
              className="w-full rounded-xl border border-border-strong/45 bg-surface px-3 py-2 text-sm text-foreground"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <p className="text-xs text-text-soft">
              This is the name shown in your account and household.
            </p>
          </>
        ) : null}

        <label className="block text-sm text-text-muted" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-border-strong/45 bg-surface px-3 py-2 text-sm text-foreground"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label className="block text-sm text-text-muted" htmlFor="password">
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
          className="w-full rounded-xl border border-border-strong/45 bg-surface px-3 py-2 text-sm text-foreground"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </Button>
      </form>
    </PageCard>
  );
}
