/**
 * /gtm — "Expert agents that run your GTM" landing.
 *
 * Editorial one-pager fusing the MindMarket reference (cream canvas,
 * oversized display type, pill nav, color pops — see gtm.css) with the
 * Pancake v1 kit (Aeonik/Fono, `.badge`, pancake shapes, partner logos).
 * Section order: pill nav → display hero → partner strip → agent
 * library (expandable gallery) → how it works → sunshine closing band
 * → slim footer.
 */
import type { Metadata } from "next";
import Link from "next/link";

import {
  ExpandableAgentGallery,
  type GalleryAgent,
} from "@/components/ui/expandable-agent-gallery";

import "./gtm.css";

const PAGE_TITLE = "Expert agents that run your GTM · Pancake";
const PAGE_DESCRIPTION =
  "Pancake deploys a squad of specialized agents that find your leads, run your AI SEO, and work Reddit. Runs on Claude Code and Codex.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "https://www.getpancake.ai/gtm" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    url: "https://www.getpancake.ai/gtm",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const APP_URL = "https://app.getpancake.ai";

const AGENTS: GalleryAgent[] = [
  {
    id: "leadfinder",
    name: "LeadFinder",
    tagline:
      "Finds, qualifies, and enriches the accounts you should be talking to — every morning.",
    description:
      "LeadFinder scans the live web for companies that match your ICP, qualifies them against your playbook, and hands you enriched contacts ready for outreach.",
    bullets: [
      "Builds ICP-matched lead lists from live web signals",
      "Enriches every contact with verified emails and context",
      "Hands off warm, prioritized accounts — not raw CSVs",
    ],
    infra: "Behind it: sourcing by Exa, enrichment by FullEnrich — orchestrated by Pancake.",
    accent: "sky",
    art: "/pancake-svgs/angled-2.svg",
    expert: {
      name: "Sam Blond",
      title: "CEO at Monaco",
      quote: "The agents I would have used when starting my first company.",
      initials: "SB",
    },
  },
  {
    id: "aiseo",
    name: "AISEO",
    tagline:
      "Runs your AI SEO so ChatGPT, Claude, and Google cite you before your competitors.",
    description:
      "AISEO researches the questions your buyers ask AI engines, writes the content that answers them, and keeps your llms.txt and comparison pages fresh — on a schedule, not when someone remembers.",
    bullets: [
      "Tracks the prompts your buyers actually ask AI engines",
      "Publishes ranking content straight to your CMS",
      "Maintains llms.txt and structured data automatically",
    ],
    infra: "Behind it: research by Exa, publishing through your CMS — orchestrated by Pancake.",
    accent: "grass",
    art: "/pancake-svgs/top-2.svg",
    expert: {
      name: "Maya Chen",
      title: "Head of Growth at Vantage",
      quote: "It ships the content our team never had time to write.",
      initials: "MC",
    },
  },
  {
    id: "reddit",
    name: "Reddit",
    tagline:
      "Works Reddit the way a good community member would — and turns threads into pipeline.",
    description:
      "The Reddit agent finds the threads where your buyers ask for help, drafts replies in your voice, and builds karma long before it ever mentions your product.",
    bullets: [
      "Monitors the subreddits where your buyers ask for help",
      "Drafts human replies you approve before they post",
      "Builds karma and authority before any mention of you",
    ],
    infra:
      "Behind it: browsing by Anchor Browser, every reply approved by you — orchestrated by Pancake.",
    accent: "coral",
    art: "/pancake-svgs/flat-2.svg",
    expert: {
      name: "Leo Devaux",
      title: "Founder at Craftbase",
      quote: "It reads Reddit better than my own growth team did.",
      initials: "LD",
    },
  },
  {
    id: "next",
    name: "Your next hire",
    tagline: "Outbound, X, newsletters — the library keeps growing.",
    description:
      "The library keeps growing. Outbound sequencing, X engagement, and newsletter agents are next — tell us which one your GTM needs first.",
    bullets: [
      "Outbound — sequences via AgentMail",
      "X — engages where your market talks",
      "Newsletter — drafts, sends, learns",
    ],
    infra: "Every new agent ships with a named playbook and the infrastructure behind it.",
    accent: "neutral",
    art: "/pancake-svgs/top-bordered-3.svg",
    comingSoon: true,
  },
];

const PARTNER_LOGOS = [
  { name: "Exa", src: "/logos/exa.svg" },
  { name: "FullEnrich", src: "/logos/fullenrich.svg" },
  { name: "Anchor Browser", src: "/logos/anchorbrowser.svg" },
  { name: "AgentMail", src: "/logos/agentmail.svg" },
  { name: "LiteLLM", src: "/logos/litellm.svg" },
];

const STEPS = [
  {
    index: "01",
    dot: "gtm-dot--sky",
    title: "Pick your squad",
    body: "Choose agents from the library. Each one arrives trained on a playbook proven by someone who has done the job before.",
  },
  {
    index: "02",
    dot: "",
    title: "They run on your runtime",
    body: "Under the hood, Pancake operates Claude Code or Codex. You see every step it takes — nothing is a black box.",
  },
  {
    index: "03",
    dot: "gtm-dot--coral",
    title: "You approve, they ship",
    body: "Review the work in Slack, approve once, and the squad keeps compounding while you build the product.",
  },
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: "https://www.getpancake.ai/gtm",
  about: {
    "@type": "SoftwareApplication",
    name: "Pancake",
    applicationCategory: "BusinessApplication",
    url: "https://www.getpancake.ai",
  },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Pancake GTM agent library",
  itemListElement: AGENTS.filter((agent) => !agent.comingSoon).map((agent, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: agent.name,
    description: agent.tagline,
  })),
};

