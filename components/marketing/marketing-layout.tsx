import type { PropsWithChildren } from "react";

import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicHeader } from "@/components/marketing/public-header";

export function MarketingLayout({ children }: PropsWithChildren) {
  return (
    <div className="marketing-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_6%_0%,rgba(219,241,158,0.38),transparent_42%),radial-gradient(circle_at_96%_8%,rgba(244,188,70,0.22),transparent_35%),radial-gradient(circle_at_80%_72%,rgba(59,114,70,0.14),transparent_36%)]" />
      <div className="marketing-grid pointer-events-none absolute inset-x-0 top-0 h-[36rem] opacity-50" />
      <div className="marketing-dot-pattern pointer-events-none absolute top-40 left-[-6rem] h-44 w-44 rounded-full opacity-50 blur-[1px]" />
      <div className="marketing-dot-pattern pointer-events-none absolute right-[-4rem] bottom-24 h-56 w-56 rounded-full opacity-45 blur-[1px]" />
      <div className="marketing-floating pointer-events-none absolute top-32 left-[8%] h-24 w-24 rounded-[38%] bg-[radial-gradient(circle_at_35%_35%,rgba(219,241,158,0.92),rgba(128,171,93,0.28))] blur-[2px]" />
      <div className="marketing-floating-delayed pointer-events-none absolute top-48 right-[10%] h-20 w-20 rounded-[44%] bg-[radial-gradient(circle_at_35%_35%,rgba(244,188,70,0.62),rgba(244,188,70,0.08))]" />
      <div className="relative flex min-h-screen flex-col">
        <PublicHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
          {children}
        </main>
        <PublicFooter />
      </div>
    </div>
  );
}
