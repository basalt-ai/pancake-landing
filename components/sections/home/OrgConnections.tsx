"use client";

/**
 * Org diagram wires — squads revamp.
 * • Nine elements: You, Pancake (hub for squads + chip for founder wire), and all 7 squad cards
 *   (Posthog, Meta Ads, Outreach, AI SEO, GitHub Triage, Google Ads, Reddit — outer two bleed
 *   past the band edges as blurred teasers).
 * • Squad wires are hand-authored cubic béziers DIRECTLY in stage space (1136×706 viewBox, no group
 *   transforms) — each leaves the monster's underside and enters its squad card top-center with
 *   vertical tangents (`M hx hy C cx my, ex my, ex ey`, my ≈ midpoint). The `d` strings are plain
 *   stage numbers; tune them live in devtools. (The old Figma-export wires carried ~80 lines of
 *   frame/rotation transform plumbing that existed only to replay Figma's coordinate system.)
 * • Founder↔chip wire keeps its original Figma transform — it is independent of squad count.
 * • Several balls run only on founder↔chip (same leg tween + respawn you/pancake); hub traffic uses squad legs only.
 * • Duration is random and scaled by path length so short founder↔chip legs don't read slower than long squad wires.
 *   Stroke-free trail dots.
 */

import { useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const SVG_NS = "http://www.w3.org/2000/svg";

type OrgDeptWire = { id: string; d: string };

/**
 * Hub exits fan across the monster's underside (monster box: 608,0 → 736,128).
 * Each wire = hub departure → horizontal "bus lane" → vertical drop onto its
 * card. Bus lanes are NESTED per side — the farther the target, the HIGHER
 * its lane (188 / 210 / 232, ≥22px apart) — so a nearer wire's vertical drop
 * can never slice through a farther wire's lane (founder: dirty crossings on
 * both flanks). Departure order matches target order, so the descents from
 * the hub don't cross either. Outer two wires end past the stage edges — the
 * band mask fades them out.
 */
const ORG_DEPT_WIRES: readonly OrgDeptWire[] = [
  { id: "wire-posthog", d: "M630 127C533 188 -176 188 -176 306" },
  { id: "wire-meta", d: "M641 129C573 210 72 210 72 290" },
  { id: "wire-outreach", d: "M652 131C612 232 320 232 320 326" },
  { id: "wire-seo", d: "M664 132C652 199 568 199 568 266" },
  { id: "wire-triage", d: "M676 131C693 232 816 232 816 294" },
  { id: "wire-ads", d: "M688 129C733 210 1064 210 1064 330" },
  { id: "wire-reddit", d: "M700 127C773 188 1312 188 1312 302" },
];

type OrgWireFrame = { x: number; y: number; w: number; h: number };

/** Founder↔Pancake wire — original Figma vector (rotated-inner transform preserved). */
const ORG_WIRE_FOUNDER_PANCAKE = {
  dataNodeId: "428:14936",
  vbW: 18.134,
  vbH: 121.501,
  d: "M6.00034 1.50035C22.0003 35.5004 19.5003 83.0004 1.50034 120",
  frame: { x: 492.5, y: 21.87, w: 118.5, h: 15.135 } as OrgWireFrame,
};

const FOUNDER_WIRE_ID = ORG_WIRE_FOUNDER_PANCAKE.dataNodeId;

/** Pancake *chip* end of the founder wire (stage space) — distinct from hub used for squad wires. */
const FOUNDER_CHIP_STAGE = { x: 862, y: 36 };

/** All wire ids that carry ball traffic (squads + human↔Pancake). */
const ORG_WIRE_IDS_WITH_BALLS: readonly string[] = [
  ...ORG_DEPT_WIRES.map((w) => w.id),
  FOUNDER_WIRE_ID,
];

function founderWireGroupTransform(): string {
  const { frame, vbW, vbH } = ORG_WIRE_FOUNDER_PANCAKE;
  const innerW = 15.135;
  const innerH = 118.5;
  const sx = innerW / vbW;
  const sy = innerH / vbH;
  const cx = frame.x + frame.w / 2;
  const cy = frame.y + frame.h / 2;
  return `translate(${cx} ${cy}) rotate(-90) translate(${-innerW / 2} ${-innerH / 2}) scale(${sx} ${sy})`;
}

/**
 * Reduced-motion fallback — static balls at fixed fractions of each wire's
 * length (computed, not hardcoded stage coords, so they survive path tweaks).
 * Outer wires get one ball, the two inner ones two, founder wire one.
 */
const REDUCED_FALLBACK_FRACTIONS: Record<string, readonly number[]> = {
  "wire-posthog": [0.35],
  "wire-meta": [0.3, 0.7],
  "wire-outreach": [0.3, 0.7],
  "wire-seo": [0.4],
  "wire-triage": [0.3, 0.7],
  "wire-ads": [0.35, 0.75],
  "wire-reddit": [0.35],
  [FOUNDER_WIRE_ID]: [0.5],
};

const BALL_R_MIN = 3.2;
const BALL_R_MAX = 7.8;
/** Hub/squad legs only (Pancake ↔ seven squad cards). ~5 of 7 wires are on
 *  screen at typical widths, so 8–11 total ≈ the shipped 4-card visible
 *  density; balls bound for off-screen cards fading at the mask edge read as
 *  life beyond the fold. */
const TOTAL_BALL_MIN = 8;
const TOTAL_BALL_MAX = 11;
/** Departure weight for `you` (<1): only one outgoing leg (→chip), so uniform anchors over-count you→chip. */
const DEPARTURE_WEIGHT_YOU = 0.5;
/** When leaving Pancake, chance to pick the founder↔chip leg if squad legs also exist (balances chip↦you vs you↦chip). */
const PANCAKE_FOUNDER_LEG_PROB = 0.5;
/** Balls that only use founder↔chip legs (same u 0→1 + respawn as runBallLeg); always >1 on that wire. */
const FOUNDER_BALL_MIN = 2;
const FOUNDER_BALL_MAX = 4;
/** One-way leg duration (s) before length scaling; clamped after scale. */
const DURATION_MIN = 1.1;
const DURATION_MAX = 2.85;
/** Path length in path user units above which duration is not shortened (squad wires). */
const DURATION_REF_PATH_LEN = 300;
const DURATION_FLOOR_AFTER_SCALE = 0.48;
const LEG_DELAY_MAX = 0.35;

const EASE_POOL = ["none", "power1.inOut", "power2.inOut", "sine.inOut", "power1.out", "power2.out"] as const;

/** Diagram centres in stage / viewBox space (1136×706) — nearest path end picks semantic node. */
const ANCHOR_IDS = ["you", "pancake", "posthog", "meta", "outreach", "seo", "triage", "ads", "reddit"] as const;
type AnchorId = (typeof ANCHOR_IDS)[number];

const ANCHORS: Record<AnchorId, { x: number; y: number }> = {
  you: { x: 263, y: 98 },
  pancake: { x: 672, y: 88 },
  posthog: { x: -176, y: 460 },
  meta: { x: 72, y: 444 },
  outreach: { x: 320, y: 480 },
  seo: { x: 568, y: 420 },
  triage: { x: 816, y: 448 },
  ads: { x: 1064, y: 484 },
  reddit: { x: 1312, y: 456 },
};

type DirectedLeg = {
  wireId: string;
  path: SVGPathElement;
  ballRoot: SVGGElement;
  forward: boolean;
  from: AnchorId;
  to: AnchorId;
};

function readDashPatternFromDom(path: SVGPathElement): string {
  return getComputedStyle(path).strokeDasharray || "1 12";
}

function stagePointToPathLocal(path: SVGPathElement, root: SVGSVGElement, x: number, y: number): { x: number; y: number } {
  const p = root.createSVGPoint();
  p.x = x;
  p.y = y;
  const pathCtm = path.getCTM();
  const rootCtm = root.getCTM();
  if (!pathCtm || !rootCtm) return { x, y };
  return p.matrixTransform(pathCtm.inverse().multiply(rootCtm));
}

function clearBallRoot(root: SVGGElement): void {
  while (root.firstChild) root.removeChild(root.firstChild);
}

function createTrailCircle(r: number): SVGCircleElement {
  const c = document.createElementNS(SVG_NS, "circle");
  c.setAttribute("class", "home-org-diagram__flow-node home-org-diagram__flow-node--trail");
  c.setAttribute("data-org-trail-ball", "1");
  c.setAttribute("r", String(r));
  c.setAttribute("cx", "0");
  c.setAttribute("cy", "0");
  return c;
}

function rand(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pickEase(rng: () => number): string {
  return EASE_POOL[Math.floor(rng() * EASE_POOL.length)] ?? "sine.inOut";
}

/** Random duration scaled by path length so short founder↔chip legs don't feel sluggish vs long squad wires. */
function randomLegDuration(pathLen: number, rng: () => number): number {
  const base = rand(rng, DURATION_MIN, DURATION_MAX);
  const lenFactor = gsap.utils.clamp(0.22, 1, pathLen / DURATION_REF_PATH_LEN);
  return gsap.utils.clamp(DURATION_FLOOR_AFTER_SCALE, DURATION_MAX, base * lenFactor);
}

function closestAnchorToPathPoint(path: SVGPathElement, svg: SVGSVGElement, px: number, py: number): AnchorId {
  let best: AnchorId = "you";
  let bestD = Infinity;
  for (const id of ANCHOR_IDS) {
    const a = ANCHORS[id];
    const loc = stagePointToPathLocal(path, svg, a.x, a.y);
    const d = (loc.x - px) ** 2 + (loc.y - py) ** 2;
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function buildDirectedLegs(
  svg: SVGSVGElement,
  wireCtx: readonly { wireId: string; path: SVGPathElement; ballRoot: SVGGElement }[],
): DirectedLeg[] {
  const legs: DirectedLeg[] = [];
  for (const w of wireCtx) {
    if (w.wireId === FOUNDER_WIRE_ID) {
      const path = w.path;
      const len = path.getTotalLength();
      const p0 = path.getPointAtLength(0);
      const p1 = path.getPointAtLength(len);
      const youL = stagePointToPathLocal(path, svg, ANCHORS.you.x, ANCHORS.you.y);
      const chipL = stagePointToPathLocal(path, svg, FOUNDER_CHIP_STAGE.x, FOUNDER_CHIP_STAGE.y);
      const d0You = dist2(p0.x, p0.y, youL.x, youL.y);
      const d1You = dist2(p1.x, p1.y, youL.x, youL.y);
      const d0Chip = dist2(p0.x, p0.y, chipL.x, chipL.y);
      const d1Chip = dist2(p1.x, p1.y, chipL.x, chipL.y);
      const youAtP0 = d0You + d1Chip < d1You + d0Chip;
      if (youAtP0) {
        legs.push({ wireId: w.wireId, path, ballRoot: w.ballRoot, forward: true, from: "you", to: "pancake" });
        legs.push({ wireId: w.wireId, path, ballRoot: w.ballRoot, forward: false, from: "pancake", to: "you" });
      } else {
        legs.push({ wireId: w.wireId, path, ballRoot: w.ballRoot, forward: true, from: "pancake", to: "you" });
        legs.push({ wireId: w.wireId, path, ballRoot: w.ballRoot, forward: false, from: "you", to: "pancake" });
      }
      continue;
    }

    const len = w.path.getTotalLength();
    const p0 = w.path.getPointAtLength(0);
    const p1 = w.path.getPointAtLength(len);
    const a0 = closestAnchorToPathPoint(w.path, svg, p0.x, p0.y);
    const a1 = closestAnchorToPathPoint(w.path, svg, p1.x, p1.y);
    legs.push({ wireId: w.wireId, path: w.path, ballRoot: w.ballRoot, forward: true, from: a0, to: a1 });
    legs.push({ wireId: w.wireId, path: w.path, ballRoot: w.ballRoot, forward: false, from: a1, to: a0 });
  }
  return legs;
}

function pickWeightedDepartureAnchor(rng: () => number): AnchorId {
  const weightFor = (id: AnchorId) => (id === "you" ? DEPARTURE_WEIGHT_YOU : 1);
  let sum = 0;
  for (const id of ANCHOR_IDS) sum += weightFor(id);
  let t = rng() * sum;
  for (const id of ANCHOR_IDS) {
    t -= weightFor(id);
    if (t <= 0) return id;
  }
  return ANCHOR_IDS[ANCHOR_IDS.length - 1]!;
}

/** Departure on the founder wire only: `you` vs `pancake` (chip), same weight ratio as global `you` bias. */
function pickFounderWireDeparture(rng: () => number): "you" | "pancake" {
  const t = rng() * (DEPARTURE_WEIGHT_YOU + 1);
  return t < DEPARTURE_WEIGHT_YOU ? "you" : "pancake";
}

function pickLegFromAnchor(legs: readonly DirectedLeg[], from: AnchorId, rng: () => number): DirectedLeg {
  const candidates = legs.filter((l) => l.from === from);
  if (candidates.length === 0) return legs[randInt(rng, 0, legs.length - 1)]!;

  if (from === "pancake") {
    const founderC = candidates.filter((l) => l.wireId === FOUNDER_WIRE_ID);
    const deptC = candidates.filter((l) => l.wireId !== FOUNDER_WIRE_ID);
    if (founderC.length > 0 && deptC.length > 0) {
      if (rng() < PANCAKE_FOUNDER_LEG_PROB) {
        return founderC[randInt(rng, 0, founderC.length - 1)]!;
      }
      return deptC[randInt(rng, 0, deptC.length - 1)]!;
    }
    if (deptC.length > 0) return deptC[randInt(rng, 0, deptC.length - 1)]!;
    if (founderC.length > 0) return founderC[randInt(rng, 0, founderC.length - 1)]!;
  }

  return candidates[randInt(rng, 0, candidates.length - 1)]!;
}

function placeBallOnPath(
  path: SVGPathElement,
  pathLen: number,
  u: number,
  forward: boolean,
  circle: SVGCircleElement,
): void {
  const t = gsap.utils.clamp(0, 1, u);
  const along = forward ? t : 1 - t;
  const pt = path.getPointAtLength(along * pathLen);
  circle.setAttribute("cx", String(pt.x));
  circle.setAttribute("cy", String(pt.y));
}

/** Same as `runBallLeg` but legs are restricted to founder↔chip so this ball never leaves that link. */
function runFounderOnlyBallLeg(circle: SVGCircleElement, founderLegs: readonly DirectedLeg[], rng: () => number): void {
  const from = pickFounderWireDeparture(rng);
  const leg = pickLegFromAnchor(founderLegs, from, rng);
  leg.ballRoot.appendChild(circle);

  const pathLen = leg.path.getTotalLength();
  const duration = randomLegDuration(pathLen, rng);
  const ease = pickEase(rng);
  const delay = rand(rng, 0, LEG_DELAY_MAX);

  circle.setAttribute("r", String(rand(rng, BALL_R_MIN, BALL_R_MAX)));

  const proxy = { u: 0 };
  const tick = () => {
    placeBallOnPath(leg.path, pathLen, proxy.u, leg.forward, circle);
  };

  gsap.fromTo(
    proxy,
    { u: 0 },
    {
      u: 1,
      duration,
      ease,
      delay,
      immediateRender: true,
      onUpdate: tick,
      onComplete: () => runFounderOnlyBallLeg(circle, founderLegs, rng),
    },
  );

  tick();
}

function runBallLeg(circle: SVGCircleElement, legs: readonly DirectedLeg[], rng: () => number): void {
  const from = pickWeightedDepartureAnchor(rng);
  const leg = pickLegFromAnchor(legs, from, rng);
  leg.ballRoot.appendChild(circle);

  const pathLen = leg.path.getTotalLength();
  const duration = randomLegDuration(pathLen, rng);
  const ease = pickEase(rng);
  const delay = rand(rng, 0, LEG_DELAY_MAX);

  circle.setAttribute("r", String(rand(rng, BALL_R_MIN, BALL_R_MAX)));

  const proxy = { u: 0 };
  const tick = () => {
    placeBallOnPath(leg.path, pathLen, proxy.u, leg.forward, circle);
  };

  gsap.fromTo(
    proxy,
    { u: 0 },
    {
      u: 1,
      duration,
      ease,
      delay,
      immediateRender: true,
      onUpdate: tick,
      onComplete: () => runBallLeg(circle, legs, rng),
    },
  );

  tick();
}

function startBallTraffic(
  svg: SVGSVGElement,
  wireCtx: readonly { wireId: string; path: SVGPathElement; ballRoot: SVGGElement }[],
  rng: () => number,
): void {
  wireCtx.forEach(({ ballRoot }) => {
    gsap.killTweensOf(ballRoot.querySelectorAll("circle[data-org-trail-ball]"));
    clearBallRoot(ballRoot);
  });

  const legs = buildDirectedLegs(svg, wireCtx);
  const founderLegs = legs.filter((l) => l.wireId === FOUNDER_WIRE_ID);
  const hubLegs = legs.filter((l) => l.wireId !== FOUNDER_WIRE_ID);
  if (hubLegs.length === 0) return;

  if (founderLegs.length >= 2) {
    const founderBallCount = randInt(rng, FOUNDER_BALL_MIN, FOUNDER_BALL_MAX);
    for (let k = 0; k < founderBallCount; k++) {
      const c = createTrailCircle(rand(rng, BALL_R_MIN, BALL_R_MAX));
      c.setAttribute("data-org-founder-always", "1");
      c.setAttribute("opacity", "1");
      runFounderOnlyBallLeg(c, founderLegs, rng);
    }
  }

  const total = randInt(rng, TOTAL_BALL_MIN, TOTAL_BALL_MAX);
  for (let i = 0; i < total; i++) {
    const circle = createTrailCircle(rand(rng, BALL_R_MIN, BALL_R_MAX));
    circle.setAttribute("opacity", "1");
    runBallLeg(circle, hubLegs, rng);
  }
}

function mountReducedMotionBalls(
  path: SVGPathElement,
  ballRoot: SVGGElement,
  wireId: string,
  dashRestore: string,
): void {
  clearBallRoot(ballRoot);
  path.setAttribute("stroke-dasharray", dashRestore);
  path.setAttribute("stroke-dashoffset", "0");

  const fractions = REDUCED_FALLBACK_FRACTIONS[wireId] ?? [0.5];
  const len = path.getTotalLength();
  const r = (BALL_R_MIN + BALL_R_MAX) / 2;

  fractions.forEach((frac) => {
    const pt = path.getPointAtLength(frac * len);
    const circle = createTrailCircle(r);
    circle.setAttribute("opacity", "1");
    circle.setAttribute("cx", String(pt.x));
    circle.setAttribute("cy", String(pt.y));
    ballRoot.appendChild(circle);
  });
}

export function OrgConnections() {
  const rootRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = rootRef.current;
      if (!svg || typeof window === "undefined") return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const wireCtx = ORG_WIRE_IDS_WITH_BALLS.map((wireId) => {
        const g = svg.querySelector<SVGGElement>(`g[data-node-id="${wireId}"]`);
        const path = g?.querySelector<SVGPathElement>("path.home-org-diagram__wire") ?? null;
        const ballRoot = g?.querySelector<SVGGElement>("[data-org-ball-root]") ?? null;
        return { wireId, path, ballRoot };
      }).filter((c): c is { wireId: string; path: SVGPathElement; ballRoot: SVGGElement } =>
        Boolean(c.path && c.ballRoot),
      );

      if (wireCtx.length === 0) return;

      const dashRestore = readDashPatternFromDom(wireCtx[0]!.path);

      const cleanup = () => {
        st?.kill();
        svg.querySelectorAll<SVGCircleElement>("circle[data-org-trail-ball]").forEach((c) => {
          gsap.killTweensOf(c);
        });
        wireCtx.forEach(({ ballRoot }) => {
          gsap.killTweensOf(ballRoot.querySelectorAll("circle"));
          clearBallRoot(ballRoot);
        });
      };

      let st: ScrollTrigger | undefined;

      if (reduced) {
        wireCtx.forEach(({ path, ballRoot, wireId }) => {
          mountReducedMotionBalls(path, ballRoot, wireId, dashRestore);
        });
        return cleanup;
      }

      st = ScrollTrigger.create({
        trigger: svg,
        start: "top 80%",
        once: true,
        onEnter: () => {
          svg.querySelectorAll<SVGCircleElement>("circle[data-org-trail-ball]").forEach((c) => {
            gsap.killTweensOf(c);
          });
          wireCtx.forEach(({ ballRoot }) => {
            gsap.killTweensOf(ballRoot.querySelectorAll("circle"));
            clearBallRoot(ballRoot);
          });
          const rng = () => Math.random();
          startBallTraffic(svg, wireCtx, rng);
        },
      });

      return cleanup;
    },
    { scope: rootRef },
  );

  return (
    <svg
      ref={rootRef}
      className="home-org-diagram__svg home-org-diagram__svg--org-connections"
      viewBox="0 0 1136 706"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
    >
      {ORG_DEPT_WIRES.map((wire) => (
        <g key={wire.id} data-node-id={wire.id} data-org-anim="dept">
          <path className="home-org-diagram__wire" d={wire.d} />
          <g data-org-ball-root aria-hidden />
        </g>
      ))}
      <g data-node-id={ORG_WIRE_FOUNDER_PANCAKE.dataNodeId} transform={founderWireGroupTransform()}>
        <path
          className="home-org-diagram__wire"
          d={ORG_WIRE_FOUNDER_PANCAKE.d}
          vectorEffect="nonScalingStroke"
        />
        <g data-org-ball-root aria-hidden />
      </g>
    </svg>
  );
}