export default function GtmLandingPage() {
  return (
    <main className="gtm-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* Floating pill nav */}
      <div className="gtm-nav-wrap">
        <div className="gtm-container">
          <header className="gtm-nav">
            <Link href="/" className="gtm-nav-logo" aria-label="Pancake home">
              {/* eslint-disable-next-line @next/next/no-img-element -- vector logo */}
              <img src="/pancake-logo.svg" alt="" width={156} height={44} decoding="async" />
            </Link>
            <nav className="gtm-nav-links" aria-label="Primary">
              <Link href="/blog" className="gtm-nav-link">
                Blog
              </Link>
              <Link href="/pricing" className="gtm-nav-link">
                Pricing
              </Link>
            </nav>
            <a href={APP_URL} className="gtm-btn gtm-btn--sm">
              <span className="gtm-dot" aria-hidden />
              Start free
            </a>
          </header>
        </div>
      </div>

      {/* Hero */}
      <section className="gtm-hero">
        <div className="gtm-hero-art" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative vectors */}
          <img src="/pancake-svgs/angled-1.svg" alt="" className="gtm-art-1" />
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative vectors */}
          <img src="/pancake-svgs/top-1.svg" alt="" className="gtm-art-2" />
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative vectors */}
          <img src="/pancake-svgs/flat-3.svg" alt="" className="gtm-art-3" />
        </div>
        <div className="gtm-container">
          <div className="gtm-hero-copy">
            <span className="badge">
              <span className="gtm-dot" aria-hidden />
              Runs on Claude Code &amp; Codex
            </span>
            <h1 className="gtm-display">Expert agents that run your GTM</h1>
            <h2 className="gtm-hero-sub">
              Pancake deploys a squad of specialized agents that find your leads, run your AI
              SEO, and work Reddit.
            </h2>
            <div className="gtm-hero-cta-row">
              <a href={APP_URL} className="gtm-btn">
                <span className="gtm-dot" aria-hidden />
                Get started for free
              </a>
              <a href="#library" className="gtm-btn gtm-btn--ghost">
                <span className="gtm-dot gtm-dot--sky" aria-hidden />
                Meet the agents
              </a>
            </div>
            <p className="gtm-hero-note">No credit card required &bull; SOC 2 compliant</p>
          </div>
        </div>
      </section>

      {/* Partner infrastructure strip */}
      <div className="gtm-container">
        <div className="gtm-logos" aria-label="Agent infrastructure partners">
          <p className="gtm-logos-label">The squad runs on</p>
          {PARTNER_LOGOS.map((logo) => (
            <span
              key={logo.name}
              className="gtm-logo-mask"
              role="img"
              aria-label={logo.name}
              style={{
                maskImage: `url(${logo.src})`,
                WebkitMaskImage: `url(${logo.src})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Agent library */}
      <section className="gtm-section" id="library">
        <div className="gtm-container">
          <div className="gtm-section-head">
            <span className="badge">
              <span className="gtm-dot gtm-dot--coral" aria-hidden />
              Agent library
            </span>
            <h2 className="gtm-heading">Every agent has a name behind it</h2>
            <p className="gtm-lede">
              Surface any agent to see exactly what it runs on — the infrastructure underneath
              and the operator whose playbook shaped it.
            </p>
          </div>
          <ExpandableAgentGallery agents={AGENTS} />
        </div>
      </section>

      {/* How it works */}
      <section className="gtm-section">
        <div className="gtm-container">
          <div className="gtm-section-head">
            <span className="badge">
              <span className="gtm-dot gtm-dot--sky" aria-hidden />
              How it works
            </span>
            <h2 className="gtm-heading">Hire the squad in an afternoon</h2>
          </div>
          <div className="gtm-steps">
            {STEPS.map((step) => (
              <article className="gtm-step" key={step.index}>
                <span className="gtm-step-index">
                  <span className={`gtm-dot ${step.dot}`.trim()} aria-hidden />
                  {step.index}
                </span>
                <h3 className="gtm-step-title">{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing sunshine band */}
      <section className="gtm-band">
        <div className="gtm-container">
          <div className="gtm-band-inner">
            <h2 className="gtm-band-title">Your GTM squad, running by tonight.</h2>
            <a href={APP_URL} className="gtm-btn">
              <span className="gtm-dot" aria-hidden />
              Get started for free
            </a>
          </div>
        </div>
      </section>

      {/* Slim footer */}
      <footer className="gtm-footer">
        <div className="gtm-container">
          <div className="gtm-footer-inner">
            <Link href="/" aria-label="Pancake home">
              {/* eslint-disable-next-line @next/next/no-img-element -- vector logo */}
              <img src="/pancake-logo.svg" alt="" width={156} height={44} decoding="async" />
            </Link>
            <nav className="gtm-footer-links" aria-label="Footer">
              <Link href="/blog">Blog</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
            <p className="gtm-footer-legal">&copy; 2026 Pancake &middot; San Francisco</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
