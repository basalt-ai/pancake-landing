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
 * Two founder-reported glitches shaped this structure (2026-09-01):
 * - "la bouteille apparaît après quelques millisecondes": the card's CSS
 *   background paints instantly but the player needs an import + a JSON
 *   fetch. A POSTER of the intro's frame 0 (rendered from the Lottie
 *   itself, public/lp/lp-bottleneck-poster-*.png) ships in the SSR markup
 *   and hides only once the player has painted its own first frame
 *   ([data-live] on the holder).
 * - "après la première goutte la bouteille blink un coup": destroying the
 *   intro player and creating the loop player left empty frames. Now the
 *   loop player is DOUBLE-BUFFERED: created on a second host while the
 *   intro plays, pre-rendered at its first frame (== the intro's last),
 *   and the handoff is a visibility swap of two identical frames.
 *
 * Budget discipline (post-OOM doctrine): pure-vector files (~77KB each),
 * CANVAS renderer only, lottie-web's canvas-only build dynamically imported
 * the first time the banner comes within a viewport of the screen. Players
 * pause off-stage and on tab hide; reduced-motion never boots the player at
 * all — the poster is the render.
 */

const SRC = {
  h: { intro: "/lp/lp-bottleneck-h.json", loop: "/lp/lp-bottleneck-h-loop.json" },
  v: { intro: "/lp/lp-bottleneck-v.json", loop: "/lp/lp-bottleneck-v-loop.json" },
} as const;

export function LpBottleneck() {
  const holderRef = useRef<HTMLDivElement>(null);
  const hostARef = useRef<HTMLDivElement>(null);
  const hostBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = holderRef.current;
    const hostA = hostARef.current;
    const hostB = hostBRef.current;
    if (!holder || !hostA || !hostB) return;
    const phone = matchMedia("(max-width: 767px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    let lottie: typeof import("lottie-web").default | null = null;
    let intro: AnimationItem | null = null;
    let loop: AnimationItem | null = null;
    let active: "intro" | "loop" = "intro";
    let disposed = false;
    let loading = false;
    let onStage = false;

    const teardown = () => {
      intro?.destroy();
      loop?.destroy();
      intro = loop = null;
      active = "intro";
      hostA.replaceChildren();
      hostB.replaceChildren();
      hostA.style.visibility = "";
      hostB.style.visibility = "hidden";
      holder.removeAttribute("data-live");
    };

    const create = () => {
      if (disposed || !lottie) return;
      teardown();
      const src = SRC[phone.matches ? "v" : "h"];
      const settings = {
        renderer: "canvas" as const,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
          clearCanvas: true,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
        },
      };
      intro = lottie.loadAnimation({
        ...settings,
        container: hostA,
        loop: false,
        autoplay: true,
        path: src.intro,
      });
      // the loop pre-renders NOW, hidden, at its first frame — which is the
      // intro's last — so the 5.5s handoff swaps two identical frames
      loop = lottie.loadAnimation({
        ...settings,
        container: hostB,
        loop: true,
        autoplay: false,
        path: src.loop,
      });
      loop.addEventListener("DOMLoaded", () => {
        if (!disposed) loop?.goToAndStop(0, true);
      });
      intro.addEventListener("enterFrame", function reveal() {
        // first painted player frame — retire the poster
        holder.setAttribute("data-live", "");
        intro?.removeEventListener("enterFrame", reveal);
      });
      intro.addEventListener("complete", () => {
        if (disposed || !loop) return;
        hostB.style.visibility = "";
        active = "loop";
        sync();
        // two frames of overlap (identical content), then retire the intro
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            hostA.style.visibility = "hidden";
            intro?.destroy();
            intro = null;
          }),
        );
      });
      sync();
    };

    const sync = () => {
      const anim = active === "intro" ? intro : loop;
      if (!anim) return;
      if (onStage && !document.hidden) anim.play();
      else anim.pause();
    };

    const boot = () => {
      if (loading || lottie || disposed || reduced.matches) return;
      loading = true;
      import("lottie-web/build/player/lottie_canvas").then((m) => {
        if (disposed) return;
        lottie = (m.default ?? m) as typeof import("lottie-web").default;
        create();
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
    io.observe(holder);

    const onMedia = () => {
      if (reduced.matches) {
        teardown(); // poster (correct orientation via <picture>) is the render
        return;
      }
      if (lottie) create();
      else boot();
    };
    const onVisibility = () => sync();
    phone.addEventListener("change", onMedia);
    reduced.addEventListener("change", onMedia);
    document.addEventListener("visibilitychange", onVisibility);
    hostB.style.visibility = "hidden";

    return () => {
      disposed = true;
      io.disconnect();
      phone.removeEventListener("change", onMedia);
      reduced.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
      teardown();
    };
  }, []);

  return (
    <div ref={holderRef} className="lp-banner__lottie" aria-hidden="true">
      {/* frame-0 poster, in the SSR markup: the bottle is there the instant
          the card is — the player replaces it only once it has painted */}
      <picture className="lp-banner__poster">
        <source media="(max-width: 767px)" srcSet="/lp/lp-bottleneck-poster-v.png" />
        <img src="/lp/lp-bottleneck-poster-h.png" alt="" />
      </picture>
      <div ref={hostARef} className="lp-banner__lottie-host" />
      <div ref={hostBRef} className="lp-banner__lottie-host" />
    </div>
  );
}
