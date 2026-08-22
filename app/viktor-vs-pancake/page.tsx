/**
 * /viktor-vs-pancake — bottom-of-funnel comparison page (PRD: Viktor-vs-Pancake-PRD).
 *
 * Captures "viktor vs pancake" / "viktor alternative" search intent. Built
 * entirely from existing landing-page primitives — the `home-landing-section`
 * shell, the `.button` CTA anchor, the `HomeLandingTestimonials` banner, and
 * the `.influencers-tiers__table` chrome — so it reads as part of the same
 * site, not a one-off. Honest framing: Viktor is great at what it is; Pancake
 * wins by being a different category. Tone + claims track
 * `content/blog/viktor-vs-pancake.mdx`.
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

const APP_URL = "https://beta.getpancake.ai";

export const metadata: Metadata = {
  title: "Viktor vs Pancake: One AI Coworker vs a Company That Runs Itself",
  description:
    "Viktor gives you a smart AI coworker. Pancake gives you a team of coordinating agents with persistent memory, a company brain, and dedicated infrastructure. See the real difference.",
  alternates: { canonical: "https://getpancake.ai/viktor-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/viktor-vs-pancake",
    title: "Viktor vs Pancake: One AI Coworker vs a Company That Runs Itself",
    description:
      "Viktor gives you a smart AI coworker. Pancake gives you a team of coordinating agents with persistent memory, a company brain, and dedicated infrastructure. See the real difference.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Viktor vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viktor vs Pancake: One AI Coworker vs a Company That Runs Itself",
    description:
      "Viktor gives you a smart AI coworker. Pancake gives you a team of coordinating agents with persistent memory, a company brain, and dedicated infrastructure.",
    images: ["/og-image.png"],
  },
};

/** Five narrative differentiators (PRD §3). Each contrasts Viktor vs Pancake + a copy-angle pull line. */
const DIFFERENTIATORS = [
  {
    n: "01",
    title: "A team of specialists, not one AI coworker",
    body: "Viktor is one model doing everything. You prompt it, it responds. Pancake coordinates a full org-chart of specialists running in parallel: SEO, ads, code, ops, finance. The right agent picks up the right job and works without being asked, like a real team.",
    angle: "One agent doing everything vs the right agent for every job.",
  },
  {
    n: "02",
    title: "Proactive, not reactive",
    body: "Viktor waits for a message. Pancake's agents run cron jobs overnight, chase blockers, file reports, and finish tasks without being prompted. It's the difference between a coworker you delegate to and a workforce that has its own goals.",
    angle: "Viktor helps you ask better. Pancake helps you stop asking.",
  },
  {
    n: "03",
    title: "A company brain, not workspace memory",
    body: "Viktor builds up workspace context. Pancake maintains a live org brain: goals, decisions, metrics, meeting notes. All of it structured, linked, and actively maintained by your agents. When one agent learns something, all agents know it. No context resets between sessions.",
    angle: "Not memory. Institutional knowledge.",
  },
  {
    n: "04",
    title: "Your own infrastructure, not a shared sandbox",
    body: "Viktor runs code in a shared, managed sandbox. Every Pancake customer gets a dedicated pod: 50GB RAM, full package install, persistent agent profiles, and long-running processes. Your agents have been here before. They're not starting fresh each time.",
    angle: "Not a chat window. A machine.",
  },
  {
    n: "05",
    title: "OpenClaw: Claude with the limits removed",
    body: "Pancake runs on OpenClaw: Claude extended with a real browser, a filesystem, and the ability to integrate with anything that has an API key. Viktor's integrations are pre-built OAuth connectors. Pancake's agents can wire up new tools on the fly.",
    angle: "Same model. Different league.",
  },
];

type Cell = { text: string; mark?: "yes" | "no" };
type Row = { feature: string; viktor: Cell; pancake: Cell };

/** Feature comparison (PRD §4). Marks are honest — Viktor keeps its real win (integration breadth). */
const TABLE_ROWS: Row[] = [
  {
    feature: "Agent architecture",
    viktor: { text: "Single AI coworker" },
    pancake: { text: "A coordinated team of specialists", mark: "yes" },
  },
  {
    feature: "Works without prompting",
    viktor: { text: "Prompt-response only", mark: "no" },
    pancake: { text: "Agents run autonomously on cron", mark: "yes" },
  },
  {
    feature: "Agent coordination",
    viktor: { text: "None", mark: "no" },
    pancake: { text: "Agents share one company brain", mark: "yes" },
  },
  {
    feature: "Company memory",
    viktor: { text: "Workspace context" },
    pancake: { text: "Structured org brain across every agent", mark: "yes" },
  },
  {
    feature: "Infrastructure",
    viktor: { text: "Shared managed sandbox" },
    pancake: { text: "Dedicated pod per customer (50GB RAM)", mark: "yes" },
  },
  {
    feature: "Browser & custom integrations",
    viktor: { text: "Limited" },
    pancake: { text: "Any tool with an API key", mark: "yes" },
  },
  {
    feature: "Getting started",
    viktor: { text: "Add to Slack, start chatting" },
    pancake: { text: "Add to Slack, start chatting" },
  },
  {
    feature: "Integrations",
    viktor: { text: "3,200+ pre-built OAuth", mark: "yes" },
    pancake: { text: "Deep native + anything via your pod" },
  },
  {
    feature: "Best for",
    viktor: { text: "Teams that want AI assistance" },
    pancake: { text: "Founders building partially-autonomous companies" },
  },
];

