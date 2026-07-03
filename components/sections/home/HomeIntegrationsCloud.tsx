/**
 * Home — “Endless integrations” floating cloud (Figma `428:15019`).
 *
 * v4.5 "deep cloud" (founder ask: show ~10× the integrations while staying
 * cute and juicy). The original 8 single-chip tentacles became 16 CHAINS of
 * 2-5 chips — 50 logos, grouped by theme (dev flows out of GitHub/Vercel,
 * growth out of X/LinkedIn, money out of Stripe…). Founder rules: sizes are
 * DELIBERATELY non-monotone along a chain (the hero logo is often the
 * second link, not the first); only a handful of chains end on a pancake
 * berry — most run OFF-canvas through half-cut chips so the cloud reads as
 * continuing past the frame.
 *
 *  - Each logo sits on a tilted cream **blob chip** — ONE shared organic
 *    path (lifted from the original Figma ellipse export), scaled per node,
 *    so the "orbit" always fits its logo exactly at any size.
 *  - Chain segments are dotted Beziers recomputed every frame; opacity
 *    fades with depth (inner .7 → mid .5 → tail .32) so tendrils visibly
 *    dissolve past the last logo — the cloud reads as continuing forever.
 *  - A small pancake sits at every tail tip.
 *  - All wobble math runs on the GSAP shared ticker (one rAF loop) with
 *    deterministic per-element seeds so SSR/CSR agree. Wobble amplitude
 *    scales with chip size — satellites float gently, heroes drift wide.
 *  - Mobile (<1024px) hides depth ≥ 1 chips + chain segments and shows a
 *    direct head→tail "bridge" instead — same density as the original
 *    8-chip cloud in the zoomed 5/6 crop.
 *
 * Coordinates are the Figma inner-container space (1786 × 900); the SVG
 * `viewBox` does the responsive scaling.
 */

"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { PancakeMonster } from "@/components/mascot/pancake-monster/PancakeMonster";
import { gsap } from "@/lib/gsap";
import { PANCAKE_TINTS } from "@/lib/pancake-palette";

const VB_W = 1920;
const VB_H = 720;
/** Tentacle anchor — pancake-monster centre in Figma container coords. */
const ANCHOR_X = 960;
const ANCHOR_Y = 360;

/* ----------------------------------------------------------------------- */
/* Pancake — inline SVG, parameterised colours, used for tails + decoration */
/* ----------------------------------------------------------------------- */

const PANCAKE_SIDE_D =
  "M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z";
const PANCAKE_TOP_D =
  "M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z";

const PANCAKE_PALETTE = {
  pink:   PANCAKE_TINTS.pink,
  purple: PANCAKE_TINTS.purple,
  orange: PANCAKE_TINTS.orange,
  yellow: PANCAKE_TINTS.yellow,
  cream:  { top: "#FFD7A8", side: "#FFE9C8" },
} as const;
type PancakePaletteName = keyof typeof PANCAKE_PALETTE;

/**
 * Shared chip blob — the organic cream ellipse from the original Figma
 * export (`ellipse-gmail.svg`, 172.13 × 169.339). Inlined once and scaled
 * per chip so every logo's "orbit" is proportional to the logo itself.
 */
const BLOB_W = 172.13;
const BLOB_H = 169.339;
const BLOB_D =
  "M172.13 77.2048C172.13 125.026 134.869 169.339 87.3369 169.339C63.9016 169.339 38.4144 165.431 22.8941 150.144C6.93551 134.426 0 105.714 0 81.4702C0 54.3473 14.515 36.3508 33.9172 20.4742C48.7239 8.35805 66.7634 0 87.3369 0C134.869 0 172.13 29.3831 172.13 77.2048Z";
const BLOB_FILL = "#FFF7EC";

/* ----------------------------------------------------------------------- */
/* Tentacle definitions                                                     */
/* ----------------------------------------------------------------------- */

type NodeDef = {
  /** Doubles as the wobble seed and (unless `src` overrides) the icon file name. */
  slug: string;
  alt: string;
  /** Chip centre in Figma coords. */
  cx: number;
  cy: number;
  /** Chip blob width in viewBox units (height follows the blob's own ratio). */
  chip: number;
  /** Optional explicit icon path (defaults to `/integrations/<slug>.svg`). */
  src?: string;
  /** Logo width = chip × logoScale (default 0.56 — matches the original chips). */
  logoScale?: number;
  logoRotateDeg?: number;
  /** Inline-rendered logo (LinkedIn kept from the original implementation). */
  inline?: "linkedin";
  /** Kept in the mobile crop (big recognizable chips only, wired straight
   *  to the monster — chains don't survive the 1.4× zoomed crop). */
  mobile?: boolean;
};

