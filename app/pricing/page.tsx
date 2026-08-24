/**
 * Pricing V2 — one flat plan, Okara-simplified (founder call 2026-08-06:
 * $99/month flat, everything included; the V1 token-pack model is retired).
 * Rides the landing skin (.lv2) so the two pages read as one product:
 * nav + header + single plan card with the feature list + booking modal.
 */
import type { Metadata } from "next";

import { FxPill, FxPillLink } from "@/components/sections/landing/FxPill";
import { PriceGroups } from "@/components/sections/landing/PriceGroups";
import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingModals } from "@/components/sections/landing/LandingModals";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import { pricingV2 } from "@/lib/copy";
import "@/app/_styles/landing-v2.css";

const DESCRIPTION = `Pancake is ${pricingV2.currencySymbol}${pricingV2.monthlyDollars}/month flat for your whole AI sales and marketing team. Everything included. No tiers, no seats.`;

export const metadata: Metadata = {
  title: `Pricing: $${pricingV2.monthlyDollars}/month flat · Pancake`,
  description: DESCRIPTION,
  openGraph: {
    title: `Pancake Pricing: $${pricingV2.monthlyDollars}/month flat`,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Pancake Pricing: $${pricingV2.monthlyDollars}/month flat`,
    description: DESCRIPTION,
  },
};

/* Product / Offer JSON-LD — one plan, one price, kept in lockstep with
   the visible card via pricingV2. */
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Pancake: AI agents that bring you customers",
  description: DESCRIPTION,
  brand: { "@type": "Brand", name: "Pancake" },
  offers: {
    "@type": "Offer",
    price: String(pricingV2.monthlyDollars),
    priceCurrency: pricingV2.currency,
    availability: "https://schema.org/InStock",
  },
};

export default function PricingPage() {
  return (
    <main className="lv2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="lv2-viewport lv2-viewport--page">
        <LandingNav />
        <section className="lv2s lv2-pricing-page" aria-labelledby="lv2-pricing-page-title">
          <div className="lv2-container">
            <header className="lv2-section-header">
              <h1 id="lv2-pricing-page-title" className="lv2-section-title">
                {pricingV2.title}
              </h1>
              <p className="lv2-section-lede">{pricingV2.blurb}</p>
            </header>

            <div className="lv2-price-card">
              <p className="lv2-price-figure">
                <span className="lv2-price-amount">
                  {pricingV2.currencySymbol}
                  {pricingV2.monthlyDollars}
                </span>
                <span className="lv2-price-cycle">{pricingV2.perMonth}</span>
              </p>
              <p className="lv2-price-sub">{pricingV2.access}</p>
              <PriceGroups />
              <div className="lv2-button-group">
                <FxPillLink href="https://app.getpancake.ai" data-analytics-id="app_pricing_page">
                  Get started
                </FxPillLink>
                <FxPill
                  variant="outline"
                  data-lv2-open="call"
                  data-analytics-id="call_pricing_page"
                >
                  Book a call
                </FxPill>
              </div>
              <p className="lv2-price-fine">{pricingV2.fine}</p>
            </div>
          </div>
        </section>
      </div>
      <LandingFooter />
      <LandingModals />
    </main>
  );
}
