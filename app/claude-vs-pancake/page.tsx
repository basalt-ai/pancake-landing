/**
 * Comparison landing page — Claude (Tag) vs Pancake (`/claude-vs-pancake`).
 *
 * Built entirely from the existing landing-page system: the parameterised
 * `<HomeHero>`, the `home-landing-section*` rhythm, the design-system
 * primitives (`.button`, `.badge`, `.heading`, `Card`), and the real
 * `<HomeLandingTestimonials>` banner. The only bespoke pieces — the quick
 * verdict block and the feature table — live in `claude-vs-pancake.css` and
 * reference only semantic tokens.
 */
import type { Metadata } from "next";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { Footer } from "@/components/shared/Footer";
import { H2 } from "@/components/ui/Headings";

import "./claude-vs-pancake.css";

const CANONICAL = "https://www.getpancake.ai/claude-vs-pancake";

const HERO_TITLE = "Claude gives you one AI. Pancake gives you an entire company.";
const HERO_SUB =
  "Claude Tag is a chatbot in your Slack channel. Pancake is an org-chart of specialized agents, a persistent company brain, and compute — all coordinated by your Superagent.";

const SIGNUP_URL = "https://app.getpancake.ai";

export const metadata: Metadata = {
  title: "Pancake vs Claude (Tag) — AI agents for your whole company",
  description:
    "Claude Tag is a chatbot. Pancake is an org-chart of specialized agents with persistent memory, real compute, and proactive autonomy. See the difference.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    url: CANONICAL,
    title: "Pancake vs Claude (Tag) — AI agents for your whole company",
    description:
      "Claude Tag is a chatbot. Pancake is an org-chart of specialized agents with persistent memory, real compute, and proactive autonomy. See the difference.",
    siteName: "Pancake",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake vs Claude (Tag)" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake vs Claude (Tag) — AI agents for your whole company",
    description:
      "Claude Tag is a chatbot. Pancake is an org-chart of specialized agents with persistent memory, real compute, and proactive autonomy.",
    images: [{ url: "/og-image.png" }],
  },
};

/** Quick-verdict matrix — PRD §2. */
const VERDICT: { label: string; claude: string; pancake: string }[] = [
  { label: "Best for", claude: "Quick Q&A in Slack", pancake: "Running your company autonomously" },
  { label: "Model", claude: "Claude, one instance", pancake: "Claude-powered, extended via OpenClaw" },
  { label: "Memory", claude: "Channel-scoped, resets", pancake: "Persistent company brain across all agents" },
  { label: "Agents", claude: "1", pancake: "Unlimited specialized agents" },
  { label: "Compute", claude: "None", pancake: "50GB pod, full package support" },
];

/** Five differentiators — PRD §3. `alt` flags the alternating background. */
const DIFFERENTIATORS: {
  eyebrow: string;
  badgeVariant: string;
  title: string;
  body: string;
  alt: boolean;
}[] = [
  {
    eyebrow: "Org-chart",
    badgeVariant: "brand",
    title: "Claude Tag is one AI. Pancake is a company.",
    body: "Claude Tag puts one general-purpose AI in your Slack channel. Pancake gives you a Superagent that coordinates a full org-chart of specialized agents — SEO, ads, code, ops, and more. Each agent has a defined role, memory, and autonomy. They work in parallel, report back, and escalate when they need you.",
    alt: true,
  },
  {
    eyebrow: "OpenClaw",
    badgeVariant: "brand-alt-1",
    title: "Pancake runs on OpenClaw — Claude, extended.",
    body: "Pancake is built on OpenClaw, which means your agents get capabilities Claude Tag never will: authenticated browser sessions, API integrations with any tool that has a key, file system access, and the ability to install packages and run code. Same underlying intelligence. Dramatically more capable.",
    alt: false,
  },
  {
    eyebrow: "Compute",
    badgeVariant: "brand-alt-2",
    title: "Not a chat window. A pod.",
    body: "Every Pancake user gets a dedicated pod with 50GB of RAM. Your agents can download packages from the internet, run scripts, process data, and build integrations — all without leaving your workspace. Claude Tag has no compute. It can talk about doing things. Pancake's agents actually do them.",
    alt: true,
  },
  {
    eyebrow: "Company brain",
    badgeVariant: "brand",
    title: "Your company's memory — searchable, structured, always on.",
    body: "Pancake maintains a persistent wiki of every decision, document, meeting, and context your team generates. Every agent reads it. New agents start informed. Nothing gets lost when someone is out of office, and nothing needs to be re-explained. Claude Tag's context is the last few messages in a channel. Pancake's context is your entire company.",
    alt: false,
  },
  {
    eyebrow: "Proactive",
    badgeVariant: "brand-alt-1",
    title: "Pancake works between your pings.",
    body: "Claude Tag waits to be @-tagged. Pancake's agents run cron jobs, chase blockers, surface metrics, and report back — without you having to ask. Your Superagent checks in every 2 hours, dispatches work, and flags anything that needs your attention. Proactive by default.",
    alt: true,
  },
];

