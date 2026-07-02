/**
 * Home — “Endless integrations” floating cloud (Figma `428:15019`) + callout copy (`428:15015`).
 *
 * Reproduces the static Figma artwork as a live, organic animation:
 *  - Each logo sits on a tilted **pancake** chip (ellipse + 3D-side, layered
 *    via two stacked SVG paths). No more perfect circles — chips track the
 *    pancake design system used elsewhere on the page.
 *  - Each chip is anchored to the central pancake monster by a dotted Bezier
 *    "tentacle". The tentacle is split into two segments: an *inner* run
 *    from monster→chip (full opacity) and an *outer* run from chip→tail
 *    (faded), so the tendril clearly continues past the logo.
 *  - A small pancake sits at every outer-tail tip, plus a handful of
 *    decorative pancake "berries" scattered through negative space — same
 *    set used in the Figma decoration layer, just tinted from the palette.
 *  - All wobble math runs on the GSAP shared ticker (one rAF loop), with
 *    deterministic per-element seeds so SSR/CSR agree.
 *
 * Coordinates are the Figma inner-container space (1786 × 900); the SVG
 * `viewBox` does the responsive scaling.
 */

"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { PancakeMonster } from "@/components/mascot/pancake-monster/PancakeMonster";
import { gsap } from "@/lib/gsap";
import { PANCAKE_TINTS } from "@/lib/pancake-palette";

const VB_W = 1786;
const VB_H = 900;
/** Tentacle anchor — pancake-monster centre in Figma container coords. */
const ANCHOR_X = 960;
const ANCHOR_Y = 435;

/**
 * Figma `428:15015` — callout in inner-container coords (1786×900).
 * `white-space: pre` + explicit `\n` = exactly 3 lines. Each time we narrow `w`,
 * add the same delta to `x` so the block slides right (right edge ~1758) and
 * the inner peach rail shrinks vs the longest line + padding.
 */
const INTEGRATIONS_CALLOUT_VB = { x: 1278, y: 48, w: 480 };
/** Figma `428:15015` — three-line stack (explicit breaks match comp). */
const INTEGRATIONS_CALLOUT_COPY = `Connect your tools. Your agents
read, write, ship, and sell through
them \u2014 like an employee would.`;

/* ----------------------------------------------------------------------- */
/* Pancake — inline SVG, parameterised colours, used for chips + decoration */
/* ----------------------------------------------------------------------- */

/**
 * Path data lifted directly from `public/pancake-svgs/angled-1.svg` (project
 * design system). Side path is the lighter "edge" of the 3D pancake, top
 * path is the darker upper surface — together they form the layered look.
 */
const PANCAKE_VIEWBOX = "0 0 49 48";
const PANCAKE_SIDE_D =
  "M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z";
const PANCAKE_TOP_D =
  "M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z";

/**
 * Decorative pancake palettes. Used for the small "berries" scattered through
 * negative space and the tail tips at the end of each tentacle. Convention:
 * `top` = darker visible upper surface; `side` = lighter underbelly peeking
 * at the lower edge — matches `pancake-svgs/angled-1.svg`.
 *
 * Brand hues come from the shared `PANCAKE_TINTS` (lib/pancake-palette.ts —
 * on-palette values from tokens.css) so the cloud pancakes match the hero and
 * closing-CTA decor exactly; previously this held local off-palette, muted
 * approximations. `cream` is a cloud-only accent with no tokens.css
 * counterpart, so it stays local.
 *
 * The chip backgrounds use external Figma ellipse SVGs (see `LOGOS[].chipSrc`),
 * NOT this layered pancake — chips are simple cream ellipses, not pancakes.
 */
const PANCAKE_PALETTE = {
  pink:   PANCAKE_TINTS.pink,
  purple: PANCAKE_TINTS.purple,
  orange: PANCAKE_TINTS.orange,
  yellow: PANCAKE_TINTS.yellow,
  cream:  { top: "#FFD7A8", side: "#FFE9C8" },
} as const;
type PancakePaletteName = keyof typeof PANCAKE_PALETTE;

/* ----------------------------------------------------------------------- */
/* Logo definitions                                                         */
/* ----------------------------------------------------------------------- */

