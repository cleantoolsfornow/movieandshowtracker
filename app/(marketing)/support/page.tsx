import type { Metadata } from "next";

import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import { PickleIcon } from "@/components/marketing/inline-icons";
import { SupportEmailCard } from "@/components/marketing/support-email-card";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Need help with FilmPickle? Send feedback, bug reports, or questions by email.",
  openGraph: {
    title: "Support | FilmPickle",
    description:
      "Get support for FilmPickle or send feedback, bug reports, and product questions.",
    type: "website",
  },
};

export default function SupportPage() {
  return (
    <div className="space-y-10 pb-10 md:space-y-14">
      <section className="marketing-section grid gap-6 pt-2 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="marketing-pill text-xs font-semibold tracking-[0.2em] uppercase">
              <PickleIcon className="h-4 w-4 text-[rgb(32,94,51)]" />
              Support
            </span>
            <span className="marketing-pill text-sm">
              Bugs, feedback, questions, the whole little pile
            </span>
          </div>

          <div className="space-y-4">
            <p className="app-kicker">Get out of the what-to-watch pickle.</p>
            <h1 className="max-w-3xl text-4xl leading-[1] font-semibold text-balance text-[rgb(23,35,18)] sm:text-5xl md:text-6xl">
              Send feedback, bug reports, or questions straight to the inbox without any support-maze nonsense.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)] sm:text-lg sm:leading-8">
              If something feels off, confusing, broken, or just worth suggesting,
              send it over. Support is simple for now: one email address and no
              weird maze to get there.
            </p>
          </div>
        </div>

        <SupportEmailCard />
      </section>

      <section className="marketing-section grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Feedback",
            body: "Tell us what feels good, what feels clunky, or what would make FilmPickle more fun to keep updated.",
          },
          {
            title: "Bug reports",
            body: "If something breaks, gets weird, or behaves like it has had too much coffee, send the details over.",
          },
          {
            title: "Questions",
            body: "If you are unsure how something works, whether a feature exists yet, or what is planned, ask away.",
          },
        ].map((item) => (
          <PageCard key={item.title} elevated className="rounded-[30px] p-6">
            <h2 className="text-2xl font-semibold text-[rgb(23,35,18)]">
              {item.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-[rgb(69,84,53)]">
              {item.body}
            </p>
          </PageCard>
        ))}
      </section>

      <section className="marketing-section">
        <PageCard elevated className="rounded-[36px] p-7 md:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="app-kicker">Back to your queue, little pickle and all</p>
              <h2 className="max-w-3xl text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
                If you are all set, the next title you mean to save is probably already trying to escape.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)]">
                Open FilmPickle, save a few good picks, and keep the queue from
                turning back into chaos.
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