type TentacleDef = {
  id: string;
  /** Ordered from the monster outward — index 0 is the "head" (kept on mobile). */
  nodes: NodeDef[];
  /** Chain ending A: a pancake berry (kept for a handful of chains). */
  tail?: { x: number; y: number; size: number; palette: PancakePaletteName };
  /** Chain ending B: a bare exit point, usually OFF-canvas — the last faded
   *  segment runs out of the image so the cloud reads as endless.
   *  Neither set → the chain simply ends on its last logo. */
  exit?: { x: number; y: number };
};

/**
 * Hand-authored chains — full 1920×720 stage, monster dead-center at
 * (960, 360). Sizes are deliberately non-monotone along a chain.
 * The 720 height replaced 900 (founder: the section must fit one screen and
 * logos must never get cropped) — x positions and chip sizes are untouched,
 * only vertical spacing compressed (y' ≈ 360 + (y − 435) × 0.7 plus manual
 * de-collision nudges); every chip clears the top/bottom edges even at full
 * wobble amplitude, so no dynamic viewport cropping is needed.
 */
const TENTACLES: TentacleDef[] = [
  {
    // Google-suite — small Calendar sits close to the monster (founder: the
    // ring around Pancake was empty), hero Gmail is the SECOND link.
    id: "gmail",
    nodes: [
      { slug: "googlecalendar", alt: "Google Calendar", cx: 790, cy: 286, chip: 64 },
      { slug: "gmail", alt: "Gmail", cx: 560, cy: 196, chip: 130, mobile: true },
      { slug: "googledrive", alt: "Google Drive", cx: 400, cy: 138, chip: 68 },
      { slug: "producthunt", alt: "Product Hunt", cx: 268, cy: 99, chip: 52 },
      { slug: "loom", alt: "Loom", cx: 150, cy: 67, chip: 46 },
    ],
    exit: { x: 30, y: -40 },
  },
  {
    id: "github",
    nodes: [
      { slug: "linear", alt: "Linear", cx: 1060, cy: 250, chip: 54 },
      { slug: "github", alt: "GitHub", src: "/integrations/github-fill.svg", cx: 1085, cy: 150, chip: 120, logoRotateDeg: 6.63, mobile: true },
      { slug: "youtube", alt: "YouTube", cx: 1215, cy: 100, chip: 78, mobile: true },
    ],
    tail: { x: 1320, y: 26, size: 16, palette: "yellow" },
  },
  {
    id: "ai",
    nodes: [
      { slug: "openai", alt: "OpenAI", cx: 1265, cy: 322, chip: 70, mobile: true },
      { slug: "claude", alt: "Claude", cx: 1505, cy: 286, chip: 92 },
      { slug: "perplexity", alt: "Perplexity", cx: 1680, cy: 243, chip: 54 },
    ],
    exit: { x: 1830, y: 206 },
  },
  {
    id: "x",
    nodes: [
      { slug: "x", alt: "X", cx: 380, cy: 384, chip: 100, mobile: true },
      { slug: "reddit", alt: "Reddit", cx: 240, cy: 410, chip: 84, mobile: true },
      { slug: "tiktok", alt: "TikTok", cx: 132, cy: 445, chip: 56 },
    ],
    tail: { x: 28, y: 474, size: 18, palette: "pink" },
  },
  {
    id: "linkedin",
    nodes: [
      { slug: "hubspot", alt: "HubSpot", cx: 1150, cy: 420, chip: 60 },
      { slug: "linkedin", alt: "LinkedIn", inline: "linkedin", cx: 1362, cy: 400, chip: 140, logoScale: 0.63, mobile: true },
      { slug: "salesforce", alt: "Salesforce", cx: 1565, cy: 444, chip: 78 },
      { slug: "apollo", alt: "Apollo", cx: 1715, cy: 484, chip: 52 },
    ],
    exit: { x: 1890, y: 521 },
  },
  {
    id: "vercel",
    nodes: [
      { slug: "supabase", alt: "Supabase", cx: 770, cy: 451, chip: 58 },
      { slug: "vercel", alt: "Vercel", cx: 480, cy: 505, chip: 120, logoScale: 0.4, mobile: true },
      { slug: "sentry", alt: "Sentry", cx: 330, cy: 562, chip: 74 },
      { slug: "cloudflare", alt: "Cloudflare", cx: 208, cy: 610, chip: 56 },
      { slug: "aws", alt: "AWS", cx: 108, cy: 650, chip: 48 },
    ],
    exit: { x: 0, y: 735 },
  },
  {
    id: "slack",
    nodes: [
      { slug: "slack", alt: "Slack", cx: 870, cy: 542, chip: 130, logoRotateDeg: -9.15, mobile: true },
      { slug: "discord", alt: "Discord", cx: 770, cy: 634, chip: 80, mobile: true },
      { slug: "zapier", alt: "Zapier", cx: 700, cy: 680, chip: 56 },
    ],
    exit: { x: 660, y: 760 },
  },
  {
    id: "notion",
    nodes: [
      { slug: "notion", alt: "Notion", cx: 1242, cy: 560, chip: 140, logoRotateDeg: 6.49, mobile: true },
      { slug: "airtable", alt: "Airtable", cx: 1425, cy: 608, chip: 76, mobile: true },
      { slug: "asana", alt: "Asana", cx: 1555, cy: 644, chip: 60 },
      { slug: "trello", alt: "Trello", cx: 1695, cy: 672, chip: 50 },
    ],
    tail: { x: 1790, y: 691, size: 16, palette: "orange" },
  },
  {
    id: "stripe",
    nodes: [
      { slug: "stripe", alt: "Stripe", cx: 855, cy: 150, chip: 100, mobile: true },
      { slug: "paypal", alt: "PayPal", cx: 770, cy: 84, chip: 64 },
      { slug: "quickbooks", alt: "QuickBooks", cx: 690, cy: 44, chip: 54 },
    ],
    exit: { x: 655, y: -40 },
  },
  {
    id: "figma",
    nodes: [
      { slug: "figma", alt: "Figma", cx: 300, cy: 266, chip: 90, mobile: true },
      { slug: "canva", alt: "Canva", cx: 185, cy: 232, chip: 64 },
      { slug: "webflow", alt: "Webflow", cx: 92, cy: 202, chip: 54 },
    ],
    tail: { x: 15, y: 180, size: 14, palette: "purple" },
  },
  {
    id: "shopify",
    nodes: [
      { slug: "shopify", alt: "Shopify", cx: 1062, cy: 608, chip: 92, mobile: true },
      { slug: "mailchimp", alt: "Mailchimp", cx: 1150, cy: 668, chip: 60 },
      { slug: "intercom", alt: "Intercom", cx: 1235, cy: 682, chip: 52 },
    ],
    exit: { x: 1310, y: 745 },
  },
  {
    id: "meta",
    nodes: [
      { slug: "meta", alt: "Meta Ads", cx: 200, cy: 315, chip: 80, mobile: true },
      { slug: "googleads", alt: "Google Ads", cx: 112, cy: 355, chip: 58 },
      { slug: "googleanalytics", alt: "Google Analytics", cx: 40, cy: 374, chip: 50 },
    ],
    exit: { x: -60, y: 392 },
  },
  {
    id: "instagram",
    nodes: [
      { slug: "instagram", alt: "Instagram", cx: 1148, cy: 248, chip: 78, mobile: true },
      { slug: "calendly", alt: "Calendly", cx: 1258, cy: 193, chip: 50 },
    ],
    tail: { x: 1310, y: 152, size: 14, palette: "pink" },
  },
  {
    // Ops — fills the empty top-right box (founder note): staggered radii
    // with hero Jira mid-chain, exits through the corner.
    id: "ops",
    nodes: [
      { slug: "zendesk", alt: "Zendesk", cx: 1385, cy: 213, chip: 52 },
      { slug: "jira", alt: "Jira", cx: 1560, cy: 140, chip: 96 },
      { slug: "telegram", alt: "Telegram", cx: 1735, cy: 96, chip: 58 },
    ],
    exit: { x: 1885, y: -30 },
  },
  {
    // Automation — a short chain that just ends on n8n, filling the bare
    // stretch between the monster and the X/Gmail chains (founder note).
    id: "automation",
    nodes: [
      { slug: "docker", alt: "Docker", cx: 660, cy: 325, chip: 54 },
      { slug: "n8n", alt: "n8n", cx: 520, cy: 355, chip: 48 },
    ],
  },
  {
    // Analytics — starts right by the monster and GROWS outward (founder:
    // no bare anchor runs with the logos bunched at the tip).
    id: "analytics",
    nodes: [
      { slug: "mixpanel", alt: "Mixpanel", cx: 1225, cy: 448, chip: 50 },
      { slug: "googlesheets", alt: "Google Sheets", cx: 1445, cy: 518, chip: 56 },
      { slug: "posthog", alt: "PostHog", cx: 1610, cy: 542, chip: 74 },
    ],
    exit: { x: 1790, y: 570 },
  },
  {
    // Comms — starts right next to the monster and just ENDS on WhatsApp
    // (founder: not every chain terminates with a pancake or an exit).
    id: "comms",
    nodes: [
      { slug: "zoom", alt: "Zoom", cx: 1038, cy: 482, chip: 58 },
      { slug: "whatsapp", alt: "WhatsApp", cx: 1130, cy: 532, chip: 52 },
    ],
  },
  {
    // Workspace — ClickUp anchors the chain near the monster so the long
    // climb to Miro/Dropbox isn't a bare wire with a tip cluster.
    id: "workspace",
    nodes: [
      { slug: "clickup", alt: "ClickUp", cx: 968, cy: 224, chip: 48 },
      { slug: "miro", alt: "Miro", cx: 990, cy: 115, chip: 58 },
      { slug: "dropbox", alt: "Dropbox", cx: 1040, cy: 64, chip: 50 },
    ],
    exit: { x: 1075, y: -40 },
  },
];

