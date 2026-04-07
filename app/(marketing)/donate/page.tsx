import Link from "next/link";
import type { Metadata } from "next";

import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import {
  ArrowUpRightIcon,
  LibraryIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/marketing/inline-icons";

export const metadata: Metadata = {
  title: "Support The Project",
  description:
    "Support Movie And Show Tracker on Ko-fi to help cover hosting and ongoing product improvements.",
  openGraph: {
    title: "Support The Project | Movie And Show Tracker",
    description:
      "Support Movie And Show Tracker on Ko-fi to help cover hosting and ongoing product improvements.",
    type: "website",
  },
};

const supportReasons = [
  {
    title: "Hosting and infrastructure",
    body: "Support helps cover the services that keep the app available and responsive.",
    icon: LibraryIcon,
  },
  {
    title: "Ongoing polish and upkeep",
    body: "It helps fund continued improvements, bug fixes, and UX refinement over time.",
    icon: SparkIcon,
  },
  {
    title: "Keeping the project healthy",
    body: "Contributions make it easier to sustainably maintain the tracker and keep momentum.",
    icon: ShieldIcon,
  },
] as const;

export default function DonatePage() {
  return (
    <div className="space-y-12 pb-8 md:space-y-14">
      <section className="marketing-section space-y-5 pt-2">
        <p className="app-kicker">Support</p>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-foreground md:text-5xl">
          Thank you for helping this project keep growing.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-text-muted md:text-lg">
          Movie And Show Tracker is currently free to use. If it has been useful for you, support is
          deeply appreciated and helps keep the work moving.
        </p>
      </section>

      <section className="marketing-section">
        <PageCard elevated className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-accent/14 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-shared-watch/14 blur-2xl" />
          <div className="relative space-y-4">
            <p className="app-kicker">Ko-fi</p>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Support on Ko-fi</h2>
            <p className="max-w-2xl text-sm leading-6 text-text-muted md:text-base">
              If you want to contribute, this is the best place to do it. Every bit of support helps with upkeep, polish, and keeping the tracker healthy.
            </p>
            <Link
              href="https://ko-fi.com/cleantoolsfornow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition hover:border-accent-strong hover:bg-accent-strong"
              aria-label="Support on Ko-fi (opens in a new tab)"
            >
              <ArrowUpRightIcon className="h-4 w-4" />
              Support on Ko-fi (opens in new tab)
            </Link>
            <p className="text-xs text-text-soft">External link: ko-fi.com/cleantoolsfornow</p>
          </div>
        </PageCard>
      </section>

      <section className="marketing-section grid gap-4 md:grid-cols-3">
        {supportReasons.map((item) => (
          <PageCard key={item.title} className="space-y-2 p-5">
            <p className="text-accent">
              <item.icon className="h-4 w-4" />
            </p>
            <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
            <p className="text-sm leading-6 text-text-muted">{item.body}</p>
          </PageCard>
        ))}
      </section>

      <section className="marketing-section">
        <PageCard elevated className="space-y-4 p-6 md:p-8">
          <p className="app-kicker">Use The App</p>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            Whether you donate or not, thanks for being here.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-text-muted md:text-base">
            No donation is required. If you are ready to keep tracking, jump back in now.
          </p>
          <HomeCtaRow includeFeaturesLink />
        </PageCard>
      </section>
    </div>
  );
}
