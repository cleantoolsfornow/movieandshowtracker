import type { Metadata } from "next";

import { Chip } from "@/components/common/chip";
import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import {
  FilmIcon,
  LibraryIcon,
  SearchIcon,
  ShieldIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/marketing/inline-icons";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore fast capture, shared household tracking, solo-friendly workflows, and visual library tools in Movie And Show Tracker.",
  openGraph: {
    title: "Features | Movie And Show Tracker",
    description:
      "Explore fast capture, shared household tracking, solo-friendly workflows, and visual library tools in Movie And Show Tracker.",
    type: "website",
  },
};

const featureBlocks = [
  {
    title: "Search and add in seconds",
    body: "Find a movie or show fast, save it immediately, and keep momentum when ideas hit.",
    kicker: "Fast capture",
    icon: SearchIcon,
  },
  {
    title: "Shared household visibility",
    body: "Track what each person wants to watch and what you've already watched together.",
    kicker: "Household clarity",
    icon: UsersIcon,
  },
  {
    title: "Personal intent and watched state",
    body: "Mark titles clearly so your personal picks never get lost in the noise.",
    kicker: "Solo confidence",
    icon: ShieldIcon,
  },
  {
    title: "A visual-first library",
    body: "Browse with poster-forward cards instead of buried rows in a spreadsheet-like list.",
    kicker: "Poster-first",
    icon: LibraryIcon,
  },
  {
    title: "Better watch decisions",
    body: "Use your saved context to narrow choices quickly when it's time to press play.",
    kicker: "Decision support",
    icon: SparkIcon,
  },
  {
    title: "Rich title detail and status tracking",
    body: "Keep metadata and status together so each title page is genuinely useful.",
    kicker: "Title detail",
    icon: FilmIcon,
  },
  {
    title: "Smooth onboarding into household mode",
    body: "Start solo now, then invite or join a household when shared tracking matters.",
    kicker: "Flexible start",
    icon: UsersIcon,
  },
] as const;

const compareRows = [
  {
    label: "Best for",
    solo: "Personal watch habits and private queues",
    household: "Shared decisions across two or more people",
  },
  {
    label: "View",
    solo: "A clean, personal picture of what you want and watched",
    household: "Member-aware view of shared picks and overlap",
  },
  {
    label: "Outcome",
    solo: "Less forgetting, faster personal picks",
    household: "Less debate, more confidence in tonight's choice",
  },
] as const;

export default function FeaturesPage() {
  return (
    <div className="space-y-14 pb-8 md:space-y-16">
      <section className="marketing-section space-y-5 pt-2">
        <p className="app-kicker">Features</p>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-foreground md:text-5xl">
          Everything you need to track movies and shows with less friction.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-text-muted md:text-lg">
          This app is built to answer one question quickly: what should we watch next? It keeps your
          picks organized, your status clear, and your decisions easier whether you are solo or shared.
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip tone="muted">
            <ShieldIcon className="h-3.5 w-3.5" />
            Useful alone
          </Chip>
          <Chip tone="muted">
            <UsersIcon className="h-3.5 w-3.5" />
            Built for households
          </Chip>
          <Chip tone="muted">
            <SearchIcon className="h-3.5 w-3.5" />
            Fast to maintain
          </Chip>
        </div>
      </section>

      <section className="marketing-section grid gap-4 md:grid-cols-2">
        {featureBlocks.map((feature) => (
          <PageCard key={feature.title} elevated className="space-y-2 p-5">
            <p className="app-kicker inline-flex items-center gap-1.5">
              <feature.icon className="h-3.5 w-3.5" />
              {feature.kicker}
            </p>
            <h2 className="text-xl font-semibold text-foreground">{feature.title}</h2>
            <p className="text-sm leading-6 text-text-muted">{feature.body}</p>
          </PageCard>
        ))}
      </section>

      <section className="marketing-section space-y-5">
        <div className="space-y-2">
          <p className="app-kicker">Solo vs Household</p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            The same product, tuned to how you watch.
          </h2>
        </div>
        <div className="space-y-4 md:hidden">
          {compareRows.map((row) => (
            <PageCard key={row.label} elevated className="space-y-3 p-5">
              <h3 className="text-base font-semibold text-foreground">{row.label}</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-soft">Solo</p>
                  <p className="text-sm leading-6 text-text-muted">{row.solo}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-soft">Household</p>
                  <p className="text-sm leading-6 text-text-muted">{row.household}</p>
                </div>
              </div>
            </PageCard>
          ))}
        </div>
        <PageCard elevated className="hidden overflow-hidden p-0 md:block">
          <div className="grid grid-cols-[0.9fr_1fr_1fr] border-b border-border-subtle bg-surface-muted px-4 py-3 text-sm font-semibold text-foreground">
            <p>Use case</p>
            <p>Solo</p>
            <p>Household</p>
          </div>
          {compareRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[0.9fr_1fr_1fr] gap-2 border-b border-border-subtle px-4 py-4 text-sm last:border-b-0"
            >
              <p className="font-semibold text-foreground">{row.label}</p>
              <p className="text-text-muted">{row.solo}</p>
              <p className="text-text-muted">{row.household}</p>
            </div>
          ))}
        </PageCard>
      </section>

      <section className="marketing-section">
        <PageCard elevated className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/16 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-shared-watch/16 blur-2xl" />
          <div className="relative space-y-4">
            <p className="app-kicker">Start Tracking</p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-foreground md:text-4xl">
              Save your first titles today and keep every next-watch decision clear.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-text-muted md:text-base">
              Create an account in minutes, then use it solo or bring your household in when you&apos;re ready.
            </p>
            <HomeCtaRow includeFeaturesLink={false} />
          </div>
        </PageCard>
      </section>
    </div>
  );
}
