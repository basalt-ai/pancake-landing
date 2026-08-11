"use client";

/**
 * The problem statement — the page's dark chapter, scroll-driven. The section
 * pins for ~3.8 viewport heights; the four sentences appear ONE AT A TIME
 * (display-sized, no spoiling the ones to come) while the canvas acts them
 * out: the weekend hack ships (cursor clicks "Ship it", the Live chip pops),
 * the GTM backlog rains down with real weight (gravity falls, squash-and-
 * stretch, the window flinching and sinking under each impact), and Pancake
 * clears the pile into a mint checked grid.
 *
 * Choreography follows the pancake-studio loop grammar (agents-loop et al.):
 * power3.out entrances, back.out landings, power2.in gravity, aura pings,
 * the hand-drawn cursor, ✓ glyphs, mint = done. Everything is scrubbed —
 * deterministic and reversible; relative window tweens never overlap in time.
 *
 * The server-rendered default is the RESOLVED beat-4 scene (tidy mint cards,
 * checks, beads, all sentences readable) — mobile, reduced-motion, and no-JS
 * visitors get that complete static chapter. Every narrative-only element
 * (cursor, ship button, tally, pings, signal dot) defaults hidden in CSS.
 */

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

const BEATS = [
  "With AI coding tools, a weekend hack can become a real product by Monday morning.",
  "But turning it into a real business still means a mountain of GTM work.",
  "Finding leads. Writing outreach. Publishing content. Getting cited by AI search. None of that got easier.",
  "Pancake is changing that.",
] as const;

const TASKS = [
  "Find leads",
  "Write outreach",
  "Publish content",
  "Position the launch",
  "Follow up",
  "Get cited by AI search",
] as const;

/** Mid-story mound each card falls into (top, left, rotate) — beats 2–3. */
const MOUND: Array<[string, string, number]> = [
  ["34%", "30%", -7],
  ["46%", "6%", 5],
  ["55%", "44%", -4],
  ["65%", "2%", 3],
  ["72%", "50%", 7],
  ["83%", "20%", -5],
];

/** Approximate card centers in canvas % — impact-ring anchor points. */
const MOUND_CENTER: Array<[string, string]> = [
  ["47%", "38%"],
  ["23%", "50%"],
  ["61%", "59%"],
  ["19%", "69%"],
  ["67%", "76%"],
  ["37%", "87%"],
];

/** The tidy grid Pancake leaves behind (top, left) — also the SSR default. */
const NEAT: Array<[string, string]> = [
  ["54%", "2%"],
  ["70%", "2%"],
  ["86%", "2%"],
  ["54%", "52%"],
  ["70%", "52%"],
  ["86%", "52%"],
];

