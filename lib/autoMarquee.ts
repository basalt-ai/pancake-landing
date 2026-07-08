/**
 * Auto-scrolling marquee on a NATIVE horizontal scroll container.
 *
 * The element stays natively swipeable (touch / trackpad / wheel keep
 * working); between interactions a rAF loop drifts `scrollLeft` at a
 * constant px/s. The content must be duplicated (two identical sets back to
 * back) so the wrap is seamless: crossing one set width instantly rebases by
 * that width onto the visually identical copy.
 *
 * A finger down (or a wheel nudge) pauses the drift — the touch analog of a
 * hover-pause, so a reader can hold a card still (WCAG 2.2.2). After a short
 * idle it resumes from wherever the user left the scroll. `prefers-reduced-
 * motion` disables the drift entirely; the strip stays swipeable.
 */

type MarqueeOptions = {
  /** Drift speed in px/s. */
  speed?: number;
  /** Initial travel: 1 = content moves left (scrollLeft grows); -1 = reverse. */
  direction?: 1 | -1;
  /** Flex gap between cards in px — corrects the half-gap wrap seam. */
  gap?: number;
  /** Idle after an interaction before the drift resumes. */
  resumeDelayMs?: number;
  /**
   * "loop" (default): content is duplicated, so crossing one set width
   * rebases seamlessly onto the identical copy. "bounce": no duplication,
   * the drift reverses at each scroll end — for strips too heavy to
   * duplicate (e.g. live videos).
   */
  mode?: "loop" | "bounce";
};

export function startAutoMarquee(el: HTMLElement, opts: MarqueeOptions = {}): () => void {
  const speed = opts.speed ?? 36;
  const gap = opts.gap ?? 0;
  const resumeDelay = opts.resumeDelayMs ?? 1200;
  const mode = opts.mode ?? "loop";

  const prm =
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  let raf = 0;
  let last = 0;
  let paused = false;
  let resumeTimer = 0;
  let pos = el.scrollLeft;
  let travel: 1 | -1 = opts.direction ?? 1;

  // One logical set = half the duplicated content, plus the half gap that
  // sits between the two sets (mirrors the desktop ticker's `+ gap/2`).
  const setWidth = () => el.scrollWidth / 2 + gap / 2;
  const maxScroll = () => el.scrollWidth - el.clientWidth;

  // Reverse loop drift needs room to the left, so start a set-width in.
  // Bounce keeps whatever start position the caller left (e.g. the UGC
  // script centres the strip first) and simply reverses at the ends.
  if (mode === "loop" && travel === -1) {
    pos = setWidth();
    el.scrollLeft = pos;
  }

  const onFrame = (t: number) => {
    raf = requestAnimationFrame(onFrame);
    if (last === 0) {
      last = t;
      return;
    }
    const dt = (t - last) / 1000;
    last = t;
    if (paused || (prm && prm.matches)) return;
    // Nothing to drive until the content actually overflows.
    const max = maxScroll();
    if (max <= 4) return;
    pos += travel * speed * dt;
    if (mode === "loop") {
      const w = setWidth();
      if (w <= 4) return;
      if (pos >= w) pos -= w;
      else if (pos < 0) pos += w;
    } else {
      // bounce: clamp + flip at the ends.
      if (pos >= max) {
        pos = max;
        travel = -1;
      } else if (pos <= 0) {
        pos = 0;
        travel = 1;
      }
    }
    el.scrollLeft = pos;
  };

  const pause = () => {
    paused = true;
    window.clearTimeout(resumeTimer);
  };
  const scheduleResume = () => {
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      // Continue from wherever the finger left the scroll.
      if (mode === "loop") {
        const w = setWidth();
        pos = w > 0 ? ((el.scrollLeft % w) + w) % w : el.scrollLeft;
        el.scrollLeft = pos;
      } else {
        pos = el.scrollLeft;
      }
      last = 0;
      paused = false;
    }, resumeDelay);
  };

  const onDown = () => pause();
  const onUp = () => scheduleResume();
  const onWheel = () => {
    pause();
    scheduleResume();
  };

  el.addEventListener("pointerdown", onDown, { passive: true });
  el.addEventListener("pointerup", onUp, { passive: true });
  el.addEventListener("pointercancel", onUp, { passive: true });
  el.addEventListener("touchstart", onDown, { passive: true });
  el.addEventListener("touchend", onUp, { passive: true });
  el.addEventListener("wheel", onWheel, { passive: true });

  raf = requestAnimationFrame(onFrame);

  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(resumeTimer);
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointerup", onUp);
    el.removeEventListener("pointercancel", onUp);
    el.removeEventListener("touchstart", onDown);
    el.removeEventListener("touchend", onUp);
    el.removeEventListener("wheel", onWheel);
  };
}
