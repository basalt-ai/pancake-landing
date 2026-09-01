"use client";

import { useEffect, useRef } from "react";

import type { AnimationItem } from "lottie-web";

/**
 * Banner bottle — the designer's Lottie animation (delivered 2026-09-01,
 * "bottleneck": horizontal 1620×720 for desktop, vertical 720×1620 for
 * phones; intro frames 0–330 then a seamless 330–600 loop — the loop file's
 * first frame IS the intro's last). Per the designer's note, the rounded
 * corners and the headings stay in HTML: the card's r48 + overflow:hidden
 * clip this, and LpBanner's titles/body render above.
 *
 * Budget discipline (post-OOM doctrine): pure-vector files (~77KB each),
 * CANVAS renderer only (one canvas, no 46-layer SVG DOM), lottie-web's
 * canvas-only build dynamically imported the first time the banner comes
 * within a viewport of the screen — zero cost to initial load. The player
 * pauses off-stage and when the tab hides; reduced-motion renders the
 * settled intro pose once and never plays.
 */

const SRC = {
  h: { intro: "/lp/lp-bottleneck-h.json", loop: "/lp/lp-bottleneck-h-loop.json" },
  v: { intro: "/lp/lp-bottleneck-v.json", loop: "/lp/lp-bottleneck-v-loop.json" },
} as const;

export function LpBottleneck() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const phone = matchMedia("(max-width: 767px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    let anim: AnimationItem | null = null;
    let lottie: typeof import("lottie-web").default | null = null;
    let disposed = false;
    let loading = false;
    let onStage = false;
    let phase: "intro" | "loop" = "intro";

    const destroy = () => {
      anim?.destroy();
      anim = null;
      host.replaceChildren();
    };

    const create = (which: "intro" | "loop") => {
      if (disposed || !lottie) return;
      destroy();
      phase = which;
      const src = SRC[phone.matches ? "v" : "h"][which];
      anim = lottie.loadAnimation({
        container: host,
        renderer: "canvas",
        loop: which === "loop",
        // lottie drives its own start (a play() raced ahead of the renderer
        // and no-opped — chromium repro 2026-09-01); sync() only PAUSES
        autoplay: !reduced.matches,
        path: src,
        rendererSettings: {
          // fill the card box, center-crop the ~3% mobile ratio difference
          preserveAspectRatio: "xMidYMid slice",
          clearCanvas: true,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
        },
      });
      if (which === "intro" && !reduced.matches) {
        anim.addEventListener("complete", () => create("loop"));
      }
      anim.addEventListener("DOMLoaded", () => {
        if (disposed || !anim) return;
        if (reduced.matches) {
          // settled pose (== the loop's resting state), drawn once
          anim.goToAndStop(Math.max(0, anim.totalFrames - 1), true);
          return;
        }
        sync();
      });
    };

    const sync = () => {
      if (!anim || reduced.matches) return;
      if (onStage && !document.hidden) anim.play();
      else anim.pause();
    };

    const boot = () => {
      if (loading || lottie || disposed) return;
      loading = true;
      // canvas-only build — no SVG/HTML renderers in the bundle
      import("lottie-web/build/player/lottie_canvas").then((m) => {
        if (disposed) return;
        lottie = (m.default ?? m) as typeof import("lottie-web").default;
        create("intro");
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        onStage = entries.some((e) => e.isIntersecting);
        if (onStage) boot();
        sync();
      },
      { rootMargin: "100% 0%" },
    );
    io.observe(host);

    // breakpoint flip = other orientation's files; restart from the loop
    // resting state rather than replaying the intro mid-visit
    const onMedia = () => {
      if (!lottie) return;
      create(phase === "intro" ? "intro" : "loop");
    };
    const onVisibility = () => sync();
    phone.addEventListener("change", onMedia);
    reduced.addEventListener("change", onMedia);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      io.disconnect();
      phone.removeEventListener("change", onMedia);
      reduced.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
      destroy();
    };
  }, []);

  return <div ref={hostRef} className="lp-banner__lottie" aria-hidden="true" />;
}
