/**
 * The landing snake — 13 pancake beads chasing a wander/orbit path, drawn on
 * canvas in multiply blend, revealing duplicate copy through per-frame
 * clip-path circles. Verbatim port of the engine inside public/landing-v2.html,
 * refactored from a page-level IIFE into a mountable instance so the hero and
 * the closing CTA can each run their own stage.
 *
 * Instance contract: `mountSnake({ stage, canvas, overlays })` → cleanup fn.
 * `overlays` are absolutely-positioned duplicate-text spans (cream-colored)
 * whose clip-path is rewritten every frame in their own local coordinates.
 */

export type SnakeHandle = {
  step: (n?: number, dtMs?: number) => void;
  state: () => Record<string, unknown>;
  setPointer: (x: number | null, y?: number) => void;
  suspendPointer: (v: boolean) => void;
  setLoopDist: (d: number) => void;
  pause: (v: boolean) => void;
};

declare global {
  interface Window {
    /** Deterministic QA hooks, one entry per mounted stage (hero first). */
    __snakes?: SnakeHandle[];
    __snakePaused?: boolean;
  }
}

type MountOpts = {
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  overlays: HTMLElement[];
  /** Copy/CTA block the snake must not park on: the wander steers away from
   *  it, the mobile orbit lap shrinks to the band above it. */
  keepOut?: HTMLElement;
  /** Wider keep-out used on loop-mode stages (≤1079px / coarse pointer) —
   *  typically the whole copy block including the H1. At stacked widths the
   *  lap otherwise sweeps the headline and the tail's pale single circles
   *  park on it, eroding the cream knockout mid-letter (mobile QA
   *  2026-08-26). Desktop wander keeps `keepOut` so beads still cross the
   *  H1 and fire the reveal — the hero's signature. */
  keepOutStacked?: HTMLElement;
};

// ---------- geometry & motion constants (measured on the reference) ----------
const R = 88.5; //                circle radius — identical at every breakpoint
const L = R * 0.8; //             arc-length between segment centers
const N = 13; //                  segments
// ---------- pancake skin (design-system tokens) ----------
const CREAM = "#FFF7EC"; //       chrome-20
const FILLS = ["#FFBD7A", "#BA8BFF", "#68CEA7"]; // golden, purple, mint — multiply does the rest
const CRUISE = 48; //             head speed, px/s
const LOOP_LAMBDA = 6; //         how tightly the head tracks its orbit target
const CHASE_LAMBDA = 3.4; //      pursuit: pos += (target-pos) * (1 - e^(-λ·dt))
const RAMP_LAMBDA = 2.5; //       wander speed ramp toward cruise
const TURN_FAST = 0.6; //         rad/s amplitude, ~1.8s-period steering noise
const TURN_SLOW = 0.3; //         rad/s amplitude, ~8s-period drift bias
const KO_PAD = 12; //             keep-out rect inflation, px
const KO_STEER = 2.2; //          rad/s max repel away from the keep-out

