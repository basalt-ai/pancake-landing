"use client";

import { useEffect } from "react";

import { startAutoMarquee } from "@/lib/autoMarquee";

/**
 * Mobile-only auto-drift for the UGC video strip. It rides the SAME native
 * scroll container the inline video script already manages, so the strip
 * stays swipeable; the drift runs opposite the testimonials marquee at the
 * same 36 px/s (founder 2026-07-07: "faire tourner le carousel dans le sens
 * inverse à la même vitesse"). Bounce mode — no duplicated <video> elements.
 * Desktop is untouched (its scroll-snap strip stays static).
 */
export function HomeUGCMarquee() {
  useEffect(() => {
    const track = document.querySelector<HTMLElement>("[data-ugc-wall] .home-ugc-track");
    if (!track) return;

    let cleanup: (() => void) | null = null;
    const mq = window.matchMedia("(max-width: 1023.98px)");

    const apply = () => {
      cleanup?.();
      cleanup = null;
      if (mq.matches) {
        cleanup = startAutoMarquee(track, {
          speed: 36,
          direction: -1,
          mode: "bounce",
        });
      }
    };

    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      cleanup?.();
    };
  }, []);

  return null;
}
