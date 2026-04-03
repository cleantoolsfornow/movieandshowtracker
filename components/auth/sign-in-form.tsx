"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth/auth-client";
import { getAuthErrorMessage, getPostSignInPath } from "@/lib/auth/auth-helpers";

type Mode = "sign-in" | "sign-up";

export function SignInForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(
    () => getPostSignInPath(searchParams.get("next")),
    [searchParams],
  );

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
        await signUpWithEmail(email, password);
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
    <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">
          Sign in to your shared movie and TV tracker.
        </p>
      </div>

      <button
        type="button"
        className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        Continue with Google
      </button>

      <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        <span>or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm">
        <button
          type="button"
          className={`rounded-md px-3 py-2 ${
            mode === "sign-in" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
          onClick={() => setMode("sign-in")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-2 ${
            mode === "sign-up" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
          onClick={() => setMode("sign-up")}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <label className="block text-sm text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label className="block text-sm text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>
    </section>
  );
}