/** Flat list — handy for building refs/wobbles once. */
const ALL_NODES: NodeDef[] = TENTACLES.flatMap((t) => t.nodes);

/* ----------------------------------------------------------------------- */
/* Per-element wobble seed                                                  */
/* ----------------------------------------------------------------------- */

type Wobble = {
  freqX: number; freqY: number;
  ampX: number;  ampY: number;
  phaseX: number; phaseY: number;
  /** Segment control-point wobble — independent of chip wobble so ropes undulate. */
  ctrlFreqA: number; ctrlAmpA: number; ctrlPhaseA: number;
  /** Resting perpendicular curl for the segment ARRIVING at this element. */
  restCurl: number;
  /** Chip tilt — deterministic, replaces the per-chip Figma rotations. */
  tiltDeg: number;
};

/** Deterministic per-id wobble (stable string hash) — SSR/CSR agree. */
function wobbleFor(id: string): Wobble {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const r = (mul: number) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return ((h >>> 0) / 0x1_0000_0000) * mul;
  };
  return {
    // Frequencies ~2× the original — the founder read the slow drift as
    // "lancinant, mou"; amplitudes trimmed so the faster motion stays cute.
    freqX: 0.52 + r(0.42),
    freqY: 0.5 + r(0.4),
    ampX:  14 + r(12),
    ampY:  13 + r(11),
    phaseX: r(Math.PI * 2),
    phaseY: r(Math.PI * 2),
    ctrlFreqA: 0.55 + r(0.45),
    ctrlAmpA:  80 + r(70),
    ctrlPhaseA: r(Math.PI * 2),
    restCurl: r(160) - 80,
    tiltDeg: r(120) - 60,
  };
}

