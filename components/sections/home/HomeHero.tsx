import type { CSSProperties } from "react";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HOME_HERO_ORBIT_LAYERS_OUTER_TO_INNER } from "@/components/sections/home/home-hero-orbit-layers";
import {
  HOME_HERO_MONSTER_ELLIPSE_SRC,
  HOME_HERO_MONSTER_FIGMA_PX,
  HOME_HERO_ORBIT_SATELLITES,
  homeHeroOrbitSatelliteCssRotationDeg,
  homeHeroOrbitSatelliteSrc,
} from "@/components/sections/home/home-hero-orbit-satellites";
import { HomeHeroPancakeMonster } from "@/components/sections/home/HomeHeroPancakeMonster";
import { HomeLogoMarquee } from "@/components/sections/home/HomeLogoMarquee";
import { H1 } from "@/components/ui/Headings";

const HERO_TITLE = "The superagent that makes your company autonomous";

const HERO_SUB =
  "Pancake connects to your tools, creates agents, and starts working for you.";

export function HomeHero() {
  return (
    <section
      className="home-hero relative w-full overflow-hidden"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div
        className={`${HOME_PAGE_CONTAINER_CLASS} grid grid-cols-1 pt-[var(--spacing-home-hero-padding-top-mobile)] pb-[var(--spacing-xxl)] lg:grid-cols-[minmax(0,9fr)_minmax(0,3fr)] lg:gap-x-[var(--spacing-xxl)] lg:pt-[var(--spacing-home-hero-padding-top)] lg:pb-[var(--spacing-xxl)]`}
        style={{ rowGap: "var(--spacing-xl)" }}
      >
        <div className="home-hero-text-stack relative z-[1] lg:pr-[var(--spacing-md)]">
          <H1 className="whitespace-pre-line">{HERO_TITLE}</H1>
          <p className="home-hero-body whitespace-pre-line">{HERO_SUB}</p>
          <div className="home-hero-cta-row">
            <a
              href="https://app.getpancake.ai"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Try for free
            </a>
            <a
              href="https://zcal.co/i/ZEHl48rv"
              target="_blank"
              rel="noopener noreferrer"
              className="home-hero-cta-link"
            >
              Book a meeting →
            </a>
            <p className="home-hero-cta-note">No credit card required • SOC 2 compliant</p>
          </div>
        </div>

        {/* HQ mascot + cream + dotted orbits 1–6 — Figma `428:14900` (see `home-hero-orbit-layers.ts`). */}
        <div className="home-hero-pancake" aria-hidden>
          <div className="home-hero-pancake-stack">
            <div className="home-hero-pancake-stack-inner">
              {/* eslint-disable-next-line @next/next/no-img-element -- Figma-export rasters */}
              <img
                className="home-hero-pancake-ellipse"
                src={HOME_HERO_MONSTER_ELLIPSE_SRC}
                alt=""
                width={946}
                height={946}
                decoding="sync"
                fetchPriority="high"
              />
              {HOME_HERO_ORBIT_LAYERS_OUTER_TO_INNER.map((layer) => (
                <div
                  key={layer.figmaNode}
                  className={`home-hero-pancake-orbit home-hero-pancake-orbit--${layer.orbit}`}
                  data-figma-node={layer.figmaNode}
                  data-figma-name={layer.figmaName}
                >
                  <svg
                    viewBox={layer.viewBox}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden
                  >
                    <path
                      d={layer.pathD}
                      stroke="var(--text)"
                      strokeLinecap="round"
                      strokeWidth={1}
                      strokeDasharray="0.578125 6.9375"
                      {...(layer.pathOpacity !== undefined ? { opacity: layer.pathOpacity } : {})}
                    />
                  </svg>
                </div>
              ))}
              {HOME_HERO_ORBIT_SATELLITES.filter((s) => s.layer === "behindMascot").map((s) => (
                <div
                  key={s.figmaNode}
                  className="home-hero-orbit-satellite home-hero-orbit-satellite--behind"
                  data-figma-node={s.figmaNode}
                  data-orbit={s.orbit}
                  style={
                    {
                      "--sat-dx": `calc(var(--size-home-hero-monster-max-width) * ${s.dxFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      "--sat-dy": `calc(var(--size-home-hero-monster-max-width) * ${s.dyFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      width: `calc(var(--size-home-hero-monster-max-width) * ${s.widthFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      height: `calc(var(--size-home-hero-monster-max-width) * ${s.heightFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                    } as CSSProperties
                  }
                >
                  <div
                    className="home-hero-orbit-satellite-rot"
                    style={
                      {
                        "--sat-rot": `${homeHeroOrbitSatelliteCssRotationDeg(s.rotationFigmaPluginDeg)}deg`,
                      } as CSSProperties
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- Figma PNG @2x (skew-accurate vs SVG export) */}
                    <img
                      className="home-hero-orbit-satellite-img"
                      src={homeHeroOrbitSatelliteSrc(s.figmaNode)}
                      alt=""
                      decoding="async"
                    />
                  </div>
                </div>
              ))}
              <HomeHeroPancakeMonster />
              {HOME_HERO_ORBIT_SATELLITES.filter((s) => s.layer === "frontOfMascot").map((s) => (
                <div
                  key={s.figmaNode}
                  className="home-hero-orbit-satellite home-hero-orbit-satellite--front"
                  data-figma-node={s.figmaNode}
                  data-orbit={s.orbit}
                  style={
                    {
                      "--sat-dx": `calc(var(--size-home-hero-monster-max-width) * ${s.dxFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      "--sat-dy": `calc(var(--size-home-hero-monster-max-width) * ${s.dyFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      width: `calc(var(--size-home-hero-monster-max-width) * ${s.widthFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      height: `calc(var(--size-home-hero-monster-max-width) * ${s.heightFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                    } as CSSProperties
                  }
                >
                  <div
                    className="home-hero-orbit-satellite-rot"
                    style={
                      {
                        "--sat-rot": `${homeHeroOrbitSatelliteCssRotationDeg(s.rotationFigmaPluginDeg)}deg`,
                      } as CSSProperties
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- Figma PNG @2x (skew-accurate vs SVG export) */}
                    <img
                      className="home-hero-orbit-satellite-img"
                      src={homeHeroOrbitSatelliteSrc(s.figmaNode)}
                      alt=""
                      decoding="async"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer/partner strips pinned at the bottom of the first viewport —
          the grid above auto-centers in the remaining space (`margin-block:
          auto`). Transparent band: the dotted orbits pass behind it. */}
      <HomeLogoMarquee />
    </section>
  );
}
