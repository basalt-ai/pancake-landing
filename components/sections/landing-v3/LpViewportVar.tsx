"use client";

import { useEffect } from "react";

/**
 * Freezes the viewport height into --lp-svh so the hero's fold clamp
 * (hero.css) doesn't reflow on every frame of a live window-resize drag —
 * that continuous relayout under six big animated ring layers read as
 * "resize breaks the rainbow's fluidity" (founder, 2026-08-31). Same
 * doctrine as v2's grow-only frozen hero measure: set once on mount, then
 * only after a resize settles (250ms quiet). CSS falls back to live 100svh
 * before hydration.
 */
export function LpViewportVar() {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const h = window.innerHeight;
      const prev = parseFloat(root.style.getPropertyValue("--lp-svh")) || 0;
      if (Math.abs(h - prev) >= 1) root.style.setProperty("--lp-svh", `${h}px`);
    };
    apply();
    let t: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(apply, 150);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      root.style.removeProperty("--lp-svh");
    };
  }, []);
  return null;
}
