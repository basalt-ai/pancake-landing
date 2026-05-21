/**
 * /creators — the Pancake Creator Program.
 *
 * Brag about your AI cofounder, get paid back in cash, credits, or a
 * progressively-stupider ladder of gifts (founder phone call → Thermomix).
 * Structure intentionally diverges from comparable creator pages: a single
 * unified payout table, three "prize" lanes (not 5 platform tables), a
 * 4-step flow (not 6), and a gift ladder that doesn't exist anywhere else.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { H2, H3 } from "@/components/ui/Headings";

const APPLY_HREF =
  "mailto:creators@getpancake.ai?subject=Pancake%20Creator%20Program&body=Hi%20Pancake%20team%2C%0A%0AI%27d%20like%20to%20join%20the%20creator%20program.%0A%0AMy%20main%20platform%3A%20%0AMy%20handle%3A%20%0AMy%20typical%20reach%3A%20%0A%0A%E2%80%94";

export const metadata: Metadata = {
  title: "Creator Program — Post a Pancake, get a Thermomix · Pancake",
  description:
    "Show what your AI cofounder is doing. Get paid in cash, credits, or a Thermomix. Pancake's creator program for builders who share online.",
  alternates: { canonical: "https://www.getpancake.ai/creators" },
  openGraph: {
    type: "website",
    url: "https://www.getpancake.ai/creators",
    title: "Pancake Creator Program — Post a Pancake, get a Thermomix",
    description:
      "Cash, credits, or — if you go viral — an actual Thermomix. Pancake's creator program.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake Creator Program" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake Creator Program — Post a Pancake, get a Thermomix",
    description:
      "Cash, credits, or — if you go viral — an actual Thermomix. Pancake's creator program.",
    images: ["/og-image.png"],
  },
};

const tiers = [
  { reach: "1k – 5k", cash: "$200", credits: "$300", surprise: "—" },
  { reach: "5k – 20k", cash: "$600", credits: "$900", surprise: "Founder calls you" },
  { reach: "20k – 100k", cash: "$1,000", credits: "$1,500", surprise: "Founder calls you" },
  { reach: "100k+", cash: "$2,000", credits: "$3,000", surprise: "A real Thermomix TM6" },
];

const steps = [
  {
    n: "01",
    title: "Let Pancake do the work",
    body: "Briefing, research, copy, code, whatever. The screenshot has to be real output from your real workspace.",
  },
  {
    n: "02",
    title: "Post it. Tag us.",
    body: "X, LinkedIn, TikTok, YouTube, Instagram. Tag @getpancake_ai. No paid boosts.",
  },
  {
    n: "03",
    title: "Wait a week",
    body: "Seven days for the numbers to settle. Then send us the post link and an analytics screenshot.",
  },
  {
    n: "04",
    title: "Get paid in 48h",
    body: "Cash via Wise, credits applied instantly, or a Thermomix shipped to your door if you go big.",
  },
];

const rules = [
  "One post per week. Four per month. Don't flood the feed — yours or ours.",
  "Real Pancake output only. Blur anything you don't want public. No staged screenshots.",
  "Tag @getpancake_ai in the post. Organic reach only — no boosted or paid placement.",
  "Don't bundle Pancake into a 5-tools-I-use roundup. The post should be about us.",
  "We pay out 48h after you submit the analytics. Cash within 5 business days, credits instantly.",
];

const creatorProgramJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Pancake Creator Program",
  url: "https://www.getpancake.ai/creators",
  description:
    "Earn cash, credits, or surprise gifts (up to a Thermomix TM6) by posting about Pancake on social.",
  isPartOf: {
    "@type": "WebSite",
    name: "Pancake",
    url: "https://www.getpancake.ai",
  },
};

export default function CreatorsPage() {
  return (
    <main id="main-content" className="creators-page min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creatorProgramJsonLd) }}
      />

      <HomeNav />

      {/* Hero */}
      <section className="home-landing-section" aria-labelledby="creators-hero-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <Badge variant="brand-alt-1">Creator Program</Badge>
            <h1
              id="creators-hero-heading"
              className="heading home-landing-section__title text-center"
            >
              Post a Pancake. Get a Thermomix.
            </h1>
            <p className="home-landing-section__lede text-center">
              Show the internet what your AI cofounder is doing. We pay you back in
              cash, credits, or — if you really go for it — an actual kitchen robot.
            </p>
          </header>
          <div className="creators-hero__cta">
            <a
              href={APPLY_HREF}
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Apply to join
            </a>
            <a href="#rules" className="creators-hero__cta-secondary no-underline">
              Or read the fine print →
            </a>
          </div>
        </div>
      </section>

      {/* Three prize lanes */}
      <section
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="creators-prizes-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="creators-prizes-heading" className="heading home-landing-section__title text-center">
              Pick your prize
            </H2>
            <p className="home-landing-section__lede text-center">
              Three lanes. Same posts. Wildly different payouts.
            </p>
          </header>

          <ul className="creators-prizes">
            <li>
              <Card variant="outline" className="creators-prize">
                <span className="creators-prize__eyebrow">Lane 1</span>
                <H3 className="heading creators-prize__title">Cash</H3>
                <p className="creators-prize__body">
                  $200 to $2,000 per post, paid in dollars via Wise. The boring,
                  reliable option. Your landlord likes this one.
                </p>
              </Card>
            </li>
            <li>
              <Card variant="brand-alt-1" className="creators-prize">
                <span className="creators-prize__eyebrow">Lane 2 · 50% more</span>
                <H3 className="heading creators-prize__title">Pancake credits</H3>
                <p className="creators-prize__body">
                  Take it in credits and we top you up by 50%. Run more agents,
                  burn more tokens, post more screenshots. The flywheel.
                </p>
              </Card>
            </li>
            <li>
              <Card variant="brand" className="creators-prize">
                <span className="creators-prize__eyebrow">Lane 3 · escalating</span>
                <H3 className="heading creators-prize__title">Surprise gifts</H3>
                <p className="creators-prize__body">
                  At 5k+ reach a Pancake founder calls you and tells you one
                  genuinely bad joke. At 100k+ we ship you a Thermomix TM6.
                  Yes, really. Yes, the €1,400 one.
                </p>
              </Card>
            </li>
          </ul>
        </div>
      </section>

      {/* Unified tier table */}
      <section className="home-landing-section" aria-labelledby="creators-tiers-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="creators-tiers-heading" className="heading home-landing-section__title text-center">
              How big you go = what you get
            </H2>
            <p className="home-landing-section__lede text-center">
              One table for every platform. Impressions on X/LinkedIn, views
              everywhere else.
            </p>
          </header>

          <div className="creators-tiers" role="region" aria-label="Reward tiers">
            <table className="creators-tiers__table">
              <thead>
                <tr>
                  <th scope="col">Reach</th>
                  <th scope="col">Cash</th>
                  <th scope="col">Credits</th>
                  <th scope="col">Surprise</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.reach}>
                    <th scope="row">{t.reach}</th>
                    <td>{t.cash}</td>
                    <td>
                      <span className="creators-tiers__credits">{t.credits}</span>
                    </td>
                    <td>{t.surprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="creators-tiers__note">
              Max $2,000 cash (or $3,000 in credits) per post. Pick one lane per
              post — you can mix it up across the month.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="creators-howto-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="creators-howto-heading" className="heading home-landing-section__title text-center">
              Four steps. No paperwork.
            </H2>
            <p className="home-landing-section__lede text-center">
              From screenshot to payout in eight days flat.
            </p>
          </header>

          <ol className="creators-steps">
            {steps.map((s) => (
              <li key={s.n} className="creators-step">
                <span className="creators-step__num">{s.n}</span>
                <div>
                  <H3 className="heading creators-step__title">{s.title}</H3>
                  <p className="creators-step__body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* House rules */}
      <section
        id="rules"
        className="home-landing-section"
        aria-labelledby="creators-rules-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="creators-rules-heading" className="heading home-landing-section__title text-center">
              House rules
            </H2>
            <p className="home-landing-section__lede text-center">
              Short list. We trust you.
            </p>
          </header>

          <ul className="creators-rules">
            {rules.map((r) => (
              <li key={r} className="creators-rules__item">
                <span aria-hidden className="creators-rules__dot" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="creators-closing-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <h2
            id="creators-closing-heading"
            className="heading home-landing-section__closing-title text-center"
          >
            Your turn.
          </h2>
          <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
            Apply in one email. We&apos;ll get back to you within two days,
            joke optional.
          </p>
          <div className="home-landing-closing-cta">
            <a
              href={APPLY_HREF}
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Apply to join
            </a>
            <p className="home-landing-closing-cta__note">
              Or DM <Link href="https://x.com/getpancake_ai" className="underline">@getpancake_ai</Link>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
