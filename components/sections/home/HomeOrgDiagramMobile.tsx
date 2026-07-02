/**
 * Mobile-only "Hire squads of agents that work autonomously" — squads revamp
 * of the original Figma `596:2940` layout.
 *
 * Layout (top to bottom):
 *  1. You + Pancake mascot pair, joined by an animated dotted-arc connector
 *     with traveling balls that signal live communication between founder
 *     and co-founder (mirrors the desktop You↔Pancake leg).
 *  2. Horizontal snap-scroll carousel: four live squad cards (Outreach,
 *     AI SEO, GitHub Triage, Google Ads) whose subagent rows live-mutate via
 *     `useOrgLiveTicker` — same add / remove / FLIP behavior as desktop —
 *     plus a static dashed "Build your own" finale slide.
 *  3. Dots indicator under the carousel.
 *
 * The desktop component (`HomeOrgDiagram`) is hidden via CSS at <lg.
 */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getInitialDeptMap,
  useOrgLiveTicker,
  type LiveRow,
} from "@/components/sections/home/HomeOrgLiveRows";
import { LIVE_INITIAL_DEPTS, type OrgDotTone, type OrgSurface } from "@/components/sections/home/orgLiveData";
import { gsap } from "@/lib/gsap";

const DOT_CLASS: Record<OrgDotTone, string> = {
  positive: "home-org-mobile-row__dot--positive",
  warning: "home-org-mobile-row__dot--warning",
  negative: "home-org-mobile-row__dot--negative",
};

/** Mobile dept-card lookup for the live ticker (matches markup below). */
function mobileArticleSelector(surface: OrgSurface): string {
  return `.home-org-mobile-card--${surface}`;
}

function dotClassForRow(row: LiveRow): OrgDotTone {
  if (row.baseDot !== undefined) return row.baseDot;
  return row.phase === "active" ? "positive" : "negative";
}

function FounderAvatar() {
  return (
    <svg viewBox="0 0 108 108" aria-hidden focusable="false" className="home-org-mobile-mascot__svg">
      <rect width="108" height="108" rx="54" fill="var(--palette-purple-10, #efddf1)" />
      <g>
        <path
          d="M70.7992 43.5975C72.1483 59.1754 65.1894 74.0014 49.5981 75.4872C33.9421 76.979 24.4667 63.8761 23.1042 48.1425C21.7417 32.4089 28.8112 17.7294 44.4672 16.2375C60.0585 14.7517 69.4502 28.0197 70.7992 43.5975Z"
          fill="var(--palette-purple-30, #ba8bff)"
        />
        <path
          d="M59.8224 148.311C38.4258 154.044 16.024 148.002 10.0967 126.621C4.14489 105.151 20.08 88.6935 41.6905 82.903C63.301 77.1125 85.5258 83.3447 91.4776 104.815C97.4049 126.196 81.2189 142.578 59.8224 148.311Z"
          fill="var(--palette-purple-30, #ba8bff)"
        />
        <path
          d="M47.6222 46.0657C47.9529 49.8841 46.5381 53.4905 43.2713 53.8018C39.991 54.1144 37.9628 50.8745 37.6288 47.018C37.2949 43.1614 38.7333 39.5912 42.0136 39.2786C45.2805 38.9673 47.2916 42.2472 47.6222 46.0657Z"
          fill="var(--palette-chrome-100, #2c002a)"
        />
        <path
          d="M64.9917 43.682C65.2504 46.6698 64.1434 49.4918 61.5872 49.7354C59.0204 49.98 57.4334 47.4449 57.1721 44.4272C56.9107 41.4095 58.0363 38.6159 60.6031 38.3713C63.1593 38.1277 64.7329 40.6942 64.9917 43.682Z"
          fill="var(--palette-chrome-100, #2c002a)"
        />
      </g>
    </svg>
  );
}

const CONNECTOR_VB_W = 80;
const CONNECTOR_VB_H = 40;
/** Arc path between the two mascots (left → right, dipping over the top).
 *  Matches the previous static dotted curve so the visual silhouette is
 *  unchanged; only the dashes + traveling balls are new. */
