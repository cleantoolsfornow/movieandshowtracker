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
    "See how FilmPickle handles fast title capture, visual browsing, personal tracking, and shared household use.",
  openGraph: {
    title: "Features | FilmPickle",
    description:
      "Explore FilmPickle's fast capture, household-aware tracking, poster-first browsing, and current feature set.",
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
    body: "Poster-first browsing makes the queue easier to revisit, easier to scan, and much more likely to stay useful over time.",
    icon: LibraryIcon,
  },
  {
    kicker: "Track",
    title: "Keep statuses clear without creating more admin.",
    body: "Keep track of what was saved, what you still want to watch, and what already got watched without making the app feel like homework.",
    icon: ShieldIcon,
  },
  {
    kicker: "Share",
    title: "See who is into what across the household.",
    body: "Track personal and shared state side by side so households get better context without flattening everyone into one shared opinion blob.",
    icon: UsersIcon,
  },
  {
    kicker: "Adapt",
    title: "Start solo now and grow into shared use later.",
    body: "FilmPickle works just as well as a personal tracker as it does for a couple, roommate setup, or larger household.",
    icon: PickleIcon,
  },
  {
    kicker: "Decide",
    title: "Keep the queue tidy enough that choosing something gets easier.",
    body: "FilmPickle is built to reduce mess and make shared watch decisions feel lighter, even before deeper picker tools arrive.",
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
      "Clear status context",
      "Less clutter than notes, texts, or spreadsheets",
    ],
  },
  {
    title: "For choosing",
    items: [
      "Household-aware watch context",
      "Better overlap visibility",
      "A cleaner place to decide from",
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
    bullets: ["Shared watchlist", "Overlap visibility", "Less rehashing"],
  },
  {
    name: "Household",
    body: "A better setup for multiple tastes, multiple members, and one place to sort out what actually has group momentum.",
    bullets: [
      "Member-aware context",
      "Shared tracking",
      "Cleaner decisions",
    ],
  },
] as const;

const availableNow = [
  "Search for movies and TV shows and save them quickly",
  "Track personal want-to-watch and watched status",
  "Add personal ratings and notes",
  "Use a shared household watchlist",
  "Record watched-together household events",
  "Browse a poster-first library built for solo and shared use",
] as const;

const plannedNext = [
  "Deeper TV season and episode progress",
  "Richer continue-watching support",
  "Stronger watch-night decision tools",
  "Better household management options",
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
            <p className="app-kicker">Get out of the what-to-watch pickle.</p>
            <h1 className="max-w-3xl text-4xl leading-[1] font-semibold text-balance text-[rgb(23,35,18)] sm:text-5xl md:text-6xl">
              The tools that make FilmPickle feel fast, tidy, and useful.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)] sm:text-lg sm:leading-8">
              Every feature is there to support the same outcome: capture the
              titles you care about, keep the queue readable, and make your
              personal or shared tracking easier to keep up with.
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
                Save quickly. Stay organized. Stay sane about what to watch.
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

      <section className="marketing-section grid gap-4 lg:grid-cols-2">
        <PageCard elevated className="rounded-[32px] p-6 md:p-7">
          <p className="app-kicker">Available now</p>
          <h2 className="mt-3 text-3xl font-semibold text-[rgb(23,35,18)] sm:text-4xl">
            What FilmPickle does today
          </h2>
          <div className="mt-5 space-y-2">
            {availableNow.map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-[rgba(255,255,255,0.7)] px-3 py-2.5 text-sm font-medium text-[rgb(42,58,33)]"
              >
                {item}
              </div>
            ))}
          </div>
        </PageCard>

        <PageCard elevated className="rounded-[32px] p-6 md:p-7">
          <p className="app-kicker">Planned next</p>
          <h2 className="mt-3 text-3xl font-semibold text-[rgb(23,35,18)] sm:text-4xl">
            Where the product is headed
          </h2>
          <p className="mt-4 text-base leading-7 text-[rgb(69,84,53)]">
            FilmPickle already covers the core tracking loop. The next layer is
            deeper TV progress, stronger decision support, and better shared-use tools.
          </p>
          <div className="mt-5 space-y-2">
            {plannedNext.map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-[rgba(255,255,255,0.7)] px-3 py-2.5 text-sm font-medium text-[rgb(42,58,33)]"
              >
                {item}
              </div>
            ))}
          </div>
        </PageCard>
      </section>

      <section className="marketing-section space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="app-kicker">Feature set</p>
          <h2 className="text-3xl font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
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
          <h2 className="mt-3 text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl">
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
              <p className="app-kicker">A slightly less picklish watch life</p>
              <h2 className="max-w-3xl text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
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
