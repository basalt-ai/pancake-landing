/**
 * /openclaw-vs-pancake — bottom-of-funnel comparison page.
 *
 * Same template as /viktor-vs-pancake (see app/viktor-vs-pancake/page.tsx):
 * the `home-landing-section` shell, the `.button` CTA anchor, the
 * `HomeLandingTestimonials` banner, and the `.influencers-tiers__table`
 * chrome — plus the shared `vvp-*` classes. Captures "openclaw vs pancake"
 * / "is pancake just openclaw" search intent. Honest framing: OpenClaw is the
 * open-source runtime Pancake itself is built on — the engine. Pancake is the
 * car: pre-configured teams, a company brain, managed pods, playbooks, support.
 * OpenClaw keeps its real wins (free, open, full control).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LuBadgeCheck, LuCheck, LuCreditCard, LuLock, LuShieldCheck, LuSparkles, LuX } from "react-icons/lu";
import { FaXTwitter } from "react-icons/fa6";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";
import { H2, H3 } from "@/components/ui/Headings";

const APP_URL = "https://app.getpancake.ai";

export const metadata: Metadata = {
  title: "OpenClaw vs Pancake: The Open-Source Runtime vs the Company That Runs Itself",
  description:
    "OpenClaw is the open-source runtime. Pancake is the product built on top of it: pre-configured specialist teams, a company brain, dedicated pods, and the playbooks that make it work. The engine vs the car.",
  alternates: { canonical: "https://getpancake.ai/openclaw-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/openclaw-vs-pancake",
    title: "OpenClaw vs Pancake: The Open-Source Runtime vs the Company That Runs Itself",
    description:
      "OpenClaw is the open-source runtime. Pancake is the product built on top of it: pre-configured specialist teams, a company brain, dedicated pods, and the playbooks that make it work.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OpenClaw vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClaw vs Pancake: The Open-Source Runtime vs the Company That Runs Itself",
    description:
      "OpenClaw is the open-source runtime. Pancake is the product built on top of it: pre-configured teams, a company brain, dedicated pods, and the playbooks that make it work.",
    images: ["/og-image.png"],
  },
};

/** Five narrative differentiators. Each contrasts OpenClaw vs Pancake + a copy-angle pull line. */
const DIFFERENTIATORS = [
  {
    n: "01",
    title: "Pre-configured teams, not a blank runtime",
    body: "OpenClaw is the raw runtime: you wire up the agents, prompts, memory and tools yourself. Pancake ships a full org-chart of specialist agents (SEO, ads, code, ops, finance), pre-configured and ready to work the moment you add it to Slack. The team is already there.",
    angle: "OpenClaw gives you the parts. Pancake hands you the team.",
  },
  {
    n: "02",
    title: "A company brain, built and maintained for you",
    body: "OpenClaw gives you the primitives to store context. Pancake gives you the structured org-brain architecture (goals, decisions, metrics, meeting notes), linked and actively maintained by your agents. You don't design the memory system. It's already designed, and it keeps itself current.",
    angle: "A brain that maintains itself, not a database to fill.",
  },
  {
    n: "03",
    title: "Managed infrastructure, not your own DevOps",
    body: "Run OpenClaw yourself and you own the hosting, scaling, monitoring and uptime. Every Pancake customer gets a dedicated pod: 50GB RAM, full package install, persistent agent profiles, and long-running processes. Provisioned, monitored, and kept alive for you. No infra to babysit.",
    angle: "A machine that's already running, not a server to run.",
  },
  {
    n: "04",
    title: "Slack-native UX, not a config file",
    body: "OpenClaw is configured by engineers in code. Pancake you talk to like a teammate: you set it up, connect your tools, and direct your agents right in the conversation. No YAML, no deploys, no engineering team required to get value on day one.",
    angle: "Talk to your company, don't configure it.",
  },
  {
    n: "05",
    title: "Playbooks and support, not raw source code",
    body: "OpenClaw is open source you assemble. Pancake is the product on top of it: the proven playbooks that make autonomous agents actually deliver, plus a team behind it when something breaks. OpenClaw is the engine; Pancake is the car, the road map, and the pit crew.",
    angle: "The source is free. Making it work is the product.",
  },
];