const CONNECTOR_PATH_D = `M2 32 Q ${CONNECTOR_VB_W / 2} -10 ${CONNECTOR_VB_W - 2} 32`;

const CONNECTOR_BALL_COUNT = 2;
const CONNECTOR_BALL_R_MIN = 1.6;
const CONNECTOR_BALL_R_MAX = 2.6;
const CONNECTOR_DURATION_MIN = 1.4;
const CONNECTOR_DURATION_MAX = 2.4;
const CONNECTOR_DELAY_MAX = 0.7;

/**
 * Animated dotted arc between the You and Pancake mascots.
 *
 * Rebuilds the desktop "Founder ↔ Pancake" wire idea for mobile: the dashed
 * arc is the same shape it was as a static SVG, but small balls now travel
 * along it back and forth so the link reads as living. Direction alternates
 * per leg so traffic feels two-way instead of a conveyor belt.
 */
function PairConnector() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (reducedMotion) return;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const len = path.getTotalLength();
    const balls: SVGCircleElement[] = [];

    const runLeg = (circle: SVGCircleElement, forward: boolean) => {
      const proxy = { u: 0 };
      const duration =
        CONNECTOR_DURATION_MIN + Math.random() * (CONNECTOR_DURATION_MAX - CONNECTOR_DURATION_MIN);
      const delay = Math.random() * CONNECTOR_DELAY_MAX;
      const tick = () => {
        const t = Math.max(0, Math.min(1, proxy.u));
        const along = forward ? t : 1 - t;
        const pt = path.getPointAtLength(along * len);
        circle.setAttribute("cx", pt.x.toFixed(2));
        circle.setAttribute("cy", pt.y.toFixed(2));
      };
      gsap.fromTo(
        proxy,
        { u: 0 },
        {
          u: 1,
          duration,
          delay,
          ease: "sine.inOut",
          immediateRender: true,
          onUpdate: tick,
          onComplete: () => runLeg(circle, !forward),
        },
      );
      tick();
    };

    for (let i = 0; i < CONNECTOR_BALL_COUNT; i++) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute(
        "r",
        String(CONNECTOR_BALL_R_MIN + Math.random() * (CONNECTOR_BALL_R_MAX - CONNECTOR_BALL_R_MIN)),
      );
      c.setAttribute("class", "home-org-mobile-pair__ball");
      svg.appendChild(c);
      balls.push(c);
      runLeg(c, i % 2 === 0);
    }

    return () => {
      balls.forEach((b) => {
        gsap.killTweensOf(b);
        b.remove();
      });
    };
  }, [reducedMotion]);

  return (
    <svg
      ref={svgRef}
      className="home-org-mobile-pair__connector"
      viewBox={`0 0 ${CONNECTOR_VB_W} ${CONNECTOR_VB_H}`}
      aria-hidden
      focusable="false"
    >
      <path
        ref={pathRef}
        d={CONNECTOR_PATH_D}
        fill="none"
        stroke="var(--palette-chrome-70, #b6a4ad)"
        strokeWidth="2"
        strokeDasharray="1 8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Carousel slides: the four live squads + the static "Build your own" finale. */
const SLIDES: readonly { key: string; label: string }[] = [
  ...LIVE_INITIAL_DEPTS.map((d) => ({ key: d.surface, label: d.title })),
  { key: "build", label: "Build your own" },
];

export function HomeOrgDiagramMobile() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1); // second card (AI SEO) centered by default

  /**
   * Live row state — same shape as desktop. The hook drives all add /
   * remove / FLIP timing; we just render the markup it expects (each row
   * carries `data-org-live-row={row.id}` for the ticker to find / animate).
   */
  const [deptRows, setDeptRows] = useState(getInitialDeptMap);

  const { registerArticle, reducedMotion } = useOrgLiveTicker({
    scrollRootRef: rootRef,
    deptRows,
    setDeptRows,
    articleSelector: mobileArticleSelector,
  });

  // Track which dept card is most centered in the carousel.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let best = 0;
      let bestDist = Infinity;
      const cards = track.querySelectorAll<HTMLElement>(".home-org-mobile-card");
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActiveIndex(best);
    };
    track.addEventListener("scroll", update, { passive: true });
    // Center the second card (AI SEO) on mount — peek both ways, and the
    // build card stays the finale rather than the opener.
    requestAnimationFrame(() => {
      const cards = track.querySelectorAll<HTMLElement>(".home-org-mobile-card");
      const target = cards[1];
      if (target) {
        const offset = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
        track.scrollTo({ left: offset, behavior: "auto" });
      }
      update();
    });
    return () => track.removeEventListener("scroll", update);
  }, []);

  function scrollToIndex(i: number) {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>(".home-org-mobile-card");
    const target = cards[i];
    if (!target) return;
    const offset = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
    track.scrollTo({ left: offset, behavior: "smooth" });
  }

  return (
    <div ref={rootRef} className="home-org-mobile">
      {/* Mascot row — You purple person + Pancake monster + animated dotted connector. */}
      <div className="home-org-mobile-pair">
        <div className="home-org-mobile-mascot home-org-mobile-mascot--you">
          <div className="home-org-mobile-mascot__icon">
            <FounderAvatar />
          </div>
          <div className="home-org-mobile-mascot__chip">
            <p className="home-org-mobile-mascot__title">You</p>
            <p className="home-org-mobile-mascot__sub">The founder</p>
          </div>
        </div>

        <PairConnector />

        <div className="home-org-mobile-mascot home-org-mobile-mascot--pancake">
          <div className="home-org-mobile-mascot__icon">
            <Image src="/pancake-monster.png" alt="" width={108} height={108} />
          </div>
          <div className="home-org-mobile-mascot__chip">
            <p className="home-org-mobile-mascot__title">Pancake</p>
            <p className="home-org-mobile-mascot__sub">Your coworker</p>
          </div>
        </div>
      </div>

      {/* "The org" eyebrow removed per design feedback — the section H2
          ("Hire squads of agents that work autonomously") already labels the
          section, and the eyebrow read as redundant noise above the carousel. */}

      {/* Horizontal snap carousel — one dept card per viewport, with adjacent peeks. */}
      <div className="home-org-mobile-carousel">
        <div ref={trackRef} className="home-org-mobile-carousel__track">
          {LIVE_INITIAL_DEPTS.map((dept) => (
            <article
              key={dept.surface}
              ref={registerArticle(dept.surface)}
              className={`home-org-mobile-card home-org-mobile-card--${dept.surface}`}
            >
              <h3 className="home-org-mobile-card__title">{dept.title}</h3>
              {/* No aria-live: the row churn is decorative texture, not
                  information — announcing it would spam screen readers. */}
              <ul className="home-org-mobile-card__rows">
                {(reducedMotion
                  ? // Reduced motion: render the seeded set, no live mutations.
                    dept.rows.map((r, i) => ({
                      id: `seed-${dept.surface}-${i}`,
                      label: r.label,
                      phase: "active" as const,
                      baseDot: r.dot,
                    }))
                  : deptRows[dept.surface]
                ).map((row) => (
                  <li
                    key={row.id}
                    className="home-org-mobile-row"
                    data-org-live-row={row.id}
                  >
                    <span className={`home-org-mobile-row__dot ${DOT_CLASS[dotClassForRow(row)]}`} />
                    <span className="home-org-mobile-row__label">{row.label}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          {/* Static "Build your own" finale — no live rows, no registerArticle. */}
          <article className="home-org-mobile-card home-org-mobile-card--build">
            <h3 className="home-org-mobile-card__title">+ Build your own</h3>
            <p className="home-org-mobile-card__sub">Assemble any agents into a squad of your own.</p>
          </article>
        </div>

        {/* Dots indicator. */}
        <div className="home-org-mobile-dots" role="tablist" aria-label="Squads">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={slide.label}
              className={`home-org-mobile-dot ${i === activeIndex ? "home-org-mobile-dot--active" : ""}`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
