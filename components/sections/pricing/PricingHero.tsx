"use client";

import Link from "next/link";
import { useId, useState } from "react";

import type { pricing as pricingCopy } from "@/lib/copy";

import { PancakeStack } from "./PancakeStack";

type Pricing = typeof pricingCopy;

/**
 * Token-pack card — the RIGHT of the two pricing cards. The $49
 * base plan lives on the LEFT (PricingBase, fixed). This card is
 * entirely about the variable: the user picks a token pack via the
 * slider, the pancake mascot grows to match, and the trial CTA
 * sends them off.
 *
 * Internal layout: a 2-column grid (info left, pancake right). The
 * info column flows top-to-bottom as:
 *
 *   SYRUP                       ← tier kicker (top-left, tier-tinted)
 *   Pick your token pack
 *   How much your agents…       ← caption, framing what the slider does
 *
 *   [────●────]
 *   $50  $100  $250  $500  $1000
 *
 *   $99 / month total · For side projects
 *
 *   [Start your free trial]
 *   7-day free trial · $100 token cap
 *
 *   (pancake mascot column on the right, full height)
 *
 * No $49 mention here — that's the OTHER card's job. Keeping the two
 * concerns separate is the whole point of the two-card split.
 */
export function PricingHero({ pricing }: { pricing: Pricing }) {
  const tiers = pricing.tiers;
  const [tierIndex, setTierIndex] = useState<number>(pricing.defaultTierIndex);
  const tier = tiers[tierIndex];
  const sliderId = useId();

  const tokenPortion = tier.totalDollars - pricing.infrastructureDollars;

  return (
    <div
      className="pricing-hero"
      style={{ "--plan-accent": tier.accent } as React.CSSProperties}
    >
      <p className="pricing-hero__plan-kicker" aria-live="polite">
        {tier.planName}
      </p>

      <div className="pricing-hero__info">
        <div className="pricing-hero__choice">
          <p className="pricing-hero__choice-label">{pricing.tokenPickLabel}</p>
        </div>

        <div className="pricing-hero__slider-wrap">
          <label htmlFor={sliderId} className="sr-only">
            token pack size
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={tiers.length - 1}
            step={1}
            value={tierIndex}
            onChange={(e) => setTierIndex(Number(e.target.value))}
            aria-valuetext={`${pricing.currencySymbol}${tokenPortion} token pack, ${pricing.currencySymbol}${tier.totalDollars} per month total`}
            className="pricing-hero__slider"
            style={
              { "--progress": tierIndex / (tiers.length - 1) } as React.CSSProperties
            }
          />
          <div className="pricing-hero__slider-stops" aria-hidden>
            {tiers.map((t, i) => {
              /* Compensate for the slider thumb radius: a native range
                 input's thumb CENTER can't actually reach 0% or 100% —
                 it ranges from `radius` to (width − radius). So labels
                 placed naively at 0% / 100% drift away from the visible
                 thumb position at the extremes. The shift below moves
                 each label so its centre lines up exactly under where
                 the thumb centre lands at that value, giving all four
                 inter-label gaps equal visual width. */
              const THUMB_RADIUS = 14;
              const progress = i / (tiers.length - 1);
              const offsetPx = THUMB_RADIUS - 2 * THUMB_RADIUS * progress;
              return (
                <button
                  key={t.planName}
                  type="button"
                  className="pricing-hero__slider-stop"
                  data-active={i === tierIndex ? "true" : undefined}
                  onClick={() => setTierIndex(i)}
                  style={{ left: `calc(${progress * 100}% + ${offsetPx}px)` }}
                >
                  {pricing.currencySymbol}
                  {t.totalDollars - pricing.infrastructureDollars}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pricing-hero__result" aria-live="polite">
          <p className="pricing-hero__result-amount">
            {pricing.currencySymbol}
            {tier.totalDollars}
            {pricing.totalLabel}
          </p>
          <p className="pricing-hero__result-audience">
            {tier.forAudience}
          </p>
        </div>

        <div className="pricing-hero__cta">
          <Link
            href={pricing.trialHref}
            className="button inline-flex items-center justify-center no-underline"
            data-size="lg"
            prefetch={false}
          >
            {pricing.trialCta}
          </Link>
          <p className="pricing-hero__cta-caption">{pricing.trialCaption}</p>
        </div>
      </div>

      <div className="pricing-hero__mascot">
        <div className="pricing-hero__mascot-stack" aria-hidden>
          <PancakeStack count={tier.pancakes as 1 | 2 | 3 | 4 | 5} />
        </div>
      </div>
    </div>
  );
}