/** Chip-size wobble damping — satellites float gently, heroes drift wide. */
function ampScaleFor(chip: number): number {
  return Math.max(0.4, Math.min(1, chip / 172));
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
  /** Chain segments keyed `${tentacleId}:${segmentIndex}` (0 = anchor→head). */
  const segRefs = useRef<Map<string, SVGPathElement>>(new Map());
  /** Mobile-only direct anchor→chip wires, keyed by node slug. */
  const mobileWireRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const tailRefs = useRef<Map<string, SVGGElement>>(new Map());
  const monsterSlotRef = useRef<HTMLDivElement | null>(null);
  const [monsterSizePx, setMonsterSizePx] = useState(160);

  const wobbles = useMemo(() => {
    const m = new Map<string, Wobble>();
    for (const n of ALL_NODES) m.set(n.slug, wobbleFor(n.slug));
    for (const t of TENTACLES) m.set(`${t.id}-tail`, wobbleFor(`${t.id}-tail`));
    return m;
  }, []);

  /**
   * Monster target — a smoothly eased random walk around the monster centre.
   * (Unchanged from the 8-logo version.)
   */
  const targetMotionRef = useRef({
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
      const tNow = m.duration > 0 ? Math.min(1, (now - m.startedAt) / m.duration) : 1;
      const easedNow = tNow * tNow * (3 - 2 * tNow);
      m.current = {
        x: m.current.x + (m.next.x - m.current.x) * easedNow,
        y: m.current.y + (m.next.y - m.current.y) * easedNow,
      };
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

    /** Quadratic segment `d` between two live points with a perpendicular curl. */
    const segD = (x1: number, y1: number, x2: number, y2: number, curl: number) => {
      const vx = x2 - x1;
      const vy = y2 - y1;
      const len = Math.hypot(vx, vy) || 1;
      // Curl is capped by segment length so short satellite links stay tidy.
      const c = Math.max(-len * 0.42, Math.min(len * 0.42, curl));
      const cx = (x1 + x2) / 2 + (-vy / len) * c;
      const cy = (y1 + y2) / 2 + (vx / len) * c;
      return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    };

    const tick = () => {
      if (disposed) return;
      const t = performance.now() / 1000 - start;

      for (const tent of TENTACLES) {
        // 1. Wobbled positions for every node + the tail.
        const pts: { x: number; y: number }[] = [{ x: ANCHOR_X, y: ANCHOR_Y }];
        for (const node of tent.nodes) {
          const w = wobbles.get(node.slug)!;
          const s = ampScaleFor(node.chip);
          const x = node.cx + Math.sin(t * w.freqX * Math.PI + w.phaseX) * w.ampX * s;
          const y = node.cy + Math.sin(t * w.freqY * Math.PI + w.phaseY) * w.ampY * s;
          pts.push({ x, y });
          const chipEl = chipRefs.current.get(node.slug);
          if (chipEl) chipEl.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
          const mWire = mobileWireRefs.current.get(node.slug);
          if (mWire) {
            const curl = w.restCurl + Math.sin(t * w.ctrlFreqA * Math.PI + w.ctrlPhaseA) * w.ctrlAmpA * 0.5;
            mWire.setAttribute("d", segD(ANCHOR_X, ANCHOR_Y, x, y, curl));
          }
        }
        const end = tent.tail ?? tent.exit;
        if (end) {
          const tw = wobbles.get(`${tent.id}-tail`)!;
          const tailPt = {
            x: end.x + Math.sin(t * tw.freqX * Math.PI + tw.phaseX) * tw.ampX * 1.3,
            y: end.y + Math.sin(t * tw.freqY * Math.PI + tw.phaseY) * tw.ampY * 1.3,
          };
          pts.push(tailPt);
          const tailEl = tailRefs.current.get(tent.id);
          if (tailEl) tailEl.setAttribute("transform", `translate(${tailPt.x.toFixed(2)} ${tailPt.y.toFixed(2)})`);
        }

        // 2. Chain segments — curl = per-arrival resting curl + live wobble.
        for (let i = 0; i < pts.length - 1; i++) {
          const seg = segRefs.current.get(`${tent.id}:${i}`);
          if (!seg) continue;
          const arriveId = i < tent.nodes.length ? tent.nodes[i].slug : `${tent.id}-tail`;
          const w = wobbles.get(arriveId)!;
          const curl = w.restCurl + Math.sin(t * w.ctrlFreqA * Math.PI + w.ctrlPhaseA) * w.ctrlAmpA * 0.5;
          seg.setAttribute("d", segD(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, curl));
        }

      }
    };

    gsap.ticker.add(tick);
    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
    };
  }, [reducedMotion, wobbles]);

  /** Static segment d for SSR/no-JS/reduced-motion (straight midpoint quadratic). */
  const staticSegD = (x1: number, y1: number, x2: number, y2: number) =>
    `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2} ${x2} ${y2}`;

  return (
    <div className="home-integrations-cloud" data-node-id="428:15019">
      <div className="home-integrations-cloud__viz">
      {/* `slice`: on desktop the container ratio matches the viewBox so this
          equals `meet`; on mobile the shorter 9/7 box crops the SIDES to a
          ~1150-unit window — a natural zoom with no transform hacks. */}
      <svg
        className="home-integrations-cloud__svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        focusable="false"
      >
        {/* Chain segments — depth-faded (inner .7 → mid .5 → tail .32). */}
        {TENTACLES.map((tent) => {
          const pts = [
            { x: ANCHOR_X, y: ANCHOR_Y },
            ...tent.nodes.map((n) => ({ x: n.cx, y: n.cy })),
            ...(tent.tail ?? tent.exit ? [{ x: (tent.tail ?? tent.exit)!.x, y: (tent.tail ?? tent.exit)!.y }] : []),
          ];
          return pts.slice(0, -1).map((p, i) => {
            const q = pts[i + 1];
            const depthClass =
              i === 0
                ? "home-integrations-cloud__tentacle--inner"
                : i === pts.length - 2
                  ? "home-integrations-cloud__tentacle--outer"
                  : "home-integrations-cloud__tentacle--mid";
            return (
              <path
                key={`${tent.id}-seg-${i}`}
                ref={(el) => {
                  if (el) segRefs.current.set(`${tent.id}:${i}`, el);
                  else segRefs.current.delete(`${tent.id}:${i}`);
                }}
                className={`home-integrations-cloud__tentacle ${depthClass}`}
                data-seg-depth={i}
                d={staticSegD(p.x, p.y, q.x, q.y)}
              />
            );
          });
        })}

        {/* Mobile-only wires: each kept chip connects straight to the monster
            (chains don't survive the zoomed mobile crop). */}
        {ALL_NODES.filter((n) => n.mobile).map((node) => (
          <path
            key={`${node.slug}-mwire`}
            ref={(el) => {
              if (el) mobileWireRefs.current.set(node.slug, el);
              else mobileWireRefs.current.delete(node.slug);
            }}
            className="home-integrations-cloud__tentacle home-integrations-cloud__tentacle--inner home-integrations-cloud__tentacle--mobile"
            d={staticSegD(ANCHOR_X, ANCHOR_Y, node.cx, node.cy)}
          />
        ))}

        {/* Tail pancakes — only chains that end INSIDE the frame get a berry;
            the rest just run off-canvas (founder: not everything terminates). */}
        {TENTACLES.filter((tent) => tent.tail).map((tent) => (
          <g
            key={`${tent.id}-tail`}
            ref={(el) => {
              if (el) tailRefs.current.set(tent.id, el);
              else tailRefs.current.delete(tent.id);
            }}
            transform={`translate(${tent.tail!.x} ${tent.tail!.y})`}
            data-tail
          >
            <g transform={`scale(${tent.tail!.size / 49}) translate(${-49 / 2} ${-48 / 2})`}>
              <PancakePaths palette={tent.tail!.palette} />
            </g>
          </g>
        ))}

        {/*
         * Logo chips — shared blob path scaled per node (the orbit always
         * fits its logo), deterministic tilt, logo on top. Painted after
         * all segments so ropes pass underneath.
         */}
        {TENTACLES.map((tent) =>
          tent.nodes.map((node, depth) => {
            const w = wobbles.get(node.slug)!;
            const logoW = node.chip * (node.logoScale ?? (node.chip < 70 ? 0.62 : 0.56));
            return (
              <g
                key={node.slug}
                ref={(el) => {
                  if (el) chipRefs.current.set(node.slug, el);
                  else chipRefs.current.delete(node.slug);
                }}
                transform={`translate(${node.cx} ${node.cy})`}
                data-logo={node.slug}
                data-depth={depth}
                data-mobile={node.mobile ? "1" : "0"}
              >
                <g transform={`rotate(${w.tiltDeg})`}>
                  <g
                    transform={`scale(${node.chip / BLOB_W}) translate(${-BLOB_W / 2} ${-BLOB_H / 2})`}
                  >
                    <path d={BLOB_D} fill={BLOB_FILL} />
                  </g>
                </g>
                <g transform={`rotate(${node.logoRotateDeg ?? 0})`}>
                  {node.inline === "linkedin" ? (
                    <svg
                      viewBox="0 0 24 24"
                      width={logoW}
                      height={logoW}
                      x={-logoW / 2}
                      y={-logoW / 2}
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
                      href={node.src ?? `/integrations/${node.slug}.svg`}
                      width={logoW}
                      height={logoW}
                      x={-logoW / 2}
                      y={-logoW / 2}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  )}
                </g>
              </g>
            );
          }),
        )}
      </svg>

      {/* Interactive pancake monster — unchanged from the 8-logo version. */}
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

    </div>
  );
}
