import type { Metadata } from "next";

import { PageCard } from "@/components/common/page-card";
import { HomeCtaRow } from "@/components/marketing/home-cta-row";
import { PickleIcon } from "@/components/marketing/inline-icons";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about FilmPickle, including solo use, households, pricing, and current feature support.",
  openGraph: {
    title: "FAQ | FilmPickle",
    description:
      "Get quick answers about how FilmPickle works for personal trackers, couples, roommates, and households.",
    type: "website",
  },
};

const faqs = [
  {
    question: "Can I use FilmPickle by myself?",
    answer:
      "Yes. FilmPickle is meant to work as a personal tracker just as well as it works for shared households.",
  },
  {
    question: "Do I need to create a household?",
    answer:
      "You can start with your own personal setup and use the app by yourself. If you want shared tracking later, you can create a household or invite people then.",
  },
  {
    question: "Can I invite someone later?",
    answer:
      "Yes. You do not have to start in shared mode. You can begin solo and make it collaborative when that becomes useful.",
  },
  {
    question: "Is FilmPickle free?",
    answer:
      "Yes. FilmPickle is free right now. Donations are optional and just help keep the project moving.",
  },
  {
    question: "Does FilmPickle work for couples?",
    answer:
      "Yes. Couples are one of the clearest use cases. It is built to work well for one person, two people, roommates, and larger households.",
  },
  {
    question: "Does it work for roommates or bigger households too?",
    answer:
      "Yes. The app supports shared use for 1 to 3+ people, including couples, roommates, and full households.",
  },
  {
    question: "Does FilmPickle support TV season or episode progress?",
    answer:
      "Not yet. Right now TV shows are tracked at the title level. Deeper season and episode progress is planned for the future.",
  },
  {
    question: "Can I leave a household right now?",
    answer:
      "Not currently. Better household management, including leaving a household, is planned for the future.",
  },
  {
    question: "Can I delete my account right now?",
    answer:
      "Not currently. Account deletion is planned for the future, but it is not part of the product yet.",
  },
  {
    question: "Can I import or export my data?",
    answer:
      "Not currently. Import and export are not supported right now.",
  },
  {
    question: "Can I use FilmPickle on my phone?",
    answer:
      "Yes. FilmPickle is built for the web and is intended to work well on mobile web too.",
  },
] as const;

export default function FaqPage() {
  return (
    <div className="space-y-10 pb-10 md:space-y-14">
      <section className="marketing-section grid gap-6 pt-2 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="marketing-pill text-xs font-semibold tracking-[0.2em] uppercase">
              <PickleIcon className="h-4 w-4 text-[rgb(32,94,51)]" />
              FAQ
            </span>
            <span className="marketing-pill text-sm">
              The useful questions, not the fake ones
            </span>
          </div>

          <div className="space-y-4">
            <p className="app-kicker">Get out of the what-to-watch pickle.</p>
            <h1 className="max-w-3xl text-4xl leading-[1] font-semibold text-balance text-[rgb(23,35,18)] sm:text-5xl md:text-6xl">
              Everything people are likely to ask before they start saving titles.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)] sm:text-lg sm:leading-8">
              FilmPickle is meant to be simple, but a few questions come up fast:
              can you use it solo, does it work for couples, does it handle TV
              progress, and is it free? Here are the honest answers.
            </p>
          </div>
        </div>

        <PageCard elevated className="rounded-[34px] p-6 md:p-7">
          <p className="app-kicker">Short version</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[rgb(69,84,53)]">
            <p>
              Yes, you can use FilmPickle by yourself.
            </p>
            <p>
              Yes, it works for couples, roommates, and larger households too.
            </p>
            <p>
              Yes, it is free right now.
            </p>
            <p>
              No, deeper TV episode progress is not there yet.
            </p>
          </div>
        </PageCard>
      </section>

      <section className="marketing-section">
        <div className="grid gap-4">
          {faqs.map((item) => (
            <PageCard key={item.question} elevated className="rounded-[28px] p-5 md:p-6">
              <h2 className="text-xl font-semibold text-[rgb(23,35,18)]">
                {item.question}
              </h2>
              <p className="mt-3 max-w-4xl text-base leading-7 text-[rgb(69,84,53)]">
                {item.answer}
              </p>
            </PageCard>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <PageCard elevated className="rounded-[36px] p-7 md:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="app-kicker">One less thing to overthink</p>
              <h2 className="max-w-3xl text-3xl leading-tight font-semibold text-[rgb(23,35,18)] sm:text-4xl md:text-5xl">
                The easiest way to understand FilmPickle is still to use it for a few minutes.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[rgb(69,84,53)]">
                Start with your own tracker, save a few titles, and see whether it
                feels like the right home for your watch habits.
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
