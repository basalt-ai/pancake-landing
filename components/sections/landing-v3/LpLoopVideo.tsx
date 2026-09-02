"use client";

import { useEffect, useRef } from "react";

/**
 * v3 port of components/sections/landing/LoopVideo.tsx (lp scope — don't import
 * the v2 one, different css namespace). Same three behaviors:
 * - raw-HTML tag so the `muted` attribute survives SSR (facebook/react#10389)
 *   and autoplay works on first paint;
 * - IntersectionObserver pauses it offscreen (three 1080x1080 loops decoding
 *   for the whole visit is real battery on mobile);
 * - prefers-reduced-motion holds it on a still, and a flip of the preference
 *   mid-visit is honored.
 * The host div is the media card itself (className comes from the caller);
 * the inner video is absolutely positioned so it can never change the card box.
 *
 * Never a play button (founder 2026-09-02, iPhone: "pourquoi les motions ont
 * un bouton play?? pas bien"). iOS refuses autoplay in Low Power Mode and
 * under Reduce Motion, then paints its own start-playback glyph over the
 * blank first frame. Three things replace that: a poster (a "full" frame of
 * the loop, the still the card shows whenever it is not playing), the WebKit
 * glyph hidden in steps.css, and a retry of play() on the first user gesture
 * — which is when iOS grants activation. Playback starts from the poster's
 * own instant, so the still and the motion are one continuous frame.
 */
export function LpLoopVideo({
  src,
  alt,
  className,
  poster,
  posterAt = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  /** still shown while not playing (see header) */
  poster?: string;
  /** seconds into the loop the poster was taken — playback starts there */
  posterAt?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = hostRef.current?.querySelector("video");
    if (!video) return;
    const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let seeked = false;
    let armed = false;

    // one seek to the poster's instant, as soon as the timeline exists
    const seekToPoster = () => {
      if (seeked || !(posterAt > 0) || video.readyState < 1) return;
      seeked = true;
      try {
        video.currentTime = posterAt;
      } catch {
        /* not seekable yet — the poster still stands */
      }
    };

    // autoplay refused (no activation yet): retry on the first gesture
    const gestures = ["touchend", "pointerup", "click", "keydown"] as const;
    const retry = () => {
      disarm();
      sync();
    };
    const arm = () => {
      if (armed) return;
      armed = true;
      for (const g of gestures) document.addEventListener(g, retry, { passive: true });
    };
    const disarm = () => {
      if (!armed) return;
      armed = false;
      for (const g of gestures) document.removeEventListener(g, retry);
    };

    const sync = () => {
      if (motionMq.matches || !inView) {
        video.pause();
        return;
      }
      seekToPoster();
      const p = video.play();
      if (p) p.then(disarm).catch(arm);
    };
    const onMotion = () => {
      if (motionMq.matches && seeked) video.currentTime = posterAt;
      sync();
    };

    video.addEventListener("loadedmetadata", seekToPoster);
    seekToPoster();
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    motionMq.addEventListener("change", onMotion);
    if (motionMq.matches) video.pause();
    return () => {
      io.disconnect();
      disarm();
      video.removeEventListener("loadedmetadata", seekToPoster);
      motionMq.removeEventListener("change", onMotion);
    };
  }, [posterAt]);

  const posterAttr = poster ? ` poster="${poster}"` : "";
  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label={alt}
      dangerouslySetInnerHTML={{
        __html: `<video class="lp-loop-video" src="${src}"${posterAttr} autoplay muted loop playsinline preload="metadata" disablepictureinpicture disableremoteplayback></video>`,
      }}
    />
  );
}
