"use client";

import { useEffect } from "react";

/**
 * Feeds every fixed-px art canvas its fit scale as a unitless custom
 * property: --lp-fit = container-content-width / canvas-design-width, set
 * on the container the canvas scales against (the same box that carries
 * container-type for the old cqw formula; the var inherits into the canvas).
 *
 * Why JS instead of pure CSS: the canvases used
 * transform: scale(tan(atan2(100cqw, <design>px))) — a division trick that
 * iOS WebKit mis-resolves (iOS 18.7 simulator diagnostic, 2026-08-31:
 * tan(atan2(100cqw, 1654px)) computed 0.701137 for a 200px container
 * instead of 0.1209), producing garbage matrices that threw the mobile
 * hero rainbow off-screen. The trig expression remains as the var()
 * fallback, so engines that compute it correctly render identically
 * before hydration; iOS shows one wrong pre-hydration frame that
 * self-corrects the moment the observer fires.
 *
 * Measurement note: ResizeObserver's contentBoxSize is the LAYOUT content
 * width — exactly what 100cqw resolved against — and is immune to ancestor
 * transforms (the CTA slivers sit inside a scaled card on small viewports,
 * where getBoundingClientRect would report the wrong width).
 */

const TARGETS: ReadonlyArray<readonly [selector: string, designWidth: number]> = [
  [".lp-hero-art", 1654], // hero canvas (uniform scale <768 / ≥768; scaleX ≥1655)
  [".lp-price-art", 1654], // pricing canvas
  [".lp-cta__art--left", 560], // cta left sliver canvas
  [".lp-cta__art--right", 529], // cta right sliver canvas
  [".lp-banner__card", 1622], // banner canvas (desktop only; hidden ≤767)
];

export function LpFitVars() {
  useEffect(() => {
    const designs = new Map<Element, number>();
    const last = new Map<Element, string>();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const design = designs.get(entry.target);
        if (!design) continue;
        const box = entry.contentBoxSize?.[0];
        const width = box ? box.inlineSize : entry.contentRect.width;
        if (!(width > 0)) continue;
        // the exact quotient, unrounded: the CSS fallback computes the same
        // value, so in engines that get the trig right the write is a no-op
        // for the computed transform (a rounded value differed by ~1e-6 and
        // made Gecko re-rasterise the six hero ring blobs during hydration)
        const fit = String(width / design);
        if (last.get(entry.target) === fit) continue;
        last.set(entry.target, fit);
        (entry.target as HTMLElement).style.setProperty("--lp-fit", fit);
      }
    });

    for (const [selector, design] of TARGETS) {
      document.querySelectorAll(selector).forEach((el) => {
        designs.set(el, design);
        observer.observe(el); // delivers the initial size immediately
      });
    }

    return () => {
      observer.disconnect();
      designs.forEach((_design, el) => {
        (el as HTMLElement).style.removeProperty("--lp-fit");
      });
    };
  }, []);
  return null;
}
