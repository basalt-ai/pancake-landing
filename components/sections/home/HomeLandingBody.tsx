/**
 * Home page sections below the hero (`/`). Most illustrations are PNGs in `public/home-landing-*.png`
 * (regenerate: `FIGMA_ACCESS_TOKEN=… npm run figma:export-landing`).
 *
 * Landing v4 narrative arc (one identity throughout — ONE coworker, a whole
 * team of agents behind it), reordered 2026-07-02 to the classic question
 * chain (Julian Shapiro / StoryBrand / CXL consensus + viktor/lindy/linear
 * live orders): benefits before mechanism, trust where doubt peaks (right
 * before money), nothing between price and the ask:
 *   Use cases ("what would it do for me") → Slack ("what's it like
 *   day-to-day, and it doesn't wait to be asked") → Org chart ("how can ONE
 *   coworker do all that") → Integrations ("does it fit my stack") →
 *   X posts + UGC videos ("who else uses it") → Trust ("can I trust it with
 *   my accounts") → Pricing teaser → Closing CTA → Blog (post-CTA — editorial
 *   never sits inside the conversion path).
 * Background rhythm: plain/alt alternation; testimonials + pricing teaser are
 * full-bleed bands with their own treatment; the org band keeps the plain
 * surface (its edge-fade mask blends into `--surface`).
 */

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeBlogCards } from "@/components/sections/home/HomeBlogCards";
import { HomeIntegrationsCloud } from "@/components/sections/home/HomeIntegrationsCloud";
import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { HomeTrustCarousel } from "@/components/sections/home/HomeTrustCarousel";
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
      {/* "Four real jobs" use-case grid — leads the body since the 2026-07-02
          narrative reorder (benefits before mechanism: right after the video
          receipt, the visitor asks "what would it do for MY startup").
          Rebuilt in v4.1 as "chat theater" (founder: flat/not juicy/fixed):
          tinted mats, floating Slack panels, play-once GSAP conversation
          choreography with a receipt-stamp artifact payoff. Mats carry their
          own tints, so the band takes the plain surface. */}
      <section className="home-landing-section" aria-labelledby="home-landing-usecases-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            {/* Single-line header — one-screen budget (founder rule). */}
            <H2 id="home-landing-usecases-heading" className="heading home-landing-section__title text-center">
              Give Pancake a job, come back to finished work
            </H2>
          </header>
          <HomeUseCases />
        </div>
      </section>

      {/* Figma `428:15120` slack — the interaction model, second since the
          reorder: once the use cases build desire for the outcomes, this
          answers "what's it like to work with day-to-day" — and the
          proactivity line lands harder. Singular framing: the hero
          introduced ONE coworker; the plural team story lands next in the
          org chart. `--alt` keeps the plain/alt rhythm after the plain
          use-case band. */}
      <section className="home-landing-section home-landing-section--alt" aria-labelledby="home-landing-slack-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            {/* Single-line header — one-screen budget (founder rule). */}
            <H2 id="home-landing-slack-heading" className="heading home-landing-section__title text-center">
              Pancake lives in Slack and doesn’t wait to be asked
            </H2>
          </header>
          <div className="home-landing-section__figure home-landing-section__figure--slack">
            <SlackUI />
          </div>
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
            {/* Single-line header (founder: one efficient sentence frees the
                vertical room that keeps the squad boxes at full size). */}
            <H2 id="home-landing-org-heading" className="heading home-landing-section__title text-center">
              One coworker, a whole team of agents behind it
            </H2>
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
            {/* Single-line header (founder: one efficient sentence — the freed
                line keeps the full artwork visible without cropping logos). */}
            <H2 id="home-landing-integrations-heading" className="heading home-landing-section__title text-center">
              Pancake plugs into the tools you already use
            </H2>
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

      {/* Trust — six-card drag carousel (founder call 2026-07-02, second
          rebuild): one card per buyer question, anxiety-descending —
          approvals, reach, accounts, audit, secrets, data isolation. SOC 2
          lives in the sober footnote. Replaces the three-pillar
          HomeLandingTrust (stays on disk unreferenced, like
          HomeLandingSecurity/Control before it). Single-line header per
          the one-screen budget; H2 names the substance — it acts as you,
          you keep the veto. */}
      <section className="home-landing-section" aria-labelledby="home-landing-trust-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-trust-heading" className="heading home-landing-section__title text-center">
              It acts as you. You keep the last word.
            </H2>
          </header>
          <HomeTrustCarousel />
        </div>
      </section>

      {/* Pricing teaser — the homepage previously never mentioned price;
          the honest $49-flat + tokens-at-cost story is the sharpest
          differentiator. Full band with its own pink treatment. */}
      <HomePricingTeaser />

      {/* Figma `428:15160` closing CTA — directly after pricing since the
          2026-07-02 narrative reorder: nothing sits between the price and
          the ask (the blog cards that used to live here were an exit ramp
          at the exact moment of decision). Decorative pancakes (purple
          top-left, half-pink bottom-left, orange-pink right) bleed past the
          section edges; desktop positions added in landing v4. */}
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

      {/* From the blog — post-CTA since the 2026-07-02 narrative reorder
          (editorial never sits inside the conversion path; every reference
          page keeps resources out of it). Still on the homepage for crawler
          discovery of new articles — real <a href> anchors. (The FAQ
          accordion that once sat by the blog was removed earlier the same
          day; HomeFaq.tsx and home-faq.css stay on disk, unreferenced.)
          Rhythm: pricing(pink band) → closing(alt) → blog(plain) → footer. */}
      <HomeBlogCards />
    </div>
  );
}