type LogoDef = {
  id: string;
  src: string;
  alt: string;
  /** Chip centre in Figma coords. */
  cx: number;
  cy: number;
  /**
   * Chip ellipse asset (a Figma export — simple cream ellipse path with
   * `fill="var(--fill-0, #FFF7EC)"`). Sized to its native viewBox below.
   */
  chipSrc: string;
  /** Chip ellipse intrinsic dimensions (match the asset's viewBox). */
  chipW: number;
  chipH: number;
  /** Tilt (deg) applied around the chip centre — matches Figma per-chip rotations. */
  chipRotateDeg: number;
  /** Logo dimensions and any in-chip rotation. */
  logoW: number;
  logoH: number;
  logoRotateDeg?: number;
  /** Outer tail point in Figma coords — the tentacle continues from chip→tail past the logo. */
  tailX: number;
  tailY: number;
  /** Pancake at the tail tip — size + colour. */
  tailSize: number;
  tailPalette: PancakePaletteName;
  /** Outer-segment perpendicular curl (px) — sets which side the outer Bezier sweeps. */
  outerCurl: number;
};

const LOGOS: LogoDef[] = [
  // Gmail (Figma Ellipse 4 — un-rotated 172×169 cream ellipse).
  // Tail extended outward into the top-left corner; deeper outer curl so the
  // wire arcs more dramatically away from the monster.
  {
    id: "gmail", src: "/integrations/gmail.svg", alt: "Gmail",
    cx: 658, cy: 254,
    chipSrc: "/integrations/ellipse-gmail.svg", chipW: 172, chipH: 169, chipRotateDeg: 0,
    logoW: 96, logoH: 72, logoRotateDeg: -8.59,
    tailX: 140, tailY: 30, tailSize: 22, tailPalette: "orange", outerCurl: -130,
  },
  // GitHub (Ellipse 9 — 137×135, tilted 58.71° in Figma).
  {
    id: "github", src: "/integrations/github-fill.svg", alt: "GitHub",
    cx: 1085, cy: 172,
    chipSrc: "/integrations/ellipse-github.svg", chipW: 137.52, chipH: 135.29, chipRotateDeg: 58.71,
    logoW: 76, logoH: 75, logoRotateDeg: 6.63,
    tailX: 1430, tailY: -10, tailSize: 24, tailPalette: "yellow", outerCurl: 120,
  },
  // Claude (Ellipse 13 — 63×55, tilt -149.23°).
  {
    id: "claude", src: "/integrations/claude.svg", alt: "Claude",
    cx: 1576, cy: 303,
    chipSrc: "/integrations/ellipse-claude.svg", chipW: 63.27, chipH: 54.9, chipRotateDeg: -149.23,
    logoW: 36, logoH: 36,
    tailX: 1880, tailY: 200, tailSize: 16, tailPalette: "orange", outerCurl: -75,
  },
  // X (Ellipse 12 — 113×98, tilt -109.95°).
  {
    id: "x", src: "/integrations/x.svg", alt: "X",
    cx: 380, cy: 470,
    chipSrc: "/integrations/ellipse-x.svg", chipW: 113.65, chipH: 98.61, chipRotateDeg: -109.95,
    logoW: 60, logoH: 55,
    tailX: -10, tailY: 600, tailSize: 18, tailPalette: "pink", outerCurl: -110,
  },
  // LinkedIn (Ellipse 8 — 206×203, tilt 58.71°). Pushed further right so it
  // doesn't crowd the central pancake monster.
  {
    id: "linkedin", src: "", alt: "LinkedIn",
    cx: 1310, cy: 470,
    chipSrc: "/integrations/ellipse-linkedin.svg", chipW: 206.38, chipH: 203.03, chipRotateDeg: 58.71,
    logoW: 130, logoH: 130,
    tailX: 1820, tailY: 600, tailSize: 24, tailPalette: "orange", outerCurl: 110,
  },
  // Vercel (Ellipse 5 — same cream ellipse asset as Gmail; un-rotated 172×169).
  {
    id: "vercel", src: "/integrations/vercel.svg", alt: "Vercel",
    cx: 556, cy: 596,
    chipSrc: "/integrations/ellipse-gmail.svg", chipW: 172, chipH: 169, chipRotateDeg: 0,
    logoW: 64, logoH: 56,
    tailX: 160, tailY: 830, tailSize: 24, tailPalette: "yellow", outerCurl: -125,
  },
  // Slack (Ellipse 6 — 172×169, tilt 58.71°).
  {
    id: "slack", src: "/integrations/slack.svg", alt: "Slack",
    cx: 870, cy: 695,
    chipSrc: "/integrations/ellipse-slack.svg", chipW: 172.13, chipH: 169.34, chipRotateDeg: 58.71,
    logoW: 96, logoH: 96, logoRotateDeg: -9.15,
    tailX: 720, tailY: 940, tailSize: 28, tailPalette: "purple", outerCurl: 95,
  },
  // Notion (Ellipse 7 — 215×212, tilt 58.71°).
  {
    id: "notion", src: "/integrations/notion.svg", alt: "Notion",
    cx: 1242, cy: 720,
    chipSrc: "/integrations/ellipse-notion.svg", chipW: 215.57, chipH: 212.07, chipRotateDeg: 58.71,
    logoW: 132, logoH: 132, logoRotateDeg: 6.49,
    tailX: 1740, tailY: 880, tailSize: 20, tailPalette: "orange", outerCurl: 130,
  },
];