const PINK = "#ff7aa0";
const TICK_DIM = "rgba(255, 247, 236, 0.22)";

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const section = sectionRef.current;
        if (!section) return;
        section.classList.add("lv2-manifesto--pin");

        const q = gsap.utils.selector(section);
        const beats = q("[data-mb]");
        const ticks = q("[data-mt]");
        const canvas = q(".lv2-manifesto-canvas");
        const win = q(".lv2-mwin");
        const lines = q(".lv2-mwin-line");
        const chip = q(".lv2-mwin-chip");
        const chipDot = q(".lv2-mwin-chip-dot");
        const ship = q(".lv2-mship");
        const cursor = q(".lv2-mcursor");
        const tally = q(".lv2-mtally");
        const pingA = q(".lv2-mping-a");
        const pingB = q(".lv2-mping-b");
        const mdot = q(".lv2-mdot");
        const cards = q(".lv2-mtasks li");
        const checks = q(".lv2-mtask-check");
        const beads = q(".lv2-manifesto-bead");

        // ── Rewind the resolved scene to its opening state (JS-only) ──
        gsap.set(beats.slice(1), { autoAlpha: 0, y: 26 });
        gsap.set(ticks[0], { backgroundColor: PINK });
        gsap.set(canvas, { transformOrigin: "50% 40%" });
        gsap.set(win, {
          y: 48,
          autoAlpha: 0,
          scale: 1,
          rotation: 0,
          xPercent: 0,
          transformOrigin: "50% 100%",
        });
        gsap.set(lines, { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(chip, { scale: 0.5, autoAlpha: 0 });
        // Explicit start color so the beat-2 grey tween has a recorded start.
        gsap.set(chipDot, { backgroundColor: "#e33a6a" });
        gsap.set(ship, { autoAlpha: 0, scale: 0.6 });
        gsap.set(cursor, { autoAlpha: 0, x: 120, y: 90 });
        gsap.set(tally, { autoAlpha: 0, y: -12, scale: 0.7 });
        gsap.set(mdot, { autoAlpha: 0, x: 0, y: 0 });
        // Pings get NO set — hidden state is pure CSS; fired via fromTo with
        // immediateRender:false so the scrubbed timeline never flashes them.
        gsap.set(cards, {
          top: (i: number) => MOUND[i][0],
          left: (i: number) => MOUND[i][1],
          // Counter-tilt spawn; each fall resolves to the mound tilt.
          rotation: (i: number) => MOUND[i][2] * -1.2,
          y: (i: number) => (i < 3 ? -170 : -190),
          autoAlpha: 0,
          backgroundColor: "#fffcf8",
          scaleX: 1,
          scaleY: 1,
          transformOrigin: "50% 100%",
        });
        gsap.set(checks, { scale: 0.4, autoAlpha: 0 });
        gsap.set(beads, { scale: 0.75, autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            pin: true,
            start: "top top",
            end: "+=380%",
            scrub: 0.7,
            anticipatePin: 1,
          },
        });

        // ── Helpers (all positions in abstract units; total 19) ──
        const swap = (t: number, from: number, to: number) => {
          tl.to(beats[from], { autoAlpha: 0, y: -18, duration: 0.45, ease: "power2.in" }, t);
          tl.to(beats[to], { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, t + 0.25);
          tl.to(ticks[from], { backgroundColor: TICK_DIM, duration: 0.4 }, t);
          tl.to(ticks[to], { backgroundColor: PINK, duration: 0.4 }, t);
        };
        const firePing = (
          el: gsap.TweenTarget,
          i: number,
          t: number,
          from: [number, number],
          to: number,
          dur: number
        ) => {
          tl.set(el, { left: MOUND_CENTER[i][0], top: MOUND_CENTER[i][1] }, t - 0.03);
          tl.fromTo(
            el,
            { scale: from[0], opacity: from[1] },
            { scale: to, opacity: 0, duration: dur, ease: "power2.out", immediateRender: false },
            t
          );
        };
        const fall = (i: number, t: number, dur: number, sq: [number, number], rec: [number, number], recEase: string) => {
          tl.to(cards[i], { autoAlpha: 1, duration: 0.12, ease: "power1.out" }, t);
          tl.to(cards[i], { y: 0, rotation: MOUND[i][2], duration: dur, ease: "power2.in" }, t);
          tl.to(cards[i], { scaleY: sq[0], scaleX: sq[1], duration: 0.1, ease: "power2.in" }, t + dur);
          tl.to(cards[i], { scaleY: rec[0], scaleX: rec[1], duration: dur > 0.5 ? 0.35 : 0.25, ease: recEase }, t + dur + 0.1);
        };
        const wiggle = (t: number, frames: number[], dur = 0.25) => {
          tl.to(tally, { keyframes: { rotation: frames }, duration: dur, ease: "power2.out" }, t);
        };
        const jolt = (t: number, xs: number[], ys: number[], dur: number) => {
          tl.to(canvas, { keyframes: { x: xs, y: ys }, duration: dur, ease: "power2.out" }, t);
        };

        // ── Beat 1 (0–3.6) — the weekend hack ships ──
        tl.to(win, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out" }, 0);
        tl.to(lines, { scaleX: 1, duration: 0.6, stagger: 0.35, ease: "power3.out" }, 0.65);
        tl.to(ship, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" }, 1.9);
        tl.to(cursor, { x: 0, y: 0, duration: 0.6, ease: "power2.inOut" }, 1.95);
        tl.to(cursor, { autoAlpha: 1, duration: 0.2 }, 1.95);
        tl.to(cursor, { scale: 0.86, duration: 0.1, ease: "power2.in" }, 2.6);
        tl.to(ship, { scale: 0.94, duration: 0.1, ease: "power2.in" }, 2.6);
        tl.to(cursor, { scale: 1, duration: 0.15, ease: "back.out(2)" }, 2.7);
        tl.to(ship, { autoAlpha: 0, scale: 0.8, duration: 0.2, ease: "power2.in" }, 2.72);
        tl.to(chip, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2.2)" }, 2.8);
        // Go-live aura at the chip's slot.
        tl.set(pingA, { left: "33%", top: "30%" }, 2.75);
        tl.fromTo(
          pingA,
          { scale: 0.45, opacity: 0.8 },
          { scale: 2.1, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false },
          2.8
        );
        tl.to(cursor, { x: "+=90", y: "+=70", autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 3.0);

        swap(3.6, 0, 1);

        // ── Beat 2 (4.2–8.4) — the mound arrives, each drop a micro-scene ──
        // Window clears a bigger stage for the story.
        tl.to(win, { scale: 0.88, xPercent: -6, y: -12, duration: 0.6, ease: "power2.inOut" }, 4.2);
        // Camera creeps in across the whole beat (scale only; jolts own x/y).
        tl.to(canvas, { scale: 1.03, duration: 4, ease: "power2.inOut" }, 4.2);
        tl.to(tally, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }, 4.45);

        // Drop 1 — pile is light: full springy recovery, window takes the hit.
        fall(0, 4.9, 0.55, [0.78, 1.14], [1, 1], "back.out(2.4)");
        firePing(pingA, 0, 5.45, [0.45, 0.7], 1.9, 0.5);
        tl.to(win, { y: "+=12", rotation: "+=1.2", scale: "-=0.015", duration: 0.12, ease: "power2.in" }, 5.45);
        tl.to(win, { y: "-=6", rotation: "-=0.6", duration: 0.4, ease: "back.out(1.6)" }, 5.58);
        wiggle(5.48, [0, -3, 2.5, 0]);

        // Drop 2 — harder, opposite tilt; the first card gets shoved.
        fall(1, 6.1, 0.55, [0.78, 1.14], [1, 1], "back.out(2.4)");
        firePing(pingB, 1, 6.65, [0.45, 0.7], 1.9, 0.5);
        tl.to(win, { y: "+=12", rotation: "-=1.6", scale: "-=0.015", duration: 0.12, ease: "power2.in" }, 6.65);
        tl.to(win, { y: "-=6", rotation: "+=0.8", duration: 0.4, ease: "back.out(1.6)" }, 6.78);
        tl.to(cards[0], { y: "+=4", rotation: "+=2", duration: 0.3, ease: "back.out(1.7)" }, 6.68);
        wiggle(6.68, [0, 3, -2.5, 0]);
        jolt(6.65, [-2, 2, 0], [1, -1, 0], 0.28);

        // Drop 3 — hardest; the window is visibly listing by now.
        fall(2, 7.3, 0.55, [0.78, 1.14], [1, 1], "back.out(2.4)");
        firePing(pingA, 2, 7.85, [0.45, 0.7], 1.9, 0.5);
        tl.to(win, { y: "+=12", rotation: "+=1.0", scale: "-=0.02", duration: 0.12, ease: "power2.in" }, 7.85);
        tl.to(win, { y: "-=6", rotation: "-=0.5", duration: 0.4, ease: "back.out(1.6)" }, 7.98);
        tl.to(cards.slice(0, 2), { y: "+=3", rotation: "-=1.5", duration: 0.3, ease: "back.out(1.7)", stagger: 0.05 }, 7.88);
        wiggle(7.88, [0, -3, 2.5, 0]);
        jolt(7.85, [-3, 3, 0], [2, -1, 0], 0.32);
        // The Live dot loses its pulse — the product losing shine closes the beat.
        tl.to(chipDot, { backgroundColor: "#cbbdb3", duration: 0.3 }, 8.05);

        swap(8.4, 1, 2);

        // ── Beat 3 (9.0–13.0) — rain, not single events; weight accumulates ──
        tl.to(canvas, { scale: 1.05, duration: 2, ease: "power2.inOut" }, 9);

        // Drops land with residual compression; the window sinks, no recovery.
        fall(3, 9.2, 0.5, [0.8, 1.12], [0.97, 1.02], "back.out(1.6)");
        firePing(pingB, 3, 9.7, [0.4, 0.6], 1.6, 0.4);
        tl.to(win, { y: "+=7", scale: "-=0.012", rotation: "-=0.8", duration: 0.15, ease: "power2.in" }, 9.7);
        wiggle(9.72, [0, -3, 2.5, 0], 0.2);

        fall(4, 9.75, 0.5, [0.8, 1.12], [0.97, 1.02], "back.out(1.6)");
        firePing(pingA, 4, 10.25, [0.4, 0.6], 1.6, 0.4);
        tl.to(win, { y: "+=7", scale: "-=0.012", rotation: "+=0.8", duration: 0.15, ease: "power2.in" }, 10.25);
        wiggle(10.27, [0, 3, -2.5, 0], 0.2);

        // The heaviest, final landing — avalanche shockwave.
        fall(5, 10.3, 0.5, [0.8, 1.12], [0.97, 1.02], "back.out(1.6)");
        firePing(pingB, 5, 10.8, [0.5, 0.6], 2.1, 0.7);
        jolt(10.8, [-4, 3, -1, 0], [2, -2, 1, 0], 0.4);
        tl.to(win, { y: "+=7", scale: "-=0.012", rotation: "-=0.6", duration: 0.15, ease: "power2.in" }, 10.8);
        wiggle(10.82, [0, -3.5, 3, 0], 0.2);

        // Early cards sink deeper under the pile (absolute rotation on purpose:
        // overwrites accumulated jostle drift).
        tl.to(
          cards.slice(0, 3),
          { y: "+=9", rotation: (i: number) => MOUND[i][2] * 1.6, duration: 0.5, ease: "power2.inOut", stagger: 0.06 },
          10.85
        );
        // One last collective compression — stillness sells mass.
        tl.to(cards, { y: "+=3", duration: 0.2, ease: "power2.in" }, 11.15);
        // The product is smothered; then a deliberate silent hold to 13.0.
        tl.to(win, { autoAlpha: 0.45, y: "+=5", duration: 1.4, ease: "sine.inOut" }, 11.35);

        swap(13.0, 2, 3);

        // ── Beat 4 (13.6–18) — Pancake clears it ──
        tl.to(beads, { scale: 1, autoAlpha: 0.9, duration: 1.1, stagger: 0.3, ease: "power3.out" }, 13.7);
        // Relief ping over the golden bead — Pancake announces itself.
        tl.set(pingA, { left: "19%", top: "45%" }, 14.1);
        tl.fromTo(
          pingA,
          { scale: 0.45, opacity: 0.8 },
          { scale: 2.1, opacity: 0, duration: 0.7, ease: "power2.out", immediateRender: false },
          14.15
        );
        tl.to(tally, { y: -10, scale: 0.8, autoAlpha: 0, duration: 0.35, ease: "back.in(1.6)" }, 14.2);
        // Weight comes off BEFORE anything moves — the key weight-lifting cue.
        tl.to(cards, { y: "-=8", duration: 0.3 }, 14.3);
        tl.to(win, { y: "-=6", autoAlpha: 0.7, duration: 0.3 }, 14.35);
        // Camera release — the exhale.
        tl.to(canvas, { scale: 1, duration: 1.4, ease: "power3.inOut" }, 14.3);
        // Cards snap into their slots with a small positional overshoot.
        tl.to(
          cards,
          {
            top: (i: number) => NEAT[i][0],
            left: (i: number) => NEAT[i][1],
            rotation: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 1.15,
            ease: "back.out(1.6)",
            stagger: 0.16,
          },
          14.65
        );
        // Absolute reset — absorbs every accumulated relative offset.
        tl.to(win, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, xPercent: 0, duration: 1, ease: "back.out(1.6)" }, 14.8);
        tl.fromTo(chip, { scale: 0.92 }, { scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, 15.9);
        tl.to(chipDot, { backgroundColor: "#e33a6a", duration: 0.3 }, 15.9);
        // Pancake's signal travels mint bead → first grid card, cueing the flips.
        tl.to(mdot, { autoAlpha: 1, duration: 0.1 }, 15.6);
        tl.to(mdot, { x: -141, y: -52, duration: 0.55, ease: "power2.inOut" }, 15.6);
        tl.to(mdot, { autoAlpha: 0, duration: 0.1 }, 16.05);
        // The studio's "done" grammar: each card flips mint as its check lands.
        tl.to(cards, { backgroundColor: "#a8e5c9", duration: 0.45, stagger: 0.18 }, 16.2);
        tl.to(checks, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.18, ease: "back.out(2)" }, 16.2);
        // The only motion left is gentle.
        tl.to(beads, { y: "-=4", duration: 1.2, ease: "sine.inOut", stagger: 0.12 }, 17.5);
        // Settle hold before the pin releases (total 19).
        tl.to({}, { duration: 1 }, 18);

        return () => {
          section.classList.remove("lv2-manifesto--pin");
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="lv2s lv2-manifesto" aria-labelledby="lv2-manifesto-title">
      <div className="lv2-container">
        <h2 id="lv2-manifesto-title" className="lv2-manifesto-title">
          Shipping got 10x easier.
          <br />
          Selling didn&rsquo;t.
        </h2>
        <div className="lv2-manifesto-grid">
          <div className="lv2-manifesto-beats">
            <div className="lv2-manifesto-slot">
              {BEATS.map((b, i) => (
                <p key={i} data-mb={i} className="lv2-manifesto-beat">
                  {b}
                </p>
              ))}
            </div>
            <div className="lv2-manifesto-ticks" aria-hidden="true">
              {BEATS.map((_, i) => (
                <span key={i} data-mt={i} className="lv2-manifesto-tick" />
              ))}
            </div>
          </div>
          <div className="lv2-manifesto-canvas" aria-hidden="true">
            <i className="lv2-manifesto-bead" data-tone="golden" />
            <i className="lv2-manifesto-bead" data-tone="purple" />
            <i className="lv2-manifesto-bead" data-tone="mint" />
            <i className="lv2-mdot" />
            <div className="lv2-mwin">
              <div className="lv2-mwin-bar">
                <span className="lv2-mwin-mark" />
                <span className="lv2-mwin-url">yourproduct.com</span>
              </div>
              <div className="lv2-mwin-body">
                <i className="lv2-mwin-line" />
                <i className="lv2-mwin-line" />
                <i className="lv2-mwin-line" />
                <span className="lv2-mwin-chip">
                  <i className="lv2-mwin-chip-dot" />
                  Live · Mon 9:04 am
                </span>
                <span className="lv2-mship">Ship it</span>
              </div>
            </div>
            <ul className="lv2-mtasks">
              {TASKS.map((t, i) => (
                <li key={t} style={{ top: NEAT[i][0], left: NEAT[i][1] }}>
                  {t}
                  <span className="lv2-mtask-check">&#10003;</span>
                </li>
              ))}
            </ul>
            <span className="lv2-mtally">GTM backlog</span>
            <i className="lv2-mping-a" />
            <i className="lv2-mping-b" />
            <div className="lv2-mcursor">
              <svg width="34" height="38" viewBox="0 0 26 29" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 1 L2 22 L7.5 17.5 L11 26 L15 24.2 L11.6 16 L19 15.5 Z"
                  fill="#2c002a"
                  stroke="#fff7ec"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
