/**
 * /creators — the Pancake Creator Program.
 *
 * Show off your AI cofounder, get Pancake credits + an escalating ladder
 * of surprise gifts (founder joke → pancakes to your office → 1-star
 * Michelin dinner → Thermomix). Structure intentionally diverges from
 * comparable creator pages: no cash, no application form, no platform-
 * by-platform tables — one toggle (X / LinkedIn), one ladder, no gate.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { CreatorsRules } from "@/components/sections/creators/CreatorsRules";
import { CreatorsTiers } from "@/components/sections/creators/CreatorsTiers";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";
import { H2, H3 } from "@/components/ui/Headings";

export const metadata: Metadata = {
  title: "Creator Program — Post a Pancake, get a Thermomix · Pancake",
  description:
    "Show what your AI cofounder is doing. Get Pancake credits — and surprise gifts from a bad-joke phone call all the way up to a Thermomix.",
  alternates: { canonical: "https://www.getpancake.ai/creators" },
  openGraph: {
    type: "website",
    url: "https://www.getpancake.ai/creators",
    title: "Pancake Creator Program — Post a Pancake, get a Thermomix",
    description:
      "Credits + an escalating ladder of surprise gifts: founder joke → pancakes to your office → Michelin dinner → Thermomix.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake Creator Program" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake Creator Program — Post a Pancake, get a Thermomix",
    description:
      "Credits + a ladder of stupid gifts. Top tier: an actual Thermomix.",
    images: ["/og-image.png"],
  },
};

const steps = [
  {
    n: "01",
    title: "Catch Pancake in the act",
    body: "Real screenshot, real workspace, real output. Briefing, research, copy, code — whatever made you go 'huh, that's good.'",
  },
  {
    n: "02",
    title: "Post it. Tag us.",
    body: "X or LinkedIn. Tag @getpancake_ai. No paid boosts. No 5-tools-I-use roundups.",
  },
  {
    n: "03",
    title: "Wait a week",
    body: "Seven days for the numbers to settle. Then send us the post link and an analytics screenshot.",
  },
  {
    n: "04",
    title: "Get the goods",
    body: "Credits applied instantly. Surprises shipped: phone call, pancakes, a Michelin reservation, or a kitchen robot.",
  },
];

const creatorProgramJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Pancake Creator Program",
  url: "https://www.getpancake.ai/creators",
  description:
    "Earn Pancake credits and surprise gifts (up to a Thermomix TM6) by posting about Pancake on X or LinkedIn.",
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
              Show the internet what your AI cofounder is doing. We pay you back
              in credits — and a ladder of increasingly suspicious gifts.
            </p>
          </header>
          <div className="creators-hero__cta">
            <a
              href="#prizes"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Show me the prizes
            </a>
            <p className="creators-hero__cta-note">
              There&apos;s no application form. That&apos;s the whole bit.
            </p>
          </div>
        </div>
      </section>

      {/* The reward ladder */}
      <section
        id="prizes"
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="creators-prizes-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="creators-prizes-heading" className="heading home-landing-section__title text-center">
              The reward ladder
            </H2>
            <p className="home-landing-section__lede text-center">
              Credits every time. Surprises that get progressively less rational
              the further you climb.
            </p>
          </header>

          <ul className="creators-ladder">
            <li>
              <div className="creators-ladder__step">
                <span className="creators-ladder__rung">01</span>
                <H3 className="heading creators-ladder__title">A founder calls you</H3>
                <p className="creators-ladder__body">
                  Picks up the phone, tells you a joke. In their own words. No
                  script, no PR rehearsal. Quality not guaranteed.
                </p>
              </div>
            </li>
            <li>
              <div className="creators-ladder__step">
                <span className="creators-ladder__rung">02</span>
                <H3 className="heading creators-ladder__title">Pancakes to your office</H3>
                <p className="creators-ladder__body">
                  We send actual pancakes. The edible kind. Delivered to whatever
                  address you call &ldquo;the office&rdquo;.
                </p>
              </div>
            </li>
            <li>
              <div className="creators-ladder__step">
                <span className="creators-ladder__rung">03</span>
                <H3 className="heading creators-ladder__title">Michelin dinner for two</H3>
                <p className="creators-ladder__body">
                  Invitation for two at a one-star Michelin restaurant. Bring a
                  cofounder. Bring your mum. Up to you.
                </p>
              </div>
            </li>
            <li>
              <div className="creators-ladder__step creators-ladder__step--top">
                <span className="creators-ladder__rung">04</span>
                <H3 className="heading creators-ladder__title">A real Thermomix</H3>
                <p className="creators-ladder__body">
                  Top tier. We ship you a brand-new Thermomix TM6. Because if
                  Pancake can run your company, the least we can do is run your
                  kitchen.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Unified tier table with X / LinkedIn toggle */}
      <section className="home-landing-section" aria-labelledby="creators-tiers-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="creators-tiers-heading" className="heading home-landing-section__title text-center">
              How big you go = what you get
            </H2>
            <p className="home-landing-section__lede text-center">
              Same thresholds on both platforms. Pick yours.
            </p>
          </header>

          <CreatorsTiers />
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
              From screenshot to surprise in about eight days.
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
              Mostly shared. X lets you post more, LinkedIn wants you to chill.
            </p>
          </header>

          <CreatorsRules />
        </div>
      </section>

      {/* Closing */}
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
            Open Pancake. Open X (or LinkedIn). Post. Tag us. That&apos;s it.
          </p>
          <div className="home-landing-closing-cta">
            <Link
              href="https://x.com/getpancake_ai"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
              prefetch={false}
            >
              Tag @getpancake_ai
            </Link>
            <p className="home-landing-closing-cta__note">
              Questions? DM us — or read the{" "}
              <a href="#rules" className="underline">house rules</a>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
