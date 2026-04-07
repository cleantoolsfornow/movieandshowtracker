import Link from "next/link";
import type { Metadata } from "next";

import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import {
  ArrowUpRightIcon,
  LibraryIcon,
  PickleIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/marketing/inline-icons";

export const metadata: Metadata = {
  title: "Support FilmPickle",
  description:
    "Support FilmPickle on Ko-fi to help fund hosting, maintenance, and continued product improvements.",
  openGraph: {
    title: "Support FilmPickle",
    description:
      "Back FilmPickle on Ko-fi and help keep the project healthy, maintained, and improving over time.",
    type: "website",
  },
};

const supportReasons = [
  {
    title: "Hosting and infrastructure",
    body: "Support helps cover the services that keep FilmPickle online, responsive, and dependable.",
    icon: LibraryIcon,
  },
  {
    title: "Ongoing product polish",
    body: "It creates room for better UI work, cleaner details, and continued refinement over time.",
    icon: SparkIcon,
  },
  {
    title: "Sustainable maintenance",
    body: "It helps keep the project healthy instead of letting a useful tool slowly drift out of shape.",
    icon: ShieldIcon,
  },
] as const;

export default function DonatePage() {
  return (
    <div className="space-y-10 pb-10 md:space-y-14">
      <section className="marketing-section grid gap-6 pt-2 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="marketing-pill text-xs font-semibold tracking-[0.2em] uppercase">
              <PickleIcon className="h-4 w-4 text-[rgb(32,94,51)]" />
              Support FilmPickle
            </span>
            <span className="marketing-pill text-sm">
              Help keep the project moving
            </span>
          </div>

          <div className="space-y-4">
            <p className="app-kicker">Support the project</p>
            <h1 className="max-w-3xl text-4xl leading-[1] font-semibold text-balance text-[rgb(23,35,18)] sm:text-5xl md:text-6xl">
              If FilmPickle has earned a place in your watch routine, you can
              help keep it improving.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)] sm:text-lg sm:leading-8">
              Support is never expected, but it directly helps with the real
              work behind the product: hosting, maintenance, and the time it
              takes to keep refining the experience.
            </p>
          </div>
        </div>

        <PageCard elevated className="rounded-[34px] p-6 md:p-7">
          <p className="app-kicker">Ko-fi</p>
          <h2 className="mt-3 text-3xl font-semibold text-[rgb(23,35,18)] md:text-4xl">
            Support the work behind the watchlist.
          </h2>
          <p className="mt-4 text-base leading-7 text-[rgb(69,84,53)]">
            If you want to contribute, Ko-fi is the simplest way to do it. Every
            bit of support helps keep FilmPickle stable, maintained, and moving
            toward a better version of itself.
          </p>
          <Link
            href="https://ko-fi.com/cleantoolsfornow"
            target="_blank"
            rel="noopener noreferrer"
            className="marketing-button-primary mt-6 inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition"
            aria-label="Support on Ko-fi (opens in a new tab)"
          >
            <ArrowUpRightIcon className="h-4 w-4" />
            Support on Ko-fi
          </Link>
          <p className="mt-3 text-xs font-medium tracking-[0.18em] text-[rgb(94,107,67)] uppercase">
            External link: ko-fi.com/cleantoolsfornow
          </p>
        </PageCard>
      </section>

      <section className="marketing-section space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="app-kicker">What support helps with</p>
          <h2 className="text-3xl font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
            The practical side of keeping a good product good.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {supportReasons.map((item) => (
            <PageCard key={item.title} elevated className="rounded-[30px] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(39,102,57,0.1)] text-[rgb(30,88,48)]">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-[rgb(23,35,18)]">
                {item.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-[rgb(69,84,53)]">
                {item.body}
              </p>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <PageCard elevated className="rounded-[36px] p-7 md:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="app-kicker">Keep tracking</p>
              <h2 className="max-w-3xl text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
                The easiest free way to support FilmPickle is simple: keep using
                it.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)]">
                If you are ready to jump back in, your next recommendation,
                shared pick, or watch-night decision is already waiting.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <HomeCtaRow includeFeaturesLink />
            </div>
          </div>
        </PageCard>
      </section>
    </div>
  );
}
