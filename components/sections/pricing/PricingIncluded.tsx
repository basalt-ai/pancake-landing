/**
 * "Everything your $49 buys" — the receipt for the always-on cloud
 * portion of the bundle. Sits directly under the hero so the natural
 * follow-up question to "$49 for what?" gets answered in-page.
 *
 * 12 items in a responsive grid: 3 cols on desktop, 2 cols on tablet,
 * 1 col on phones. Each item has:
 *   • An icon (branded SVG for known services like Slack/iMessage/
 *     Chrome and a multi-disc mark for the model-agnostic Harness;
 *     stroke icons for generic features) — pulled from IncludedIcons
 *     via the `icon` key on each item.
 *   • A short bold label.
 *   • A one-line detail.
 *   • Optional "Soon" pill for roadmap items.
 */
import type { pricing as pricingCopy } from "@/lib/copy";

import { IncludedIcon } from "./IncludedIcons";

type Pricing = typeof pricingCopy;

export function PricingIncluded({ pricing }: { pricing: Pricing }) {
  return (
    <section
      className="pricing-included"
      aria-labelledby="pricing-included-title"
    >
      <div className="pricing-included__inner">
        <header className="pricing-included__header">
          <h2
            id="pricing-included-title"
            className="heading pricing-included__title"
          >
            {pricing.included.title}
          </h2>
          <p className="pricing-included__subtitle">
            {pricing.included.subtitle}
          </p>
        </header>
        <ul className="pricing-included__grid">
          {pricing.included.items.map((item) => (
            <li key={item.name} className="pricing-included__item">
              <span className="pricing-included__icon" aria-hidden>
                <IncludedIcon name={item.icon} />
              </span>
              <div className="pricing-included__text">
                <p className="pricing-included__name">
                  {item.name}
                  {"soon" in item && item.soon ? (
                    <span className="pricing-included__soon">Soon</span>
                  ) : null}
                </p>
                {item.detail ? (
                  <p className="pricing-included__detail">{item.detail}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
