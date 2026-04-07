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
    "FilmPickle is a playful, polished movie and show tracker for solo queues, shared households, and easier watch-night decisions.",
  openGraph: {
    title: "FilmPickle | Movie and show tracking for households",
    description:
      "Save movies and shows fast, keep household picks sorted, and make picking what to watch feel delightfully easy.",
    type: "website",
  },
};

const promiseCards = [
  {
    kicker: "Capture",
    title: "Save the recommendation before it disappears.",
    body: "FilmPickle makes it easy to grab a movie or show the moment it sounds good, before it gets lost in the scroll.",
    icon: SearchIcon,
  },
  {
    kicker: "Align",
    title: "Keep personal picks and shared picks straight.",
    body: "See what is just for you, what belongs to the household, and where the overlap actually is without text-thread archaeology.",
    icon: UsersIcon,
  },
  {
    kicker: "Decide",
    title: "Turn a messy maybe-list into a real tonight list.",
    body: "When it is time to press play, the right titles are already surfaced so choosing something feels quick instead of draining.",
    icon: SparkIcon,
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Save titles as they come in",
    body: "Add movies and shows the second someone mentions them, while the recommendation still has momentum.",
  },
  {
    number: "02",
    title: "Keep the queue clean",
    body: "Use a visual library and clear status so the watchlist stays organized instead of turning into a dumping ground.",
  },
  {
    number: "03",
    title: "Open the shortlist and pick",
    body: "When it is time to watch, you already know what is viable for tonight and what has real household momentum.",
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
      "Shared shortlist",
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
      "Shared momentum",
      "Cleaner watch-night decisions",
    ],
  },
] as const;

const heroBenefits = [
  {
    title: "Save fast",
    body: "Capture recommendations while they are still fresh.",
    icon: SearchIcon,
  },
  {
    title: "See overlap",
    body: "Keep household picks clear without the group-text mess.",
    icon: UsersIcon,
  },
  {
    title: "Choose tonight",
    body: "Turn a vague maybe-list into a real shortlist.",
    icon: SparkIcon,
  },
] as const;

