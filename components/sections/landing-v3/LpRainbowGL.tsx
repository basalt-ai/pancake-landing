"use client";

import { useEffect, useRef } from "react";

/**
 * Rainbow renderer — WebGL, one canvas per art (hero, pricing, the two CTA
 * slivers), replacing the CSS cohort's per-ring composited layers. Desktop
 * since 2026-09-01; every width since 2026-09-02 (founder: "le même travail
 * de fluidité / anti-freeze sur mobile — quand on arrive en bas ça casse"):
 * on phones the CTA and pricing rings were still the CSS cohort, thawed by
 * LpAnimFreeze on approach — eleven ~2600px layers recomposited at once
 * right when the footer arrives. Now the DOM rings are static at every
 * width and this canvas is the only motion; LpArcCanvas (the phone hero's
 * bitmap renderer) yields to it on handoff and remains the fallback.
 *
 * Why (2026-09-01, after a day of desktop-Safari failures): every rotating
 * ring was its own ~2400×2600px composited layer — six per section, ten in
 * the CTA — and real Macs choked on the standing GPU allocation (flicker,
 * square tiles, layer eviction of the H1, hover FX painting garbage).
 * Benchmarked three replacements with the live geometry: Canvas2D path
 * fills (what a Lottie canvas player does — CPU rasterization in WebKit,
 * cost grows with load), Canvas2D bitmap blits (drops frames in Chromium),
 * and WebGL meshes — flat CPU, trivial GPU work (six flat-color triangle
 * meshes per frame), tiny memory. WebGL won.
 *
 * Fidelity: nothing is re-derived. Each ring's path, viewBox, pose matrix,
 * layout offsets, spin direction and designed delay (the CTA-left −7.3s)
 * are read from the DOM that anim.css/LpPancakes already position, and the
 * canvas div's computed transform (fit / wide-screen scaleX) is applied as
 * is. The frame composes the same matrices the CSS version did, with the
 * spin angle on a clock shared by every instance — the whole page stays
 * phase-locked like the Figma cohort. Ring paths are flattened once
 * (48 segments per cubic — sub-0.2px chord error at these radii) and
 * triangulated with earcut; MSAA does the edge anti-aliasing.
 *
 * Handoff: the canvas draws its first frame, THEN [data-lp-gl] on the art
 * hides the DOM rings and stops their CSS animations (freeing the layers).
 * The static DOM artboard is the permanent fallback — no WebGL2 (or only a
 * software one: failIfMajorPerformanceCaveat), context loss, reduced
 * motion, phones (<768, where LpArcCanvas / static rules apply): nothing
 * changes. Off-stage the loop stops and the drawing buffer shrinks to 1×1
 * so no GPU memory sits idle for far sections.
 *
 * Firefox lesson (2026-09-01, the day after shipping): the first version
 * flattened each ring by sampling a scratch SVGPathElement.getPointAtLength
 * ~10k times per build — 0.28ms a call in Gecko (0.06 Blink, 0.12 WebKit),
 * i.e. a 2.8–5s main-thread freeze at every rainbow section, replayed on
 * every scroll-return because the off-stage 1×1 shrink rebuilt from
 * scratch. Paths are now flattened in plain JS (M/L/H/V/C/S/A/Z, the DOM
 * sampler only as a fallback for anything else), cached per `d`, and the
 * GPU buffers persist across the shrink; a rebuild is a handful of DOM
 * reads. The ring DOM is also static on desktop from the start (anim.css),
 * so the handoff never snaps phase and a browser without usable WebGL
 * shows the artboard instead of Gecko's 0.1fps CSS spin of six 2600px SVGs.
 */

type Variant = "hero" | "pricing" | "ctaLeft" | "ctaRight";

