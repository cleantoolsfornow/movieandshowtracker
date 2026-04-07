import Link from "next/link";
import type { Metadata } from "next";

import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import {
  ArrowRightIcon,
  PickleIcon,
  SearchIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/marketing/inline-icons";

export const metadata: Metadata = {
  title: "FilmPickle",
  description:
    "FilmPickle is a playful movie and show tracker for personal queues, couples, roommates, and shared households.",
  openGraph: {
    title: "FilmPickle | Movie and show tracking for solo and shared use",
    description:
      "Save movies and shows fast, track what you want to watch and what you watched, and use it by yourself or with your household.",
    type: "website",
  },
};

const promiseCards = [
  {
    kicker: "Capture",
    title: "Catch the recommendation before it vanishes into the abyss.",
    body: "Save a movie or show the second it sounds promising, before it gets buried in a text thread, notes app, or your own unreliable memory.",
    icon: SearchIcon,
  },
  {
    kicker: "Align",
    title: "Keep your picks and the household picks from becoming one big blob.",
    body: "See what is just for you, what is shared, and what overlap actually exists without doing group-text archaeology.",
    icon: UsersIcon,
  },
  {
    kicker: "Decide",
    title: "Make deciding what to watch feel less like a tiny administrative crisis.",
    body: "FilmPickle keeps the queue cleaner and the shared context clearer, so picking something feels lighter when it actually matters.",
    icon: SparkIcon,
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Save titles as they come in",
    body: "Add movies and shows while the recommendation still feels fresh and before you forget why it sounded good.",
  },
  {
    number: "02",
    title: "Keep the queue clean",
    body: "Use a visual library and clear statuses so the watchlist stays usable instead of quietly turning into a dumping ground.",
  },
  {
    number: "03",
    title: "Open the app and pick from a cleaner queue",
    body: "When it is time to watch, you are not starting from a chaotic heap of forgotten recommendations and half-remembered maybes.",
  },
] as const;

const watchModes = [
  {
    name: "Solo",
    blurb:
      "A polished personal watch home for private queues, impulse saves, and keeping your own progress straight.",
    points: [
      "Private watchlist",
      "Fast recommendation capture",
      "Clear personal status",
    ],
  },
  {
    name: "Two people",
    blurb:
      "Perfect for couples, roommates, or any two-person setup where overlap matters and shared promises are easy to forget.",
    points: [
      "Shared watchlist",
      "Better overlap visibility",
      "Less back-and-forth",
    ],
  },
  {
    name: "Household",
    blurb:
      "A calmer system for multiple tastes, multiple queues, and one shared place to decide what is worth watching together.",
    points: [
      "Member-aware context",
      "Shared watch tracking",
      "Cleaner watch decisions",
    ],
  },
] as const;

const heroBenefits = [
  {
    title: "Save fast",
    body: "Grab recommendations while they are still fresh.",
    icon: SearchIcon,
  },
  {
    title: "See overlap",
    body: "Keep shared interest clear without the group-text mess.",
    icon: UsersIcon,
  },
  {
    title: "Choose tonight",
    body: "Keep the queue tidy enough that picking something gets easier.",
    icon: SparkIcon,
  },
] as const;

export default function MarketingHomePage() {
  return (
    <div className="space-y-10 pb-10 md:space-y-14">
      <section className="marketing-section grid gap-8 pt-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-5">
            <h1 className="font-display max-w-3xl text-3xl leading-[1.01] font-semibold text-balance text-[rgb(23,35,18)] sm:text-4xl md:text-5xl lg:text-6xl">
              Your movie &amp; show tracker. Use yourself, as a couple, or even a household.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)] sm:text-lg sm:leading-8 md:text-xl">
              Save titles fast, track what you want to watch and what you watched,
              and keep shared watch decisions from turning back into chaos.
            </p>
          </div>

          <HomeCtaRow />

          <p className="max-w-2xl text-sm leading-7 text-[rgb(87,101,66)] md:text-base">
            No spreadsheets. No lost texts. No opening five apps just to remember
            what sounded good three days ago.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {heroBenefits.map((benefit) => (
              <PageCard key={benefit.title} className="rounded-[28px] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(39,102,57,0.1)] text-[rgb(30,88,48)]">
                  <benefit.icon className="h-4 w-4" />
                </div>
                <p className="mt-4 text-lg font-semibold text-[rgb(23,35,18)]">
                  {benefit.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[rgb(69,84,53)]">
                  {benefit.body}
                </p>
              </PageCard>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="marketing-floating absolute top-6 -left-5 hidden h-16 w-16 rounded-[40%] bg-[linear-gradient(145deg,rgba(219,241,158,0.92),rgba(255,255,255,0.45))] lg:block" />
          <div className="marketing-floating-delayed absolute top-20 -right-4 hidden h-14 w-14 rounded-full bg-[linear-gradient(145deg,rgba(244,188,70,0.8),rgba(255,255,255,0.2))] lg:block" />

          <div className="marketing-hero-card marketing-shine p-5 sm:p-6">
            <div className="overflow-hidden rounded-[30px] border border-[rgb(58,104,63,0.1)] bg-[rgba(255,255,255,0.74)] shadow-[0_22px_44px_rgba(84,90,42,0.08)]">
              <div className="flex items-center justify-between border-b border-[rgb(58,104,63,0.08)] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(39,102,57,0.85)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(244,188,70,0.9)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(228,232,209,0.95)]" />
                  </div>
                  <p className="app-kicker">Household dashboard preview</p>
                </div>
                <span className="marketing-pill w-fit shrink-0 text-xs font-semibold">
                  2 members live
                </span>
              </div>

              <div className="mx-auto max-w-[620px] p-4 sm:p-5">
                <div className="grid items-start gap-3 md:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[24px] bg-[linear-gradient(160deg,rgba(30,59,45,0.96),rgba(20,39,30,0.94))] p-4 text-[rgb(243,250,236)]">
                    <p className="text-xs font-semibold tracking-[0.17em] text-[rgba(243,250,236,0.68)] uppercase">
                      Shared picks
                    </p>
                    <h2 className="mt-1 text-[1.65rem] leading-tight font-semibold">
                      Pick faster tonight.
                    </h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[rgba(243,250,236,0.82)]">
                      One clean board for what sounds good now.
                    </p>

                    <div className="mt-4 flex gap-2.5">
                      <article className="min-w-0 flex-1 rounded-[14px] border border-white/16 bg-[rgba(18,36,27,0.56)] p-2">
                        <div className="h-16 rounded-[10px] bg-[radial-gradient(circle_at_15%_15%,rgba(222,237,224,0.34),transparent_58%),linear-gradient(150deg,rgba(26,61,43,0.95),rgba(19,43,32,0.93))]" />
                        <p className="mt-2 truncate text-xs font-semibold text-[rgba(244,251,237,0.95)]">
                          Severance
                        </p>
                        <p className="text-[11px] text-[rgba(244,251,237,0.72)]">
                          Shared watchlist
                        </p>
                      </article>

                      <article className="min-w-0 flex-1 rounded-[14px] border border-white/16 bg-[rgba(18,36,27,0.56)] p-2">
                        <div className="h-16 rounded-[10px] bg-[radial-gradient(circle_at_15%_15%,rgba(255,238,194,0.36),transparent_58%),linear-gradient(150deg,rgba(241,188,85,0.95),rgba(223,160,61,0.93))]" />
                        <p className="mt-2 truncate text-xs font-semibold text-[rgba(244,251,237,0.95)]">
                          Paddington in Peru
                        </p>
                        <p className="text-[11px] text-[rgba(244,251,237,0.72)]">
                          Watched together
                        </p>
                      </article>

                      <article className="min-w-0 flex-1 rounded-[14px] border border-white/16 bg-[rgba(18,36,27,0.56)] p-2">
                        <div className="h-16 rounded-[10px] bg-[radial-gradient(circle_at_15%_15%,rgba(220,236,217,0.3),transparent_58%),linear-gradient(150deg,rgba(103,132,107,0.95),rgba(74,100,80,0.93))]" />
                        <p className="mt-2 truncate text-xs font-semibold text-[rgba(244,251,237,0.95)]">
                          Dune: Part Two
                        </p>
                        <p className="text-[11px] text-[rgba(244,251,237,0.72)]">
                          Saved
                        </p>
                      </article>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[24px] border border-[rgb(58,104,63,0.1)] bg-[linear-gradient(180deg,rgba(255,251,242,0.95),rgba(255,255,255,0.8))] p-4">
                      <p className="app-kicker">Household pulse</p>
                      <p className="mt-1 text-xl leading-tight font-semibold text-[rgb(23,35,18)]">
                        Who wants what
                      </p>
                      <div className="mt-3 space-y-2.5">
                        {[
                          ["Alex", "Wants 3"],
                          ["Jordan", "Watched 2"],
                          ["You", "Saved 4"],
                        ].map(([name, detail]) => (
                          <div
                            key={name}
                            className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.82)] px-3 py-2"
                          >
                            <span className="text-sm font-semibold text-[rgb(36,52,30)]">
                              {name}
                            </span>
                            <span className="text-xs font-semibold text-[rgb(84,95,60)]">
                              {detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[20px] border border-[rgb(58,104,63,0.08)] bg-[rgba(255,255,255,0.88)] p-3.5">
                        <p className="app-kicker">Library</p>
                        <p className="mt-1 text-3xl font-semibold text-[rgb(23,35,18)]">
                          34
                        </p>
                        <p className="text-xs text-[rgb(69,84,53)]">titles</p>
                      </div>
                      <div className="rounded-[20px] border border-[rgb(58,104,63,0.08)] bg-[rgba(255,255,255,0.88)] p-3.5">
                        <p className="app-kicker">Tonight</p>
                        <p className="mt-1 text-3xl font-semibold text-[rgb(23,35,18)]">
                          6
                        </p>
                        <p className="text-xs text-[rgb(69,84,53)]">ready</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="app-kicker">Why it lands</p>
          <h2 className="text-3xl font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
            Built to solve the parts of watch tracking that usually fall apart.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)] md:text-lg">
            Most watchlists are fine at collecting titles and bad at helping you
            do anything useful with them. FilmPickle is designed to stay tidy,
            readable, and genuinely helpful when you come back later wondering what is actually worth watching.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {promiseCards.map((card) => (
            <PageCard
              key={card.title}
              elevated
              className="rounded-[30px] p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(39,102,57,0.1)] text-[rgb(30,88,48)]">
                <card.icon className="h-5 w-5" />
              </div>
              <p className="app-kicker mt-5">{card.kicker}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[rgb(23,35,18)]">
                {card.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-[rgb(69,84,53)]">
                {card.body}
              </p>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <PageCard elevated className="rounded-[32px] p-6 md:p-7">
          <p className="app-kicker">How it works</p>
          <h2 className="mt-3 max-w-md text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl">
            A simple loop that holds up in real life.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-[rgb(69,84,53)]">
            FilmPickle is at its best when it disappears into the routine: save
            what sounds good, keep the queue readable, and come back to a watchlist
            that still makes sense later when your brain has fully moved on.
          </p>
          <Link
            href="/features"
            className="marketing-link mt-6 inline-flex items-center gap-2 text-sm font-semibold"
          >
            Explore the feature set
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </PageCard>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <PageCard
              key={step.title}
              className={`rounded-[30px] p-5 ${
                index === 1
                  ? "bg-[linear-gradient(180deg,rgba(255,251,240,0.92),rgba(245,238,215,0.82))]"
                  : undefined
              }`}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(219,241,158,0.88),rgba(244,188,70,0.42))] text-sm font-semibold text-[rgb(27,67,39)]">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-[rgb(23,35,18)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[rgb(69,84,53)]">
                {step.body}
              </p>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section space-y-5">
        <div className="max-w-2xl space-y-3">
          <p className="app-kicker">Fits the way you watch</p>
          <h2 className="text-3xl font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
            Start with one person. Grow into whatever your household looks like.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {watchModes.map((mode) => (
            <PageCard key={mode.name} elevated className="rounded-[30px] p-6">
              <div className="inline-flex rounded-full bg-[rgba(219,241,158,0.62)] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[rgb(33,78,42)] uppercase">
                Watch mode
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-[rgb(23,35,18)]">
                {mode.name}
              </h3>
              <p className="mt-3 text-base leading-7 text-[rgb(69,84,53)]">
                {mode.blurb}
              </p>
              <div className="mt-5 space-y-2">
                {mode.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl bg-[rgba(255,255,255,0.58)] px-3 py-2 text-sm font-medium text-[rgb(42,58,33)]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <PageCard
          elevated
          className="rounded-[36px] bg-[linear-gradient(135deg,rgba(255,252,246,0.92),rgba(246,237,216,0.9))] p-7 md:p-9"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="app-kicker">
                Ready to make this your new watch home?
              </p>
              <h2 className="max-w-3xl text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
                Start building a watchlist that is actually pleasant to use.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)]">
                Save your first few titles in minutes, then bring in your
                partner, roommate, or household whenever shared tracking starts
                to matter a little more.
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
