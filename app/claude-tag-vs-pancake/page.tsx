/**
 * /claude-tag-vs-pancake — bottom-of-funnel comparison page.
 *
 * Same template as /viktor-vs-pancake (see app/viktor-vs-pancake/page.tsx):
 * the `home-landing-section` shell, the `.button` CTA anchor, the
 * `HomeLandingTestimonials` banner, and the `.influencers-tiers__table`
 * chrome — plus the shared `vvp-*` classes. Captures "claude tag vs pancake"
 * / "claude tag alternative" search intent. Lead message: Pancake is ~75%
 * cheaper because it mixes Anthropic's Claude with open-source models
 * (routing each task to the model that fits) and connects to 1,000+ tools
 * instead of an admin-approved connector list.
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
  title: "Claude Tag vs Pancake: The Same Claude, 75% Cheaper, 1,000+ Tools",
  description:
    "Claude Tag runs every task on Anthropic's premium models at premium prices. Pancake mixes Claude with open-source models, so the same work costs about 75% less, and its agents connect to 1,000+ tools. See the real difference.",
  alternates: { canonical: "https://getpancake.ai/claude-tag-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/claude-tag-vs-pancake",
    title: "Claude Tag vs Pancake: The Same Claude, 75% Cheaper, 1,000+ Tools",
    description:
      "Claude Tag runs every task on Anthropic's premium models at premium prices. Pancake mixes Claude with open-source models, so the same work costs about 75% less, and its agents connect to 1,000+ tools.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Claude Tag vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Tag vs Pancake: The Same Claude, 75% Cheaper, 1,000+ Tools",
    description:
      "Pancake mixes Claude with open-source models, so the same work costs about 75% less, and its agents connect to 1,000+ tools instead of an approved-connector list.",
    images: ["/og-image.png"],
  },
};

/** Five narrative differentiators. Each contrasts Claude Tag vs Pancake + a copy-angle pull line. */
const DIFFERENTIATORS = [
  {
    n: "01",
    title: "75% cheaper: the right model for every task",
    body: "Claude Tag runs every single task through Anthropic's premium models, at Anthropic's premium prices. Pancake routes each task to the model that fits: Claude handles the reasoning-heavy work, and open-source models handle the volume work like drafts, research sweeps, and data cleanup, at a fraction of the token price. Same quality where it matters, roughly 75% off the bill.",
    angle: "Claude for the thinking. Open source for the typing.",
  },
  {
    n: "02",
    title: "1,000+ tools, not an approved-connector list",
    body: "Claude Tag's integrations are connectors your admin approves one by one. Pancake's agents connect to 1,000+ tools out of the box: CRMs, ad platforms, analytics, code, email, calendars. And when something isn't on the list, they can wire it up themselves with an API key, right in the conversation.",
    angle: "If it has an API, Pancake connects to it.",
  },
  {
    n: "03",
    title: "A team of specialists, not one shared teammate",
    body: "Claude Tag is a single AI identity everyone in the workspace tags into a thread. Pancake coordinates a full org-chart of specialists running in parallel: SEO, ads, code, ops, finance. The right agent picks up the right job and works without being asked. A real team, not one teammate stretched across every channel.",
    angle: "One @-mention for everything vs the right agent for every job.",
  },
  {
    n: "04",
    title: "A company brain, not channel-scoped memory",
    body: "Claude Tag builds org memory that admins scope per channel and per tool. Pancake maintains a live, structured org brain (goals, decisions, metrics, meeting notes), linked and actively maintained by your agents. When one agent learns something, every agent knows it. No silos between channels, no context resets between sessions.",
    angle: "Institutional knowledge, not scoped memory.",
  },
  {
    n: "05",
    title: "Owns functions, not tagged tasks",
    body: "Claude Tag takes initiative on the tasks you tag it into and monitors what it's scoped to. Pancake's agents own whole functions: they run cron jobs overnight, chase blockers, file reports, and pursue their own goals without being prompted. It's the difference between a teammate you delegate to and a workforce that owns the outcome.",
    angle: "Claude Tag works when you tag it. Pancake works when you sleep.",
  },
];

type Cell = { text: string; mark?: "yes" | "no" };
type Row = { feature: string; competitor: Cell; pancake: Cell };

