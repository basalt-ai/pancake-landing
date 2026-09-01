"use client";

import { useEffect } from "react";

/**
 * Off-stage animation freeze — iPhone WebContent OOM guard (founder 17 Pro
 * report 2026-08-31: Safari's "A problem repeatedly occurred" while scrolling
 * the landing). The page runs every animated cohort simultaneously — 6 hero
 * arcs (2390×2331 imgs), 44 banner bubbles, pricing + CTA arcs, the features
 * ring flow, two 9200px testimonial tracks — and each holds a live composited
 * GPU surface at device pixel ratio 3 whether visible or not. That standing
 * budget is what pushed WebContent over iOS's memory kill line.
 *
 * Mechanism: observe each animation-owning section root; further than 1.5
 * viewports from the screen it gets data-lp-offstage, and anim.css drops the
 * members' animation-name (plus the big tracks' will-change) so WebKit
 * decomposes the layers and frees the memory. The frozen pose is the static
 * artboard — the exact reduced-motion contract. On re-entry each member
 * restarts with animation-delay = designed-delay − (elapsed mod duration) on
 * the shared page clock, so the 20s phase-locked cohorts (and the −7.3s
 * cta-left offset) resume EXACTLY where they would have been — no visible
 * desync, and every flip happens far off-screen anyway.
 */

/** Section roots that own animated members (attribute target). */
const STAGES = [
  ".lp-hero-art",
  ".lp-banner__card",
  ".lp-marquee",
  ".lp-feat-f2",
  ".lp-feat-f4",
  ".lp-tst-strip",
  ".lp-price-art",
  ".lp-cta__art--left",
  ".lp-cta__art--right",
].join(", ");

/** Animated members inside a stage (mirror of the anim.css offstage block). */
const MEMBERS =
  ".lp-anim-spin--cw, .lp-anim-spin--ccw, .lp-anim-bubble, .lp-feat-ringfx i, .lp-tst-track, .lp-marquee__track";

export function LpAnimFreeze() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;
    // PHONES ONLY (founder 2026-09-01: "l'animation de l'arc-en-ciel break
    // complètement" — on desktop a fast scroll-back outran the observer and
    // showed the arcs frozen at the artboard pose before they resumed).
    // The OOM this system exists for is an iPhone budget; Macs ran the
    // always-on cohort for weeks without issue. On phones the ≤767 static
    // block already holds arcs/bubbles, so freezing effectively manages the
    // testimonial tracks — the one big animated surface left there.
    const phone = window.matchMedia("(max-width: 767px)");
    const t0 = performance.now();
    // Designed timing per member, captured from computed style before the
    // first freeze ever overrides animation-delay inline.
    const timing = new WeakMap<Element, { delay: number; duration: number }>();

    const thaw = (stage: HTMLElement) => {
      stage.querySelectorAll<HTMLElement>(MEMBERS).forEach((m) => {
        const t = timing.get(m);
        if (!t || !t.duration) return; // never frozen — nothing to rephase
        const elapsed = (performance.now() - t0) / 1000;
        m.style.animationDelay = `${t.delay - (elapsed % t.duration)}s`;
      });
      stage.removeAttribute("data-lp-offstage");
    };

    let observer: IntersectionObserver | null = null;
    const setEnabled = (on: boolean) => {
      if (on && !observer) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const stage = entry.target as HTMLElement;
              if (entry.isIntersecting) {
                thaw(stage);
              } else {
                stage.querySelectorAll<HTMLElement>(MEMBERS).forEach((m) => {
                  if (timing.has(m)) return;
                  const cs = getComputedStyle(m);
                  timing.set(m, {
                    delay: parseFloat(cs.animationDelay) || 0,
                    duration: parseFloat(cs.animationDuration) || 0,
                  });
                });
                stage.setAttribute("data-lp-offstage", "");
              }
            }
          },
          // 0.75 viewport of slack above and below (OOM round 2)
          { rootMargin: "75% 0%" },
        );
        document.querySelectorAll(STAGES).forEach((s) => observer!.observe(s));
      } else if (!on && observer) {
        observer.disconnect();
        observer = null;
        // everything frozen resumes in phase — desktop runs the full cohort
        document
          .querySelectorAll<HTMLElement>("[data-lp-offstage]")
          .forEach(thaw);
      }
    };

    setEnabled(phone.matches);
    const onMedia = () => setEnabled(phone.matches);
    phone.addEventListener("change", onMedia);
    return () => {
      phone.removeEventListener("change", onMedia);
      setEnabled(false);
    };
  }, []);
  return null;
}
