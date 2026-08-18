import Link from "next/link";

import { PancakeStack } from "@/components/sections/pricing/PancakeStack";
import { pricingV2 } from "@/lib/copy";

import { FxPill } from "./FxPill";

/**
 * Pricing — one flat number, Okara-simple (founder call 2026-08-06: $99/month
 * flat, no tokens, no tiers — that model was Pancake V1). One card: price,
 * feature list, waitlist. Figures come from `pricingV2` in lib/copy.ts.
 */
export function LandingPricing() {
  return (
    <section
      className="lv2s lv2s--brand lv2-pricing"
      id="pricing"
      aria-labelledby="lv2-pricing-title"
    >
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-pricing-title" className="lv2-section-title">
            {pricingV2.title}
          </h2>
        </header>

        <div className="lv2-price-fold">
          <div className="lv2-price-card">
            <p className="lv2-price-figure">
              <span className="lv2-price-amount">
                {pricingV2.currencySymbol}
                {pricingV2.monthlyDollars}
              </span>
              <span className="lv2-price-cycle">{pricingV2.perMonth}</span>
            </p>
            <p className="lv2-price-sub">{pricingV2.blurb}</p>
            <ul className="lv2-price-features">
              {pricingV2.features.map((f) => (
                <li key={f}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M3 8.5 6.5 12 13 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="lv2-button-group">
              <FxPill data-lv2-open="waitlist" data-analytics-id="waitlist_pricing_card">
                Join waitlist
              </FxPill>
              <Link href="/pricing" className="lv2-price-link">
                See full pricing
              </Link>
            </div>
          </div>
          <div className="lv2-price-decor" aria-hidden="true">
            <PancakeStack count={3} />
          </div>
        </div>
      </div>
    </section>
  );
}
