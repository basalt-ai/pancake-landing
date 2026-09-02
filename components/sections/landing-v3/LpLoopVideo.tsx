"use client";

import { useEffect, useRef } from "react";

/**
 * Step animation: plays ONCE, when its card comes into view, and then holds
 * its last frame as the still (founder 2026-09-02: "les animations démarrent
 * quand l'écran est focalisé sur l'animation … l'image statique demeure à la
 * fin" — the brain, the Agents view, the filled calendar). Scrolled away
 * before the end → paused, resumed on return; once ended it never restarts.
 *
 * - raw-HTML tag so the `muted` attribute survives SSR (facebook/react#10389);
 * - IntersectionObserver at 60 % visibility decides "focused on it";
 * - prefers-reduced-motion shows the final still (seek to the end, no motion),
 *   and a flip of the preference mid-visit is honored.
 * The host div is the media card itself (className comes from the caller);
 * the inner video is absolutely positioned so it can never change the card box.
 *
 * Never a play button (founder 2026-09-02, iPhone). In Low Power Mode (and
 * under aggressive thermal mitigation) iOS denies every play() outside a user
 * gesture AND paints its own start-playback glyph — but only on a video
 * carrying the `autoplay` content attribute (HTMLMediaElement::
 * shouldForceControlsDisplay; the ::-webkit-media-controls CSS hides are a
 * no-op on modern iOS). So: no `autoplay` attribute (the observer starts
 * playback), a poster = the animation's first frame (the still the card
 * shows before it starts), and one retry of play() on the first gesture
 * anywhere for every denied video at once: WebKit lifts the restriction per
 * element for good when play() runs inside that gesture.
 */

/** every mounted video → its "play inside a gesture" routine (see header) */
const videos = new Map<HTMLVideoElement, () => void>();
let unlockArmed = false;
// activation-triggering events (scroll is not a gesture)
const GESTURES = ["touchend", "pointerup", "click", "keydown"] as const;
const onGesture = () => {
  unlockArmed = false;
  for (const g of GESTURES) document.removeEventListener(g, onGesture, true);
  videos.forEach((resume) => resume());
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
}: {
  src: string;
  alt: string;
  className?: string;
  /** the animation's first frame — shown until it starts */
  poster?: string;
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
    let done = false;

    // reduced motion: the final still, no motion at all
    const showEnd = () => {
      if (video.readyState < 1 || !isFinite(video.duration)) return;
      video.pause();
      try {
        video.currentTime = Math.max(0, video.duration - 0.05);
      } catch {
        /* not seekable yet — the poster stands */
      }
    };

    const sync = () => {
      if (motionMq.matches) {
        showEnd();
        return;
      }
      if (!inView || done) {
        if (!done) video.pause();
        return;
      }
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
    videos.set(video, () => {
      if (motionMq.matches || done) return;
      void video.play().then(
        () => {
          host.dataset.lpVideo = "playing";
          if (!inView) video.pause();
        },
        () => {},
      );
    });
    const onEnded = () => {
      done = true;
      host.dataset.lpVideo = "done";
    };
    const onMotion = () => {
      if (!motionMq.matches && !done) {
        // preference lifted mid-visit: start over from the beginning if in view
        try {
          video.currentTime = 0;
        } catch {
          /* noop */
        }
      }
      sync();
    };

    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", () => {
      if (motionMq.matches) showEnd();
    });
    if (motionMq.matches) showEnd();
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0.6 },
    );
    io.observe(video);
    motionMq.addEventListener("change", onMotion);
    return () => {
      io.disconnect();
      videos.delete(video);
      video.removeEventListener("ended", onEnded);
      motionMq.removeEventListener("change", onMotion);
    };
  }, []);

  const posterAttr = poster ? ` poster="${poster}"` : "";
  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label={alt}
      dangerouslySetInnerHTML={{
        // no `autoplay`, no `loop` — see header; muted stays a content attribute (SSR)
        __html: `<video class="lp-loop-video" src="${src}"${posterAttr} muted playsinline preload="auto" disablepictureinpicture disableremoteplayback></video>`,
      }}
    />
  );
}
