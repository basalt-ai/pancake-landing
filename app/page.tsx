import type { Metadata } from "next";

import { FinalCta } from "@/components/sections/landing/FinalCta";
import { HowItWorks } from "@/components/sections/landing/HowItWorks";
import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingHero } from "@/components/sections/landing/LandingHero";
import { LandingModals } from "@/components/sections/landing/LandingModals";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import { LandingPricing } from "@/components/sections/landing/LandingPricing";
import { LandingTestimonials } from "@/components/sections/landing/LandingTestimonials";
import { LeadFindingDive } from "@/components/sections/landing/LeadFindingDive";
import { Manifesto } from "@/components/sections/landing/Manifesto";
import { pricingV2 } from "@/lib/copy";
import "@/app/_styles/landing-v2.css";

/**
 * The GTM landing (v2) — React port of public/landing-v2.html plus the full
 * page below the hero: how it works (studio motion loops), feature deep-dive,
 * social proof (tweets + UGC reuse), pricing, closing snake CTA, footer.
 * Narrative backbone: greptile.com x synthetic.ai (see pancake-studio
 * briefs/cmo-app/lp-skeleton-review.md).
 */

// Page-level metadata mirrors the static landing head (GTM positioning);
// the root layout still carries the org-wide defaults.
export const metadata: Metadata = {
  title: "Pancake — You run your company. We run your GTM.",
  description:
    "Pancake is a team of AI agents that understand your company and handle high quality GTM tasks autonomously.",
  alternates: { canonical: "https://getpancake.ai" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai",
    title: "You run your company. We run your GTM.",
    description:
      "Pancake is a team of AI agents that understand your company and handle high quality GTM tasks autonomously.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "You run your company. We run your GTM.",
    description:
      "Pancake is a team of AI agents that understand your company and handle high quality GTM tasks autonomously.",
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
    "Pancake is a team of AI agents that understand your company and handle high quality GTM tasks autonomously: a living GTM Brain, outbound on hot leads, and content recommended on Google and AI search.",
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
    <main id="main-content" className="lv2">
      {/* SoftwareApplication JSON-LD — homepage only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <div className="lv2-viewport">
        <LandingNav />
        <LandingHero />
      </div>
      <HowItWorks />
      <Manifesto />
      <LeadFindingDive />
      <LandingTestimonials />
      <LandingPricing />
      <FinalCta />
      <LandingFooter />
      <LandingModals />
    </main>
  );
}
