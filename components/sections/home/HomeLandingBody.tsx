/**
 * Home page sections below the hero (`/`). Most illustrations are PNGs in `public/home-landing-*.png`
 * (regenerate: `FIGMA_ACCESS_TOKEN=… npm run figma:export-landing`).
 *
 * Landing v4 narrative arc (one identity throughout — ONE coworker, a whole
 * team of agents behind it):
 *   Slack (where it lives) → Use cases (four real jobs) → Org chart (the
 *   team behind your coworker) → Integrations → UGC videos + X posts (proof)
 *   → Security → Control → Pricing teaser → FAQ → Blog → Closing CTA.
 * Background rhythm: plain/alt alternation; testimonials + pricing teaser are
 * full-bleed bands with their own treatment; the org band keeps the plain
 * surface (its edge-fade mask blends into `--surface`).
 */

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeBlogCards } from "@/components/sections/home/HomeBlogCards";
import { HomeFaq } from "@/components/sections/home/HomeFaq";
import { HomeIntegrationsCloud } from "@/components/sections/home/HomeIntegrationsCloud";
import { HomeLandingControl } from "@/components/sections/home/HomeLandingControl";
import { HomeLandingSecurity } from "@/components/sections/home/HomeLandingSecurity";
import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { HomeOrgDiagram } from "@/components/sections/home/HomeOrgDiagram";
import { HomeOrgDiagramMobile } from "@/components/sections/home/HomeOrgDiagramMobile";
import { HomePricingTeaser } from "@/components/sections/home/HomePricingTeaser";
import { HomeUGCWall } from "@/components/sections/home/HomeUGCWall";
import { HomeUseCases } from "@/components/sections/home/HomeUseCases";
import { SlackUI } from "@/components/shared/SlackUI";
import { H2 } from "@/components/ui/Headings";
import { PANCAKE_TINTS } from "@/lib/pancake-palette";

/**
 * Figma `428:15162` — two-line composition. A plain "\n" because the heading
 * renders with `whitespace-pre-line`, which honors LF but NOT the U+2028 the
 * old constant carried (Chromium rendered it as a typo-looking double gap on
 * a single line).
 */
const CLOSING_TITLE = "Make your\ncompany autonomous";

/**
 * Inline pancake decoration — same two-tone silhouette used across the page
 * (side + top paths from `pancake-svgs/angled-1.svg`), tinted by variant via
 * the shared on-palette tints in `lib/pancake-palette` (previously off-palette
 * hardcoded hexes — unified in landing v4).
 * Powers the bleed pancakes around the closing CTA (Figma `451:20112`).
 */
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

