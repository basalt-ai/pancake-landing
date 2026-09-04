"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";

import { LpFeatStage } from "./LpFeatMocks";
import { buildFeatTimeline, type FeatVariant } from "./lp-feat-timelines";

/**
 * A "How Pancake finds customers" media zone that animates its mock UI in
 * place — DOM + CSS + one GSAP timeline per card (lp-feat-timelines.ts),
 * replacing the four mp4 renders of the same compositions (founder
 * 2026-09-03: no 500 KB–1 MB video downloads, vector-crisp at every DPR).
 *
 * Same contract as LpLoopVideo had for these cards:
 * - plays ONCE, when the zone is 60 % in view; scrolled away before the end
 *   → paused, resumed on return; once complete it never restarts and holds
 *   its last frame — the designer's picture;
 * - prefers-reduced-motion shows that picture directly (seek to the end),
 *   and a flip of the preference mid-visit is honored (lifted → starts over);
 * - before the timeline is armed the stage stays hidden (= the blank cream
 *   the video's first-frame poster showed), so hydration never flashes the
 *   final picture. If the build ever throws, the rest-state DOM shows as a
 *   still ("static").
 *
 * Geometry: the stage is the 560×621 zone at design size and scales as
 * pixels with the zone (--lp-fit = zone width / 560, via ResizeObserver;
 * CSS trig fallback pre-hydration — the LpFitVars recipe, since iOS
 * mis-resolves container units inside trig). Text therefore never rewraps
 * at any width: the mock lays out exactly like the desktop render, always.
 */
export function LpFeatAnim({
  variant,
  alt,
  className,
}: {
  variant: FeatVariant;
  /** what the animation shows — the only copy a screen reader gets */
  alt: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const stage = host?.querySelector<HTMLElement>(".lp-feat-stage");
    if (!host || !stage) return;

    // fit scale: the layout content width of the zone (immune to ancestor transforms)
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.contentBoxSize?.[0];
        const width = box ? box.inlineSize : entry.contentRect.width;
        if (!(width > 0)) continue;
        host.style.setProperty("--lp-fit", String(width / 560));
      }
    });
    ro.observe(host);

    const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let done = false;
    let tl: gsap.core.Timeline | undefined;
    let cleanupDom: (() => void) | undefined;

    const sync = () => {
      if (!tl) return;
      if (motionMq.matches) {
        // the final still, no motion at all (events suppressed: not "done" —
        // lifting the preference mid-visit starts the build-up over)
        tl.pause();
        tl.progress(1, true);
        return;
      }
      if (done) return;
      if (inView) {
        tl.play();
        host.dataset.lpAnim = "playing";
      } else {
        tl.pause();
      }
    };

    const ctx = gsap.context(() => {
      try {
        const built = buildFeatTimeline(variant, stage);
        tl = built.tl;
        cleanupDom = built.cleanup;
        tl.eventCallback("onComplete", () => {
          done = true;
          host.dataset.lpAnim = "done";
        });
        tl.pause(0); // frame 0 (the composition's first frame: cream only)
        host.dataset.lpAnim = "armed";
        // QA hook (like __lpArcPhase / __lpRingPhase): seek a card's timeline
        // to any moment and compare with the composition's render
        const w = window as unknown as { __lpFeat?: Record<string, gsap.core.Timeline> };
        w.__lpFeat = { ...w.__lpFeat, [variant]: tl };
      } catch (err) {
        // never a blank card: the rest-state markup is the designer's picture
        host.dataset.lpAnim = "static";
        if (process.env.NODE_ENV !== "production") console.error(err);
      }
    }, stage);

    const onMotion = () => {
      if (!tl) return;
      if (!motionMq.matches && !done) tl.progress(0, true);
      sync();
    };
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0.6 },
    );
    io.observe(host);
    motionMq.addEventListener("change", onMotion);
    sync();

    return () => {
      io.disconnect();
      ro.disconnect();
      motionMq.removeEventListener("change", onMotion);
      ctx.revert();
      cleanupDom?.();
      const w = window as unknown as { __lpFeat?: Record<string, gsap.core.Timeline> };
      if (w.__lpFeat) delete w.__lpFeat[variant];
      delete host.dataset.lpAnim;
      host.style.removeProperty("--lp-fit");
    };
  }, [variant]);

  return (
    <div ref={hostRef} className={className} role="img" aria-label={alt}>
      <LpFeatStage variant={variant} />
    </div>
  );
}
