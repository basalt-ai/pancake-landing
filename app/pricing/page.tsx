/**
 * Pricing — radically honest. Two-card hero: $49/month flat for the
 * always-on cloud (LEFT) + a user-picked token pack (RIGHT, $50 to
 * $1000). Token packs are passed through at the labs' public price,
 * no markup — our margin is the volume discount we get for buying in
 * bulk.
 *
 * Section order: hero (2 cards) → included list → manifesto → what
 * your tokens buy → FAQ. Trust before value: the user sees the price,
 * sees what's included, then learns what the agent does with it.
 */
import type { Metadata } from "next";

import { PricingBase } from "@/components/sections/pricing/PricingBase";
import { PricingFaq } from "@/components/sections/pricing/PricingFaq";
import { PricingHero } from "@/components/sections/pricing/PricingHero";
import { PricingIncluded } from "@/components/sections/pricing/PricingIncluded";
import { TokensBuyCards } from "@/components/sections/pricing/TokensBuyCards";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { Footer } from "@/components/shared/Footer";
import { H3 } from "@/components/ui/Headings";
import { pricing } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Pricing — $49/month for an always-on AI agent · Pancake",
  description: pricing.subtitle,
  openGraph: {
    title: "Pancake Pricing — $49/month flat for an AI agent",
    description: pricing.subtitle,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake Pricing — $49/month flat for an AI agent",
    description: pricing.subtitle,
  },
};

/* FAQPage JSON-LD — surfaces our FAQ to search crawlers and AI
   crawlers so Google rich-snippets and LLM answer engines can quote
   accurate, up-to-date answers about the pricing model. Built from
   the same data the on-page FAQ renders, so the schema can never
   drift from the visible content. */
const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: pricing.faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

/* Product / Offer JSON-LD — describes the bundled plan + the five
   token packs so crawlers can extract structured pricing data
   (price range, currency, what's included) without scraping the
   visible page. The five tier offers reuse the canonical pricing
   data so any future price change updates the schema automatically. */
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Pancake — always-on AI agent",
  description: pricing.subtitle,
  brand: { "@type": "Brand", name: "Pancake" },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: pricing.currency,
    lowPrice: pricing.tiers[0].totalDollars,
    highPrice: pricing.tiers[pricing.tiers.length - 1].totalDollars,
    offerCount: pricing.tiers.length,
    offers: pricing.tiers.map((t) => ({
      "@type": "Offer",
      name: `${t.planName} — ${pricing.currencySymbol}${
        t.totalDollars - pricing.infrastructureDollars
      } token pack`,
      price: t.totalDollars,
      priceCurrency: pricing.currency,
      description: t.forAudience,
    })),
  },
};

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* FAQ + Product JSON-LD for SEO / AI crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <HomeNav />

      <section className="pricing-section" aria-label="Pricing">
        <div className="pricing-section__inner">
          <PricingBase pricing={pricing} />
          <PricingHero pricing={pricing} />
        </div>
      </section>

      <PricingIncluded pricing={pricing} />

      <section className="pricing-manifesto" aria-labelledby="pricing-manifesto-title">
        <div className="pricing-manifesto__inner">
          <h2 id="pricing-manifesto-title" className="heading pricing-manifesto__title">
            {pricing.manifesto.title}
          </h2>
          <ul className="pricing-manifesto__grid">
            {pricing.manifesto.items.map((item) => (
              <li key={item.title} className="pricing-manifesto__item">
                <H3 className="heading pricing-manifesto__item-title">{item.title}</H3>
                <p className="pricing-manifesto__item-body">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TokensBuyCards pricing={pricing} />

      <div className="pricing-faq__container">
        <PricingFaq pricing={pricing} />
      </div>

      <Footer />
    </main>
  );
}
