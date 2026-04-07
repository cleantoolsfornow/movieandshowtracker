import type { Metadata } from "next";

import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import {
  PickleIcon,
  SearchIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/marketing/inline-icons";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how FilmPickle works for solo trackers, couples, roommates, and households.",
  openGraph: {
    title: "How It Works | FilmPickle",
    description:
      "Learn how FilmPickle helps you save titles fast, track what you watch, and keep shared context tidy.",
    type: "website",
  },
};

const personalSteps = [
  {
    number: "01",
    title: "Create your account",
    body: "Start with your own personal tracker. No full household setup is required to get going.",
  },
  {
    number: "02",
    title: "Save titles as they come up",
    body: "Search for a movie or show the second it sounds good and park it somewhere cleaner than a notes app or text thread.",
  },
  {
    number: "03",
    title: "Track what you want and what you watched",
    body: "Keep your watchlist, watched titles, ratings, and notes in one place that is actually pleasant to revisit.",
  },
] as const;

const sharedSteps = [
  {
    number: "01",
    title: "Create a household or join one by invite code",
    body: "Use FilmPickle with a partner, spouse, roommate, or larger household whenever shared watch decisions start to matter.",
  },
  {
    number: "02",
    title: "Track personal and shared state separately",
    body: "Each person can track their own watched and want-to-watch status, while the household can also keep a shared watchlist.",
  },
  {
    number: "03",
    title: "Keep watch-night context from getting messy",
    body: "Instead of rehashing the same conversation every time, you can actually see what sounds good, what has been watched, and what is still in play.",
  },
] as const;

const callouts = [
  {
    title: "Use it by yourself",
    body: "FilmPickle works as a personal tracker first, not just a shared tool with the solo mode awkwardly bolted on.",
    icon: PickleIcon,
  },
  {
    title: "Invite people later",
    body: "You can start alone now and turn it into a shared setup whenever your watch life gets more collaborative.",
    icon: UsersIcon,
  },
  {
    title: "Keep updates light",
    body: "The goal is quick capture and low-friction tracking, not turning movie night into admin.",
    icon: SparkIcon,
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className="space-y-10 pb-10 md:space-y-14">
      <section className="marketing-section grid gap-6 pt-2 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="marketing-pill text-xs font-semibold tracking-[0.2em] uppercase">
              <PickleIcon className="h-4 w-4 text-[rgb(32,94,51)]" />
              How it works
            </span>
            <span className="marketing-pill text-sm">
              Solo first, shared whenever you want
            </span>
          </div>

          <div className="space-y-4">
            <p className="app-kicker">Get out of the what-to-watch pickle.</p>
            <h1 className="max-w-3xl text-4xl leading-[1] font-semibold text-balance text-[rgb(23,35,18)] sm:text-5xl md:text-6xl">
              Save titles fast, track what you watched, and keep shared watch life from getting sloppy.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)] sm:text-lg sm:leading-8">
              FilmPickle is built to work whether you are keeping a personal
              tracker for yourself or trying to make watch-night decisions a little
              less chaotic with other people.
            </p>
          </div>
        </div>

        <PageCard elevated className="rounded-[32px] p-5 md:p-6">
          <p className="app-kicker">At a glance</p>
          <div className="mt-4 space-y-3">
            {callouts.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,249,236,0.72))] p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(39,102,57,0.1)] text-[rgb(30,88,48)]">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-[rgb(23,35,18)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[rgb(69,84,53)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </PageCard>
      </section>

      <section className="marketing-section grid gap-6 lg:grid-cols-2">
        <PageCard elevated className="rounded-[32px] p-6 md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(39,102,57,0.1)] text-[rgb(30,88,48)]">
              <SearchIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="app-kicker">Personal tracker</p>
              <h2 className="text-2xl font-semibold text-[rgb(23,35,18)] sm:text-3xl">
                Start with one person
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {personalSteps.map((step) => (
              <div
                key={step.number}
                className="rounded-[26px] bg-[rgba(255,255,255,0.74)] p-4"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(219,241,158,0.88),rgba(244,188,70,0.42))] text-sm font-semibold text-[rgb(27,67,39)]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-[rgb(23,35,18)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[rgb(69,84,53)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </PageCard>

        <PageCard elevated className="rounded-[32px] p-6 md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(39,102,57,0.1)] text-[rgb(30,88,48)]">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="app-kicker">Shared use</p>
              <h2 className="text-2xl font-semibold text-[rgb(23,35,18)] sm:text-3xl">
                Invite people when you are ready
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {sharedSteps.map((step) => (
              <div
                key={step.number}
                className="rounded-[26px] bg-[rgba(255,255,255,0.74)] p-4"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(219,241,158,0.88),rgba(244,188,70,0.42))] text-sm font-semibold text-[rgb(27,67,39)]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-[rgb(23,35,18)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[rgb(69,84,53)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </PageCard>
      </section>

      <section className="marketing-section">
        <PageCard elevated className="rounded-[36px] p-7 md:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="space-y-4">
              <p className="app-kicker">Product preview</p>
              <h2 className="max-w-3xl text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
                Leave room for screenshots here as the product keeps growing.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)]">
                This section is intentionally ready for real product screenshots
                later. For now, it can hold lightweight mockups and clearer visual
                examples of search, dashboard, and title detail views.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Search and add", "Dashboard", "Title detail"].map((label) => (
                <div
                  key={label}
                  className="rounded-[26px] border border-[rgb(58,104,63,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,249,236,0.7))] p-4"
                >
                  <div className="aspect-[0.72] rounded-[20px] bg-[linear-gradient(180deg,rgba(219,241,158,0.38),rgba(255,255,255,0.9))]" />
                  <p className="mt-3 text-sm font-semibold text-[rgb(23,35,18)]">
                    {label}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-[rgb(87,101,66)]">
                    Placeholder for future screenshot or mockup.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PageCard>
      </section>

      <section className="marketing-section">
        <PageCard elevated className="rounded-[36px] p-7 md:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="app-kicker">Less chaos, more actually watching things</p>
              <h2 className="max-w-3xl text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
                Start with your own tracker now, then invite people later if your watch life gets more collaborative.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)]">
                FilmPickle is happiest when it stays easy to keep up with, whether
                that means one person or a whole watch-happy household.
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
