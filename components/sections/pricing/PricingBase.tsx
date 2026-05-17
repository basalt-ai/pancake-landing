/**
 * Base-plan card — the LEFT of the two pricing cards. Communicates
 * the fixed promise: "$49/month for your autonomous company".
 * No interactivity, no slider — the price never moves regardless of
 * what the user does next door.
 *
 * Layout: kicker pill → big price → "Your autonomous company" title
 * → "Everything it needs to run:" subtitle → 4-item highlight list
 * with branded icons. The detailed 12-item bundle lives in
 * PricingIncluded just below the hero; the 4 lines here are the
 * marketing distillation.
 */
import type { pricing as pricingCopy } from "@/lib/copy";

import { IncludedIcon } from "./IncludedIcons";

type Pricing = typeof pricingCopy;

export function PricingBase({ pricing }: { pricing: Pricing }) {
  return (
    <article
      className="pricing-base"
      aria-labelledby="pricing-base-title"
    >
      <p className="pricing-base__kicker">{pricing.basePlan.kicker}</p>

      {/* Main cluster — price → title → highlights, stacked at the top
          of the card. The footnote sits as a sibling pinned to the
          bottom by the parent's `justify-content: space-between`, so
          it horizontally aligns with the CTA caption on the right
          card regardless of card height. */}
      <div className="pricing-base__main">
        <p className="pricing-base__price">
          <span className="pricing-base__symbol">{pricing.currencySymbol}</span>
          {pricing.infrastructureDollars}
          <span className="pricing-base__suffix">{pricing.perMonth}</span>
        </p>

        <h2 id="pricing-base-title" className="pricing-base__title">
          {pricing.basePlan.title}
        </h2>

        <ul className="pricing-base__highlights">
          {pricing.basePlan.highlights.map((h) => (
            <li key={h.name} className="pricing-base__highlight">
              <span className="pricing-base__highlight-icon" aria-hidden>
                <IncludedIcon name={h.icon} />
              </span>
              <span className="pricing-base__highlight-name">{h.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="pricing-base__footnote">{pricing.basePlan.footnote}</p>
    </article>
  );
}
