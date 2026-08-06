import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { pricing } from "@/lib/copy";

import { FxPill } from "./FxPill";

/**
 * Pricing — one card, one honest number, Greptile-simple. Every figure
 * derives from the `pricing` block in lib/copy.ts (single source of truth,
 * no hardcoded dollars); the full slider experience lives on /pricing.
 */

const packFloor = pricing.tiers[0]!.totalDollars - pricing.infrastructureDollars;
const packCeil =
  pricing.tiers[pricing.tiers.length - 1]!.totalDollars - pricing.infrastructureDollars;

const PROOF_CHIPS = [
  `${pricing.currencySymbol}${pricing.trial.freeTokensDollars} in free credits`,
  "No credit card required",
  "Cancel anytime",
] as const;

export function LandingPricing() {
  return (
    <section className="lv2s lv2-pricing" id="pricing" aria-labelledby="lv2-pricing-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <Badge>Pricing</Badge>
          <h2 id="lv2-pricing-title" className="lv2-section-title">
            {pricing.title}
          </h2>
        </header>

        <div className="lv2-price-card">
          <p className="lv2-price-figure">
            <span className="lv2-price-amount">
              {pricing.currencySymbol}
              {pricing.infrastructureDollars}
            </span>
            <span className="lv2-price-cycle">/ month flat</span>
          </p>
          <p className="lv2-price-sub">
            One subscription for the whole agent team, always on. Tokens at the labs&rsquo; public
            price — pick a pack from {pricing.currencySymbol}
            {packFloor} to {pricing.currencySymbol}
            {packCeil}. No seats, no tiers, no surprises.
          </p>
          <ul className="lv2-price-chips">
            {PROOF_CHIPS.map((chip) => (
              <li key={chip} className="lv2-price-chip">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    d="M3 8.5 6.5 12 13 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {chip}
              </li>
            ))}
          </ul>
          <div className="lv2-button-group">
            <FxPill data-lv2-open="waitlist">Join waitlist</FxPill>
            <Link href="/pricing" className="lv2-price-link">
              See full pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
