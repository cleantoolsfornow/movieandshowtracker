import Link from "next/link";
import type { Metadata } from "next";

import { Chip } from "@/components/common/chip";
import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import {
  FilmIcon,
  LibraryIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/marketing/inline-icons";

export const metadata: Metadata = {
  title: "Know What To Watch Next",
  description:
    "Track movies and shows for yourself or your household. Save picks, stay organized, and make watch decisions faster.",
  openGraph: {
    title: "Know What To Watch Next | Movie And Show Tracker",
    description:
      "Track movies and shows for yourself or your household. Save picks, stay organized, and make watch decisions faster.",
    type: "website",
  },
};

const whyCards = [
  {
    title: "Stop losing the titles you meant to watch",
    body: "Capture movies and shows in seconds, then keep every maybe in one place.",
  },
  {
    title: "Keep shared picks clear",
    body: "See what each person wants, what you both watched, and what to pick next.",
  },
  {
    title: "Make tonight's decision easy",
    body: "Turn endless scrolling into a clear short list with context that actually helps.",
  },
] as const;

const highlightRail = [
  "Household-aware tracking",
  "Solo-friendly from day one",
  "Fast search and quick add",
  "Poster-first library",
  "Shared watch moments",
] as const;

const steps = [
  {
    step: "1",
    title: "Sign in",
    body: "Use email/password or Google and start in under a minute.",
  },
  {
    step: "2",
    title: "Add movies or shows",
    body: "Search quickly, save the maybes, and keep your queue clean.",
  },
  {
    step: "3",
    title: "Track intent and watched state",
    body: "Stay aligned with yourself or your household without spreadsheets.",
  },
] as const;

const modes = [
  {
    name: "Solo",
    blurb: "Your private watch hub for personal picks and progress.",
  },
  {
    name: "Two people",
    blurb: "A shared rhythm for couples, roommates, or best-watch-buddy mode.",
  },
  {
    name: "Household",
    blurb: "Built to hold group preferences without turning into chaos.",
  },
] as const;

export default function MarketingHomePage() {
  return (
    <div className="space-y-16 pb-8 md:space-y-20">
      <section className="marketing-section grid gap-8 pt-2 md:grid-cols-[1.08fr_0.92fr] md:items-center">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Chip tone="muted">Currently free to use</Chip>
            <Chip tone="muted">Built for solo + shared watching</Chip>
          </div>
          <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-tight text-foreground md:text-6xl md:leading-[1.02]">
            Know what to watch next, together or on your own.
          </h1>
          <p className="max-w-xl text-pretty text-base leading-7 text-text-muted md:text-lg">
            Track movies and shows in one elegant place. Save personal picks, align shared choices,
            and turn scattered maybes into a queue you can actually use.
          </p>

          <HomeCtaRow />

          <div className="flex flex-wrap gap-2">
            <Chip tone="muted">
              <SparkIcon className="h-3.5 w-3.5" />
              Fast to start
            </Chip>
            <Chip tone="muted">
              <UsersIcon className="h-3.5 w-3.5" />
              Solo + household ready
            </Chip>
            <Chip tone="muted">
              <FilmIcon className="h-3.5 w-3.5" />
              Poster-first experience
            </Chip>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -left-8 -top-10 h-36 w-36 rounded-full bg-accent/18 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-shared-watch/18 blur-2xl" />
          <div className="relative grid gap-4">
            <PageCard elevated className="marketing-glow space-y-4 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <p className="app-kicker">What The Product Does</p>
                <Chip tone="muted" className="text-xs">
                  Clear next-watch decisions
                </Chip>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-semibold text-foreground">One place for saved picks, watched titles, and shared momentum.</p>
                <p className="text-sm text-text-muted">
                  Search quickly, keep the right context, and stop restarting the same watch debate from scratch.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-border-subtle bg-surface p-2 text-text-muted">Save what looks good</div>
                <div className="rounded-xl border border-border-subtle bg-surface p-2 text-text-muted">Track what got watched</div>
                <div className="rounded-xl border border-border-subtle bg-surface p-2 text-text-muted">See overlap fast</div>
              </div>
            </PageCard>

            <div className="grid gap-4 sm:grid-cols-2">
              <PageCard className="space-y-1 p-4">
                <p className="app-kicker">One Place</p>
                <p className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                  <LibraryIcon className="h-5 w-5 text-accent" />
                  No spreadsheet energy
                </p>
                <p className="text-xs text-text-soft">A library that feels visual, not like chores.</p>
              </PageCard>
              <PageCard className="space-y-1 p-4">
                <p className="app-kicker">Two Modes</p>
                <p className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                  <SparkIcon className="h-5 w-5 text-shared-watch" />
                  Solo or shared
                </p>
                <p className="text-xs text-text-soft">Useful for private queues and household planning alike.</p>
              </PageCard>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section space-y-5">
        <div className="max-w-2xl space-y-2">
          <p className="app-kicker">Why It Matters</p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">From scattered notes to clear watch decisions.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {whyCards.map((card) => (
            <PageCard
              key={card.title}
              elevated
              className="space-y-2 p-5 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="text-sm leading-6 text-text-muted">{card.body}</p>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section space-y-5">
        <div className="max-w-2xl space-y-2">
          <p className="app-kicker">How It Works</p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Three steps and your next watch is handled.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <PageCard key={item.step} className="space-y-3 p-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/35 bg-accent/10 text-sm font-semibold text-accent">
                {item.step}
              </span>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-6 text-text-muted">{item.body}</p>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section space-y-5">
        <div className="max-w-2xl space-y-2">
          <p className="app-kicker">Highlights</p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Built for the way people actually choose what to watch.</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {highlightRail.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border-subtle bg-surface-strong px-4 py-2 text-sm font-medium text-text-muted"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="marketing-section grid gap-5 md:grid-cols-3 md:items-stretch">
        <div className="md:col-span-3 max-w-2xl space-y-2">
          <p className="app-kicker">Usage Modes</p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Useful alone. Better together.</h2>
        </div>
        {modes.map((mode) => (
          <PageCard key={mode.name} elevated className="space-y-2 p-5">
            <h3 className="text-lg font-semibold text-foreground">{mode.name}</h3>
            <p className="text-sm leading-6 text-text-muted">{mode.blurb}</p>
          </PageCard>
        ))}
      </section>

      <section className="marketing-section">
        <PageCard elevated className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-14 h-48 w-48 rounded-full bg-accent/16 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-shared-watch/16 blur-2xl" />
          <div className="relative space-y-4">
            <p className="app-kicker">Ready To Start</p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-foreground md:text-4xl">
              Save your first picks in minutes and make every watch night smoother.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-text-muted md:text-base">
              Account setup is quick. Start solo today, or invite your household whenever shared tracking becomes useful.
            </p>
            <HomeCtaRow includeFeaturesLink={false} />
            <Link
              className="inline-flex text-sm font-medium text-accent hover:text-accent-strong"
              href="/features"
            >
              See features
            </Link>
          </div>
        </PageCard>
      </section>
    </div>
  );
}
