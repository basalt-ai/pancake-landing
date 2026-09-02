"use client";

import { useEffect, useRef } from "react";

/**
 * Ring flow renderer — Canvas 2D, one canvas per rainbow ring (the f2 draft
 * ring, the f4 brain ring), taking over from the eight masked spinning discs
 * (`.lp-feat-ringfx i`, features.css) on desktop.
 *
 * Why (Gecko, 2026-09-02): the CSS flow is four mask-image boxes per ring,
 * each holding a 520px conic disc on `rotate(0 → 360deg)` over 20s. Firefox
 * refuses to run a transform animation on the compositor when any ancestor
 * carries mask-image / clip-path (nsDisplayTransform::
 * ShouldPrerenderTransformedContent), so every vsync near the section is a
 * main-thread restyle + display-list rebuild + WebRender scene — measured
 * ≈70% of a core (83% → 15% with the section hidden). Chromium and WebKit
 * composite the same DOM for free, but a canvas is cheap in every engine:
 * per draw, four rotated bitmap blits and four mask multiplies of one
 * 405×284 box, 30 draws a second, no transform animation anywhere.
 *
 * Fidelity — nothing is re-derived, every input is the CSS flow's:
 *   masks   the same four squiggle SVGs, drawn over the full box
 *           (= mask-size: 100% 100%); their alpha is the mask, as for CSS;
 *   wheels  the four conic-gradient() rules rebuilt with createConicGradient.
 *           CSS `from 0deg` starts at 12 o'clock and runs clockwise; the
 *           canvas start angle is measured from 3 o'clock, clockwise — so
 *           CSS `from 0deg` == canvas start −π/2, and the stops are the same
 *           turn fractions (0, 290, 315, 335, 360 / 360, sRGB ramps in both).
 *           The disc is centred on the box (left/top 50%, −260px margin) and
 *           its 260px radius covers either box through the full turn, so the
 *           wheel is simply the box filled from its own centre;
 *   clock   20s linear, clockwise (positive CSS rotate == positive canvas
 *           rotate, both y-down), accumulating only while on stage and the
 *           document visible — LpAnimFreeze's play-state pause on the same
 *           0.75-viewport margin — and seeded from the CSS discs' own
 *           currentTime at handoff, so the swap never snaps phase;
 *   stack   p1 → p4 source-over, the baked svg's paint order.
 * At angle 0 the composition is the designed rest pose: each squiggle its
 * own colour at the top.
 *
 * Handoff: the canvas draws its first frame, THEN [data-lp-ringflow] lands
 * on the ring stage (`.lp-feat-f2` / `.lp-feat-f4` — the canvas's parent,
 * the box holding the baked img, the CSS discs and the canvas); features.css
 * then shows the canvas and display:none's the discs (their animations end
 * with them — no per-vsync work left). A mask failing to load, no 2D
 * context, no conic gradients, reduced motion, phones: the attribute never
 * lands and the CSS ring flow / baked img stay, byte for byte.
 */

type Variant = "f2" | "f4";

const LOOP_MS = 20000; // lp-feat-ringspin: 20s linear infinite
const DRAW_MS = 32; // ~30 draws/s: the wave crawls at 18°/s; halves the cost, matters at 120Hz
const MAX_DPR = 2;
const SQUIGGLES = 4;

/** Mirror of features.css `.lp-feat-ringfx--pN i`: [base, wave] per
    squiggle; each wheel is base 0–290°, ramp, wave 315–335°, ramp, base
    at 360°. Keep in sync with the CSS — the parity gate compares the two. */
const WHEELS: ReadonlyArray<readonly [base: string, wave: string]> = [
  ["#ba8bff", "#ffbd7a"],
  ["#ffbd7a", "#6ebbff"],
  ["#6ebbff", "#ff7aa0"],
  ["#ff7aa0", "#ba8bff"],
];
const STOPS = [0, 290, 315, 335, 360] as const; // degrees, clockwise from the top

const loadMask = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(url));
    img.decoding = "async";
    img.src = url;
  });

