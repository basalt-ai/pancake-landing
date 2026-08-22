/**
 * /pancake-vs-paperclips — bottom-of-funnel comparison page.
 *
 * Captures "pancake vs paperclips" / "paperclips alternative" search intent.
 * Built from the same landing-page primitives and shared `vvp-*` classes as
 * `/viktor-vs-pancake`, `/openclaw-vs-pancake`, and `/claude-tag-vs-pancake` —
 * so it reads as part of the same comparison-page family. Honest framing:
 * Paperclips is a serious open-source framework; Pancake is a managed
 * platform. Tone + claims track `content/blog/pancake-vs-paperclips.mdx`.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LuCheck, LuCreditCard, LuLock, LuShieldCheck, LuSparkles, LuX } from "react-icons/lu";
import { FaXTwitter } from "react-icons/fa6";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";
import { H2, H3 } from "@/components/ui/Headings";

const APP_URL = "https://beta.getpancake.ai";

export const metadata: Metadata = {
  title: "Paperclips vs Pancake: Open-Source Framework vs Managed Autonomous Company",
  description:
    "Paperclips is the 70k-star open-source framework for orchestrating AI agents in an org chart. Pancake is the managed platform that runs the autonomous company as a service. See the real difference.",
  alternates: { canonical: "https://getpancake.ai/pancake-vs-paperclips" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/pancake-vs-paperclips",
    title: "Paperclips vs Pancake: Open-Source Framework vs Managed Autonomous Company",
    description:
      "Paperclips is the 70k-star open-source framework for orchestrating AI agents in an org chart. Pancake is the managed platform that runs the autonomous company as a service.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Paperclips vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paperclips vs Pancake: Open-Source Framework vs Managed Autonomous Company",
    description:
      "Paperclips is the 70k-star open-source framework for orchestrating AI agents in an org chart. Pancake is the managed platform that runs the autonomous company as a service.",
    images: ["/og-image.png"],
  },
};

/** Five narrative differentiators, tracking the blog post's "core tradeoff" section. */
const DIFFERENTIATORS = [
  {
    n: "01",
    title: "A managed platform, not a framework you build",
    body: "Paperclips gives you the primitives — org-chart roles, agent-to-agent delegation, escalation logic — and you write the agents, host the runtime, and maintain the database. Pancake deploys a squad of pre-built agents into your Slack that starts running the same day, with no infrastructure to stand up.",
    angle: "You build it vs. it's already built.",
  },
  {
    n: "02",
    title: "Days to autonomous company, not weeks",
    body: "Standing up a functional Paperclips deployment takes real engineering time — defining roles, wiring tools, testing orchestration. Deploying Pancake takes a conversation: connect your tools, and the squad starts working. For a founder who needs the company running now, that gap is the whole decision.",
    angle: "4-6 weeks of dev work vs. a single afternoon.",
  },
  {
    n: "03",
    title: "No developer required",
    body: "Paperclips assumes someone on your team owns agent infrastructure long-term. Pancake assumes you don't have that person — or don't want to spend them on this. Non-technical founders get the same autonomous-company outcome without writing a line of orchestration code.",
    angle: "Built for engineers vs. built for founders.",
  },
  {
    n: "04",
    title: "A shared company brain, out of the box",
    body: "Paperclips gives you the tools to wire up shared memory across agents — you build that layer yourself. Pancake's squads share one company brain from day one: goals, decisions, and context every agent can see, with no integration work.",
    angle: "You wire it vs. it's wired.",
  },
  {
    n: "05",
    title: "Maintained intelligence, not your on-call rotation",
    body: "When a Paperclips integration breaks or an agent's logic needs updating, your developer fixes it. Pancake's platform is maintained centrally — the runtime improves, the agents improve, and it's not a line item on your team's roadmap.",
    angle: "Your maintenance burden vs. ours.",
  },
];

type Cell = { text: string; mark?: "yes" | "no" };
type Row = { feature: string; paperclips: Cell; pancake: Cell };

