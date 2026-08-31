import type { Metadata, Viewport } from "next";

import { LpBanner } from "@/components/sections/landing-v3/LpBanner";
import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFeatures } from "@/components/sections/landing-v3/LpFeatures";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpHero } from "@/components/sections/landing-v3/LpHero";
import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";
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

/* Status-bar zone matches the lp cream (Dynamic Island fix, 2026-08-31) */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title: "Pancake — You run your company. We bring you customers.",
  description:
    "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
  alternates: { canonical: "https://getpancake.ai" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai",
    title: "You run your company. We bring you customers.",
    description:
      "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "You run your company. We bring you customers.",
    description:
      "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
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
    "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction. A living GTM Brain, outreach in your voice, and content recommended on Google and ChatGPT.",
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
      <LpNav />
      <LpHero />
      {/* Logo strip: V1 partner wordmarks as interim content, founder
          2026-08-31 ("reprends les logos de la V1 en attendant qu'on mette
          les nouveaux") — swap LOGOS in LpMarquee when the new set lands. */}
      <LpMarquee />
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
