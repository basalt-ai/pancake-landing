"use client";

import { useEffect } from "react";

/**
 * Sticky-nav scroll state (founder 2026-09-01: "comme Linear.app, une barre
 * en haut qui reste en permanence"). The bar itself is position:sticky in
 * nav.css — this only stamps .is-scrolled once the page leaves the very top,
 * flipping the bar from the artboard's transparent band to the translucent
 * cream chrome. rAF-throttled, passive, and idempotent.
 */
export function LpNavScroll() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".lp-nav");
    if (!nav) return;
    let ticking = false;
    const apply = () => {
      ticking = false;
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