const SEL: Record<Variant, { canvas: string; box: string }> = {
  hero: { canvas: ".lp-anim-canvas--hero", box: ".lp-anim-box--hero" },
  pricing: { canvas: ".lp-anim-canvas--pricing", box: ".lp-anim-box--pricing" },
  ctaLeft: { canvas: ".lp-anim-canvas--cta-left", box: ".lp-anim-box--cta-left" },
  ctaRight: { canvas: ".lp-anim-canvas--cta-right", box: ".lp-anim-box--cta-right" },
};

const LOOP_MS = 20000; // the Figma master loop
const POP_START = { w: 2440.574, h: 2381.047 }; // lp-anim-pop 0% keyframe
const POP_MS = 500;
const MAX_DPR = 2;
const MIN_SAMPLES = 256;
const MAX_SAMPLES = 2048;
const CHORD = 8; // user units per flattened segment (sub-0.02px sagitta here)

interface Mesh {
  vao: WebGLVertexArrayObject;
  vbuf: WebGLBuffer;
  fans: [number, number][];
  cover: number;
}

interface Ring {
  poseX: number;
  poseY: number;
  poseW: number;
  poseH: number;
  pose: DOMMatrix;
  dir: 1 | -1;
  delayMs: number;
  mesh: Mesh;
  evenOdd: boolean;
  color: [number, number, number, number];
  viewW: number;
  viewH: number;
  fillW: number;
  fillH: number;
  isPop: boolean;
}

/** `?lp-nogl` — kill switch: no WebGL anywhere (static artboard; phones
    keep the LpArcCanvas hero). For comparing builds on a device. */
const killSwitch = () =>
  typeof location !== "undefined" && new URLSearchParams(location.search).has("lp-nogl");

/** Ring outline → one flattened polygon PER SUBPATH. The LpPancakes rings
    are annuli: a hand-drawn outer contour plus an inner circle drawn with
    an `A` arc, two subpaths in one `d`; the fill rule then combines them
    exactly like the SVG renderer does. Sampling them as one outline would
    bridge the two with a chord — a hairline crack through every band (found
    the hard way, 2026-09-01). Flattened once per distinct `d` for the life
    of the page (the six ring paths are shared by every art). */
const FLAT = new Map<string, number[][] | null>();
function flatten(d: string): number[][] | null {
  let polys = FLAT.get(d);
  if (polys === undefined) {
    polys = flattenPath(d) ?? sampleSubpaths(d);
    FLAT.set(d, polys);
  }
  return polys;
}

/** Plain-JS path flattener: M L H V C S A Z (absolute and relative) — the
    whole vocabulary of the ring exports and of LpPancakes.withHole. Cubics
    are stepped at ~CHORD units of control-polygon length, arcs by angle at
    the same chord; anything else (Q/T) returns null and the DOM sampler
    below takes over. Pure arithmetic: microseconds, in every engine. */