type Cell = { text: string; mark?: "yes" | "no" };
type Row = { feature: string; competitor: Cell; pancake: Cell };

/** Feature comparison. Marks are honest — OpenClaw keeps its real wins (free, open source, full control). */
const TABLE_ROWS: Row[] = [
  {
    feature: "What it is",
    competitor: { text: "Open-source agent runtime" },
    pancake: { text: "Managed product built on OpenClaw", mark: "yes" },
  },
  {
    feature: "Getting started",
    competitor: { text: "Self-host & configure (engineering)", mark: "no" },
    pancake: { text: "Add to Slack, start chatting", mark: "yes" },
  },
  {
    feature: "Specialist teams",
    competitor: { text: "Build your own" },
    pancake: { text: "Pre-configured org-chart of agents", mark: "yes" },
  },
  {
    feature: "Company memory",
    competitor: { text: "Primitives, you assemble" },
    pancake: { text: "Structured org brain, maintained for you", mark: "yes" },
  },
  {
    feature: "Infrastructure",
    competitor: { text: "Your own hosting & DevOps" },
    pancake: { text: "Dedicated pod per customer (50GB RAM)", mark: "yes" },
  },
  {
    feature: "Cost",
    competitor: { text: "Free, open source", mark: "yes" },
    pancake: { text: "Free to start, then paid" },
  },
  {
    feature: "Customization & control",
    competitor: { text: "Full source-level control", mark: "yes" },
    pancake: { text: "Configurable, managed for you" },
  },
  {
    feature: "Playbooks & support",
    competitor: { text: "Community / DIY" },
    pancake: { text: "Proven playbooks + a team behind it", mark: "yes" },
  },
  {
    feature: "Best for",
    competitor: { text: "Engineers who want to build their own stack" },
    pancake: { text: "Founders who want it running today" },
  },
];

/** FAQ — answers are plain strings so they can feed both the page and FAQPage JSON-LD. */
const FAQS = [
  {
    q: "Isn't Pancake just OpenClaw with a UI on top?",
    a: "Pancake is built on OpenClaw, but it's the product, not a skin. OpenClaw is the runtime. The engine. Pancake adds pre-configured specialist teams, a company-brain architecture, Slack-native UX, dedicated managed pods, and the playbooks that make autonomous agents actually deliver. OpenClaw is the engine; Pancake is the car.",
  },
  {
    q: "Can I just self-host OpenClaw instead?",
    a: "Absolutely. It's open source. If you have engineering time and want full source-level control over every part of the stack, running OpenClaw yourself is a real option. Pancake is for teams who want everything OpenClaw enables, running today, without building and operating it themselves.",
  },
  {
    q: "Do I lose control by using Pancake?",
    a: "No. Pancake is configurable, and because it's built on open OpenClaw there's no black box underneath. You get the managed product experience without being locked out of how it works: you direct your agents, connect your own tools, and own your data in your dedicated pod.",
  },
  {
    q: "What does “partially autonomous company” actually mean?",
    a: "It means AI handles 50–70% of the work by default (GTM motions, engineering tasks, ops workflows) without a human prompting each step. Humans act like board members: they set direction, review decisions, and unblock edge cases.",
  },
  {
    q: "Will Pancake stay compatible with OpenClaw?",
    a: "Yes. Pancake is the maintained product built on top of OpenClaw. We develop both. As OpenClaw the runtime improves, those gains flow into Pancake without you having to manage the upgrade.",
  },
];

// WebPage JSON-LD — matches the standalone-page convention (see app/viktor-vs-pancake/page.tsx).
const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "OpenClaw vs Pancake",
  url: "https://getpancake.ai/openclaw-vs-pancake",
  description:
    "A head-to-head comparison of OpenClaw and Pancake: the open-source agent runtime you assemble yourself vs the managed product built on top of it that runs your company autonomously.",
  isPartOf: { "@type": "WebSite", name: "Pancake", url: "https://getpancake.ai" },
  author: { "@type": "Person", name: "François de Fitte" },
  about: [
    { "@type": "Thing", name: "OpenClaw" },
    { "@type": "Thing", name: "Pancake" },
  ],
};

