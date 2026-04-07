import type { PropsWithChildren } from "react";

import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicHeader } from "@/components/marketing/public-header";

export function MarketingLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_5%_-15%,rgba(42,99,255,0.24),transparent_45%),radial-gradient(circle_at_95%_5%,rgba(21,122,110,0.16),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.2),transparent_45%)]" />
      <div className="marketing-grid pointer-events-none absolute inset-x-0 top-0 h-[36rem] opacity-40" />
      <div className="relative flex min-h-screen flex-col">
        <PublicHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
        <PublicFooter />
      </div>
    </div>
  );
}
