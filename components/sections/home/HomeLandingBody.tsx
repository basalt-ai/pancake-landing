/**
 * Home page sections below the hero (`/`). Most illustrations are PNGs in `public/home-landing-*.png`
 * (regenerate: `FIGMA_ACCESS_TOKEN=… npm run figma:export-landing`). Org diagram is HTML (`HomeOrgDiagram`).
 */

import Link from "next/link";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeIntegrationsCloud } from "@/components/sections/home/HomeIntegrationsCloud";
import { HomeLandingControl } from "@/components/sections/home/HomeLandingControl";
import { HomeLandingFeatures } from "@/components/sections/home/HomeLandingFeatures";
import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { HomeOrgDiagram } from "@/components/sections/home/HomeOrgDiagram";
import { HomeOrgDiagramMobile } from "@/components/sections/home/HomeOrgDiagramMobile";
import { SlackUI } from "@/components/shared/SlackUI";
import { H2 } from "@/components/ui/Headings";

/** Figma `428:15162` — U+2028 line break before “company”. */
const CLOSING_TITLE = "Make your \u2028company autonomous";

/**
 * Inline pancake decoration \u2014 same two-tone silhouette used across the page
 * (side + top paths from `pancake-svgs/angled-1.svg`), tinted by variant.
 * Powers the bleed pancakes around the closing CTA on mobile (Figma `451:20112`).
 */
const DECOR_PALETTE = {
  purple: { side: "#D7C4ED", top: "#B89BE0" },
  pink:   { side: "#F4B0BF", top: "#F1809E" },
  orange: { side: "#FFB48A", top: "#FF7F47" },
} as const;
function DecorPancake({ variant, className }: { variant: keyof typeof DECOR_PALETTE; className: string }) {
  const p = DECOR_PALETTE[variant];
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

export function HomeLandingBody() {
  return (
    <div className="home-landing">
      {/* Figma `428:14922` org */}
      <section className="home-landing-section home-landing-section--alt" aria-labelledby="home-landing-org-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-org-heading" className="heading home-landing-section__title text-center">
              An entire org working for you
            </H2>
            <p className="home-landing-section__lede text-center">Even when you’re asleep</p>
          </header>
          <div className="home-landing-section__figure home-landing-section__figure--org">
            {/* Desktop: animated absolute diagram. Mobile: simplified
                carousel + Tailor card per Figma `596:2940`. */}
            <div className="home-landing-org-desktop">
              <HomeOrgDiagram />
            </div>
            <div className="home-landing-org-mobile">
              <HomeOrgDiagramMobile />
            </div>
          </div>
        </div>
      </section>

      {/* Figma `428:15015` integrations */}
      <section className="home-landing-section" aria-labelledby="home-landing-integrations-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-integrations-heading" className="heading home-landing-section__title text-center">
              Endless integrations
            </H2>
            <p className="home-landing-section__lede text-center">Plug in your stack, let the agents do the rest.</p>
          </header>
          <div className="home-landing-section__figure">
            <HomeIntegrationsCloud />
          </div>
        </div>
      </section>

      {/* Figma `428:15087` features */}
      <section className="home-landing-section home-landing-section--alt" aria-labelledby="home-landing-features-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-features-heading" className="heading home-landing-section__title text-center">
              Naturally works as you’d expect
            </H2>
            <p className="home-landing-section__lede text-center">Pancake comes with modern day features.</p>
          </header>
          <HomeLandingFeatures />
        </div>
      </section>

      {/* Figma `428:15120` slack */}
      <section className="home-landing-section" aria-labelledby="home-landing-slack-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-slack-heading" className="heading home-landing-section__title text-center">
              Your agents live in Slack
            </H2>
            <p className="home-landing-section__lede text-center">They don’t wait to be asked.</p>
          </header>
          <div className="home-landing-section__figure home-landing-section__figure--slack">
            <SlackUI />
          </div>
        </div>
      </section>

      {/* Figma `428:15125` control */}
      <section className="home-landing-section home-landing-section--alt" aria-labelledby="home-landing-control-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-control-heading" className="heading home-landing-section__title text-center">
              You’re always in control
            </H2>
            <p className="home-landing-section__lede text-center">Jump in at any time, you always have the last word.</p>
          </header>
          <div className="home-landing-section__figure">
            <HomeLandingControl />
          </div>
        </div>
      </section>

      {/*
        Figma `428:15175` testimonials — TEMPORARILY HIDDEN.
        Re-enable when the testimonial copy is real (the current strings are
        placeholder fiction). Leaving the markup + the HomeLandingTestimonials
        component in the repo so this is a single-block uncomment when the
        real testimonials are ready.

        <section className="home-landing-section home-landing-section--testimonials" aria-labelledby="home-landing-testimonials-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--testimonials`}>
            <header className="home-landing-section__header">
              <H2 id="home-landing-testimonials-heading" className="heading home-landing-section__title text-center">
                Take it from them
              </H2>
              <p className="home-landing-section__lede text-center">Here's what our customers are saying</p>
            </header>
          </div>
          <HomeLandingTestimonials />
        </section>
      */}

      {/* Figma `428:15160` closing CTA — mobile variant `451:20112` adds three
          decorative pancakes (purple top-left, half-pink bottom-left,
          orange-pink right) that bleed past the section edges. Decor is
          mobile-only via CSS (default `display: none`, opt-in below `lg`). */}
      <section className="home-landing-section home-landing-section--alt home-landing-section--closing" aria-labelledby="home-landing-closing-heading">
        <DecorPancake variant="purple" className="home-landing-closing-decor home-landing-closing-decor--purple" />
        <DecorPancake variant="pink" className="home-landing-closing-decor home-landing-closing-decor--pink" />
        <DecorPancake variant="orange" className="home-landing-closing-decor home-landing-closing-decor--orange" />
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <h2 id="home-landing-closing-heading" className="heading home-landing-section__closing-title whitespace-pre-line text-center">
            {CLOSING_TITLE}
          </h2>
          <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
            Sign up and onboard your cofounder now
          </p>
          <div className="home-landing-closing-cta">
            <Link
              href="/signup"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
              prefetch={false}
            >
              Try for free
            </Link>
            <p className="home-landing-closing-cta__note">No credit card required • $100 in free credits • SOC 2 compliant</p>
          </div>
        </div>
      </section>
    </div>
  );
}
