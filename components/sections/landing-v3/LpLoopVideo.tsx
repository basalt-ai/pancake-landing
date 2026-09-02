"use client";

import { useEffect, useRef } from "react";

/**
 * v3 port of components/sections/landing/LoopVideo.tsx (lp scope — don't import
 * the v2 one, different css namespace). Same three behaviors:
 * - raw-HTML tag so the `muted` attribute survives SSR (facebook/react#10389);
 * - IntersectionObserver plays it in view and pauses it offscreen (three
 *   1080x1080 loops decoding for the whole visit is real battery on mobile);
 * - prefers-reduced-motion holds it on a still, and a flip of the preference
 *   mid-visit is honored.
 * The host div is the media card itself (className comes from the caller);
 * the inner video is absolutely positioned so it can never change the card box.
 *
 * Never a play button (founder 2026-09-02, iPhone: "pourquoi les motions ont
 * un bouton play?? pas bien"). In Low Power Mode (and under aggressive
 * thermal mitigation) iOS denies every play() outside a user gesture AND
 * paints its own start-playback glyph — but only on a video carrying the
 * `autoplay` content attribute (HTMLMediaElement::shouldForceControlsDisplay;
 * the ::-webkit-media-controls CSS hides are a no-op on modern iOS). So:
 * no `autoplay` attribute (the observer starts playback anyway), a poster —
 * a "full" frame of the loop, the still the card shows whenever it is not
 * playing — and one retry of play() on the first gesture anywhere, for
 * every denied loop at once: WebKit lifts the restriction per element for
 * good when play() runs inside that gesture, so the observer keeps working
 * afterwards. Playback starts from the poster's own instant, so the still
 * and the motion are one continuous frame.
 */

/** every mounted loop → its "play inside a gesture" routine. Once one loop
    is denied, the first gesture runs it for ALL of them — including the
    ones still below the fold, which would otherwise be denied in their turn
    and need a second tap (the restriction is per element). */
const loops = new Map<HTMLVideoElement, () => void>();
let unlockArmed = false;
// activation-triggering events (scroll is not a gesture)
const GESTURES = ["touchend", "pointerup", "click", "keydown"] as const;
const onGesture = () => {
  unlockArmed = false;
  for (const g of GESTURES) document.removeEventListener(g, onGesture, true);
  loops.forEach((resume) => resume());
};
const armUnlock = () => {
  if (unlockArmed) return;
  unlockArmed = true;
  for (const g of GESTURES) document.addEventListener(g, onGesture, { capture: true, passive: true });
};

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
    const host = hostRef.current;
    const video = host?.querySelector("video");
    if (!host || !video) return;
    // IDL flags too (iOS refuses non-muted / non-inline playback)
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let seeked = false;

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

    const sync = () => {
      if (motionMq.matches || !inView) {
        video.pause();
        return;
      }
      seekToPoster();
      const p = video.play();
      if (!p) return;
      p.then(
        () => {
          host.dataset.lpVideo = "playing";
        },
        (err: unknown) => {
          // NotAllowedError = iOS wants a gesture (Low Power Mode / thermal).
          // The poster stays; the first gesture retries. Anything else
          // (AbortError from a pause() race) is noise.
          if ((err as DOMException | undefined)?.name !== "NotAllowedError") return;
          host.dataset.lpVideo = "blocked";
          armUnlock();
        },
      );
    };
    // inside a gesture: play() lifts this element's restriction for good;
    // then the observer contract applies (off-screen → paused)
    loops.set(video, () => {
      if (motionMq.matches) return;
      seekToPoster();
      void video.play().then(
        () => {
          host.dataset.lpVideo = "playing";
          if (!inView) video.pause();
        },
        () => {},
      );
    });
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
    return () => {
      io.disconnect();
      loops.delete(video);
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
        // no `autoplay` — see header; muted stays a content attribute (SSR)
        __html: `<video class="lp-loop-video" src="${src}"${posterAttr} muted loop playsinline preload="metadata" disablepictureinpicture disableremoteplayback></video>`,
      }}
    />
  );
}