export function mountSnake({ stage, canvas, overlays, keepOut, keepOutStacked }: MountOpts): () => void {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return () => {};
  const motionMq = matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- seeded noise (deterministic when ?seed= given) ----------
  const seedParam = new URLSearchParams(location.search).get("seed");
  let seedState = seedParam
    ? parseInt(seedParam, 10) >>> 0
    : Math.floor(Math.random() * 2 ** 31) >>> 0;
  const rand = () => {
    seedState |= 0;
    seedState = (seedState + 0x6d2b79f5) | 0;
    let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // 1D value noise: smooth curve through random values at integer lattice
  const makeNoise = () => {
    const g = Array.from({ length: 256 }, () => rand() * 2 - 1);
    return (x: number) => {
      const i = Math.floor(x),
        f = x - i;
      const u = f * f * (3 - 2 * f);
      return g[i & 255]! * (1 - u) + g[(i + 1) & 255]! * u;
    };
  };
  const turnNoise = makeNoise();
  const turnNoise2 = makeNoise();

  // ---------- state ----------
  let W = 0,
    H = 0,
    DPR = 2;
  let head = { x: 0, y: 0 };
  let heading = Math.PI;
  let speed = 0;
  let pointer: { x: number; y: number } | null = null; // component-local, or null
  let noiseT = rand() * 100;
  let segs: { x: number; y: number }[] = new Array(N);

  // trail: polyline the head has traveled; segments sit i*L back along it.
  // stored head-first: trail[0] is the current head position.
  let trail: { x: number; y: number; d: number }[] = [];

  const clampX = (x: number) => Math.min(Math.max(x, R), W - R);
  const clampY = (y: number) => Math.min(Math.max(y, R), H - R);

  // ---------- keep-out: the copy/CTA rect the snake must respect ----------
  // Measured from the DOM (never consumes rand() — seeded determinism holds).
  let ko: { x0: number; y0: number; x1: number; y1: number } | null = null;
  function measureKeepOut() {
    // Loop stages widen the keep-out to the whole copy block (see MountOpts).
    const el = loopMode && keepOutStacked ? keepOutStacked : keepOut;
    if (!el) {
      ko = null;
      return;
    }
    const sr = stage.getBoundingClientRect();
    const kr = el.getBoundingClientRect();
    ko = {
      x0: kr.left - sr.left - KO_PAD,
      y0: kr.top - sr.top - KO_PAD,
      x1: kr.right - sr.left + KO_PAD,
      y1: kr.bottom - sr.top + KO_PAD,
    };
  }

  // ---------- orbit mode (phones/tablets): the snake circles the stage ----------
  // Narrow stages leave no room to wander at full radius, so instead of roaming it
  // runs a closed rounded-rect lap hugging the edges. Desktop keeps the free wander.
  let loopMode = false;
  let loopDist = 0;
  const isLoopStage = () =>
    matchMedia("(pointer: coarse)").matches || window.innerWidth <= 1079;

  // the lap: rounded rectangle inset by R so the circles stay fully on stage.
  // With a keep-out, the lap flattens into the band ABOVE the content so the
  // orbit never sweeps the copy/CTAs.
  function loopBox() {
    const availH = ko ? Math.min(H, Math.max(2 * R + 10, ko.y0)) : H;
    const x0 = R,
      y0 = R,
      w = Math.max(1, W - 2 * R),
      h = Math.max(1, availH - 2 * R);
    const cr = Math.min(w, h) / 2; // fully rounded on the narrow axis
    return { x0, y0, w, h, cr, sw: w - 2 * cr, sh: h - 2 * cr, qa: (Math.PI / 2) * cr };
  }
  function loopLength() {
    const b = loopBox();
    return 2 * b.sw + 2 * b.sh + 4 * b.qa;
  }
  // point at arc-length `d` along the lap, walking top → right → bottom → left
  function loopPoint(d: number) {
    const b = loopBox();
    const per = 2 * b.sw + 2 * b.sh + 4 * b.qa;
    d = ((d % per) + per) % per;
    const L1 = b.sw,
      L2 = L1 + b.qa,
      L3 = L2 + b.sh,
      L4 = L3 + b.qa;
    const L5 = L4 + b.sw,
      L6 = L5 + b.qa,
      L7 = L6 + b.sh;
    const cx0 = b.x0 + b.cr,
      cx1 = b.x0 + b.w - b.cr;
    const cy0 = b.y0 + b.cr,
      cy1 = b.y0 + b.h - b.cr;
    const onArc = (cx: number, cy: number, a0: number, t: number) => ({
      x: cx + b.cr * Math.cos(a0 + t),
      y: cy + b.cr * Math.sin(a0 + t),
    });
    if (d < L1) return { x: cx0 + d, y: b.y0 }; //                       top edge →
    if (d < L2) return onArc(cx1, cy0, -Math.PI / 2, (d - L1) / b.cr); // top-right
    if (d < L3) return { x: b.x0 + b.w, y: cy0 + (d - L2) }; //          right edge ↓
    if (d < L4) return onArc(cx1, cy1, 0, (d - L3) / b.cr); //           bottom-right
    if (d < L5) return { x: cx1 - (d - L4), y: b.y0 + b.h }; //          bottom edge ←
    if (d < L6) return onArc(cx0, cy1, Math.PI / 2, (d - L5) / b.cr); // bottom-left
    if (d < L7) return { x: b.x0, y: cy1 - (d - L6) }; //                left edge ↑
    return onArc(cx0, cy0, Math.PI, (d - L7) / b.cr); //                 top-left
  }
  // where on the lap is this point? (used to rejoin smoothly after a drag)
  function nearestLoopDist(x: number, y: number) {
    const per = loopLength();
    let best = 0,
      bestD = Infinity;
    for (let i = 0; i < 240; i++) {
      const d = (i / 240) * per,
        p = loopPoint(d);
      const dd = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (dd < bestD) {
        bestD = dd;
        best = d;
      }
    }
    return best;
  }

  function pushTrail(x: number, y: number) {
    const prev = trail[0];
    if (prev) {
      const d = Math.hypot(x - prev.x, y - prev.y);
      if (d < 0.05) {
        prev.x = x;
        prev.y = y;
        if (trail[1]) trail[1].d = Math.hypot(prev.x - trail[1].x, prev.y - trail[1].y);
        return;
      }
      trail.unshift({ x, y, d: 0 });
      trail[1]!.d = d;
      trail[0]!.d = 0;
    } else {
      trail.unshift({ x, y, d: 0 });
    }
    // trim: keep just over N*L of arc
    let acc = 0;
    for (let i = 1; i < trail.length; i++) {
      acc += trail[i]!.d;
      if (acc > N * L + R * 0.45) {
        trail.length = i + 1;
        break;
      }
    }
  }

  function placeSegments() {
    let si = 0,
      acc = 0;
    segs[si++] = { x: trail[0]!.x, y: trail[0]!.y };
    for (let i = 1; i < trail.length && si < N; i++) {
      const p = trail[i - 1]!,
        q = trail[i]!,
        d = q.d;
      while (si < N && acc + d >= si * L) {
        const t = (si * L - acc) / d;
        segs[si] = { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
        si++;
      }
      acc += d;
    }
    for (; si < N; si++) segs[si] = { ...segs[si - 1]! };
  }

  // ---------- initial pose: open J-curve — flat run lower left, rising to the head upper right ----------
  function seedTrail() {
    trail = [];
    if (loopMode) {
      // lay the body out along the lap, head at loopDist, tail trailing behind it
      const need = N * L + R * 0.68;
      const stepLen = Math.max(2, L / 12);
      for (let d = need; d >= 0; d -= stepLen) {
        const p = loopPoint(loopDist - d);
        pushTrail(clampX(p.x), clampY(p.y));
      }
      head = { x: trail[0]!.x, y: trail[0]!.y };
      if (trail.length > 2)
        heading = Math.atan2(trail[0]!.y - trail[2]!.y, trail[0]!.x - trail[2]!.x);
      placeSegments();
      return;
    }
    // shape lives in its own 1.6 x 1.0 box, so the pose reads identically on a
    // wide desktop stage and a tall phone stage (stage fractions would stretch it)
    const SHAPE: [number, number][] = [
      [1.6, 0.0],
      [1.6, 0.196],
      [1.518, 0.433],
      [1.341, 0.67],
      [1.083, 0.856],
      [0.744, 0.969],
      [0.371, 1.0],
      [0.0, 1.0],
    ];
    const spline = (cs: { x: number; y: number }[]) => {
      const out: { x: number; y: number }[] = [];
      for (let i = 0; i < cs.length - 1; i++) {
        const p0 = cs[Math.max(i - 1, 0)]!,
          p1 = cs[i]!,
          p2 = cs[i + 1]!,
          p3 = cs[Math.min(i + 2, cs.length - 1)]!;
        for (let k = 0; k < 30; k++) {
          const t = k / 30,
            t2 = t * t,
            t3 = t2 * t;
          out.push({
            x:
              0.5 *
              (2 * p1.x +
                (-p0.x + p2.x) * t +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y:
              0.5 *
              (2 * p1.y +
                (-p0.y + p2.y) * t +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
          });
        }
      }
      return out;
    };
    const arcOf = (ps: { x: number; y: number }[]) => {
      let a = 0;
      for (let i = 1; i < ps.length; i++)
        a += Math.hypot(ps[i]!.x - ps[i - 1]!.x, ps[i]!.y - ps[i - 1]!.y);
      return a;
    };
    const want = N * L + R * 0.68;
    // size the shape so its arc equals the body length, then fit it inside the stage
    const unit = spline(SHAPE.map(([u, v]) => ({ x: u, y: v })));
    let s = want / arcOf(unit);
    s = Math.min(s, (W - 2 * R - 8) / 1.6, (H - 2 * R - 8) / 1.0);
    // park the body in the upper stage; the copy band owns the lower third
    const ox = (W - 1.6 * s) * 0.62 + R * 0.1;
    const oy = Math.min(H * 0.3, Math.max(R + 4, (H - s) * 0.42));
    const pts = spline(SHAPE.map(([u, v]) => ({ x: ox + u * s, y: oy + v * s }))).map(
      (p) => ({ x: clampX(p.x), y: clampY(p.y) }),
    );
    // narrow stages: the J-curve alone can't carry N*L of arc — extend the tail as a coil
    // (deep overlap, never concentric) instead of letting surplus segments stack on one point.
    let arc = arcOf(pts);
    const need = want;
    if (arc < need && pts.length > 1) {
      let p = pts[pts.length - 1]!;
      const q = pts[pts.length - 2]!;
      let dir = Math.atan2(p.y - q.y, p.x - q.x);
      const stepLen = Math.max(2.5, R * 0.068);
      let guard = 0;
      while (arc < need && guard++ < 2000) {
        dir += stepLen / (R * 1.25); // coil of ~1.25R; walls fold it into a serpentine
        const nx = clampX(p.x + Math.cos(dir) * stepLen),
          ny = clampY(p.y + Math.sin(dir) * stepLen);
        const moved = Math.hypot(nx - p.x, ny - p.y);
        if (moved < 0.5) {
          dir += 0.3; // pinned against a wall: rotate free
          continue;
        }
        arc += moved;
        p = { x: nx, y: ny };
        pts.push(p);
      }
    }
    for (let i = pts.length - 1; i >= 0; i--) pushTrail(clampX(pts[i]!.x), clampY(pts[i]!.y));
    head = { x: trail[0]!.x, y: trail[0]!.y };
    if (trail.length > 2)
      heading = Math.atan2(trail[0]!.y - trail[2]!.y, trail[0]!.x - trail[2]!.x);
    placeSegments();
  }

  // ---------- sizing ----------
  function resize() {
    const r = stage.getBoundingClientRect();
    if (r.width < 2 * R || r.height < 2 * R) return; // hidden/degenerate container: wait for a real rect
    const oldW = W,
      oldH = H,
      wasLoop = loopMode;
    W = r.width;
    H = r.height;
    // Mode first: measureKeepOut() picks its target element off loopMode.
    loopMode = isLoopStage();
    measureKeepOut();
    DPR = Math.max(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!trail.length) {
      seedTrail();
      return;
    }
    const rx = W / oldW,
      ry = H / oldH;
    if (loopMode !== wasLoop || Math.abs(rx - 1) > 0.15 || Math.abs(ry - 1) > 0.15) {
      // breakpoint-scale jump: a squeezed trail would pile the beads into one dark blob — re-pose instead
      seedTrail();
      return;
    }
    // gentle resize (mobile toolbars, window nudges): carry the pose along proportionally
    for (const p of trail) {
      p.x = clampX(p.x * rx);
      p.y = clampY(p.y * ry);
    }
    for (let i = 1; i < trail.length; i++) {
      trail[i]!.d = Math.hypot(trail[i]!.x - trail[i - 1]!.x, trail[i]!.y - trail[i - 1]!.y);
    }
    head = { x: trail[0]!.x, y: trail[0]!.y };
    placeSegments();
  }

  // ---------- simulation ----------
  function step(dt: number) {
    if (pointer) {
      const tx = clampX(pointer.x),
        ty = clampY(pointer.y);
      const k = 1 - Math.exp(-CHASE_LAMBDA * dt);
      head.x += (tx - head.x) * k;
      head.y += (ty - head.y) * k;
      speed = 0;
    } else if (loopMode) {
      // the target runs the lap at cruise speed; the head chases it, so a released
      // drag curves back onto the orbit instead of snapping to it
      loopDist += CRUISE * dt;
      const t = loopPoint(loopDist);
      const k = 1 - Math.exp(-LOOP_LAMBDA * dt);
      const px0 = head.x,
        py0 = head.y;
      head.x += (t.x - head.x) * k;
      head.y += (t.y - head.y) * k;
      const mx = head.x - px0,
        my = head.y - py0;
      if (Math.hypot(mx, my) > 0.01) heading = Math.atan2(my, mx);
      speed = CRUISE;
    } else {
      noiseT += dt;
      const turn = turnNoise(noiseT * 0.55) * TURN_FAST + turnNoise2(noiseT * 0.12) * TURN_SLOW;
      heading += turn * dt;
      while (heading > Math.PI) heading -= 2 * Math.PI;
      while (heading < -Math.PI) heading += 2 * Math.PI;
      speed += (CRUISE - speed) * (1 - Math.exp(-RAMP_LAMBDA * dt));
      // keep-out repel: inside the inflated rect, steer away from its center
      // (wall-escape style) so the wander never parks on the copy.
      if (ko && head.x > ko.x0 - R && head.x < ko.x1 + R && head.y > ko.y0 - R && head.y < ko.y1 + R) {
        const away = Math.atan2(head.y - (ko.y0 + ko.y1) / 2, head.x - (ko.x0 + ko.x1) / 2);
        let dh = away - heading;
        while (dh > Math.PI) dh -= 2 * Math.PI;
        while (dh < -Math.PI) dh += 2 * Math.PI;
        heading += Math.sign(dh) * Math.min(Math.abs(dh), KO_STEER * dt);
      }
      const px0 = head.x,
        py0 = head.y;
      head.x = clampX(px0 + Math.cos(heading) * speed * dt);
      head.y = clampY(py0 + Math.sin(heading) * speed * dt);
      // wall-stall escape: the more the clamp eats the motion, the harder we steer inward.
      const intended = speed * dt;
      if (intended > 1e-4) {
        const blocked = 1 - Math.hypot(head.x - px0, head.y - py0) / intended;
        if (blocked > 0.15) {
          let dh = Math.atan2(H / 2 - head.y, W / 2 - head.x) - heading;
          while (dh > Math.PI) dh -= 2 * Math.PI;
          while (dh < -Math.PI) dh += 2 * Math.PI;
          heading += Math.sign(dh) * Math.min(Math.abs(dh), blocked * blocked * 0.9 * dt);
        }
      }
    }
    pushTrail(head.x, head.y);
    placeSegments();
  }

  // ---------- render ----------
  function draw() {
    if (!trail.length) return; // container not measurable yet
    ctx!.fillStyle = CREAM;
    ctx!.globalCompositeOperation = "source-over";
    ctx!.fillRect(0, 0, W, H);
    ctx!.globalCompositeOperation = "multiply";
    for (let i = 0; i < N; i++) {
      const s = segs[i]!;
      ctx!.fillStyle = FILLS[i % 3]!;
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, R, 0, Math.PI * 2);
      ctx!.fill();
    }
    // clip-paths for the text overlays, each in its span's local coords.
    // Both overlays reveal on FULL circles (founder call 2026-08-01: one
    // consistent effect; on light single-circle zones the cream copy reads
    // faint/ghosty by design — the snake moves on within seconds).
    const cr = canvas.getBoundingClientRect();
    for (const span of overlays) {
      const sr = span.getBoundingClientRect();
      const ox = cr.left - sr.left,
        oy = cr.top - sr.top;
      let path = "";
      for (let i = 0; i < N; i++) {
        const cx = segs[i]!.x + ox,
          cy = (segs[i]!.y + oy).toFixed(1);
        const xr = (cx + R).toFixed(1),
          xl = (cx - R).toFixed(1);
        path += `M ${xr} ${cy} A ${R} ${R} 0 1 0 ${xl} ${cy} A ${R} ${R} 0 1 0 ${xr} ${cy} Z `;
      }
      span.style.clipPath = `path("${path.trim()}")`;
    }
  }

  // ---------- pointer ----------
  // Drag steers on every device; releasing hands control back to the orbit/wander.
  let pointerSuspended = false;
  function onMove(e: PointerEvent) {
    if (pointerSuspended) return;
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left,
      y = e.clientY - r.top;
    if (x >= 0 && y >= 0 && x <= r.width && y <= r.height) {
      pointer = { x, y };
    } else if (pointer) {
      releasePointer();
    }
  }
  function releasePointer() {
    if (!pointer) return;
    pointer = null;
    if (trail.length > 2)
      heading = Math.atan2(trail[0]!.y - trail[2]!.y, trail[0]!.x - trail[2]!.x);
    speed = 0;
    // rejoin the lap from wherever the drag left the head
    if (loopMode) loopDist = nearestLoopDist(head.x, head.y);
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!motionMq.matches) onMove(e);
  };
  const onPointerUp = (e: PointerEvent) => {
    // a mouse lifting its button is still hovering — only a finger/pen lift means the pointer left
    if (e.pointerType !== "mouse") releasePointer();
  };
  const onPointerCancel = () => releasePointer();
  const onMouseLeave = () => releasePointer();
  const onBlur = () => releasePointer();
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerCancel, { passive: true });
  document.addEventListener("mouseleave", onMouseLeave);
  window.addEventListener("blur", onBlur);

  // ---------- main loop ----------
  // never trust rAF cadence: throttled/headless panes starve it or fire it slow.
  // consume REAL elapsed time in <=33ms sub-steps so sim time never falls behind wall time.
  let lastNow = performance.now();
  let running = !motionMq.matches;
  let disposed = false;
  const onMotionChange = () => {
    const wasRunning = running;
    running = !motionMq.matches;
    if (!running) releasePointer();
    if (running && !wasRunning) {
      lastNow = performance.now();
      requestAnimationFrame(frame);
    }
    draw();
  };
  motionMq.addEventListener("change", onMotionChange);
  // DPR can change without a resize event (monitor hop, browser zoom).
  // One shared AbortController releases whichever DPR listener is armed at
  // dispose time — a leaked MediaQueryList retains the whole engine closure
  // plus the multi-MB canvas backing store.
  const dprAbort = new AbortController();
  const watchDPR = () => {
    const dprMq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprMq.addEventListener(
      "change",
      () => {
        if (disposed) return;
        resize();
        draw();
        watchDPR();
      },
      { once: true, signal: dprAbort.signal },
    );
  };
  watchDPR();
  function advance(now: number) {
    let elapsed = Math.min((now - lastNow) / 1000, 0.4);
    lastNow = now;
    if (!trail.length) {
      resize();
      if (!trail.length) return; // heal once the container gets real bounds
    }
    if (window.__snakePaused || elapsed <= 0) return;
    // re-measure each frame: the entrance transform settles after mount and
    // the hero column height changes with responsive wraps (DOM read only)
    measureKeepOut();
    while (elapsed > 0) {
      const h = Math.min(elapsed, 1 / 30);
      step(h);
      elapsed -= h;
    }
    draw();
  }
  function frame() {
    if (disposed || !inView) return; // offscreen: loop parks, IO re-arms it
    if (running) requestAnimationFrame(frame); // schedule first: a throw must never end the loop
    advance(performance.now());
  }
  // watchdog: keep stepping if rAF stops entirely (hidden tab)
  const watchdog = setInterval(() => {
    if (disposed || !running || !inView || window.__snakePaused) return;
    if (performance.now() - lastNow > 80) advance(performance.now());
  }, 100);

  // Two stages share one page; an offscreen stage must not simulate, paint,
  // or write clip-paths at 60fps. Park the loop when the stage leaves the
  // viewport and re-arm it (with a fresh clock) when it returns.
  let inView = true;
  const io = new IntersectionObserver(
    (entries) => {
      const nowIn = entries.some((e) => e.isIntersecting);
      if (nowIn && !inView) {
        inView = true;
        lastNow = performance.now();
        if (running && !disposed) requestAnimationFrame(frame);
      } else if (!nowIn) {
        inView = false;
      }
    },
    { threshold: 0 },
  );
  io.observe(stage);

  const onResize = () => {
    resize();
    draw();
  };
  resize();
  window.addEventListener("resize", onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());
  draw();
  if (running) requestAnimationFrame(frame);

  // ---------- deterministic QA hooks ----------
  const handle: SnakeHandle = {
    step: (n = 1, dtMs = 16.667) => {
      for (let i = 0; i < n; i++) step(dtMs / 1000);
      draw();
    },
    state: () => ({
      head: { ...head },
      heading,
      speed,
      pointer: pointer && { ...pointer },
      segs: segs.map((s) => [+s.x.toFixed(1), +s.y.toFixed(1)]),
      W,
      H,
      R,
      loopMode,
      loopDist,
      loopLen: loopMode ? loopLength() : 0,
      keepOut: ko && { ...ko },
      seed: seedState,
    }),
    setPointer: (x, y) => {
      if (x == null) releasePointer();
      else pointer = { x, y: y! };
    },
    suspendPointer: (v) => {
      pointerSuspended = !!v;
      if (v) releasePointer();
    },
    setLoopDist: (d) => {
      loopDist = d;
    },
    pause: (v) => {
      window.__snakePaused = !!v;
    },
  };
  window.__snakes = window.__snakes || [];
  window.__snakes.push(handle);

  return () => {
    disposed = true;
    clearInterval(watchdog);
    dprAbort.abort();
    io.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    document.removeEventListener("mouseleave", onMouseLeave);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("resize", onResize);
    motionMq.removeEventListener("change", onMotionChange);
    if (window.__snakes) {
      const i = window.__snakes.indexOf(handle);
      if (i >= 0) window.__snakes.splice(i, 1);
    }
  };
}

/** All snake stages share one pointer-suspend switch (modals open above them). */
export function suspendAllSnakes(v: boolean) {
  (window.__snakes || []).forEach((s) => s.suspendPointer(v));
}