/** Feature matrix — PRD §4. */
const FEATURES: { feature: string; claude: boolean; pancake: boolean }[] = [
  { feature: "Multi-agent org-chart", claude: false, pancake: true },
  { feature: "Persistent memory / company brain", claude: false, pancake: true },
  { feature: "Proactive (runs without being asked)", claude: false, pancake: true },
  { feature: "Browser access", claude: false, pancake: true },
  { feature: "API integrations (any tool)", claude: false, pancake: true },
  { feature: "Dedicated compute (pod)", claude: false, pancake: true },
  { feature: "Install packages from internet", claude: false, pancake: true },
  { feature: "Slack-native", claude: true, pancake: true },
  { feature: "Powered by Claude", claude: true, pancake: true },
  { feature: "Free to start", claude: true, pancake: true },
];

/** FAQPage JSON-LD — surfaces the comparison to Google rich-results and AI
    answer engines, matching the site's existing GEO approach. */
const FAQ: { q: string; a: string }[] = [
  {
    q: "What's the difference between Claude (Tag) and Pancake?",
    a: "Claude Tag is a single general-purpose AI you @-mention in a Slack channel — it answers, then waits. Pancake is an org-chart of specialized agents coordinated by a Superagent, with a persistent company brain and a dedicated 50GB compute pod. Claude Tag answers questions; Pancake runs the work.",
  },
  {
    q: "Does Pancake use Claude?",
    a: "Yes. Pancake is powered by Claude and built on the OpenClaw runtime, which extends that same intelligence with authenticated browser sessions, API integrations with any tool that has a key, file-system access, and the ability to install packages and run code.",
  },
  {
    q: "Is Pancake a Claude Tag alternative?",
    a: "Pancake is in a different category. Where Claude Tag is one reactive chatbot scoped to a channel, Pancake deploys an unlimited org of specialized agents that work proactively, share a company brain, and have real compute. If you've outgrown asking a bot questions, Pancake is the step up.",
  },
  {
    q: "Can Pancake run tasks without being asked?",
    a: "Yes. Pancake's agents run cron jobs, chase blockers, surface metrics, and report back on their own. Your Superagent checks in roughly every 2 hours, dispatches work, and flags anything that needs your attention — proactive by default, where Claude Tag waits to be @-tagged.",
  },
  {
    q: "How much does Pancake cost?",
    a: "Pancake is free to start — no credit card required, with free credits included so you can onboard your Superagent and see it work before paying anything.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

function IconYes() {
  return (
    <svg
      className="cvp-table__icon cvp-table__icon--yes"
      viewBox="0 0 20 20"
      fill="none"
      role="img"
      aria-label="Yes"
    >
      <path
        d="M4.5 10.5L8.5 14.5L15.5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconNo() {
  return (
    <svg
      className="cvp-table__icon cvp-table__icon--no"
      viewBox="0 0 20 20"
      fill="none"
      role="img"
      aria-label="No"
    >
      <path
        d="M6 6L14 14M14 6L6 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Closing-CTA decorative pancakes — same two-tone silhouette + mobile-only
    bleed treatment as the home closing section (`HomeLandingBody`). */
const DECOR_PALETTE = {
  purple: { side: "#D7C4ED", top: "#B89BE0" },
  pink: { side: "#F4B0BF", top: "#F1809E" },
  orange: { side: "#FFB48A", top: "#FF7F47" },
} as const;
function DecorPancake({ variant, className }: { variant: keyof typeof DECOR_PALETTE; className: string }) {
  const p = DECOR_PALETTE[variant];
  return (
    <svg className={className} viewBox="0 0 49 48" aria-hidden focusable="false">
      <path
        d="M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z"
        fill={p.side}
      />
      <path
        d="M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z"
        fill={p.top}
      />
    </svg>
  );
}

export default function ClaudeVsPancakePage() {
  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <HomeNav />

      <HomeHero title={HERO_TITLE} subtitle={HERO_SUB} ctaHref={SIGNUP_URL} />

      <div className="home-landing">
        {/* §2 — Quick verdict */}
        <section
          className="home-landing-section"
          aria-labelledby="cvp-verdict-heading"
        >
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
            <header className="home-landing-section__header">
              <H2 id="cvp-verdict-heading" className="heading home-landing-section__title text-center">
                The quick verdict
              </H2>
              <p className="home-landing-section__lede text-center">
                Two products. Two very different jobs.
              </p>
            </header>
            <dl className="cvp-verdict">
              <div className="cvp-verdict__head" aria-hidden="true">
                <span className="cvp-verdict__head-cell" />
                <span className="cvp-verdict__head-cell">Claude (Tag)</span>
                <span className="cvp-verdict__head-cell cvp-verdict__head-cell--pancake">Pancake</span>
              </div>
              {VERDICT.map((row) => (
                <div className="cvp-verdict__row" key={row.label}>
                  <dt className="cvp-verdict__label">{row.label}</dt>
                  <dd className="cvp-verdict__cell cvp-verdict__cell--claude">
                    <span className="cvp-verdict__src">Claude (Tag) — </span>
                    {row.claude}
                  </dd>
                  <dd className="cvp-verdict__cell cvp-verdict__cell--pancake">
                    <span className="cvp-verdict__src">Pancake — </span>
                    {row.pancake}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* §3 — Five differentiators */}
        {DIFFERENTIATORS.map((d, i) => (
          <section
            key={d.eyebrow}
            className={`home-landing-section${d.alt ? " home-landing-section--alt" : ""}`}
            aria-labelledby={`cvp-diff-${i}`}
          >
            <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
              <header className="home-landing-section__header">
                <span className="badge" data-variant={d.badgeVariant}>
                  {d.eyebrow}
                </span>
                <H2 id={`cvp-diff-${i}`} className="heading home-landing-section__title text-center">
                  {d.title}
                </H2>
                <p className="home-landing-section__lede text-center">{d.body}</p>
              </header>
            </div>
          </section>
        ))}

        {/* §4 — Feature comparison table */}
        <section className="home-landing-section" aria-labelledby="cvp-table-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
            <header className="home-landing-section__header">
              <H2 id="cvp-table-heading" className="heading home-landing-section__title text-center">
                Feature by feature
              </H2>
              <p className="home-landing-section__lede text-center">
                Everything Claude Tag does — plus everything it can&rsquo;t.
              </p>
            </header>
            <div className="cvp-table-wrap">
              <table className="cvp-table">
                <caption className="sr-only">
                  Feature comparison between Claude (Tag) and Pancake
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="cvp-table__feature-head">
                      Feature
                    </th>
                    <th scope="col">Claude (Tag)</th>
                    <th scope="col" className="cvp-table__pancake">
                      Pancake
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((row) => (
                    <tr key={row.feature}>
                      <th scope="row">{row.feature}</th>
                      <td>{row.claude ? <IconYes /> : <IconNo />}</td>
                      <td className="cvp-table__pancake">
                        {row.pancake ? <IconYes /> : <IconNo />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* §5 — Testimonials banner (real component, real quotes) */}
        <section
          className="home-landing-section home-landing-section--alt home-landing-section--testimonials"
          aria-labelledby="cvp-testimonials-heading"
        >
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--testimonials`}>
            <header className="home-landing-section__header">
              <H2 id="cvp-testimonials-heading" className="heading home-landing-section__title text-center">
                Take it from them
              </H2>
            </header>
          </div>
          <HomeLandingTestimonials />
        </section>

        {/* FAQ — visible companion to the FAQPage JSON-LD (same `FAQ` data drives
            both, so the structured data never claims content users can't see). */}
        <section className="home-landing-section" aria-labelledby="cvp-faq-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
            <header className="home-landing-section__header">
              <H2 id="cvp-faq-heading" className="heading home-landing-section__title text-center">
                Frequently asked questions
              </H2>
            </header>
            <dl className="cvp-faq">
              {FAQ.map((item) => (
                <div className="cvp-faq__item" key={item.q}>
                  <dt className="cvp-faq__q">{item.q}</dt>
                  <dd className="cvp-faq__a">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* §6 — Final CTA (home closing pattern) */}
        <section
          className="home-landing-section home-landing-section--alt home-landing-section--closing"
          aria-labelledby="cvp-closing-heading"
        >
          <DecorPancake variant="purple" className="home-landing-closing-decor home-landing-closing-decor--purple" />
          <DecorPancake variant="pink" className="home-landing-closing-decor home-landing-closing-decor--pink" />
          <DecorPancake variant="orange" className="home-landing-closing-decor home-landing-closing-decor--orange" />
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
            <h2 id="cvp-closing-heading" className="heading home-landing-section__closing-title text-center">
              Ready to give your company an AI team?
            </h2>
            <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
              Set up in minutes. No API keys. No prompt engineering. Just your Superagent, ready to work.
            </p>
            <div className="home-landing-closing-cta">
              <a
                href={SIGNUP_URL}
                className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
                data-size="lg"
              >
                Try for free
              </a>
              <p className="home-landing-closing-cta__note">
                No credit card required • $100 in free credits • SOC 2 compliant
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
