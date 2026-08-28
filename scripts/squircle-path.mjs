#!/usr/bin/env node
/**
 * Figma corner-smoothing path generator (vendored port of the `figma-squircle`
 * algorithm — Figma's "Desperately seeking squircles" corner math).
 *
 * The landing-v3 buttons are clipped with these exact paths so their corners
 * match the artboard in every browser (CSS `corner-shape: squircle` is both
 * Chromium-only and a generic superellipse, not Figma's smoothing geometry).
 *
 * Usage:  node scripts/squircle-path.mjs <width> <height> <radius> <smoothing>
 * e.g.    node scripts/squircle-path.mjs 203 72 18 0.75
 * Prints a `path("…")` value for clip-path. Regenerate whenever a button size
 * in app/_styles/landing-v3/foundation.css changes.
 */

const toRad = (deg) => (deg * Math.PI) / 180;

function cornerParams(R, smoothing, budget) {
  // p — how far along each edge the smoothing extends from the corner
  let s = smoothing;
  let p = (1 + s) * R;
  if (p > budget) {
    s = Math.max(0, budget / R - 1);
    p = budget;
  }
  const arcMeasure = 90 * (1 - s); // degrees kept as a true circular arc
  const arcSectionLength = Math.sin(toRad(arcMeasure / 2)) * R * Math.SQRT2;
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4Distance = R * Math.tan(toRad(angleAlpha / 2));
  const angleBeta = 45 * s;
  const c = p3ToP4Distance * Math.cos(toRad(angleBeta));
  const d = c * Math.tan(toRad(angleBeta));
  const b = (p - arcSectionLength - c - d) / 3;
  const a = 2 * b;
  return { a, b, c, d, p, arcSectionLength, R };
}

const f = (n) => {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? 0 : r;
};

// Relative-command form mirroring figma-squircle's drawing order:
// clockwise, each corner = bezier-in → circular arc (radius R) → bezier-out.
export function squirclePathRel(w, h, R, smoothing) {
  const { a, b, c, d, p, arcSectionLength: L } = cornerParams(R, smoothing, Math.min(w, h) / 2);
  const A = (sx, sy) => `a ${f(R)} ${f(R)} 0 0 1 ${f(sx)} ${f(sy)}`;
  return (
    `M ${f(w - p)} 0 ` +
    // top-right
    `c ${f(a)} 0 ${f(a + b)} 0 ${f(a + b + c)} ${f(d)} ` +
    `${A(L, L)} ` +
    `c ${f(d)} ${f(c)} ${f(d)} ${f(b + c)} ${f(d)} ${f(a + b + c)} ` +
    `L ${f(w)} ${f(h - p)} ` +
    // bottom-right
    `c 0 ${f(a)} 0 ${f(a + b)} ${f(-d)} ${f(a + b + c)} ` +
    `${A(-L, L)} ` +
    `c ${f(-c)} ${f(d)} ${f(-(b + c))} ${f(d)} ${f(-(a + b + c))} ${f(d)} ` +
    `L ${f(p)} ${f(h)} ` +
    // bottom-left
    `c ${f(-a)} 0 ${f(-(a + b))} 0 ${f(-(a + b + c))} ${f(-d)} ` +
    `${A(-L, -L)} ` +
    `c ${f(-d)} ${f(-c)} ${f(-d)} ${f(-(b + c))} ${f(-d)} ${f(-(a + b + c))} ` +
    `L 0 ${f(p)} ` +
    // top-left
    `c 0 ${f(-a)} 0 ${f(-(a + b))} ${f(d)} ${f(-(a + b + c))} ` +
    `${A(L, -L)} ` +
    `c ${f(c)} ${f(-d)} ${f(b + c)} ${f(-d)} ${f(a + b + c)} ${f(-d)} ` +
    `Z`
  );
}

const [, , w, h, r, s] = process.argv;
if (w && h && r && s) {
  console.log(`clip-path: path("${squirclePathRel(+w, +h, +r, +s)}");`);
}