export function LpRingFlow({ variant }: { variant: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    if (!canvas || !stage) return;
    if (typeof IntersectionObserver === "undefined") return;
    // Contexts and offscreen buffers are created on the first approach
    // (boot), not at mount: ten 2D contexts per ring at hydration were a
    // 20ms canvas-IPC burst in Gecko for a section two viewports away.
    let mctx: CanvasRenderingContext2D | null = null;
    let sctx: CanvasRenderingContext2D | null = null;
    const scratch = document.createElement("canvas");
    // offscreen buffers, (re)sized on build only — the loop allocates nothing
    const masks: HTMLCanvasElement[] = [];
    const maskCtx: CanvasRenderingContext2D[] = [];
    const wheels: HTMLCanvasElement[] = [];
    const wheelCtx: CanvasRenderingContext2D[] = [];
    let contextsFailed = false;
    const ensureContexts = (): boolean => {
      if (mctx && sctx) return true;
      if (contextsFailed) return false;
      const m0 = canvas.getContext("2d");
      // no conic gradients (Safari < 16.4): the CSS flow stays
      if (!m0 || typeof m0.createConicGradient !== "function") {
        contextsFailed = true;
        return false;
      }
      const s0 = scratch.getContext("2d");
      if (!s0) {
        contextsFailed = true;
        return false;
      }
      for (let k = 0; k < SQUIGGLES; k++) {
        const m = document.createElement("canvas");
        const w = document.createElement("canvas");
        const mc = m.getContext("2d");
        const wc = w.getContext("2d");
        if (!mc || !wc) {
          contextsFailed = true;
          return false;
        }
        masks.push(m);
        maskCtx.push(mc);
        wheels.push(w);
        wheelCtx.push(wc);
      }
      mctx = m0;
      sctx = s0;
      return true;
    };
    const desktop = matchMedia("(min-width: 768px)");
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");

    let images: HTMLImageElement[] = [];
    let loading = false;
    let W = 0; // backing store, device px
    let H = 0;
    let S = 0; // wheel square side = the box diagonal, so any rotation covers the box
    let built = false;
    let raf = 0;
    let active = desktop.matches && motion.matches;
    let onStage = false;
    let live = false;
    let disposed = false;
    // The ring's own clock: advances only while a frame is drawn (on stage,
    // document visible) — the CSS discs' play-state pause, same margin.
    let activeMs = 0;
    let lastTick = 0;
    let lastDraw = 0;
    let resizeTimer = 0;

    // Staged build: the first frame of a ring costs four SVG mask rasters
    // and four wheel fills (~1 Mpx each) — one tick of 280ms in Gecko when
    // done at once, right as the section approaches. One buffer per tick
    // instead (eight ticks, ~130ms of slack at 60Hz, all inside the 75%
    // margin); the main canvas is only resized — blanked — at the last
    // step, so a rebuild while live keeps showing the previous frame.
    let step = 0; // 0: (re)size the offscreen buffers, 1–4 masks, 5–8 wheels, 9 main canvas
    let nextW = 0;
    let nextH = 0;
    let nextS = 0;
    const build = (): boolean => {
      if (!ensureContexts()) return false;
      if (step === 0) {
        // on-screen size, not layout px: the mockzone zooms at ≤1180 / ≤1024
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        if (!(w > 0 && h > 0)) return false;
        if (w === W && h === H) {
          built = true;
          return true;
        }
        nextW = w;
        nextH = h;
        nextS = 2 * Math.ceil(Math.hypot(w, h) / 2) + 2;
        step = 1;
        return false;
      }
      if (step <= SQUIGGLES) {
        const k = step - 1;
        masks[k].width = nextW;
        masks[k].height = nextH;
        maskCtx[k].drawImage(images[k], 0, 0, nextW, nextH); // = mask-size: 100% 100%
        step++;
        return false;
      }
      if (step <= 2 * SQUIGGLES) {
        const k = step - 1 - SQUIGGLES;
        wheels[k].width = nextS;
        wheels[k].height = nextS;
        // CSS `from 0deg` (12 o'clock) == canvas −π/2 (its zero is 3 o'clock);
        // both run clockwise
        const g = wheelCtx[k].createConicGradient(-Math.PI / 2, nextS / 2, nextS / 2);
        const [base, wave] = WHEELS[k];
        g.addColorStop(STOPS[0] / 360, base);
        g.addColorStop(STOPS[1] / 360, base);
        g.addColorStop(STOPS[2] / 360, wave);
        g.addColorStop(STOPS[3] / 360, wave);
        g.addColorStop(STOPS[4] / 360, base);
        wheelCtx[k].fillStyle = g;
        wheelCtx[k].fillRect(0, 0, nextS, nextS);
        step++;
        return false;
      }
      W = nextW;
      H = nextH;
      S = nextS;
      canvas.width = W;
      canvas.height = H;
      scratch.width = W;
      scratch.height = H;
      lastDraw = 0; // resizing blanked the main buffer: draw on this tick, throttle or not
      step = 0;
      built = true;
      return true;
    };

    /** One composition at `angle` (radians, clockwise): per squiggle, the
        wheel rotated about the box centre, kept where its mask is, stacked
        source-over onto the canvas — the CSS stacking, pixel for pixel. */
    const draw = (angle: number) => {
      if (!mctx || !sctx) return;
      mctx.globalCompositeOperation = "source-over";
      mctx.clearRect(0, 0, W, H);
      for (let k = 0; k < SQUIGGLES; k++) {
        sctx.globalCompositeOperation = "source-over";
        sctx.setTransform(1, 0, 0, 1, 0, 0);
        sctx.clearRect(0, 0, W, H);
        sctx.setTransform(1, 0, 0, 1, W / 2, H / 2);
        sctx.rotate(angle);
        sctx.drawImage(wheels[k], -S / 2, -S / 2);
        sctx.setTransform(1, 0, 0, 1, 0, 0);
        sctx.globalCompositeOperation = "destination-in";
        sctx.drawImage(masks[k], 0, 0);
        mctx.drawImage(scratch, 0, 0);
      }
    };

    const frame = (t: number) => {
      raf = 0;
      if (disposed || !active || !onStage || document.hidden) return;
      if (!built && !build()) {
        raf = requestAnimationFrame(frame); // no box yet (section still skipped) — retry
        return;
      }
      if (lastTick) activeMs += t - lastTick;
      lastTick = t;
      // test hook: a fixed cycle fraction (gates only); hook 0 == the
      // artboard. Drawn every tick, so a gate sees it within one frame.
      const hook = (window as unknown as { __lpRingPhase?: number }).__lpRingPhase;
      const pinned = typeof hook === "number" ? hook : -1;
      if (pinned >= 0 || t - lastDraw >= DRAW_MS) {
        lastDraw = t;
        draw((pinned >= 0 ? pinned : (activeMs % LOOP_MS) / LOOP_MS) * 2 * Math.PI);
        if (!live) {
          live = true;
          stage.setAttribute("data-lp-ringflow", ""); // first frame drew — swap
        }
      }
      raf = requestAnimationFrame(frame);
    };

    // The CSS discs run from page load (paused off-stage by LpAnimFreeze);
    // the first canvas frame continues from their pose, so the swap is
    // invisible even when it happens on screen. Once they are display:none
    // they carry no animation and the ring keeps its own clock.
    const seed = () => {
      const disc = stage.querySelector<HTMLElement>(".lp-feat-ringfx i");
      if (!disc || typeof disc.getAnimations !== "function") return;
      const a = disc.getAnimations()[0];
      if (a && typeof a.currentTime === "number") activeMs = a.currentTime;
    };

    const start = () => {
      if (raf || disposed || !active || !images.length || !onStage || document.hidden) return;
      if (!live) seed();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastTick = 0; // the clock does not run while parked
    };
    const park = () => {
      stop();
      live = false;
      stage.removeAttribute("data-lp-ringflow"); // the CSS flow / artboard shows (features.css)
    };
    const boot = () => {
      if (images.length) {
        start();
        return;
      }
      if (loading || !ensureContexts()) return;
      loading = true;
      Promise.all(
        Array.from({ length: SQUIGGLES }, (_, k) => loadMask(`/lp/lp-${variant}-ring-p${k + 1}.svg`)),
      ).then(
        (imgs) => {
          if (disposed) return;
          images = imgs;
          start();
        },
        () => {
          // a mask failed: never swap — the CSS ring flow stays as is
        },
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        onStage = entries.some((e) => e.isIntersecting);
        if (onStage) start();
        else stop(); // the last frame stays up: the paused pose, like play-state: paused
      },
      // LpAnimFreeze's margin — the CSS discs pause and resume on the same line
      { rootMargin: "75% 0%" },
    );
    io.observe(canvas);
    // relayout → rebuild, settled (a live drag would rebuild every frame).
    // ResizeObserver misses the mockzone's zoom breakpoints (a zoomed box
    // keeps its layout size), so window resize is watched too; build() is
    // a no-op when the backing size comes out unchanged.
    const relayout = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        built = false;
        step = 0;
        start();
      }, 120);
    };
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(relayout) : null;
    ro?.observe(canvas);
    window.addEventListener("resize", relayout);
    // zoom / monitor change: the buffer scale follows devicePixelRatio
    let dprMq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onDpr = () => {
      dprMq.removeEventListener("change", onDpr);
      dprMq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMq.addEventListener("change", onDpr);
      relayout();
    };
    dprMq.addEventListener("change", onDpr);
    // desktop + motion allowed, the CSS flow's own gate; either flipping
    // off hands the ring back (the media rules hide both renders anyway)
    const onMedia = () => {
      const next = desktop.matches && motion.matches;
      if (next === active) return;
      active = next;
      if (active) boot();
      else park();
    };
    desktop.addEventListener("change", onMedia);
    motion.addEventListener("change", onMedia);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    if (active) boot();

    return () => {
      disposed = true;
      park();
      clearTimeout(resizeTimer);
      io.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", relayout);
      dprMq.removeEventListener("change", onDpr);
      desktop.removeEventListener("change", onMedia);
      motion.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`lp-feat-ringflow lp-feat-ringflow--${variant}`}
      aria-hidden="true"
    />
  );
}
