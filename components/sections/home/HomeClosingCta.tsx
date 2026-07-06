/**
 * Home — closing CTA finale (founder brief 2026-07-06: reproduce Figma
 * `1892:4502`, the design that was already strong — full-bleed band,
 * concentric dotted arcs grazing the edges, three two-tone pancakes
 * scattered on the arcs, a stacked centered title with a bold tail,
 * one pink button, one quiet note).
 *
 * Text keeps the established direction: the title cashes the hero claim
 * ("Give Pancake its first job"), the note derives from `pricing.trial`.
 * The previous orbit-stage + eye-tracking mascot version is gone per the
 * brief ("do not reinvent" the Figma layout); the decor layer spans the
 * SECTION, not the container — `.home-landing-section--closing` carries
 * `position: relative` for it.
 *
 * Static server component: the arcs and pancakes are plain SVG/CSS (slow
 * float keyframes only), no GSAP, no client hooks.
 */

import { pricing } from "@/lib/copy";
import { PANCAKE_TINTS } from "@/lib/pancake-palette";

/** Figma design space — positions below are % of the 1920×574 band. */
const PANCAKES = [
  { id: "purple", variant: "purple", size: 46, x: 26.0, y: 11.5 },
  { id: "pink", variant: "pink", size: 92, x: 11.5, y: 72.0 },
  { id: "orange", variant: "orange", size: 108, x: 96.2, y: 38.0 },
] as const;

const FLOAT_DELAYS = ["0s", "2.3s", "4.1s"];

/** Shared two-tone pancake silhouette (same drawing as the hero orbits). */
function DecorPancake({ variant, className }: { variant: keyof typeof PANCAKE_TINTS; className: string }) {
  const p = PANCAKE_TINTS[variant];
  return (
    <svg className={className} viewBox="0 0 49 48" aria-hidden focusable="false">
      <path
        d="M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z"
        fill={p.side}
      />
      <path
        d="M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z"
        fill={p.top}
      />
    </svg>
  );
}

export function HomeClosingCta() {
  const note = `${pricing.trial.days}-day free trial • ${pricing.currencySymbol}${pricing.trial.freeTokensDollars} in free credits • No credit card required`;

  return (
    <div className="home-closing">
      {/* Full-band decor — concentric dotted arcs (empty middle keeps the
          copy clean) + pancakes riding them, Figma positions. */}
      <div className="home-closing__decor" aria-hidden>
        <svg className="home-closing__arcs" viewBox="0 0 1920 574" preserveAspectRatio="xMidYMid slice">
          {[520, 700, 880, 1060].map((r, i) => (
            <circle
              key={r}
              cx={960}
              cy={287}
              r={r}
              className="home-closing__orbit"
              opacity={0.6 - i * 0.1}
            />
          ))}
        </svg>
        {PANCAKES.map((p, i) => (
          <span
            key={p.id}
            className="home-closing-pancake"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `clamp(${Math.round(p.size * 0.55)}px, ${(p.size / 1920) * 100}vw, ${p.size}px)`,
              animationDelay: FLOAT_DELAYS[i],
            }}
          >
            <DecorPancake variant={p.variant} className="home-closing-pancake__art" />
          </span>
        ))}
      </div>

      <h2 id="home-landing-closing-heading" className="heading home-landing-section__closing-title text-center">
        Give Pancake
        <br />
        its <strong>first job</strong>
      </h2>
      <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
        Onboards in Slack. Hands back finished work.
      </p>
      <div className="home-landing-closing-cta">
        <a
          href="https://app.getpancake.ai"
          className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
          data-size="lg"
        >
          Get started for free
        </a>
        <p className="home-landing-closing-cta__note">{note}</p>
      </div>
    </div>
  );
}
