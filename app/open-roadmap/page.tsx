/**
 * /open-roadmap — Pancake's public community roadmap.
 *
 * A lightweight upvote board (PRD-Fider-Rebuild): tabs-as-tags at the top,
 * idea cards with optimistic upvotes, status badges, and search. The marketing
 * site has no backend, so ideas are seeded statically and votes live in the
 * browser; submission routes to the community Discord. Structure mirrors the
 * other landing pages (hero → board → closing CTA) and reuses the design system.
 */
import type { Metadata } from "next";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { RoadmapBoard } from "@/components/sections/roadmap/RoadmapBoard";
import { ROADMAP_IDEAS, STATUS_META } from "@/components/sections/roadmap/roadmap-data";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";

const DISCORD_INVITE_URL = "https://discord.gg/brJ99Up6ym";

export const metadata: Metadata = {
  title: "Open roadmap — Vote on what Pancake builds next · Pancake",
  description:
    "Pancake's public roadmap. Upvote the squads, features, and integrations you want, see what's planned, in progress, and shipped, and suggest your own.",
  alternates: { canonical: "https://www.getpancake.ai/open-roadmap" },
  openGraph: {
    type: "website",
    url: "https://www.getpancake.ai/open-roadmap",
    title: "Pancake Open Roadmap — Vote on what we build next",
    description:
      "Upvote the squads, features, and integrations you want. See what's planned, in progress, and shipped.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake Open Roadmap" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake Open Roadmap — Vote on what we build next",
    description:
      "Upvote the squads, features, and integrations you want. See what's planned, in progress, and shipped.",
    images: ["/og-image.png"],
  },
};

/* ItemList JSON-LD — exposes the roadmap ideas + their status to search and AI
   crawlers so the public roadmap is quotable without scraping the rendered DOM.
   Built from the same seed data the board renders, so it can't drift. */
const roadmapJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Pancake Open Roadmap",
  url: "https://www.getpancake.ai/open-roadmap",
  itemListOrder: "https://schema.org/ItemListOrderDescending",
  numberOfItems: ROADMAP_IDEAS.length,
  itemListElement: ROADMAP_IDEAS.map((idea, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: idea.title,
    description: `${idea.description} (Status: ${STATUS_META[idea.status].label})`,
  })),
};

export default function OpenRoadmapPage() {
  return (
    <main id="main-content" className="roadmap-page min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roadmapJsonLd) }}
      />

      <HomeNav />

      {/* Hero */}
      <section className="home-landing-section" aria-labelledby="roadmap-hero-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <Badge variant="brand-alt-1">Open roadmap</Badge>
            <h1 id="roadmap-hero-heading" className="heading home-landing-section__title text-center">
              You decide what Pancake builds next.
            </h1>
            <p className="home-landing-section__lede text-center">
              Upvote the squads, features, and integrations you want most. Watch
              ideas move from open to planned to shipped — out in the open.
            </p>
          </header>
        </div>
      </section>

      {/* Board */}
      <section
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="roadmap-board-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <h2 id="roadmap-board-heading" className="sr-only">
            Roadmap ideas
          </h2>
          <RoadmapBoard />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="home-landing-section" aria-labelledby="roadmap-closing-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <h2 id="roadmap-closing-heading" className="heading home-landing-section__closing-title text-center">
            Got an idea?
          </h2>
          <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
            The best ideas come from the people using Pancake every day. Drop
            yours in the community — we read every one.
          </p>
          <div className="home-landing-closing-cta">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Share an idea on Discord
            </a>
            <p className="home-landing-closing-cta__note">
              No account needed to browse or vote.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