function flattenPath(d: string): number[][] | null {
  const tok = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi);
  if (!tok) return null;
  const polys: number[][] = [];
  let cur: number[] | null = null;
  let cmd = "";
  let i = 0;
  let x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0;
  const num = () => {
    const v = parseFloat(tok[i++]);
    if (!Number.isFinite(v)) throw new Error("path");
    return v;
  };
  const push = (nx: number, ny: number) => {
    if (!cur) {
      cur = [x, y];
      polys.push(cur);
    }
    cur.push(nx, ny);
    x = nx;
    y = ny;
  };
  const cubic = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
    const x0 = x, y0 = y;
    const len = Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
    const n = Math.min(512, Math.max(8, Math.ceil(len / CHORD)));
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
      push(a * x0 + b * x1 + c * x2 + e * x3, a * y0 + b * y1 + c * y2 + e * y3);
    }
    px = x2;
    py = y2;
  };
  // SVG implementation notes F.6.5: endpoint → center parameterization
  const arc = (rx: number, ry: number, deg: number, fa: number, fs: number, x2: number, y2: number) => {
    const x1 = x, y1 = y;
    if (x1 === x2 && y1 === y2) return;
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    if (!rx || !ry) return push(x2, y2);
    const phi = (deg * Math.PI) / 180, cs = Math.cos(phi), sn = Math.sin(phi);
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    const x1p = cs * dx + sn * dy, y1p = -sn * dx + cs * dy;
    const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lam > 1) {
      rx *= Math.sqrt(lam);
      ry *= Math.sqrt(lam);
    }
    const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
    const coef = (fa !== fs ? 1 : -1) * Math.sqrt(Math.max(0, (rx * rx * ry * ry - den) / den));
    const cxp = (coef * rx * y1p) / ry, cyp = (-coef * ry * x1p) / rx;
    const cx = cs * cxp - sn * cyp + (x1 + x2) / 2, cy = sn * cxp + cs * cyp + (y1 + y2) / 2;
    const ang = (ux: number, uy: number, vx: number, vy: number) => {
      const s = Math.sign(ux * vy - uy * vx) || 1;
      return s * Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)))));
    };
    const ux = (x1p - cxp) / rx, uy = (y1p - cyp) / ry;
    const t1 = ang(1, 0, ux, uy);
    let dt = ang(ux, uy, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!fs && dt > 0) dt -= 2 * Math.PI;
    else if (fs && dt < 0) dt += 2 * Math.PI;
    const n = Math.min(2048, Math.max(4, Math.ceil((Math.abs(dt) * Math.max(rx, ry)) / CHORD)));
    for (let k = 1; k <= n; k++) {
      const t = t1 + (dt * k) / n, ct = Math.cos(t), st = Math.sin(t);
      push(cx + rx * ct * cs - ry * st * sn, cy + rx * ct * sn + ry * st * cs);
    }
  };
  try {
    while (i < tok.length) {
      const t = tok[i];
      if (/[A-Za-z]/.test(t)) {
        cmd = t;
        i++;
        if (cmd === "Z" || cmd === "z") {
          cur = null;
          x = px = sx;
          y = py = sy;
          continue;
        }
      } else if (!cmd) return null;
      const rel = cmd === cmd.toLowerCase();
      switch (cmd.toUpperCase()) {
        case "M": {
          let nx = num(), ny = num();
          if (rel) { nx += x; ny += y; }
          cur = [nx, ny];
          polys.push(cur);
          x = sx = px = nx;
          y = sy = py = ny;
          cmd = rel ? "l" : "L";
          break;
        }
        case "L": {
          let nx = num(), ny = num();
          if (rel) { nx += x; ny += y; }
          push(nx, ny);
          px = x; py = y;
          break;
        }
        case "H": {
          let nx = num();
          if (rel) nx += x;
          push(nx, y);
          px = x; py = y;
          break;
        }
        case "V": {
          let ny = num();
          if (rel) ny += y;
          push(x, ny);
          px = x; py = y;
          break;
        }
        case "C": {
          let x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
          if (rel) { x1 += x; y1 += y; x2 += x; y2 += y; x3 += x; y3 += y; }
          cubic(x1, y1, x2, y2, x3, y3);
          break;
        }
        case "S": {
          let x2 = num(), y2 = num(), x3 = num(), y3 = num();
          if (rel) { x2 += x; y2 += y; x3 += x; y3 += y; }
          cubic(2 * x - px, 2 * y - py, x2, y2, x3, y3);
          break;
        }
        case "A": {
          const rx = num(), ry = num(), deg = num(), fa = num(), fs = num();
          let x2 = num(), y2 = num();
          if (rel) { x2 += x; y2 += y; }
          arc(rx, ry, deg, fa, fs, x2, y2);
          px = x; py = y;
          break;
        }
        default:
          return null;
      }
    }
  } catch {
    return null;
  }
  const out = polys.filter((p) => p.length >= 6);
  return out.length ? out : null;
}

/** Fallback flattener through a scratch SVGPathElement (any command the
    browser knows). Slow in Gecko (see header) — only ever reached for a
    path vocabulary the JS flattener does not cover. */
