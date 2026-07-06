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
import { HomeClosingCta } from "@/components/sections/home/HomeClosingCta";
import { HomeIntegrationsCloud } from "@/components/sections/home/HomeIntegrationsCloud";
import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { HomeTrustCards } from "@/components/sections/home/HomeTrustCards";
import { HomeOrgDiagram } from "@/components/sections/home/HomeOrgDiagram";
import { HomeOrgDiagramMobile } from "@/components/sections/home/HomeOrgDiagramMobile";
import { HomePricingTeaser } from "@/components/sections/home/HomePricingTeaser";
import { HomeUGCWall } from "@/components/sections/home/HomeUGCWall";
import { HomeUseCases } from "@/components/sections/home/HomeUseCases";
import { SlackUI } from "@/components/shared/SlackUI";
import { H2 } from "@/components/ui/Headings";

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

      {/* UGC video wall — real founders on camera, riding the X-posts'
          "Take it from them" title: no header of its own (founder call
          2026-07-03 — its old H2 read as AI slop, and one title covers
          both proof formats). Reads public/ugc/*.mp4 at build time;
          production renders nothing until clips are dropped in (see
          public/ugc/README.md); dev + Vercel previews show the designed
          empty state. `alt` keeps the surface alternation vs the plain
          testimonial band. */}
      <HomeUGCWall alt />

      {/* Trust — three static security/privacy cards (founder brief
          2026-07-06, Figma `428:15125`): secrets vault, sealed workspace,
          accounts stay yours. Replaces the 3D carousel (HomeTrustCarousel
          stays on disk unreferenced); SOC 2 / approvals / tool-scope cards
          dropped per the brief. Title + lede order mirrors the cards. */}
      <section className="home-landing-section" aria-labelledby="home-landing-trust-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="home-landing-trust-heading" className="heading home-landing-section__title text-center">
              Your keys, your space, your accounts.
            </H2>
            <p className="home-landing-section__lede text-center">
              Everything Pancake touches stays inside your company.
            </p>
          </header>
          <HomeTrustCards />
        </div>
      </section>

      {/* Pricing teaser — the homepage previously never mentioned price;
          the honest $49-flat + tokens-at-cost story is the sharpest
          differentiator. Full band with its own pink treatment. */}
      <HomePricingTeaser />

      {/* Closing CTA finale — directly after pricing since the 2026-07-02
          narrative reorder: nothing sits between the price and the ask.
          Rebuilt 2026-07-03 (founder: generic band, headline too far from
          the value prop): HomeClosingCta cashes the hero claim ("Give
          Pancake its first job") and restages the hero's mascot-among-
          orbits scene around the button — the old edge-bleed decor
          pancakes are gone, absorbed into the orbit satellites. (SOC 2
          left the note deliberately: the trust carousel owns compliance
          two sections up.) (Merge note: main's stopgap inline-styled
          "From the blog" link list from PR #172 is superseded by
          HomeBlogCards below — same crawler-facing real anchors, designed.) */}
      <section className="home-landing-section home-landing-section--alt home-landing-section--closing" aria-labelledby="home-landing-closing-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <HomeClosingCta />
        </div>
      </section>

      {/* No blog section (founder brief 2026-07-06: it made the page
          heavier; the AgentMail story now rides its logo in the hero
          marquee as a "Read story" chip). HomeBlogCards.tsx stays on
          disk unreferenced; /blog + llms.txt keep crawler discovery.
          Rhythm: pricing(pink band) → closing(alt) → footer. */}
    </div>
  );
}