/** Feature comparison. Marks are honest — Paperclips keeps its real wins (cost at scale, full customization). */
const TABLE_ROWS: Row[] = [
  {
    feature: "Type",
    paperclips: { text: "Open-source framework (MIT license)" },
    pancake: { text: "Managed SaaS platform", mark: "yes" },
  },
  {
    feature: "Setup",
    paperclips: { text: "Self-hosted, requires dev work", mark: "no" },
    pancake: { text: "No-code, Slack-native", mark: "yes" },
  },
  {
    feature: "Agent code",
    paperclips: { text: "You write it" },
    pancake: { text: "Pre-built squads, customizable", mark: "yes" },
  },
  {
    feature: "Runtime & infrastructure",
    paperclips: { text: "You host and maintain it", mark: "no" },
    pancake: { text: "Pancake hosts it", mark: "yes" },
  },
  {
    feature: "Company brain",
    paperclips: { text: "You build and maintain" },
    pancake: { text: "Shared, auto-updated across agents", mark: "yes" },
  },
  {
    feature: "Customization ceiling",
    paperclips: { text: "Unlimited — it's your code", mark: "yes" },
    pancake: { text: "High within the platform" },
  },
  {
    feature: "Cost model",
    paperclips: { text: "Free license + your infra & dev time" },
    pancake: { text: "Flat subscription, tokens at lab cost", mark: "yes" },
  },
  {
    feature: "Cost at scale",
    paperclips: { text: "Cheaper for high-volume self-hosting", mark: "yes" },
    pancake: { text: "Predictable, no infra to scale" },
  },
  {
    feature: "Community & ecosystem",
    paperclips: { text: "70,000+ GitHub stars, active Discord", mark: "yes" },
    pancake: { text: "Curated squads, maintained centrally" },
  },
  {
    feature: "Best for",
    paperclips: { text: "Engineering-led teams, custom builds" },
    pancake: { text: "Founders and operators who need it running now" },
  },
];

/** FAQ — mirrors the blog post's FAQ section, feeds both the page copy and FAQPage JSON-LD. */
const FAQS = [
  {
    q: "Is Paperclips free?",
    a: "Yes. Paperclips is MIT-licensed open source. You pay for hosting, compute, and any API costs — the main cost is developer time to build and maintain the system.",
  },
  {
    q: "Can I migrate from Paperclips to Pancake later?",
    a: "The conceptual model maps well — roles, hierarchies, and company structure translate directly. Agent code and configurations don't migrate automatically, but the org design decisions you made in Paperclips inform how you configure Pancake.",
  },
  {
    q: "Does Pancake offer a self-hosted option?",
    a: "Not currently. Pancake runs each customer on a dedicated pod (not a shared sandbox), which gives infrastructure isolation without the overhead of self-hosting. A self-hosted option is on the roadmap.",
  },
  {
    q: "What if I need a custom integration Pancake doesn't support?",
    a: "Pancake agents run in your own pod with shell access, so custom integrations can be added without waiting for platform support. If Paperclips has already built an integration you need, the integration itself usually isn't the blocker.",
  },
  {
    q: "Do I need a developer to use Pancake, like I would with Paperclips?",
    a: "No. That's the core difference. Paperclips is infrastructure a developer owns long-term. Pancake is configured through conversation — no engineering required to get a squad of agents running your company.",
  },
];

// WebPage JSON-LD — matches the standalone-page convention used by the other /*-vs-pancake pages.
const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Paperclips vs Pancake",
  url: "https://getpancake.ai/pancake-vs-paperclips",
  description:
    "A head-to-head comparison of Paperclips and Pancake: the open-source framework for building your own autonomous company vs the managed platform that runs it for you.",
  isPartOf: { "@type": "WebSite", name: "Pancake", url: "https://getpancake.ai" },
  author: { "@type": "Person", name: "François de Fitte" },
  about: [
    { "@type": "Thing", name: "Paperclips" },
    { "@type": "Thing", name: "Pancake" },
  ],
};

