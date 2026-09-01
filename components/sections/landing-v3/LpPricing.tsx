import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";

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
      {/* Animated pancakes group: 1654×1039 canvas where the old composite img
          sat (top -0.66px, centered); the 2622×1039 container's left offset
          within it is -272px (see anim.css .lp-anim-box--pricing). */}
      <div className="lp-price-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--pricing">
          {/* black floor UNDER the rings: the outermost black disc rotates,
              and at loop phases ~2-3s its edge lifts and exposed the cream
              section bg as a full-width flash above the footer (founder
              2026-09-01, "bande blanche"). In Figma the same lift lands on
              the artboard's black footer — invisible; this floor recreates
              that backing. Canvas coords, painted before (under) the arcs. */}
          <div className="lp-price-blackfloor" />
          <LpPancakes variant="pricing" />
        </div>
      </div>
    </section>
  );
}