/* ----------------------------------------------------------------------- */
/* Per-element wobble seed                                                  */
/* ----------------------------------------------------------------------- */

type Wobble = {
  freqX: number; freqY: number;
  ampX: number;  ampY: number;
  phaseX: number; phaseY: number;
  /** Bezier control point wobble — independent of chip wobble so the rope undulates. */
  ctrlFreqA: number; ctrlAmpA: number; ctrlPhaseA: number;
  ctrlFreqP: number; ctrlAmpP: number; ctrlPhaseP: number;
  /** Outer-tail wobble (a bit larger than chip drift — tail tips drift further). */
  tailFreqX: number; tailFreqY: number;
  tailAmpX: number;  tailAmpY: number;
  tailPhaseX: number; tailPhaseY: number;
  /** Outer-segment Bezier control wobble. */
  outerCtrlFreq: number; outerCtrlAmp: number; outerCtrlPhase: number;
};

/**
 * Deterministic per-id wobble (stable string hash).
 *
 * Tuned for a livelier cloud:
 *  - Chip drift frequencies bumped ~30% so chips visibly move (not just sit).
 *  - Chip drift amplitudes nearly doubled — chips trace bigger orbits.
 *  - Inner-Bezier ctrlAmpA range widened so the wires snake more dramatically
 *    perpendicular to the anchor→chip line.
 *  - Outer-Bezier amplitude/freq bumped so the tail end of each tendril
 *    flicks visibly instead of holding a near-static curve.
 *  - Tail point amplitudes bumped so the small pancake at the tail tip
 *    drifts noticeably across its arc.
 */
function wobbleFor(id: string): Wobble {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const r = (mul: number) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return ((h >>> 0) / 0x1_0000_0000) * mul;
  };
  return {
    freqX: 0.26 + r(0.32),
    freqY: 0.24 + r(0.32),
    ampX:  22 + r(20),
    ampY:  20 + r(20),
    phaseX: r(Math.PI * 2),
    phaseY: r(Math.PI * 2),
    ctrlFreqA: 0.32 + r(0.36),
    ctrlAmpA:  110 + r(110),
    ctrlPhaseA: r(Math.PI * 2),
    ctrlFreqP: 0.22 + r(0.28),
    ctrlAmpP:  32 + r(42),
    ctrlPhaseP: r(Math.PI * 2),
    tailFreqX: 0.30 + r(0.32),
    tailFreqY: 0.28 + r(0.30),
    tailAmpX:  32 + r(26),
    tailAmpY:  28 + r(26),
    tailPhaseX: r(Math.PI * 2),
    tailPhaseY: r(Math.PI * 2),
    outerCtrlFreq: 0.28 + r(0.30),
    outerCtrlAmp:  90 + r(100),
    outerCtrlPhase: r(Math.PI * 2),
  };
}

/* ----------------------------------------------------------------------- */
/* Inline pancake — used as a primitive everywhere                         */
/* ----------------------------------------------------------------------- */

