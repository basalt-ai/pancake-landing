"use client";

import { useEffect, useRef } from "react";

/**
 * Desktop rainbow renderer — WebGL, one canvas per art (hero, pricing, the
 * two CTA slivers), replacing the CSS cohort's per-ring composited layers.
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
 * The static DOM artboard is the permanent fallback — no WebGL2, context
 * loss, reduced motion, phones (<768, where LpArcCanvas / static rules
 * apply): nothing changes. Off-stage the loop stops and the drawing buffer
 * shrinks to 1×1 so no GPU memory sits idle for far sections.
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

interface Ring {
  poseX: number;
  poseY: number;
  poseW: number;
  poseH: number;
  pose: DOMMatrix;
  dir: 1 | -1;
  delayMs: number;
  vao: WebGLVertexArrayObject;
  fans: [number, number][];
  cover: number;
  evenOdd: boolean;
  color: [number, number, number, number];
  viewW: number;
  viewH: number;
  fillW: number;
  fillH: number;
  isPop: boolean;
}

/** Shared page clock so every section spins in the same phase. */
let clockT0 = 0;
const clock = () => {
  if (!clockT0) clockT0 = performance.now();
  return clockT0;
};

/** Ring outline → one flattened polygon PER SUBPATH. The LpPancakes rings
    are annuli: a hand-drawn outer contour plus an inner circle drawn with
    an `A` arc, two subpaths in one `d`. Each subpath is sampled through a
    scratch SVGPathElement so every command is handled by the browser's own
    path machinery (~8 user units per chord — sub-0.02px sagitta here), and
    the fill rule then combines them exactly like the SVG renderer does.
    Sampling them as one outline would bridge the two with a chord — a
    hairline crack through every band (found the hard way, 2026-09-01). */
