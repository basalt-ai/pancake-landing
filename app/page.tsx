import type { Metadata, Viewport } from "next";

import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpBanner } from "@/components/sections/landing-v3/LpBanner";
import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFeatures } from "@/components/sections/landing-v3/LpFeatures";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpHero } from "@/components/sections/landing-v3/LpHero";
import { LpModals } from "@/components/sections/landing-v3/LpModals";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpPricing } from "@/components/sections/landing-v3/LpPricing";
import { LpSteps } from "@/components/sections/landing-v3/LpSteps";
import { LpTestimonials } from "@/components/sections/landing-v3/LpTestimonials";
import { pricingV2 } from "@/lib/copy";
import "@/app/_styles/landing-v3.css";

/**
 * Landing v3 — 1:1 replication of the Figma "Pancake-Design" desktop artboard
 * (node 4197-9774, frame "hero" 4257:4893). Static phase: layout, type, color
 * and art match the artboard exactly; the Figma motion pass lands separately.
 */

// Page-level metadata mirrors the hero (unchanged copy vs v2);
// the root layout still carries the org-wide defaults.

/* NOTE: iOS Safari ignores themeColor for the Dynamic-Island band — the band
   is painted with the BODY's background (body:has(main.lp) in foundation.css,
   device-tested 2026-09-01). viewport-fit=cover is a portrait no-op there too
   (env(safe-area-inset-top) stays 0 in the browser) — don't re-add it. */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  /* SERP revert (founder 2026-09-01: Google titled the site "Pancake's AI"
     and showed the artboard lede as the snippet — "REMETS LE H2 D'AVANT").
     The bare "Pancake" title (#256 tab request) was too weak: Google rewrote
     it from the description's opening words. Title + descriptions below are
     the pre-v3 strings, identical to the root layout's. Known tradeoff: the
     browser tab shows the full title again — flagged to the founder. */
  title: "Pancake: The AI employee that does the work for you",
  description:
    "Pancake connects to your tools and does the work for you. Autonomously. One AI coworker in Slack, a whole team of agents behind it. $49/month, no tiers.",
  alternates: { canonical: "https://getpancake.ai" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai",
    title: "Pancake: The AI employee that does the work for you",
    description:
      "Pancake connects to your tools and does the work for you. Autonomously. One AI coworker in Slack, a whole team of agents behind it. $49/month, no tiers.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake, the AI coworker" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake: The AI employee that does the work for you",
    description:
      "Pancake connects to your tools and does the work for you. Autonomously. One AI coworker in Slack, a whole team of agents behind it. $49/month, no tiers.",
    images: ["/og-image.png"],
  },
};

// SoftwareApplication JSON-LD — homepage only (Organization is in root layout).
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pancake",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://getpancake.ai",
  description:
    "Pancake connects to your tools and does the work for you. Autonomously. One AI coworker in Slack, a whole team of agents behind it. $49/month, no tiers.",
  offers: {
    "@type": "Offer",
    url: "https://getpancake.ai/pricing",
    price: String(pricingV2.monthlyDollars),
    priceCurrency: pricingV2.currency,
    availability: "https://schema.org/InStock",
  },
  publisher: {
    "@type": "Organization",
    name: "Pancake",
    url: "https://getpancake.ai",
  },
};

export default function Home() {
  return (
    <main id="main-content" className="lp">
      {/* SoftwareApplication JSON-LD — homepage only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      {/* Serves every section's art canvas — the --lp-fit scale var
          (iOS WebKit cqw-in-trig workaround, see LpFitVars.tsx) */}
      <LpFitVars />
      {/* Frees off-screen sections' animation GPU surfaces — the iPhone
          WebContent OOM guard (see LpAnimFreeze.tsx) */}
      <LpAnimFreeze />
      <LpNav />
      <LpHero />
      {/* Logo strip stays unmounted: the V1 set reads as powered-by, not
          customers (founder 2026-08-31). LpMarquee + marquee.css + the V1
          wordmark wiring stay for the day real customer logos land. */}
      <LpSteps />
      <LpBanner />
      <LpFeatures />
      <LpCta />
      <LpTestimonials />
      <LpPricing />
      <LpFooter />
      <LpModals />
    </main>
  );
}