function sampleSubpaths(d: string): number[][] | null {
  const pieces = d.split(/(?=[Mm])/).map((s) => s.trim()).filter(Boolean);
  if (!pieces.length) return null;
  const scratch = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const polys: number[][] = [];
  for (const piece of pieces) {
    scratch.setAttribute("d", piece);
    const len = scratch.getTotalLength();
    if (!(len > 0)) continue;
    const n = Math.min(MAX_SAMPLES, Math.max(MIN_SAMPLES, Math.round(len / CHORD)));
    const out: number[] = [];
    for (let k = 0; k < n; k++) {
      const pt = scratch.getPointAtLength((k / n) * len);
      if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return null;
      out.push(pt.x, pt.y);
    }
    polys.push(out);
  }
  return polys.length ? polys : null;
}

/** Outline → the two draw primitives of a stencil polygon fill: a fan from
    the centroid over the outline (winding pass) and an inflated bounding
    quad (color pass). No triangulation: the winding rule is evaluated per
    pixel by the stencil buffer exactly like the SVG renderer does it, so
    the hand-drawn outlines (which are neither star-shaped nor free of
    self-overlap) fill identically to the DOM version. */
function meshFor(polys: number[][]): { verts: number[]; fans: [number, number][]; cover: number } {
  const verts: number[] = [];
  const fans: [number, number][] = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of polys) {
    const n = poly.length / 2;
    let cx = 0, cy = 0;
    for (let i = 0; i < n; i++) {
      const x = poly[2 * i], y = poly[2 * i + 1];
      cx += x; cy += y;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    // fan: centroid + outline + closing repeat of the first vertex
    const start = verts.length / 2;
    verts.push(cx / n, cy / n, ...poly, poly[0], poly[1]);
    fans.push([start, verts.length / 2 - start]);
  }
  // color pass: ONE oversized triangle over the inflated bbox (a two-
  // triangle quad would seam along its diagonal under the stencil reset)
  const w = maxX - minX + 4;
  const h = maxY - minY + 4;
  const cover = verts.length / 2;
  verts.push(minX - 2, minY - 2, minX - 2 + 2 * w, minY - 2, minX - 2, minY - 2 + 2 * h);
  return { verts, fans, cover };
}

function rgba(fill: string): [number, number, number, number] | null {
  const hex = fill.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  }
  const rgb = fill.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b] = rgb[1].split(",").map((v) => parseFloat(v));
    return [r / 255, g / 255, b / 255, 1];
  }
  return null;
}

const VS = `#version 300 es
layout(location = 0) in vec2 p;
uniform mat3 m;
void main() { vec3 q = m * vec3(p, 1.0); gl_Position = vec4(q.xy, 0.0, 1.0); }`;
const FS = `#version 300 es
precision mediump float;
uniform vec4 col;
out vec4 o;
void main() { o = col; }`;