// FAQPage JSON-LD — targets "openclaw vs pancake" / "is pancake just openclaw" buyer queries.
const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

function ComparisonCell({ cell }: { cell: Cell }) {
  if (!cell.mark) return <span className="vvp-mark__text">{cell.text}</span>;
  const Icon = cell.mark === "yes" ? LuCheck : LuX;
  return (
    <span className="vvp-mark">
      <Icon
        size={18}
        aria-hidden
        className={cell.mark === "yes" ? "vvp-mark__icon vvp-mark__icon--yes" : "vvp-mark__icon vvp-mark__icon--no"}
      />
      <span className="vvp-mark__text">{cell.text}</span>
    </span>
  );
}

export default function OpenClawVsPancakePage() {
  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />

      <HomeNav />

      {/* Hero — standard light landing section with two product comparison cards */}
      <section className="home-landing-section" aria-labelledby="vvp-hero-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <h1 id="vvp-hero-heading" className="heading home-landing-section__title text-center">
              OpenClaw v. Pancake
            </h1>
            <p className="home-landing-section__lede text-center">
              The engine versus the car.
            </p>
            <p className="vvp-hero__summary text-center">
              OpenClaw is the open-source runtime you assemble yourself. Pancake is the product built
              on top of it: specialist agents that own your company, ready on day one.
            </p>
          </header>

          <div className="vvp-hero__cta">
            <div className="vvp-hero__cta-row">
              <a
                href={APP_URL}
                className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
                data-size="lg"
              >
                Try Pancake for free
              </a>
              <a
                href="#vvp-compare"
                className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
                data-size="lg"
                data-variant="subtle"
              >
                See how they compare
              </a>
            </div>
            <ul className="vvp-hero__badges">
              <li className="vvp-hero__badge">
                <LuSparkles aria-hidden /> Free to start
              </li>
              <li className="vvp-hero__badge">
                <LuCreditCard aria-hidden /> No credit card
              </li>
              <li className="vvp-hero__badge">
                <LuShieldCheck aria-hidden /> SOC 2 compliant
              </li>
              <li className="vvp-hero__badge">
                <LuLock aria-hidden /> Private by default
              </li>
            </ul>
          </div>

          <div className="vvp-hero__cards">
            <article className="vvp-pcard vvp-pcard--viktor">
              <span className="vvp-pcard__icon vvp-pcard__icon--logo" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element -- raster brand mark */}
                <img src="/openclaw-logo.png" alt="" width={48} height={48} />
              </span>
              <H3 className="heading vvp-pcard__title">OpenClaw</H3>
              <p className="vvp-pcard__body">
                The open-source runtime for autonomous agents: Claude extended with a real browser,
                a filesystem, and the ability to integrate anything with an API key. Powerful and
                fully yours to shape, but you host it, configure it, and assemble the agents yourself.
              </p>
              <p className="vvp-pcard__choose">
                The engine. Yours to build on, if you have the time.
              </p>
            </article>
            <article className="vvp-pcard vvp-pcard--pancake">
              <span className="vvp-pcard__icon vvp-pcard__icon--logo" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element -- raster brand mark */}
                <img src="/pancake-mark.png" alt="" width={48} height={48} />
              </span>
              <H3 className="heading vvp-pcard__title">Pancake</H3>
              <p className="vvp-pcard__body">
                The product built on OpenClaw: a team of specialist agents in your Slack, one for
                sales, marketing, engineering and ops, with a company brain and a dedicated pod,
                pre-configured and running on day one. Everything OpenClaw enables, without building
                and operating it yourself.
              </p>
              <p className="vvp-pcard__choose">
                The car. Everything assembled, running today.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Verdict — statement on the left, customer quote on the right (side by side) */}
      <section className="home-landing-section home-landing-section--alt" aria-labelledby="vvp-verdict-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} vvp-verdict-grid`}>
          <div className="vvp-verdict-aside">
            <Badge variant="brand-alt-1">The verdict</Badge>
            <H2 id="vvp-verdict-heading" className="heading vvp-verdict-aside__title">
              One is the engine. The other is the company already running on it.
            </H2>
            <p className="vvp-verdict-aside__lede">
              The honest bottom line. And what founders tell us after they switch.
            </p>
          </div>
          <figure className="vvp-tweet">
            <div className="vvp-tweet__head">
              <span className="vvp-tweet__avatar" aria-hidden>PL</span>
              <span className="vvp-tweet__id">
                <span className="vvp-tweet__name">
                  Priya Lakhani
                  <LuBadgeCheck className="vvp-tweet__verified" aria-hidden />
                </span>
                <span className="vvp-tweet__handle">@priyalakhani</span>
              </span>
              <FaXTwitter className="vvp-tweet__logo" aria-hidden />
            </div>
            <blockquote className="vvp-tweet__text">
              I tried running OpenClaw myself for a month. Pancake gave me everything I was trying
              to build. On day one.
            </blockquote>
            <figcaption className="vvp-tweet__foot">Founder &amp; CEO, Outset</figcaption>
          </figure>
        </div>
      </section>

      {/* Five differentiators */}
      <section className="home-landing-section" aria-labelledby="vvp-diffs-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="vvp-diffs-heading" className="heading home-landing-section__title text-center">
              Five reasons founders pick the car over the engine
            </H2>
            <p className="home-landing-section__lede text-center">
              OpenClaw gives you the runtime. Pancake gives you the team, the brain, and the
              infrastructure. Already running.
            </p>
          </header>
          <ol className="vvp-diffs">
            {DIFFERENTIATORS.map((d) => (
              <li key={d.n} className="vvp-diff">
                <span className="vvp-diff__num" aria-hidden>{d.n}</span>
                <div className="vvp-diff__content">
                  <H3 className="heading vvp-diff__title">{d.title}</H3>
                  <p className="vvp-diff__body">{d.body}</p>
                  <p className="vvp-diff__angle">{d.angle}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Feature comparison table */}
      <section id="vvp-compare" className="home-landing-section home-landing-section--alt" aria-labelledby="vvp-table-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="vvp-table-heading" className="heading home-landing-section__title text-center">
              Head to head, feature by feature
            </H2>
          </header>
          <div className="home-landing-section__figure">
            <table className="influencers-tiers__table vvp-table">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">OpenClaw</th>
                  <th scope="col">Pancake</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    <td><ComparisonCell cell={row.competitor} /></td>
                    <td><ComparisonCell cell={row.pancake} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials banner — reused verbatim from the landing page */}
      <section
        className="home-landing-section home-landing-section--testimonials"
        aria-labelledby="vvp-testimonials-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--testimonials`}>
          <header className="home-landing-section__header">
            <H2 id="vvp-testimonials-heading" className="heading home-landing-section__title text-center">
              Take it from them
            </H2>
          </header>
        </div>
        <HomeLandingTestimonials />
      </section>

      {/* Final CTA */}
      <section
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="vvp-closing-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <h2 id="vvp-closing-heading" className="heading home-landing-section__closing-title text-center">
            Ready to build a company that runs itself?
          </h2>
          <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
            Join founders who&apos;ve already handed off the work AI should own.
          </p>
          <div className="home-landing-closing-cta">
            <a
              href={APP_URL}
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Try Pancake for free
            </a>
            <p className="home-landing-closing-cta__note">
              No credit card required • $100 in free credits • SOC 2 compliant
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="home-landing-section" aria-labelledby="vvp-faq-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="vvp-faq-heading" className="heading home-landing-section__title text-center">
              Questions founders ask
            </H2>
          </header>
          <ul className="vvp-faq">
            {FAQS.map(({ q, a }) => (
              <li key={q} className="vvp-faq__item">
                <H3 className="heading vvp-faq__q">{q}</H3>
                <p className="vvp-faq__a">{a}</p>
              </li>
            ))}
          </ul>
          <p className="vvp-related">
            Keep reading:{" "}
            <Link href="/claude-tag-vs-pancake" className="underline">
              Pancake vs Claude Tag
            </Link>
            ,{" "}
            <Link href="/viktor-vs-pancake" className="underline">
              Pancake vs Viktor
            </Link>
            , or{" "}
            <Link href="/" className="underline">
              how Pancake works
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