// FAQPage JSON-LD — targets "paperclips vs pancake" / "paperclips alternative" buyer queries.
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

export default function PancakeVsPaperclipsPage() {
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

      {/* Hero */}
      <section className="home-landing-section" aria-labelledby="vvp-hero-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <h1 id="vvp-hero-heading" className="heading home-landing-section__title text-center">
              Pancake v. Paperclips
            </h1>
            <p className="home-landing-section__lede text-center">
              An open-source framework you build versus a company that already runs.
            </p>
            <p className="vvp-hero__summary text-center">
              Paperclips gives developers the primitives to build an autonomous company from
              scratch. Pancake deploys one, fully managed, the same day.
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
              <H3 className="heading vvp-pcard__title">Paperclips</H3>
              <p className="vvp-pcard__body">
                An open-source framework (70,000+ GitHub stars, MIT license) for orchestrating AI
                agents in an org-chart structure. You define the roles, wire the agents together,
                and host the runtime yourself. Powerful, fully yours, and built for developers.
              </p>
              <p className="vvp-pcard__choose">
                Like the reference implementation you build your company on top of.
              </p>
            </article>
            <article className="vvp-pcard vvp-pcard--pancake">
              <span className="vvp-pcard__icon vvp-pcard__icon--logo" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element -- raster brand mark */}
                <img src="/pancake-mark.png" alt="" width={48} height={48} />
              </span>
              <H3 className="heading vvp-pcard__title">Pancake</H3>
              <p className="vvp-pcard__body">
                A managed autonomous company platform built on OpenClaw. Deploy a squad of
                specialist agents into Slack — sales, marketing, engineering, ops — and they run
                your company&apos;s recurring work without you standing up any infrastructure.
              </p>
              <p className="vvp-pcard__choose">
                Like hiring the team and skipping the infrastructure project.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Verdict */}
      <section className="home-landing-section home-landing-section--alt" aria-labelledby="vvp-verdict-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} vvp-verdict-grid`}>
          <div className="vvp-verdict-aside">
            <Badge variant="brand-alt-1">The verdict</Badge>
            <H2 id="vvp-verdict-heading" className="heading vvp-verdict-aside__title">
              One is infrastructure you own. The other is a company that&apos;s already running.
            </H2>
            <p className="vvp-verdict-aside__lede">
              The honest bottom line: it comes down to whether you have a developer who wants to
              own this long-term, or whether you need the company running next week.
            </p>
          </div>
          <figure className="vvp-tweet">
            <div className="vvp-tweet__head">
              <span className="vvp-tweet__avatar" aria-hidden>SO</span>
              <span className="vvp-tweet__id">
                <span className="vvp-tweet__name">Sam Okafor</span>
                <span className="vvp-tweet__handle">@samokafor</span>
              </span>
              <FaXTwitter className="vvp-tweet__logo" aria-hidden />
            </div>
            <blockquote className="vvp-tweet__text">
              We looked at Paperclips first. Would have been a great project for a developer we
              don&apos;t have. Pancake was running by Friday.
            </blockquote>
            <figcaption className="vvp-tweet__foot">Founder, solo SaaS</figcaption>
          </figure>
        </div>
      </section>

      {/* Five differentiators */}
      <section className="home-landing-section" aria-labelledby="vvp-diffs-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="vvp-diffs-heading" className="heading home-landing-section__title text-center">
              Five reasons founders pick Pancake over building it themselves
            </H2>
            <p className="home-landing-section__lede text-center">
              Paperclips is real infrastructure. Most founders don&apos;t want to be its
              maintainer.
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
                  <th scope="col">Paperclips</th>
                  <th scope="col">Pancake</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    <td><ComparisonCell cell={row.paperclips} /></td>
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
            Skip the infrastructure project. Start with the squad already built.
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
            <Link href="/blog/pancake-vs-paperclips" className="underline">
              the full Pancake vs Paperclips breakdown
            </Link>
            ,{" "}
            <Link href="/blog/pancake-vs-paperclip" className="underline">
              Pancake vs Paperclip AI
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
