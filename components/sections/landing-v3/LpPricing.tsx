import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";

/**
 * Landing v3 — Pricing (Figma node 4257:5083, 1654×890, bg #000).
 * The grouped rainbow art (lp-pancakes-pricing.svg, 1654×1039) paints the cream
 * top area + wave over the black section; its 148px spill below the section is
 * black-on-black against the footer, so the section clips it safely.
 */

const CHECKLIST = [
  "Every agent included.",
  "5 to 15 warm leads.",
  "2 to 3 new customers.",
  "30 articles posted.",
  "Google ranking and ChatGPT citations.",
  "Approvals and a hard spend cap.",
];

export function LpPricing() {
  return (
    <section id="pricing" className="lp-price">
      <div className="lp-price-frame">
        <h2 className="lp-title-section lp-price-title">Simple, transparent pricing</h2>
        <div className="lp-price-body">
          <div className="lp-price-price">
            <p className="lp-price-amount">99 USD</p>
            <p className="lp-price-per">per month, flat</p>
          </div>
          <ul className="lp-price-list">
            {CHECKLIST.map((item) => (
              <li key={item} className="lp-price-item">
                <img src="/lp/lp-p-check.svg" alt="" width={24} height={24} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <LpFxLink href="https://app.getpancake.ai" size="lg" className="lp-price-cta" data-analytics-id="app_pricing_card">
          Get started
        </LpFxLink>
        <p className="lp-price-note">No credit card needed</p>
      </div>
      <img
        className="lp-price-art"
        src="/lp/lp-pancakes-pricing.svg"
        alt=""
        width={1654}
        height={1039}
      />
    </section>
  );
}
