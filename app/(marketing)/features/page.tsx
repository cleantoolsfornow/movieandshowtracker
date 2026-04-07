import type { Metadata } from "next";

import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import {
  LibraryIcon,
  PickleIcon,
  SearchIcon,
  ShieldIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/marketing/inline-icons";

export const metadata: Metadata = {
  title: "Features",
  description:
    "See how FilmPickle handles fast title capture, visual browsing, household tracking, and easier watch-night decisions.",
  openGraph: {
    title: "Features | FilmPickle",
    description:
      "Explore FilmPickle's fast capture, household-aware tracking, poster-first browsing, and decision-friendly watchlist tools.",
    type: "website",
  },
};

const featureBlocks = [
  {
    kicker: "Capture",
    title: "Quick-add the second something sounds worth watching.",
    body: "Search for a movie or show, save it immediately, and keep moving before the recommendation disappears into the void.",
    icon: SearchIcon,
  },
  {
    kicker: "Browse",
    title: "Use a visual library instead of a sad little list.",
    body: "Poster-first browsing makes the queue easier to revisit, easier to scan, and much easier to actually use.",
    icon: LibraryIcon,
  },
  {
    kicker: "Track",
    title: "Keep statuses clear without creating more admin.",
    body: "FilmPickle helps you remember what was saved, what is promising, and what already got watched without turning the app into chores.",
    icon: ShieldIcon,
  },
  {
    kicker: "Share",
    title: "See who is into what across the household.",
    body: "Track overlap, shared picks, and household momentum so watch night starts with context instead of confusion.",
    icon: UsersIcon,
  },
  {
    kicker: "Adapt",
    title: "Start solo now and grow into shared use later.",
    body: "The product works just as well for a private watchlist as it does for a couple, roommate setup, or larger household.",
    icon: PickleIcon,
  },
  {
    kicker: "Decide",
    title: "Make tonight's choice without re-opening the whole debate.",
    body: "When it is finally time to pick something, the strongest options are already easier to spot and easier to agree on.",
    icon: SparkIcon,
  },
] as const;

const groupedBenefits = [
  {
    title: "For saving",
    items: [
      "Fast search and quick add",
      "Save recommendations before they disappear",
      "Keep titles in a clean visual queue",
    ],
  },
  {
    title: "For organizing",
    items: [
      "Poster-first browsing",
      "Clear status and progress context",
      "Less clutter than notes, texts, or spreadsheets",
    ],
  },
  {
    title: "For choosing",
    items: [
      "Household-aware watch decisions",
      "Better overlap visibility",
      "A clearer shortlist for tonight",
    ],
  },
] as const;

const watchModes = [
  {
    name: "Solo",
    body: "Use FilmPickle as a personal watch hub for private queues, guilty pleasures, rewatches, and every recommendation you want to remember.",
    bullets: ["Personal queue", "Fast capture", "Clear private progress"],
  },
  {
    name: "Two people",
    body: "Perfect for couples or roommates who want a cleaner shared shortlist and less back-and-forth every time it is time to watch.",
    bullets: ["Shared picks", "Overlap visibility", "Less rehashing"],
  },
  {
    name: "Household",
    body: "A better setup for multiple tastes, multiple members, and one place to sort out what actually has group momentum.",
    bullets: [
      "Member-aware context",
      "Household shortlist",
      "Cleaner decisions",
    ],
  },
] as const;

export default function FeaturesPage() {
  return (
    <div className="space-y-10 pb-10 md:space-y-14">
      <section className="marketing-section grid gap-6 pt-2 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="marketing-pill text-xs font-semibold tracking-[0.2em] uppercase">
              <PickleIcon className="h-4 w-4 text-[rgb(32,94,51)]" />
              Features
            </span>
            <span className="marketing-pill text-sm">
              Built for real watch habits
            </span>
          </div>

          <div className="space-y-4">
            <p className="app-kicker">What you actually get</p>
            <h1 className="max-w-3xl text-5xl leading-[1] font-semibold text-balance text-[rgb(23,35,18)] md:text-6xl">
              The tools that make FilmPickle feel fast, tidy, and useful.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[rgb(69,84,53)]">
              Every feature is there to support the same outcome: capture the
              titles you care about, keep the queue readable, and make watch
              decisions easier when they actually matter.
            </p>
          </div>
        </div>

        <PageCard elevated className="rounded-[32px] p-5 md:p-6">
          <p className="app-kicker">At a glance</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-[26px] bg-[linear-gradient(160deg,rgba(36,67,52,0.96),rgba(18,36,27,0.94))] p-5 text-[rgb(245,252,236)]">
              <p className="text-xs font-semibold tracking-[0.18em] text-[rgba(245,252,236,0.66)] uppercase">
                Core promise
              </p>
              <p className="mt-3 text-2xl font-semibold">
                Save quickly. Stay organized. Choose faster.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {groupedBenefits.map((group, index) => (
                <div
                  key={group.title}
                  className={`rounded-[24px] p-4 ${
                    index === 1
                      ? "bg-[linear-gradient(180deg,rgba(219,241,158,0.48),rgba(255,255,255,0.82))]"
                      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,249,236,0.78))]"
                  }`}
                >
                  <p className="text-sm font-semibold tracking-[0.18em] text-[rgb(75,92,57)] uppercase">
                    {group.title}
                  </p>
                  <div className="mt-4 space-y-2">
                    {group.items.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-[rgba(255,255,255,0.62)] px-3 py-2 text-sm font-medium text-[rgb(48,64,37)]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageCard>
      </section>

      <section className="marketing-section space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="app-kicker">Feature set</p>
          <h2 className="text-4xl font-semibold text-[rgb(23,35,18)] md:text-5xl">
            Designed around the parts of watch tracking that usually break.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureBlocks.map((feature) => (
            <PageCard
              key={feature.title}
              elevated
              className="rounded-[30px] p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(39,102,57,0.1)] text-[rgb(30,88,48)]">
                <feature.icon className="h-5 w-5" />
              </div>
              <p className="app-kicker mt-5">{feature.kicker}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[rgb(23,35,18)]">
                {feature.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-[rgb(69,84,53)]">
                {feature.body}
              </p>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <PageCard elevated className="rounded-[32px] p-6 md:p-7">
          <p className="app-kicker">Watch modes</p>
          <h2 className="mt-3 text-4xl leading-tight font-semibold text-[rgb(23,35,18)]">
            The same product works for one person, two people, or a full
            household.
          </h2>
          <p className="mt-4 text-base leading-7 text-[rgb(69,84,53)]">
            FilmPickle is intentionally flexible. You can use it for a private
            queue today, then let it grow with the way you actually watch over
            time.
          </p>
        </PageCard>

        <div className="grid gap-4 md:grid-cols-3">
          {watchModes.map((mode) => (
            <PageCard key={mode.name} elevated className="rounded-[30px] p-6">
              <div className="inline-flex rounded-full bg-[rgba(219,241,158,0.62)] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[rgb(33,78,42)] uppercase">
                {mode.name}
              </div>
              <p className="mt-4 text-2xl font-semibold text-[rgb(23,35,18)]">
                {mode.name === "Two people"
                  ? "Shared by default"
                  : `${mode.name} mode`}
              </p>
              <p className="mt-3 text-base leading-7 text-[rgb(69,84,53)]">
                {mode.body}
              </p>
              <div className="mt-5 space-y-2">
                {mode.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-2xl bg-[rgba(255,255,255,0.58)] px-3 py-2 text-sm font-medium text-[rgb(42,58,33)]"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <PageCard elevated className="rounded-[36px] p-7 md:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="app-kicker">Start tracking</p>
              <h2 className="max-w-3xl text-4xl leading-tight font-semibold text-[rgb(23,35,18)] md:text-5xl">
                Build your queue now, then let FilmPickle make the next decision
                easier.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)]">
                It takes minutes to set up, works beautifully from day one, and
                scales cleanly when your watch life includes more than just you.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <HomeCtaRow includeFeaturesLink={false} />
            </div>
          </div>
        </PageCard>
      </section>
    </div>
  );
}
