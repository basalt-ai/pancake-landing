import type { Metadata, Viewport } from "next";

import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpHero } from "@/components/sections/landing-v3/LpHero";
import { LpModals } from "@/components/sections/landing-v3/LpModals";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/landing-v3/agents.css";

/**
 * /agents — the homepage hero in negative (founder 2026-09-04): the same
 * nav, the same hero, the same copy, cream and plum swapped, and one empty
 * screen underneath. Groundwork for the "For agents" perspective — the
 * audience toggle in the hero switches between this page and `/`.
 * Nothing below the hero yet, so the page stays out of the index and the
 * sitemap until it has content (one line each to flip).
 */

// The iOS Dynamic-Island band follows the body background (foundation.css
// note on the homepage); the theme-color matches the inverted ground.
export const viewport: Viewport = { themeColor: "#2c002a" };

const DESCRIPTION =
  "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.";

export const metadata: Metadata = {
  // Same tab title rule as the homepage — exactly "Pancake".
  title: "Pancake",
  description: DESCRIPTION,
  alternates: { canonical: "https://getpancake.ai/agents" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/agents",
    title: "Pancake — You run your company. We bring you customers.",
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "You run your company. We bring you customers." }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake — You run your company. We bring you customers.",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function AgentsPage() {
  return (
    <main id="main-content" className="lp lp--inverted">
      {/* the hero art's --lp-fit scale var (see LpFitVars.tsx) */}
      <LpFitVars />
      <LpNav inverted />
      <LpHero audience="agents" />
      {/* One empty screen: the slot for the agent perspective's first
          section (founder: "une 100vh en dessous vide pour le moment"). */}
      <div className="lp-agents-blank" aria-hidden="true" />
      <LpModals />
    </main>
  );
}