export function LpRainbowGL({ variant }: { variant: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const art = canvas?.parentElement;
    if (!canvas || !art) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const sel = SEL[variant];

    let gl: WebGL2RenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let uM: WebGLUniformLocation | null = null;
    let uC: WebGLUniformLocation | null = null;
    let rings: Ring[] = [];
    // GPU geometry per distinct path, kept for the life of the context: a
    // rebuild (scroll-return, resize) re-reads the DOM but uploads nothing
    let meshes = new Map<string, Mesh>();
    let base = new DOMMatrix();
    let scissor: [number, number, number, number] | null = null;
    let dpr = 1;
    let raf = 0;
    let onStage = true;
    let live = false;
    let disposed = false;
    let lost = false;
    let popT0 = 0;
    // Phase clock anchored at THIS art's first drawn frame: cycle 0 == the
    // static artboard the DOM shows until the handoff, so the swap is
    // continuous even when it happens on screen (fast fling), and the two
    // CTA slivers — booting in the same frame — keep their −7.3s offset.
    // Sections are never co-visible, so a page-wide lock buys nothing.
    let t0 = 0;
    let builtW = 0;
    let builtH = 0;
    let resizeTimer = 0;
    const phone = matchMedia("(max-width: 767px)").matches;

    const dropMeshes = () => {
      const g = gl;
      if (g) {
        meshes.forEach((m) => {
          g.deleteVertexArray(m.vao);
          g.deleteBuffer(m.vbuf);
        });
      }
      meshes = new Map();
      rings = [];
    };

    const initGL = (): boolean => {
      gl = canvas.getContext("webgl2", {
        antialias: true,
        alpha: true,
        depth: false,
        premultipliedAlpha: true,
        stencil: true,
        powerPreference: "low-power",
        // a software GL (llvmpipe / SwiftShader / blocklisted driver) is
        // worse than the static artboard — let the DOM fallback stand
        failIfMajorPerformanceCaveat: true,
      });
      if (!gl || gl.isContextLost()) return false;
      art.removeAttribute("data-lp-gl-off");
      const sh = (type: number, src: string) => {
        const h = gl!.createShader(type)!;
        gl!.shaderSource(h, src);
        gl!.compileShader(h);
        return gl!.getShaderParameter(h, gl!.COMPILE_STATUS) ? h : null;
      };
      const vs = sh(gl.VERTEX_SHADER, VS);
      const fs = sh(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return false;
      prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      uM = gl.getUniformLocation(prog, "m");
      uC = gl.getUniformLocation(prog, "col");
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.STENCIL_TEST);
      gl.stencilMask(0xff);
      gl.disable(gl.CULL_FACE);
      return true;
    };

    /** Geometry + sizing from the live DOM. False = not ready yet, retry. */
    const build = (): boolean => {
      if (!gl) return false;
      const cdiv = art.querySelector<HTMLElement>(sel.canvas);
      const box = cdiv?.querySelector<HTMLElement>(sel.box);
      if (!cdiv || !box || !art.style.getPropertyValue("--lp-fit")) return false;
      const cdivT = getComputedStyle(cdiv).transform;
      if (!cdivT || cdivT === "none") return false;
      const fit = new DOMMatrix(cdivT); // transform-origin 0 0 (anim.css)
      const axisAligned = Math.abs(fit.b) < 1e-6 && Math.abs(fit.c) < 1e-6;
      // the ring box (.lp-anim-box, overflow:clip) in art space
      const bp0 = fit.transformPoint(new DOMPoint(box.offsetLeft, box.offsetTop));
      const bp1 = fit.transformPoint(new DOMPoint(box.offsetLeft + box.offsetWidth, box.offsetTop + box.offsetHeight));
      const bx0 = Math.min(bp0.x, bp1.x), bx1 = Math.max(bp0.x, bp1.x);
      const by0 = Math.min(bp0.y, bp1.y), by1 = Math.max(bp0.y, bp1.y);

      // Canvas placement in art space. Hero / pricing: the art rect itself
      // (CSS: inset 0, hero 61.96%). CTA slivers: the box spills far outside
      // the art rect and the CARD (overflow:hidden) is the real clip — on
      // desktop the card cuts exactly at the art, but on phones the arts are
      // rotated 90° into the card (cta.css) and the spilled ink lands inside
      // it: part of the mobile artboard, so the canvas must cover box ∩ card,
      // mapped into art space through the art's own transform (origin 0 0).
      let vx = 0, vy = 0;
      const clipEl = variant === "ctaLeft" || variant === "ctaRight" ? art.offsetParent : null;
      if (clipEl instanceof HTMLElement) {
        const artT = getComputedStyle(art).transform;
        const inv = (artT && artT !== "none" ? new DOMMatrix(artT) : new DOMMatrix()).inverse();
        const ox = art.offsetLeft, oy = art.offsetTop;
        const cs = [[0, 0], [clipEl.clientWidth, 0], [0, clipEl.clientHeight], [clipEl.clientWidth, clipEl.clientHeight]]
          .map(([x, y]) => inv.transformPoint(new DOMPoint(x - ox, y - oy)));
        const rx0 = Math.max(bx0, Math.min(...cs.map((c) => c.x))), rx1 = Math.min(bx1, Math.max(...cs.map((c) => c.x)));
        const ry0 = Math.max(by0, Math.min(...cs.map((c) => c.y))), ry1 = Math.min(by1, Math.max(...cs.map((c) => c.y)));
        if (!(rx1 - rx0 > 1 && ry1 - ry0 > 1)) return false;
        vx = rx0;
        vy = ry0;
        canvas.style.left = `${rx0}px`;
        canvas.style.top = `${ry0}px`;
        canvas.style.width = `${rx1 - rx0}px`;
        canvas.style.height = `${ry1 - ry0}px`;
      }

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!(cw > 0 && ch > 0)) return false;

      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      // device px → clip space, then art-space (CSS px) → device px
      const proj = new DOMMatrix([2 / canvas.width, 0, 0, -2 / canvas.height, -1, 1]);
      base = proj.multiply(new DOMMatrix().scale(dpr)).multiply(new DOMMatrix().translate(-vx, -vy)).multiply(fit);

      // the Figma group clip as a scissor rect when the fit matrix is
      // axis-aligned (desktop: scale / scaleX; every CTA). The phone hero's
      // fit carries rotate(15°)·flipX — a rect can't express that clip, and
      // the art's own clip-path already bounds the visible ink there
      // (LpArcCanvas never clipped either): no scissor.
      if (axisAligned) {
        const sx = Math.max(0, Math.floor((bx0 - vx) * dpr));
        const sy = Math.max(0, Math.floor((by0 - vy) * dpr));
        const ex = Math.min(canvas.width, Math.ceil((bx1 - vx) * dpr));
        const ey = Math.min(canvas.height, Math.ceil((by1 - vy) * dpr));
        scissor = [sx, canvas.height - ey, Math.max(0, ex - sx), Math.max(0, ey - sy)];
      } else {
        scissor = null;
      }

      const next: Ring[] = [];
      for (const arc of Array.from(box.querySelectorAll<HTMLElement>(".lp-anim-arc"))) {
        const pose = arc.querySelector<HTMLElement>(".lp-anim-pose");
        const spin = arc.querySelector<HTMLElement>(".lp-anim-spin");
        const svg = arc.querySelector<SVGSVGElement>("svg");
        const pathEl = svg?.querySelector("path");
        if (!pose || !spin || !svg || !pathEl) return false;
        const poseT = getComputedStyle(pose).transform;
        const vb = svg.viewBox.baseVal;
        const color = rgba(pathEl.getAttribute("fill") || getComputedStyle(pathEl).fill);
        if (!poseT || poseT === "none" || !vb || !(vb.width > 0) || !color) return false;
        const d = pathEl.getAttribute("d");
        if (!d) return false;
        let mesh = meshes.get(d);
        if (!mesh) {
          const polys = flatten(d);
          if (!polys) return false;
          const m = meshFor(polys);
          const vao = gl.createVertexArray();
          const vbuf = gl.createBuffer();
          if (!vao || !vbuf) return false;
          gl.bindVertexArray(vao);
          gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.verts), gl.STATIC_DRAW);
          gl.enableVertexAttribArray(0);
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
          gl.bindVertexArray(null);
          mesh = { vao, vbuf, fans: m.fans, cover: m.cover };
          meshes.set(d, mesh);
        }
        const evenOdd = getComputedStyle(pathEl).fillRule === "evenodd";
        const spinCs = getComputedStyle(spin);

        const isPop = svg.classList.contains("lp-anim-pop");
        const scs = getComputedStyle(svg);
        if (isPop) {
          // continue the CSS entrance settle from wherever it is (desktop:
          // it plays on the DOM ring until the handoff). Phones keep the
          // DOM pop off (anim.css) — there the first build plays it from
          // now, like LpArcCanvas did; any later rebuild is settled.
          const a = typeof svg.getAnimations === "function"
            ? svg.getAnimations().find((k) => (k as CSSAnimation).animationName === "lp-anim-pop")
            : undefined;
          if (a && typeof a.currentTime === "number") popT0 = performance.now() - a.currentTime;
          else if (!popT0) popT0 = performance.now();
        }
        next.push({
          poseX: box.offsetLeft + arc.offsetLeft + pose.offsetLeft,
          poseY: box.offsetTop + arc.offsetTop + pose.offsetTop,
          poseW: pose.offsetWidth,
          poseH: pose.offsetHeight,
          pose: new DOMMatrix(poseT),
          dir: spin.classList.contains("lp-anim-spin--ccw") ? -1 : 1,
          // the designed phase offset (CTA-left −7.3s). --lp-phase, not
          // animation-delay: the desktop static rules and the handoff both
          // set `animation: none`, and that shorthand resets the delay to
          // 0s — reading it made every rebuild re-mirror the two slivers
          delayMs:
            (parseFloat(spinCs.getPropertyValue("--lp-phase")) || parseFloat(spinCs.animationDelay) || 0) * 1000,
          mesh,
          evenOdd,
          color,
          viewW: vb.width,
          viewH: vb.height,
          fillW: isPop ? parseFloat(scs.width) : pose.offsetWidth,
          fillH: isPop ? parseFloat(scs.height) : pose.offsetHeight,
          isPop,
        });
      }
      if (!next.length) return false;
      rings = next;
      builtW = art.offsetWidth;
      builtH = art.offsetHeight;
      if (!popT0) popT0 = performance.now();
      return true;
    };

    const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

    const frame = () => {
      raf = 0;
      if (disposed || lost || !onStage || document.hidden || !gl) return;
      if (!rings.length && !build()) {
        raf = requestAnimationFrame(frame); // LpFitVars not there yet — retry
        return;
      }
      const now = performance.now();
      if (!t0) t0 = now;
      // test hook: freeze the clock at a cycle fraction (gates only);
      // designed delays still apply, so hook 0 == the static artboard incl.
      // the CTA-left ±131.4° de-mirror
      const hook = (window as unknown as { __lpArcPhase?: number }).__lpArcPhase;
      const elapsed = typeof hook === "number" ? hook * LOOP_MS : now - t0;
      const popP = typeof hook === "number" ? 1 : Math.min(1, (now - popT0) / POP_MS);

      gl.clearColor(0, 0, 0, 0);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
      if (scissor) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(scissor[0], scissor[1], scissor[2], scissor[3]);
      }
      for (const r of rings) {
        const cycle = ((((elapsed - r.delayMs) % LOOP_MS) + LOOP_MS) % LOOP_MS) / LOOP_MS;
        let w = r.fillW;
        let h = r.fillH;
        if (r.isPop && popP < 1) {
          const e = easeOut(popP);
          w = POP_START.w + (r.fillW - POP_START.w) * e;
          h = POP_START.h + (r.fillH - POP_START.h) * e;
        }
        const cx = r.poseW / 2;
        const cy = r.poseH / 2;
        const m = base
          .translate(r.poseX + cx, r.poseY + cy)
          .multiply(r.pose)
          .rotate(r.dir * cycle * 360)
          .translate(-cx, -cy)
          .translate((r.poseW - w) / 2, (r.poseH - h) / 2)
          .scale(w / r.viewW, h / r.viewH);
        gl.uniformMatrix3fv(uM, false, [m.a, m.b, 0, m.c, m.d, 0, m.e, m.f, 1]);
        gl.uniform4fv(uC, r.color);
        gl.bindVertexArray(r.mesh.vao);
        // pass 1 — winding numbers into the stencil (no color)
        gl.colorMask(false, false, false, false);
        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        if (r.evenOdd) {
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
        } else {
          gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.INCR_WRAP);
          gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.DECR_WRAP);
        }
        for (const [start, count] of r.mesh.fans) gl.drawArrays(gl.TRIANGLE_FAN, start, count);
        // pass 2 — color where the winding is non-zero, resetting the stencil
        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
        gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO);
        gl.drawArrays(gl.TRIANGLES, r.mesh.cover, 3);
      }
      gl.bindVertexArray(null);
      if (!live) {
        live = true;
        art.setAttribute("data-lp-gl", ""); // first frame drew — swap
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || disposed || lost || !gl) return;
      if (reduced.matches || !onStage || document.hidden) return;
      if (live && canvas.width === 1) {
        // back on stage: restore the drawing buffer (was shrunk off-stage);
        // the meshes stay — the rebuild is DOM reads only
        rings = [];
      }
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const restoreDom = () => {
      stop();
      live = false;
      art.removeAttribute("data-lp-gl");
      art.setAttribute("data-lp-gl-off", ""); // the artboard shows (anim.css)
    };

    if (reduced.matches) {
      // reduced motion never boots (the artboard shows); a later flip does
      art.setAttribute("data-lp-gl-off", "");
    } else if (killSwitch() || !initGL()) {
      // no usable WebGL2 — the static DOM artboard stays; the attribute
      // tells LpArcCanvas to take the phone hero right away
      art.setAttribute("data-lp-gl-off", "");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        onStage = entries.some((e) => e.isIntersecting);
        if (onStage) start();
        else {
          stop();
          // release the (MSAA) drawing buffer while far away; the DOM stays
          // hidden — nothing is visible off-stage anyway
          if (gl && live) {
            canvas.width = 1;
            canvas.height = 1;
          }
        }
      },
      // phones: the same 0.75-viewport slack LpAnimFreeze proved — a fling
      // at ~100px/frame must not reach a released canvas (ring-less art for
      // a frame or two: the 2026-08-31 "missing CTA band" look). Desktop
      // keeps the tighter margin (bigger buffers, more co-residency).
      { rootMargin: phone ? "75% 0%" : "25% 0%" },
    );
    io.observe(art);
    // relayout → rebuild, but only when the art actually changed size (the
    // observer also fires once on observe, and on every off-stage/on-stage
    // visibility flip in some engines), and settled — a live drag resize
    // would otherwise rebuild every frame
    const relayout = () => {
      if (art.offsetWidth === builtW && art.offsetHeight === builtH) return;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        rings = [];
        start();
      }, 120);
    };
    const ro = new ResizeObserver(relayout);
    ro.observe(art);
    // zoom / monitor change: the buffer scale follows devicePixelRatio
    let dprMq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onDpr = () => {
      dprMq.removeEventListener("change", onDpr);
      dprMq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMq.addEventListener("change", onDpr);
      rings = [];
      start();
    };
    dprMq.addEventListener("change", onDpr);
    const onMedia = () => {
      if (!reduced.matches) {
        if (!gl && !initGL()) return;
        start();
      } else restoreDom();
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      meshes = new Map(); // GPU objects died with the context
      rings = [];
      restoreDom();
    };
    const onRestored = () => {
      lost = false;
      if (initGL()) start();
    };
    reduced.addEventListener("change", onMedia);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    start();

    return () => {
      disposed = true;
      restoreDom();
      art.removeAttribute("data-lp-gl-off"); // a remount decides afresh
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      dprMq.removeEventListener("change", onDpr);
      reduced.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      // GPU buffers go; the context itself is left to die with the canvas.
      // Forcing loseContext() here poisoned React's dev double-mount: the
      // second effect run got the same, now-lost, context back and bailed.
      dropMeshes();
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`lp-gl-canvas lp-gl-canvas--${variant}`}
      aria-hidden="true"
    />
  );
}