/** FAQ (PRD §FAQ) — answers are plain strings so they can feed both the page and FAQPage JSON-LD. */
const FAQS = [
  {
    q: "How fast can I get started with Pancake?",
    a: "As fast as adding it to Slack. You talk to Pancake like a teammate, and it sets up its agents and connects your tools right in the conversation. No engineering, no dashboards. Most teams have their first agents doing real work the same day.",
  },
  {
    q: "Does Pancake have as many integrations as Viktor?",
    a: "Viktor has 3,200+ pre-built OAuth integrations. Pancake has a deep set of native integrations: browser, GitHub, Notion, Google Workspace, Slack. Plus the ability to install anything into your own pod. The breadth is Viktor's; the depth is ours.",
  },
  {
    q: "Can I use both?",
    a: "Potentially. Viktor is excellent for reactive AI assistance across a whole team. Pancake is for the founder or founding team who wants agents running proactively. They're not mutually exclusive. Yet.",
  },
  {
    q: "What does “partially autonomous company” actually mean?",
    a: "It means AI handles 50–70% of the work by default: GTM motions, engineering tasks, ops workflows. No human prompting each step. Humans act like board members: they set direction, review decisions, and unblock edge cases.",
  },
  {
    q: "How is Pancake different from just running OpenClaw yourself?",
    a: "OpenClaw is the runtime. Pancake is the product built on top of it: pre-configured teams, a company-brain architecture, Slack-native UX, and the playbooks that make it actually work. OpenClaw is the engine; Pancake is the car.",
  },
];

// WebPage JSON-LD — matches the standalone-page convention (see app/_influencers/page.tsx).
const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Viktor vs Pancake",
  url: "https://getpancake.ai/viktor-vs-pancake",
  description:
    "A head-to-head comparison of Viktor and Pancake: one AI coworker you prompt vs a team of coordinating agents that run your company autonomously.",
  isPartOf: { "@type": "WebSite", name: "Pancake", url: "https://getpancake.ai" },
  author: { "@type": "Person", name: "François de Fitte" },
  about: [
    { "@type": "Thing", name: "Viktor" },
    { "@type": "Thing", name: "Pancake" },
  ],
};

// FAQPage JSON-LD — targets "viktor vs pancake" / "viktor alternative" buyer queries.
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

export default function ViktorVsPancakePage() {
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
              Pancake v. Viktor
            </h1>
            <p className="home-landing-section__lede text-center">
              One coworker versus an AI workforce.
            </p>
            <p className="vvp-hero__summary text-center">
              Viktor answers when you ask. Pancake&apos;s specialist agents own your sales,
              marketing, ops and engineering. And they get the work done.
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
                {/* eslint-disable-next-line @next/next/no-img-element -- vector brand mark */}
                <img src="/viktor-logo.svg" alt="" width={48} height={48} />
              </span>
              <H3 className="heading vvp-pcard__title">Viktor</H3>
              <p className="vvp-pcard__body">
                One AI assistant that lives in your Slack. You message it and it helps with
                research, drafts, and tasks across your team. Smart and general-purpose, like
                having one very capable intern you can hand things to.
              </p>
              <p className="vvp-pcard__choose">
                Like a brilliant generalist who waits for you to ask.
              </p>
            </article>
            <article className="vvp-pcard vvp-pcard--pancake">
              <span className="vvp-pcard__icon vvp-pcard__icon--logo" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element -- raster brand mark */}
                <img src="/pancake-mark.png" alt="" width={48} height={48} />
              </span>
              <H3 className="heading vvp-pcard__title">Pancake</H3>
              <p className="vvp-pcard__body">
                A team of specialist agents in your Slack: one for sales, one for marketing, one
                for engineering, one for ops. They own the work and get it done. Just as easy to talk to, but it feels like hiring a whole team that
                already knows your company.
              </p>
              <p className="vvp-pcard__choose">
                Like hiring a team for every part of your company.
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
              One helps you work better. The other runs the work for you.
            </H2>
            <p className="vvp-verdict-aside__lede">
              The honest bottom line, and what founders tell us after they switch.
            </p>
          </div>
          <figure className="vvp-tweet">
            <div className="vvp-tweet__head">
              <span className="vvp-tweet__avatar" aria-hidden>MC</span>
              <span className="vvp-tweet__id">
                <span className="vvp-tweet__name">
                  Maya Chen
                  <LuBadgeCheck className="vvp-tweet__verified" aria-hidden />
                </span>
                <span className="vvp-tweet__handle">@mayachen</span>
              </span>
              <FaXTwitter className="vvp-tweet__logo" aria-hidden />
            </div>
            <blockquote className="vvp-tweet__text">
              Viktor felt like a sharp intern. Pancake feels like the team I couldn&apos;t afford
              to hire.
            </blockquote>
            <figcaption className="vvp-tweet__foot">Founder &amp; CEO, Tidewell</figcaption>
          </figure>
        </div>
      </section>

      {/* Five differentiators */}
      <section className="home-landing-section" aria-labelledby="vvp-diffs-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="vvp-diffs-heading" className="heading home-landing-section__title text-center">
              Five reasons Pancake is a different category
            </H2>
            <p className="home-landing-section__lede text-center">
              Not a better coworker. A workforce with its own goals, memory, and infrastructure.
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
                  <th scope="col">Viktor</th>
                  <th scope="col">Pancake</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    <td><ComparisonCell cell={row.viktor} /></td>
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
            <Link href="/blog/viktor-vs-pancake" className="underline">
              the full Viktor vs Pancake breakdown
            </Link>
            ,{" "}
            <Link href="/blog/viktor-alternatives" className="underline">
              Viktor alternatives
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
