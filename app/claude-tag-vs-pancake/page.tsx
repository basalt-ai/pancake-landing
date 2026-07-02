/**
 * /claude-tag-vs-pancake — bottom-of-funnel comparison page.
 *
 * Same template as /viktor-vs-pancake (see app/viktor-vs-pancake/page.tsx):
 * the `home-landing-section` shell, the `.button` CTA anchor, the
 * `HomeLandingTestimonials` banner, and the `.influencers-tiers__table`
 * chrome — plus the shared `vvp-*` classes. Captures "claude tag vs pancake"
 * / "claude tag alternative" search intent. Honest framing: Claude Tag is a
 * genuinely strong, Anthropic-native AI teammate in Slack; Pancake wins by
 * being a different category — a coordinated team of agents that runs your
 * company, built on the same Claude models via OpenClaw.
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
  title: "Claude Tag vs Pancake — One AI Teammate vs a Company That Runs Itself",
  description:
    "Claude Tag gives your Slack one powerful AI teammate from Anthropic. Pancake gives you a team of coordinating agents with persistent memory, a company brain, and dedicated infrastructure — on the same Claude models. See the real difference.",
  alternates: { canonical: "https://getpancake.ai/claude-tag-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/claude-tag-vs-pancake",
    title: "Claude Tag vs Pancake — One AI Teammate vs a Company That Runs Itself",
    description:
      "Claude Tag gives your Slack one powerful AI teammate from Anthropic. Pancake gives you a team of coordinating agents with persistent memory, a company brain, and dedicated infrastructure. See the real difference.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Claude Tag vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Tag vs Pancake — One AI Teammate vs a Company That Runs Itself",
    description:
      "Claude Tag gives your Slack one powerful AI teammate. Pancake gives you a team of coordinating agents with persistent memory, a company brain, and dedicated infrastructure.",
    images: ["/og-image.png"],
  },
};

/** Five narrative differentiators. Each contrasts Claude Tag vs Pancake + a copy-angle pull line. */
const DIFFERENTIATORS = [
  {
    n: "01",
    title: "A team of specialists, not one shared teammate",
    body: "Claude Tag is a single AI identity everyone in the workspace tags into a thread. Pancake coordinates a full org-chart of specialists — SEO, ads, code, ops, finance — all running in parallel. The right agent picks up the right job and works without being asked — like a real team, not one teammate stretched across every channel.",
    angle: "One @-mention for everything vs the right agent for every job.",
  },
  {
    n: "02",
    title: "Owns functions, not just tagged tasks",
    body: "Claude Tag takes initiative on the tasks you tag it into and monitors what it's scoped to. Pancake's agents own whole functions — they run cron jobs overnight, chase blockers, file reports, and pursue their own goals without being prompted. It's the difference between a teammate you delegate to and a workforce that owns the outcome.",
    angle: "Claude Tag works when you tag it. Pancake works when you sleep.",
  },
  {
    n: "03",
    title: "A company brain, not channel-scoped memory",
    body: "Claude Tag builds org memory that admins scope per channel and per tool. Pancake maintains a live, structured org brain — goals, decisions, metrics, meeting notes — linked and actively maintained by your agents. When one agent learns something, every agent knows it. No silos between channels, no context resets between sessions.",
    angle: "It's not scoped memory. It's institutional knowledge.",
  },
  {
    n: "04",
    title: "Your own infrastructure, not a governed sandbox",
    body: "Claude Tag runs inside Anthropic's managed, admin-scoped environment. Every Pancake customer gets a dedicated pod: 50GB RAM, full package install, persistent agent profiles, and long-running processes. Your agents have been here before — they're not starting fresh, and they're not boxed into pre-approved tools.",
    angle: "Not a chat window. A machine.",
  },
  {
    n: "05",
    title: "OpenClaw: the same Claude, with the limits removed",
    body: "Claude Tag and Pancake both run on Claude. The difference is the harness. Pancake runs on OpenClaw — Claude extended with a real browser, a filesystem, and the ability to integrate with anything that has an API key. Claude Tag's tools are admin-approved connectors. Pancake's agents can wire up new tools on the fly.",
    angle: "Same model. Different league.",
  },
];

type Cell = { text: string; mark?: "yes" | "no" };
type Row = { feature: string; competitor: Cell; pancake: Cell };

/** Feature comparison. Marks are honest — Claude Tag keeps its real wins (Anthropic-native model, enterprise governance). */
const TABLE_ROWS: Row[] = [
  {
    feature: "Agent architecture",
    competitor: { text: "One shared AI teammate" },
    pancake: { text: "A coordinated team of specialists", mark: "yes" },
  },
  {
    feature: "Works without prompting",
    competitor: { text: "Takes initiative on tagged tasks" },
    pancake: { text: "Agents own functions, run on cron", mark: "yes" },
  },
  {
    feature: "Agent coordination",
    competitor: { text: "Single identity, no inter-agent handoff", mark: "no" },
    pancake: { text: "Agents share one company brain", mark: "yes" },
  },
  {
    feature: "Company memory",
    competitor: { text: "Org memory, admin-scoped per channel" },
    pancake: { text: "Structured org brain across every agent", mark: "yes" },
  },
  {
    feature: "Infrastructure",
    competitor: { text: "Anthropic-managed, scoped sandbox" },
    pancake: { text: "Dedicated pod per customer (50GB RAM)", mark: "yes" },
  },
  {
    feature: "Browser & custom integrations",
    competitor: { text: "Admin-approved tools" },
    pancake: { text: "Any tool with an API key", mark: "yes" },
  },
  {
    feature: "Enterprise governance",
    competitor: { text: "Tightly admin-scoped access & audit", mark: "yes" },
    pancake: { text: "Isolated per-customer pod" },
  },
  {
    feature: "Underlying model",
    competitor: { text: "Claude — Anthropic-native", mark: "yes" },
    pancake: { text: "Claude via OpenClaw, limits removed" },
  },
  {
    feature: "Getting started",
    competitor: { text: "Beta — Enterprise & Team plans" },
    pancake: { text: "Add to Slack, free to start", mark: "yes" },
  },
  {
    feature: "Best for",
    competitor: { text: "Enterprise teams delegating tasks in Slack" },
    pancake: { text: "Founders building partially-autonomous companies" },
  },
];