function PancakePaths({ palette }: { palette: PancakePaletteName }) {
  const p = PANCAKE_PALETTE[palette];
  return (
    <>
      <path d={PANCAKE_SIDE_D} fill={p.side} />
      <path d={PANCAKE_TOP_D} fill={p.top} />
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* Main component                                                           */
/* ----------------------------------------------------------------------- */

export function HomeIntegrationsCloud() {
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const chipRefs = useRef<Map<string, SVGGElement>>(new Map());
  const innerPathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const outerPathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const tailRefs = useRef<Map<string, SVGGElement>>(new Map());
  /** Slot the monster sits in — its CSS sets responsive size; we read that into px. */
  const monsterSlotRef = useRef<HTMLDivElement | null>(null);
  const [monsterSizePx, setMonsterSizePx] = useState(160);

  const wobbles = useMemo(() => {
    const m = new Map<string, Wobble>();
    for (const l of LOGOS) m.set(l.id, wobbleFor(l.id));
    return m;
  }, []);

  /**
   * Monster target — a smoothly eased random walk around the monster centre
   * instead of a hard chip-to-chip jump. Each "leg" picks a new random
   * offset and `getMonsterTarget` returns the eased lerp between current and
   * next every frame; the PancakeMonster morpher then interpolates its
   * orientation against that continuously-moving point. The leg picker also
   * sometimes returns the offset to (0, 0) — straight ahead — so the
   * monster pauses at neutral instead of always pulling toward an edge.
   */
  const targetMotionRef = useRef({
    /** Offset from monster centre, window-space px. */
    current: { x: 0, y: 0 },
    next: { x: 0, y: 0 },
    startedAt: 0,
    duration: 3000,
  });

  useEffect(() => {
    if (reducedMotion) return;
    const pickNewLeg = () => {
      const m = targetMotionRef.current;
      const now = performance.now();
      // Snapshot where we *are* right now so the next leg starts from the live point.
      const tNow = m.duration > 0 ? Math.min(1, (now - m.startedAt) / m.duration) : 1;
      const easedNow = tNow * tNow * (3 - 2 * tNow);
      m.current = {
        x: m.current.x + (m.next.x - m.current.x) * easedNow,
        y: m.current.y + (m.next.y - m.current.y) * easedNow,
      };
      // 30 % chance: return to centre (neutral). Otherwise pick a random
      // direction across the full 360° spectrum at a varying radius.
      if (Math.random() < 0.3) {
        m.next = { x: 0, y: 0 };
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = 220 + Math.random() * 280;
        m.next = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
      }
      m.startedAt = now;
      m.duration = 2200 + Math.random() * 2200;
    };
    pickNewLeg();
    const id = window.setInterval(pickNewLeg, 2800);
    return () => clearInterval(id);
  }, [reducedMotion]);

  /** Live eased target point in window coords. Called every frame — stays cheap. */
  const getMonsterTarget = useCallback(() => {
    const slot = monsterSlotRef.current;
    if (!slot) return null;
    const r = slot.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const m = targetMotionRef.current;
    const t = m.duration > 0 ? Math.min(1, (performance.now() - m.startedAt) / m.duration) : 1;
    const eased = t * t * (3 - 2 * t);
    return {
      x: cx + m.current.x + (m.next.x - m.current.x) * eased,
      y: cy + m.current.y + (m.next.y - m.current.y) * eased,
    };
  }, []);

  /** Track the monster slot's responsive size so the SVG renders sharp at any breakpoint. */
  useLayoutEffect(() => {
    const el = monsterSlotRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const apply = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setMonsterSizePx(w);
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const start = performance.now() / 1000;
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const t = performance.now() / 1000 - start;

      for (const logo of LOGOS) {
        const w = wobbles.get(logo.id)!;

        // Chip drift (its own tilt is baked into the SVG transform; we just translate)
        const dx = Math.sin(t * w.freqX * Math.PI + w.phaseX) * w.ampX;
        const dy = Math.sin(t * w.freqY * Math.PI + w.phaseY) * w.ampY;
        const tipX = logo.cx + dx;
        const tipY = logo.cy + dy;

        const chipEl = chipRefs.current.get(logo.id);
        if (chipEl) {
          // Outer `<g>` only translates — chip and logo rotations live on inner `<g>`s.
          chipEl.setAttribute(
            "transform",
            `translate(${tipX.toFixed(2)} ${tipY.toFixed(2)})`,
          );
        }

        // Inner tentacle — anchor → chip
        const inner = innerPathRefs.current.get(logo.id);
        if (inner) {
          const vx = tipX - ANCHOR_X;
          const vy = tipY - ANCHOR_Y;
          const len = Math.hypot(vx, vy) || 1;
          const nx = -vy / len;
          const ny = vx / len;
          const mx = (ANCHOR_X + tipX) / 2;
          const my = (ANCHOR_Y + tipY) / 2;
          const perp = Math.sin(t * w.ctrlFreqA * Math.PI + w.ctrlPhaseA) * w.ctrlAmpA;
          const along = Math.sin(t * w.ctrlFreqP * Math.PI + w.ctrlPhaseP) * w.ctrlAmpP;
          const cx = mx + nx * perp + (vx / len) * along;
          const cy = my + ny * perp + (vy / len) * along;
          inner.setAttribute("d", `M ${ANCHOR_X.toFixed(1)} ${ANCHOR_Y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)}`);
        }

        // Tail wobble + outer tentacle (chip → tail)
        const tdx = Math.sin(t * w.tailFreqX * Math.PI + w.tailPhaseX) * w.tailAmpX;
        const tdy = Math.sin(t * w.tailFreqY * Math.PI + w.tailPhaseY) * w.tailAmpY;
        const tlX = logo.tailX + tdx;
        const tlY = logo.tailY + tdy;

        const tailEl = tailRefs.current.get(logo.id);
        if (tailEl) {
          tailEl.setAttribute("transform", `translate(${tlX.toFixed(2)} ${tlY.toFixed(2)})`);
        }

        const outer = outerPathRefs.current.get(logo.id);
        if (outer) {
          // Mid-point between chip and tail with curl perpendicular to direction
          const vx2 = tlX - tipX;
          const vy2 = tlY - tipY;
          const len2 = Math.hypot(vx2, vy2) || 1;
          const nx2 = -vy2 / len2;
          const ny2 = vx2 / len2;
          const mx2 = (tipX + tlX) / 2;
          const my2 = (tipY + tlY) / 2;
          const curl = logo.outerCurl + Math.sin(t * w.outerCtrlFreq * Math.PI + w.outerCtrlPhase) * w.outerCtrlAmp;
          const cx2 = mx2 + nx2 * curl;
          const cy2 = my2 + ny2 * curl;
          outer.setAttribute("d", `M ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${cx2.toFixed(1)} ${cy2.toFixed(1)} ${tlX.toFixed(1)} ${tlY.toFixed(1)}`);
        }
      }

      // Monster handles its own animation (PancakeMonster + useCursorTracking with custom target).
    };

    gsap.ticker.add(tick);
    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
    };
  }, [reducedMotion, wobbles]);

  return (
    <div className="home-integrations-cloud" data-node-id="428:15019">
      {/* Viz wrapper — keeps the cloud SVG + interactive monster in their own
          aspect-ratio'd box. On desktop the wrapper fills the parent (parent
          enforces aspect); on mobile the parent is auto-height (flex column)
          and this wrapper enforces the 1786/900 cloud ratio. */}
      <div className="home-integrations-cloud__viz">
      <svg
        className="home-integrations-cloud__svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        focusable="false"
      >
        {/* Outer tentacle segments (chip → tail) — drawn first / under chips, faded */}
        {LOGOS.map((logo) => (
          <path
            key={`${logo.id}-outer`}
            ref={(el) => {
              if (el) outerPathRefs.current.set(logo.id, el);
              else outerPathRefs.current.delete(logo.id);
            }}
            className="home-integrations-cloud__tentacle home-integrations-cloud__tentacle--outer"
            d={`M ${logo.cx} ${logo.cy} Q ${(logo.cx + logo.tailX) / 2} ${(logo.cy + logo.tailY) / 2} ${logo.tailX} ${logo.tailY}`}
          />
        ))}

        {/* Inner tentacle segments (anchor → chip) — full opacity */}
        {LOGOS.map((logo) => (
          <path
            key={`${logo.id}-inner`}
            ref={(el) => {
              if (el) innerPathRefs.current.set(logo.id, el);
              else innerPathRefs.current.delete(logo.id);
            }}
            className="home-integrations-cloud__tentacle home-integrations-cloud__tentacle--inner"
            d={`M ${ANCHOR_X} ${ANCHOR_Y} Q ${(ANCHOR_X + logo.cx) / 2} ${(ANCHOR_Y + logo.cy) / 2} ${logo.cx} ${logo.cy}`}
          />
        ))}

        {/* Tail pancakes (small, decorative, sit at outer tentacle tips) */}
        {LOGOS.map((logo) => (
          <g
            key={`${logo.id}-tail`}
            ref={(el) => {
              if (el) tailRefs.current.set(logo.id, el);
              else tailRefs.current.delete(logo.id);
            }}
            transform={`translate(${logo.tailX} ${logo.tailY})`}
          >
            <g transform={`scale(${logo.tailSize / 49}) translate(${-49 / 2} ${-48 / 2})`}>
              <PancakePaths palette={logo.tailPalette} />
            </g>
          </g>
        ))}

        {/*
         * Logo chips. Each chip is composed of two stacked images at the same
         * `(cx, cy)` centre:
         *  1. The **chip ellipse SVG** (Figma export, cream `#FFF7EC`) rotated
         *     by `chipRotateDeg` — this gives the tilted-oval pancake silhouette.
         *  2. The **brand logo SVG** rotated by its own `logoRotateDeg` — drift
         *     wobble is applied to the outer `<g>` so chip + logo move together.
         */}
        {LOGOS.map((logo) => (
          <g
            key={logo.id}
            ref={(el) => {
              if (el) chipRefs.current.set(logo.id, el);
              else chipRefs.current.delete(logo.id);
            }}
            transform={`translate(${logo.cx} ${logo.cy})`}
            data-logo={logo.id}
          >
            {/* Chip ellipse — tilted */}
            <g transform={`rotate(${logo.chipRotateDeg})`}>
              <image
                href={logo.chipSrc}
                width={logo.chipW}
                height={logo.chipH}
                x={-logo.chipW / 2}
                y={-logo.chipH / 2}
                preserveAspectRatio="none"
              />
            </g>
            {/* Logo — independent rotation, sits on top */}
            <g transform={`rotate(${logo.logoRotateDeg ?? 0})`}>
              {logo.id === "linkedin" ? (
                <svg
                  viewBox="0 0 24 24"
                  width={logo.logoW}
                  height={logo.logoH}
                  x={-logo.logoW / 2}
                  y={-logo.logoH / 2}
                  overflow="visible"
                >
                  <rect width="24" height="24" rx="3" fill="#0A66C2" />
                  <path
                    fill="#FFFFFF"
                    d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45z"
                  />
                </svg>
              ) : (
                <image
                  href={logo.src}
                  width={logo.logoW}
                  height={logo.logoH}
                  x={-logo.logoW / 2}
                  y={-logo.logoH / 2}
                  preserveAspectRatio="xMidYMid meet"
                />
              )}
            </g>
          </g>
        ))}
      </svg>

      {/*
       * Interactive pancake monster. Same component as the hero, but instead of
       * tracking the real cursor it tracks the centre of whichever chip is the
       * current "target" — cycling through every ~2.5 s so the monster appears
       * to look around at the logos and try to eat them. Fork cursor is
       * disabled — this monster is ambient, the page cursor stays normal.
       */}
      <div
        ref={monsterSlotRef}
        className="home-integrations-cloud__monster"
        style={{
          left: `${(ANCHOR_X / VB_W) * 100}%`,
          top: `${(ANCHOR_Y / VB_H) * 100}%`,
        }}
        aria-hidden
      >
        <PancakeMonster
          size={monsterSizePx}
          pancakeColor="yellow"
          getTarget={getMonsterTarget}
          disableForkCursor
        />
      </div>
      </div>

      <p
        className="home-integrations-cloud__callout"
        data-node-id="428:15015"
        style={{
          left: `${(INTEGRATIONS_CALLOUT_VB.x / VB_W) * 100}%`,
          top: `${(INTEGRATIONS_CALLOUT_VB.y / VB_H) * 100}%`,
          width: `${(INTEGRATIONS_CALLOUT_VB.w / VB_W) * 100}%`,
        }}
      >
        {INTEGRATIONS_CALLOUT_COPY}
      </p>
    </div>
  );
}
