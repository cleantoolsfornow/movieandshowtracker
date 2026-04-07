"use client";

import { useState } from "react";

import { Button } from "@/components/common/button";
import { PageCard } from "@/components/common/page-card";

const SUPPORT_EMAIL = "cleantoolsfornow@gmail.com";

export function SupportEmailCard() {
  const [message, setMessage] = useState<string | null>(null);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setMessage("Support email copied.");
    } catch {
      setMessage("Could not copy the support email.");
    }
  }

  return (
    <PageCard elevated className="rounded-[34px] p-6 md:p-7">
      <p className="app-kicker">Support email</p>
      <p className="mt-4 break-all text-xl font-semibold text-[rgb(23,35,18)] sm:text-2xl">
        {SUPPORT_EMAIL}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => void copyEmail()}>Copy email</Button>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="marketing-button-secondary inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition"
        >
          Open email app
        </a>
      </div>
      <p className="mt-3 text-sm leading-7 text-[rgb(69,84,53)]">
        You can use this for feedback, bug reports, questions, or general support.
      </p>
      {message ? (
        <p className="mt-3 text-sm text-[rgb(36,103,58)]">{message}</p>
      ) : null}
    </PageCard>
  );
}