function sampleSubpaths(d: string): number[][] | null {
  const pieces = d.split(/(?=[Mm])/).map((s) => s.trim()).filter(Boolean);
  if (!pieces.length) return null;
  const scratch = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const polys: number[][] = [];
  for (const piece of pieces) {
    scratch.setAttribute("d", piece);
    const len = scratch.getTotalLength();
    if (!(len > 0)) continue;
    const n = Math.min(MAX_SAMPLES, Math.max(MIN_SAMPLES, Math.round(len / 8)));
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
    const desktop = matchMedia("(min-width: 768px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const sel = SEL[variant];

    let gl: WebGL2RenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let uM: WebGLUniformLocation | null = null;
    let uC: WebGLUniformLocation | null = null;
    let rings: Ring[] = [];
    let base = new DOMMatrix();
    let scissor: [number, number, number, number] | null = null;
    let dpr = 1;
    let raf = 0;
    let onStage = true;
    let live = false;
    let disposed = false;
    let lost = false;
    let popT0 = 0;

    const initGL = (): boolean => {
      gl = canvas.getContext("webgl2", {
        antialias: true,
        alpha: true,
        premultipliedAlpha: true,
        stencil: true,
        powerPreference: "low-power",
      });
      if (!gl || gl.isContextLost()) return false;
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
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!(cw > 0 && ch > 0)) return false;

      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      // device px → clip space, then art-space (CSS px) → device px
      const proj = new DOMMatrix([2 / canvas.width, 0, 0, -2 / canvas.height, -1, 1]);
      const fit = new DOMMatrix(cdivT); // transform-origin 0 0 (anim.css)
      base = proj.multiply(new DOMMatrix().scale(dpr)).multiply(fit);

      // the Figma group clip (.lp-anim-box overflow:clip) as a scissor rect;
      // the fit matrix is axis-aligned on desktop (scale / scaleX)
      const b0 = fit.transformPoint(new DOMPoint(box.offsetLeft, box.offsetTop));
      const b1 = fit.transformPoint(new DOMPoint(box.offsetLeft + box.offsetWidth, box.offsetTop + box.offsetHeight));
      const sx = Math.max(0, Math.floor(Math.min(b0.x, b1.x) * dpr));
      const sy = Math.max(0, Math.floor(Math.min(b0.y, b1.y) * dpr));
      const ex = Math.min(canvas.width, Math.ceil(Math.max(b0.x, b1.x) * dpr));
      const ey = Math.min(canvas.height, Math.ceil(Math.max(b0.y, b1.y) * dpr));
      scissor = [sx, canvas.height - ey, Math.max(0, ex - sx), Math.max(0, ey - sy)];

      // rings (drop any previous GPU buffers)
      for (const r of rings) gl.deleteVertexArray(r.vao);
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
        const polys = d ? sampleSubpaths(d) : null;
        if (!polys) return false;
        const mesh = meshFor(polys);

        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);
        const vbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.verts), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
        const evenOdd = getComputedStyle(pathEl).fillRule === "evenodd";

        const isPop = svg.classList.contains("lp-anim-pop");
        const scs = getComputedStyle(svg);
        next.push({
          poseX: box.offsetLeft + arc.offsetLeft + pose.offsetLeft,
          poseY: box.offsetTop + arc.offsetTop + pose.offsetTop,
          poseW: pose.offsetWidth,
          poseH: pose.offsetHeight,
          pose: new DOMMatrix(poseT),
          dir: spin.classList.contains("lp-anim-spin--ccw") ? -1 : 1,
          // the designed phase offset (CTA-left −7.3s) — read before the
          // handoff removes the CSS animation
          delayMs: (parseFloat(getComputedStyle(spin).animationDelay) || 0) * 1000,
          vao,
          fans: mesh.fans,
          cover: mesh.cover,
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
      const hook = (window as unknown as { __lpArcPhase?: number }).__lpArcPhase;
      const elapsed = now - clock();
      const popP = typeof hook === "number" ? 1 : Math.min(1, (now - popT0) / POP_MS);

      gl.clearColor(0, 0, 0, 0);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
      if (scissor) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(scissor[0], scissor[1], scissor[2], scissor[3]);
      }
      for (const r of rings) {
        const cycle =
          typeof hook === "number" ? hook : (((elapsed - r.delayMs) % LOOP_MS) + LOOP_MS) % LOOP_MS / LOOP_MS;
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
        gl.bindVertexArray(r.vao);
        // pass 1 — winding numbers into the stencil (no color)
        gl.colorMask(false, false, false, false);
        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        if (r.evenOdd) {
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
        } else {
          gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.INCR_WRAP);
          gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.DECR_WRAP);
        }
        for (const [start, count] of r.fans) gl.drawArrays(gl.TRIANGLE_FAN, start, count);
        // pass 2 — color where the winding is non-zero, resetting the stencil
        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
        gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO);
        gl.drawArrays(gl.TRIANGLES, r.cover, 3);
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
      if (!desktop.matches || reduced.matches || !onStage || document.hidden) return;
      if (live && canvas.width === 1) {
        // back on stage: restore the drawing buffer (was shrunk off-stage)
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
    };

    if (reduced.matches || !desktop.matches) {
      // phones / reduced motion never boot; a later breakpoint flip does
    } else if (!initGL()) {
      return; // no WebGL2 — the static DOM artboard stays
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
      { rootMargin: "25% 0%" },
    );
    io.observe(art);
    const ro = new ResizeObserver(() => {
      rings = [];
      start();
    });
    ro.observe(art);
    const onMedia = () => {
      if (desktop.matches && !reduced.matches) {
        if (!gl && !initGL()) return;
        start();
      } else restoreDom();
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      restoreDom();
    };
    const onRestored = () => {
      lost = false;
      rings = [];
      if (initGL()) start();
    };
    desktop.addEventListener("change", onMedia);
    reduced.addEventListener("change", onMedia);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    start();

    return () => {
      disposed = true;
      restoreDom();
      io.disconnect();
      ro.disconnect();
      desktop.removeEventListener("change", onMedia);
      reduced.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      // GPU buffers go; the context itself is left to die with the canvas.
      // Forcing loseContext() here poisoned React's dev double-mount: the
      // second effect run got the same, now-lost, context back and bailed.
      if (gl) for (const r of rings) gl.deleteVertexArray(r.vao);
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