export default function MarketingHomePage() {
  return (
    <div className="space-y-10 pb-10 md:space-y-14">
      <section className="marketing-section grid gap-8 pt-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="marketing-pill text-xs font-semibold tracking-[0.2em] uppercase">
              <PickleIcon className="h-4 w-4 text-[rgb(32,94,51)]" />
              FilmPickle
            </span>
            <span className="marketing-pill text-sm">
              For solo queues and shared households
            </span>
          </div>

          <div className="space-y-5">
            <p className="app-kicker">
              A smarter watchlist for real movie nights
            </p>
            <h1 className="font-display max-w-3xl text-5xl leading-[0.98] font-semibold text-balance text-[rgb(23,35,18)] md:text-7xl">
              Your household&apos;s watchlist, finally handled.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[rgb(69,84,53)] md:text-xl">
              FilmPickle keeps recommendations, personal queues, and shared
              picks in one polished, poster-first space, so deciding what to
              watch stops feeling like work.
            </p>
          </div>

          <HomeCtaRow />

          <p className="max-w-2xl text-sm leading-7 text-[rgb(87,101,66)] md:text-base">
            No spreadsheets. No lost texts. No re-running the same conversation
            about what everyone was in the mood for.
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
            <div className="rounded-[30px] border border-[rgb(58,104,63,0.1)] bg-[rgba(255,255,255,0.68)] shadow-[0_22px_44px_rgba(84,90,42,0.08)]">
              <div className="flex items-center justify-between gap-4 border-b border-[rgb(58,104,63,0.08)] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(39,102,57,0.85)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(244,188,70,0.9)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(228,232,209,0.95)]" />
                  </div>
                  <div>
                    <p className="app-kicker">Household board</p>
                    <p className="text-sm font-medium text-[rgb(69,84,53)]">
                      Friday night picks
                    </p>
                  </div>
                </div>
                <span className="marketing-pill shrink-0 text-xs font-semibold">
                  2 members synced
                </span>
              </div>

              <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[28px] bg-[linear-gradient(160deg,rgba(36,67,52,0.96),rgba(18,36,27,0.94))] p-5 text-[rgb(245,252,236)] shadow-[0_18px_36px_rgba(25,80,47,0.18)]">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[rgba(245,252,236,0.66)] uppercase">
                    Shared shortlist
                  </p>
                  <h2 className="mt-3 max-w-sm text-3xl leading-tight font-semibold">
                    Three strong picks for tonight.
                  </h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[rgba(245,252,236,0.8)]">
                    Already filtered down from the bigger watchlist into titles
                    the household is actually likely to say yes to.
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      {
                        title: "Severance",
                        tag: "Both saved",
                        tone: "bg-[linear-gradient(180deg,rgba(24,46,34,0.96),rgba(40,71,55,0.92))]",
                      },
                      {
                        title: "Paddington in Peru",
                        tag: "Front-runner",
                        tone: "bg-[linear-gradient(180deg,rgba(244,188,70,0.96),rgba(233,157,60,0.9))]",
                      },
                      {
                        title: "Dune: Part Two",
                        tag: "Queued",
                        tone: "bg-[linear-gradient(180deg,rgba(94,125,96,0.92),rgba(58,84,62,0.92))]",
                      },
                    ].map((item) => (
                      <div key={item.title} className="space-y-3">
                        <div
                          className={`aspect-[0.74] rounded-[20px] ${item.tone} shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]`}
                        />
                        <div>
                          <p className="text-sm leading-5 font-semibold">
                            {item.title}
                          </p>
                          <p className="mt-2 inline-flex rounded-full bg-[rgba(255,255,255,0.14)] px-2.5 py-1 text-[11px] font-semibold text-[rgba(245,252,236,0.88)]">
                            {item.tag}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[26px] border border-[rgb(58,104,63,0.1)] bg-[linear-gradient(180deg,rgba(255,251,242,0.92),rgba(255,255,255,0.76))] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="app-kicker">Household pulse</p>
                        <p className="mt-2 text-2xl leading-tight font-semibold text-[rgb(23,35,18)]">
                          Everyone is pointed at the same few options.
                        </p>
                      </div>
                      <UsersIcon className="h-5 w-5 shrink-0 text-[rgb(36,103,58)]" />
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ["Alex", "3 shared picks"],
                        ["Jordan", "2 rewatches queued"],
                        ["Household", "1 clear front-runner"],
                      ].map(([name, detail]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-2xl bg-[rgba(255,255,255,0.74)] px-3 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(39,102,57,0.12)] text-xs font-semibold text-[rgb(30,88,48)]">
                              {name.slice(0, 1)}
                            </span>
                            <span className="font-medium text-[rgb(28,40,22)]">
                              {name}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[rgb(84,95,60)]">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <PageCard className="rounded-[24px] p-4">
                      <p className="app-kicker">Library</p>
                      <p className="mt-2 text-3xl font-semibold text-[rgb(23,35,18)]">
                        34
                      </p>
                      <p className="mt-1 text-sm text-[rgb(69,84,53)]">
                        titles parked
                      </p>
                    </PageCard>
                    <PageCard className="rounded-[24px] p-4">
                      <p className="app-kicker">Tonight</p>
                      <p className="mt-2 text-3xl font-semibold text-[rgb(23,35,18)]">
                        1
                      </p>
                      <p className="mt-1 text-sm text-[rgb(69,84,53)]">
                        clear front-runner
                      </p>
                    </PageCard>
                    <div className="rounded-[24px] border border-[rgb(58,104,63,0.1)] bg-[rgba(255,255,255,0.72)] p-4 sm:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(39,102,57,0.12)] text-[rgb(30,88,48)]">
                            <SearchIcon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[rgb(23,35,18)]">
                              Quick add
                            </p>
                            <p className="text-xs text-[rgb(92,104,68)]">
                              Save the next recommendation instantly
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-[rgba(219,241,158,0.8)] px-3 py-1 text-xs font-semibold text-[rgb(33,78,42)]">
                          Instant save
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["The Pitt", "Only Murders", "Dune: Part Two"].map(
                          (title) => (
                            <span
                              key={title}
                              className="rounded-full border border-[rgb(58,104,63,0.08)] bg-[rgba(255,255,255,0.8)] px-3 py-1.5 text-sm font-medium text-[rgb(28,40,22)]"
                            >
                              {title}
                            </span>
                          ),
                        )}
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
          <h2 className="text-4xl font-semibold text-[rgb(23,35,18)] md:text-5xl">
            Built to solve the parts of watch tracking that usually fall apart.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)] md:text-lg">
            Most watchlists are fine at collecting titles and bad at helping you
            do anything useful with them. FilmPickle is designed to stay tidy,
            readable, and actually helpful when it is time to choose.
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
          <h2 className="mt-3 max-w-md text-4xl leading-tight font-semibold text-[rgb(23,35,18)]">
            A simple loop that holds up in real life.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-[rgb(69,84,53)]">
            FilmPickle is at its best when it disappears into the routine: save
            what sounds good, keep the queue readable, and open a shortlist when
            it is time to watch.
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
          <h2 className="text-4xl font-semibold text-[rgb(23,35,18)] md:text-5xl">
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
              <h2 className="max-w-3xl text-4xl leading-tight font-semibold text-[rgb(23,35,18)] md:text-5xl">
                Start building a watchlist that is actually pleasant to use.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)]">
                Save your first few titles in minutes, then bring in your
                partner, roommate, or household whenever shared decisions start
                to matter.
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