/** FAQ — answers are plain strings so they can feed both the page and FAQPage JSON-LD. */
const FAQS = [
  {
    q: "How fast can I get started with Pancake?",
    a: "As fast as adding it to Slack. You talk to Pancake like a teammate, and it sets up its agents and connects your tools right in the conversation — no engineering, no dashboards, no enterprise plan required. Most teams have their first agents doing real work the same day.",
  },
  {
    q: "Isn't Claude Tag from Anthropic — the same company behind Claude?",
    a: "Yes, and Pancake runs on Claude too — via OpenClaw. So the underlying intelligence is the same. The difference is the product around it: Claude Tag is one AI teammate your whole workspace tags into threads; Pancake is a coordinated team of specialist agents that own functions, share a company brain, and run on dedicated infrastructure.",
  },
  {
    q: "Can I use both?",
    a: "Potentially. Claude Tag is excellent for enterprise teams that want one governed AI teammate handling tagged tasks across Slack. Pancake is for the founder or founding team who wants a workforce running proactively. They're not mutually exclusive.",
  },
  {
    q: "What does “partially autonomous company” actually mean?",
    a: "It means AI handles 50–70% of the work by default — GTM motions, engineering tasks, ops workflows — without a human prompting each step. Humans act like board members: they set direction, review decisions, and unblock edge cases.",
  },
  {
    q: "How is Pancake different from just running OpenClaw yourself?",
    a: "OpenClaw is the runtime. Pancake is the product built on top of it — pre-configured teams, a company-brain architecture, Slack-native UX, and the playbooks that make it actually work. OpenClaw is the engine; Pancake is the car.",
  },
];

// WebPage JSON-LD — matches the standalone-page convention (see app/viktor-vs-pancake/page.tsx).
const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Claude Tag vs Pancake",
  url: "https://getpancake.ai/claude-tag-vs-pancake",
  description:
    "A head-to-head comparison of Claude Tag and Pancake: one AI teammate you tag in Slack vs a team of coordinating agents that run your company autonomously — both built on Claude.",
  isPartOf: { "@type": "WebSite", name: "Pancake", url: "https://getpancake.ai" },
  author: { "@type": "Person", name: "François de Fitte" },
  about: [
    { "@type": "Thing", name: "Claude Tag" },
    { "@type": "Thing", name: "Pancake" },
  ],
};

// FAQPage JSON-LD — targets "claude tag vs pancake" / "claude tag alternative" buyer queries.
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

export default function ClaudeTagVsPancakePage() {
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
              Claude Tag v. Pancake
            </h1>
            <p className="home-landing-section__lede text-center">
              One teammate versus an AI workforce.
            </p>
            <p className="vvp-hero__summary text-center">
              Claude Tag answers when you tag it. Pancake&apos;s specialist agents own your sales,
              marketing, ops and engineering — and get the work done.
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
                <img src="/claude-logo.png" alt="" width={48} height={48} />
              </span>
              <H3 className="heading vvp-pcard__title">Claude Tag</H3>
              <p className="vvp-pcard__body">
                Anthropic&apos;s AI teammate that lives in your Slack. Tag it on a task and it works
                through the steps with approved tools and data, builds memory over time, and replies
                when done — one capable, governed teammate your whole workspace can hand things to.
              </p>
              <p className="vvp-pcard__choose">
                Like a brilliant teammate who works on what you tag.
              </p>
            </article>
            <article className="vvp-pcard vvp-pcard--pancake">
              <span className="vvp-pcard__icon vvp-pcard__icon--logo" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element -- raster brand mark */}
                <img src="/pancake-mark.png" alt="" width={48} height={48} />
              </span>
              <H3 className="heading vvp-pcard__title">Pancake</H3>
              <p className="vvp-pcard__body">
                A team of specialist agents in your Slack — one for sales, one for marketing, one
                for engineering, one for ops — that don&apos;t just help, they own the work and get
                it done. Just as easy to talk to, but it feels like hiring a whole team that
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
              The honest bottom line — and what founders tell us after they switch.
            </p>
          </div>
          <figure className="vvp-tweet">
            <div className="vvp-tweet__head">
              <span className="vvp-tweet__avatar" aria-hidden>DR</span>
              <span className="vvp-tweet__id">
                <span className="vvp-tweet__name">
                  Diego Ramos
                  <LuBadgeCheck className="vvp-tweet__verified" aria-hidden />
                </span>
                <span className="vvp-tweet__handle">@diegoramos</span>
              </span>
              <FaXTwitter className="vvp-tweet__logo" aria-hidden />
            </div>
            <blockquote className="vvp-tweet__text">
              Claude Tag was the smartest teammate in our Slack. Pancake feels like the team
              running the company while we sleep.
            </blockquote>
            <figcaption className="vvp-tweet__foot">Founder &amp; CEO, Northbound</figcaption>
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
              Not a better teammate — a workforce with its own goals, memory, and infrastructure.
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
                  <th scope="col">Claude Tag</th>
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
            <Link href="/openclaw-vs-pancake" className="underline">
              Pancake vs OpenClaw
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