export function HomeLandingBody() {
  return (
    <div className="home-landing">
      {/* Figma `428:15120` slack — leads the page. Pancake living in Slack is
          the headline proof point (kept from PR #151's re-order). Singular
          framing: the hero just introduced ONE coworker; the plural team
          story lands two sections later in the org chart. */}
      <section className="home-landing-section" aria-labelledby="home-landing-slack-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-slack-heading" className="heading home-landing-section__title text-center">
              Pancake lives in Slack
            </H2>
            <p className="home-landing-section__lede text-center">It doesn’t wait to be asked.</p>
          </header>
          <div className="home-landing-section__figure home-landing-section__figure--slack">
            <SlackUI />
          </div>
        </div>
      </section>

      {/* "Four real jobs" use-case grid — un-parked in landing v4, then
          rebuilt in v4.1 as "chat theater" (founder: flat/not juicy/fixed):
          tinted mats, floating Slack panels, play-once GSAP conversation
          choreography with a receipt-stamp artifact payoff. */}
      <section className="home-landing-section home-landing-section--alt" aria-labelledby="home-landing-usecases-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-usecases-heading" className="heading home-landing-section__title text-center">
              Give Pancake a job
            </H2>
            <p className="home-landing-section__lede text-center">Ask in Slack. Come back to finished work.</p>
          </header>
          <HomeUseCases />
        </div>
      </section>

      {/* Squads org chart — revived from _archive (removed in PR #151 because
          "hire squads of agents" clashed with the singular-coworker hero).
          v4 reframes it as the team BEHIND your one coworker, and the live
          rows now show task-shaped work instead of job titles, so the section
          demonstrates "does the work for you" rather than an org shuffling
          headcount. Band keeps the plain surface for its edge-fade mask. */}
      <section className="home-landing-section home-landing-section--org" aria-labelledby="home-landing-org-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-org-heading" className="heading home-landing-section__title text-center">
              One coworker. A whole team behind it.
            </H2>
            <p className="home-landing-section__lede text-center">
              Pancake staffs squads of agents that never clock out.
            </p>
          </header>
          <div className="home-landing-section__figure home-landing-org-mobile">
            <HomeOrgDiagramMobile />
          </div>
        </div>
        <div className="home-landing-org-desktop">
          <HomeOrgDiagram />
        </div>
      </section>

      {/* Figma `428:15015` integrations */}
      <section className="home-landing-section home-landing-section--alt" aria-labelledby="home-landing-integrations-heading">
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

      {/* Real X posts — full-bleed carousel band (Figma `428:15175` skeleton, real content) */}
      <section className="home-landing-section home-landing-section--testimonials" aria-labelledby="home-landing-testimonials-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--testimonials`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-testimonials-heading" className="heading home-landing-section__title text-center">
              Take it from them
            </H2>
          </header>
        </div>
        <HomeLandingTestimonials />
      </section>

      {/* UGC video wall — real founders on camera, following the X posts so
          the two proof formats read as one arc. Reads public/ugc/*.mp4 at
          build time; production renders nothing until clips are dropped in
          (see public/ugc/README.md); dev + Vercel previews show the designed
          empty state. `alt` keeps the surface alternation vs the plain
          testimonial band. */}
      <HomeUGCWall alt />

      {/* Security (card skeleton from the former Figma `428:15087` features section) */}
      <section className="home-landing-section" aria-labelledby="home-landing-security-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-security-heading" className="heading home-landing-section__title text-center">
              Secure by design
            </H2>
            <p className="home-landing-section__lede text-center">Sandboxed, approval-gated, vault-first.</p>
          </header>
          <HomeLandingSecurity />
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

      {/* Pricing teaser — the homepage previously never mentioned price;
          the honest $49-flat + tokens-at-cost story is the sharpest
          differentiator. Full band with its own pink treatment. */}
      <HomePricingTeaser />

      {/* FAQ — visible accordion backing the FAQPage JSON-LD in app/page.tsx
          (schema previously promoted content that never appeared on-page).
          FAQ_ITEMS in HomeFaq.tsx is the single source of truth for both.
          `alt` continues the rhythm after the pink band: faq(alt) →
          blog(plain) → closing(alt). */}
      <HomeFaq alt />

      {/* From the blog — explicit internal links for crawler discovery of new
          articles (kept as real <a href> anchors), now styled as cards. */}
      <HomeBlogCards />

      {/* Figma `428:15160` closing CTA — decorative pancakes (purple top-left,
          half-pink bottom-left, orange-pink right) bleed past the section
          edges; desktop positions added in landing v4 (were mobile-only). */}
      <section className="home-landing-section home-landing-section--alt home-landing-section--closing" aria-labelledby="home-landing-closing-heading">
        <DecorPancake variant="purple" className="home-landing-closing-decor home-landing-closing-decor--purple" />
        <DecorPancake variant="pink" className="home-landing-closing-decor home-landing-closing-decor--pink" />
        <DecorPancake variant="orange" className="home-landing-closing-decor home-landing-closing-decor--orange" />
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <h2 id="home-landing-closing-heading" className="heading home-landing-section__closing-title whitespace-pre-line text-center">
            {CLOSING_TITLE}
          </h2>
          <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
            Sign up and onboard Pancake now
          </p>
          <div className="home-landing-closing-cta">
            <a
              href="https://app.getpancake.ai"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Get started for free
            </a>
            <p className="home-landing-closing-cta__note">No credit card required • $100 in free credits • SOC 2 compliant</p>
          </div>
        </div>
      </section>
    </div>
  );
}
