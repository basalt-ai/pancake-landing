"use client";

import { useEffect, useRef } from "react";

/**
 * v3 port of components/sections/landing/LoopVideo.tsx (lp scope — don't import
 * the v2 one, different css namespace). Same three behaviors:
 * - raw-HTML tag so the `muted` attribute survives SSR (facebook/react#10389)
 *   and autoplay works on first paint;
 * - IntersectionObserver pauses it offscreen (three 1080x1080 loops decoding
 *   for the whole visit is real battery on mobile);
 * - prefers-reduced-motion holds it on its first frame, and a flip of the
 *   preference mid-visit is honored.
 * The host div is the media card itself (className comes from the caller);
 * the inner video is absolutely positioned so it can never change the card box.
 */
export function LpLoopVideo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = hostRef.current?.querySelector("video");
    if (!video) return;
    const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;

    const sync = () => {
      if (motionMq.matches || !inView) video.pause();
      else void video.play().catch(() => {});
    };
    const onMotion = () => {
      if (motionMq.matches) video.currentTime = 0;
      sync();
    };

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
      motionMq.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label={alt}
      dangerouslySetInnerHTML={{
        __html: `<video class="lp-loop-video" src="${src}" autoplay muted loop playsinline preload="metadata"></video>`,
      }}
    />
  );
}
