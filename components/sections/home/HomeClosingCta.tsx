"use client";

/**
 * Home — closing CTA finale (founder call 2026-07-03, full rebuild: the old
 * band was generic and "Make your company autonomous" drifted from the
 * hero's value prop; its three edge-bleed decor pancakes sat so far out
 * they never appeared in a screenshot of the center).
 *
 * Copy cashes the hero claim ("The AI coworker that does the work for you")
 * with the page's own verb: "Give Pancake its first job" — the ask is the
 * same action the use-case section promised. Button label matches the hero
 * and pricing CTAs verbatim (one primary verb top-to-bottom); the note
 * derives from `pricing.trial` instead of hardcoding figures.
 *
 * Visual bookends the hero: the eye-tracking mascot sits among two dotted
 * orbits (hero stroke recipe verbatim) with four two-tone satellite
 * pancakes placed parametrically ON the rings, gaze locked on the CTA
 * button — the character points at the ask, which also works on touch.
 * Entrance: play-once GSAP fly-in along each satellite's radial vector;
 * slow CSS floats after. Reduced-motion / no-JS render the assembled
 * state. One client component so the button ref feeding `getTarget` lives
 * beside the mascot (the HomeIntegrationsCloud split — client components
 * still SSR, no SEO cost). Stage geometry is percentage-based, so the
 * composition holds at any width without a mobile fork.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { PancakeMonster } from "@/components/mascot/pancake-monster/PancakeMonster";
import { pricing } from "@/lib/copy";
import { PANCAKE_TINTS } from "@/lib/pancake-palette";

/** One line at 64px — measures 683px against the 752px heading column
 *  (founder call); small screens wrap naturally on the max-width. */
const CLOSING_TITLE = "Give Pancake its first job";

/** Stage design space — all positions below are % of this box. */
const STAGE_W = 640;
const STAGE_H = 200;
/** Orbit center (the mascot's anchor). */
const ORBIT_CX = 320;
const ORBIT_CY = 134;

/**
 * Satellites ON the rings — centers computed parametrically at
 * (cx + rx·cosθ, cy + ry·sinθ) so they sit exactly on the dotted paths:
 * outer ring rx300 ry86 — purple θ=190°, pink θ=335°, yellow θ=285°;
 * inner ring rx210 ry60 — orange θ=160° (front layer).
 */
const SATELLITES = [
  { id: "purple", variant: "purple", size: 44, x: 24.6, y: 119.1, layer: "behind" },
  { id: "yellow", variant: "yellow", size: 28, x: 397.6, y: 50.9, layer: "behind" },
  { id: "pink", variant: "pink", size: 36, x: 591.9, y: 97.7, layer: "front" },
  { id: "orange", variant: "orange", size: 40, x: 122.7, y: 154.5, layer: "front" },
] as const;

const FLOAT_DELAYS = ["0s", "1.3s", "2.7s", "4s"];

/** Shared two-tone pancake silhouette (moved from HomeLandingBody — the
 *  old edge-bleed decors were this component's only other caller). */
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
  const rootRef = useRef<HTMLDivElement>(null);
  const monsterSlotRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  /* Mascot gaze target = the CTA button's live center. */
  const getCtaTarget = useCallback(() => {
    const el = ctaRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  /* PancakeMonster takes a px size — measure the CSS-clamped slot, the
     same pattern the integrations cloud uses. */
  const [monsterSize, setMonsterSize] = useState(132);
  useEffect(() => {
    const slot = monsterSlotRef.current;
    if (!slot) return;
    const measure = () => {
      const w = slot.getBoundingClientRect().width;
      if (w > 0) setMonsterSize(Math.round(w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(slot);
    return () => ro.disconnect();
  }, []);

  /* Play-once entrance — satellites fly in from 40px further out along
     their radial vector. Reduced-motion renders the final state. */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sats = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-sat-fly]"));
        if (!sats.length) return;
        const radial = (el: HTMLElement) => {
          const dx = Number(el.dataset.dx ?? 0);
          const dy = Number(el.dataset.dy ?? 0);
          const len = Math.hypot(dx, dy) || 1;
          return { x: (dx / len) * 40, y: (dy / len) * 40 };
        };
        gsap.from(sats, {
          x: (_i: number, el: HTMLElement) => radial(el).x,
          y: (_i: number, el: HTMLElement) => radial(el).y,
          scale: 0.4,
          opacity: 0,
          duration: 0.7,
          ease: "back.out(1.6)",
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        });
      });
    },
    { scope: rootRef },
  );

  const note = `${pricing.trial.days}-day free trial • ${pricing.currencySymbol}${pricing.trial.freeTokensDollars} in free credits • No credit card required`;

  return (
    <div ref={rootRef} className="home-closing">
      {/* Orbit stage — the hero's constellation, gathered around the ask. */}
      <div className="home-closing__stage" aria-hidden>
        <svg className="home-closing__orbits" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} preserveAspectRatio="none">
          <ellipse
            cx={ORBIT_CX}
            cy={ORBIT_CY}
            rx={300}
            ry={86}
            className="home-closing__orbit"
            opacity={0.5}
          />
          <ellipse
            cx={ORBIT_CX}
            cy={ORBIT_CY}
            rx={210}
            ry={60}
            className="home-closing__orbit"
            opacity={0.7}
          />
        </svg>
        {SATELLITES.map((s, i) => (
          <span
            key={s.id}
            className="home-closing-sat"
            data-layer={s.layer}
            style={
              {
                left: `${(s.x / STAGE_W) * 100}%`,
                top: `${(s.y / STAGE_H) * 100}%`,
                width: `${(s.size / STAGE_W) * 100}%`,
                "--sat-float-delay": FLOAT_DELAYS[i],
              } as CSSProperties
            }
          >
            <span
              className="home-closing-sat__fly"
              data-sat-fly
              data-dx={s.x - ORBIT_CX}
              data-dy={s.y - ORBIT_CY}
            >
              <span className="home-closing-sat__float">
                <DecorPancake variant={s.variant} className="home-closing-sat__pancake" />
              </span>
            </span>
          </span>
        ))}
        <div ref={monsterSlotRef} className="home-closing__monster">
          <PancakeMonster
            size={monsterSize}
            pancakeColor="yellow"
            getTarget={getCtaTarget}
            disableForkCursor
          />
        </div>
      </div>

      <h2
        id="home-landing-closing-heading"
        className="heading home-landing-section__closing-title whitespace-pre-line text-center"
      >
        {CLOSING_TITLE}
      </h2>
      <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
        Onboards in Slack. Comes back with finished work.
      </p>
      <div className="home-landing-closing-cta">
        <a
          ref={ctaRef}
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