/** Feature comparison. Marks are honest — Claude Tag keeps its real wins (Anthropic-native model, enterprise governance). */
const TABLE_ROWS: Row[] = [
  {
    feature: "Cost",
    competitor: { text: "Premium Anthropic pricing on every task" },
    pancake: { text: "~75% cheaper thanks to the model mix", mark: "yes" },
  },
  {
    feature: "Models",
    competitor: { text: "Claude only" },
    pancake: { text: "Claude + open-source, routed per task", mark: "yes" },
  },
  {
    feature: "Integrations",
    competitor: { text: "Admin-approved connectors" },
    pancake: { text: "1,000+ tools, plus anything with an API key", mark: "yes" },
  },
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
    feature: "Enterprise governance",
    competitor: { text: "Tightly admin-scoped access & audit", mark: "yes" },
    pancake: { text: "Isolated per-customer pod" },
  },
  {
    feature: "Getting started",
    competitor: { text: "Beta on Enterprise & Team plans" },
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
    q: "How is Pancake 75% cheaper than Claude Tag?",
    a: "Claude Tag runs everything on Anthropic's premium models, so you pay premium token prices on every task. Pancake mixes models: Claude handles the reasoning-heavy work, and open-source models handle high-volume work like drafts, research sweeps, and data cleanup at a fraction of the token price. Across a real workload, that mix cuts the bill by about 75%. And tokens are passed through at the labs' public prices, with no markup.",
  },
  {
    q: "Doesn't mixing in open-source models hurt quality?",
    a: "No, because routing is per task, not per customer. The work that needs Claude's reasoning still gets Claude. Open-source models only pick up the tasks where they perform just as well: formatting, summarizing, bulk research, data cleanup. You get the same output quality where it matters and a much smaller bill everywhere else.",
  },
  {
    q: "What counts in the 1,000+ tools?",
    a: "Native integrations across every function your agents work in: CRMs, ad platforms, analytics, email, calendars, code repositories, payment tools, and more. On top of that, Pancake's agents can connect to anything with an API key on the fly, so the real ceiling is any tool with an API, not a fixed list your admin approves.",
  },
  {
    q: "How fast can I get started with Pancake?",
    a: "As fast as adding it to Slack. You talk to Pancake like a teammate, and it sets up its agents and connects your tools right in the conversation. No engineering, no dashboards, no enterprise plan required. Most teams have their first agents doing real work the same day.",
  },
  {
    q: "Isn't Claude Tag from Anthropic, the same company behind Claude?",
    a: "Yes, and Pancake runs on Claude too, for the work that needs it. The difference is that Pancake isn't locked to one lab: it mixes Claude with open-source models to cut costs by about 75%, connects to 1,000+ tools instead of an approved-connector list, and coordinates a team of specialist agents instead of one shared teammate.",
  },
  {
    q: "Can I use both?",
    a: "Potentially. Claude Tag is excellent for enterprise teams that want one governed AI teammate handling tagged tasks across Slack. Pancake is for the founder or founding team who wants a workforce running proactively, at a quarter of the model cost. They're not mutually exclusive.",
  },
];

// WebPage JSON-LD — matches the standalone-page convention (see app/viktor-vs-pancake/page.tsx).
const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Claude Tag vs Pancake",
  url: "https://getpancake.ai/claude-tag-vs-pancake",
  description:
    "A head-to-head comparison of Claude Tag and Pancake: Anthropic-only pricing and admin-approved connectors vs a team of agents that mixes Claude with open-source models to cost about 75% less and connects to 1,000+ tools.",
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
              The same intelligence, at a quarter of the cost.
            </p>
            <p className="vvp-hero__summary text-center">
              Claude Tag runs everything on Anthropic&apos;s models at Anthropic&apos;s prices.
              Pancake mixes Claude with open-source models, so the same work costs about 75% less,
              and its agents connect to 1,000+ tools.
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
                when done. Every task runs on Anthropic&apos;s premium models, at Anthropic&apos;s
                premium prices.
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
                A team of specialist agents in your Slack: one for sales, one for marketing, one for
                engineering, one for ops. They route each task to the right model, Claude for the
                hard thinking, open source for the volume work, and connect to 1,000+ tools. The
                same work, at about a quarter of the cost.
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
              The same work, at a quarter of the price.
            </H2>
            <p className="vvp-verdict-aside__lede">
              The honest bottom line, and what founders tell us after they switch.
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
              Switched from Claude Tag and our AI bill dropped by 75%. Still Claude on the hard
              problems, open-source models on the grunt work, and it plugs into every tool we use.
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
              Five reasons founders pick Pancake
            </H2>
            <p className="home-landing-section__lede text-center">
              A quarter of the cost, 1,000+ tools, and a workforce instead of a teammate.
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
            Ready to cut your AI bill by 75%?
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
