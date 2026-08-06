"use client";

/**
 * The problem statement — the page's dark chapter, scroll-driven (founder ask
 * 2026-08-06): the section pins, the four sentences light up one by one, and
 * the canvas on the right acts them out — a product ships over the weekend,
 * the GTM mound buries it, the mound grows, Pancake clears it.
 *
 * The server-rendered default is the RESOLVED scene (tidy cards, checks,
 * beads, every sentence at full opacity) — mobile, reduced-motion, and no-JS
 * visitors all get that complete static chapter. The pin + timeline are a
 * desktop enhancement layered on via gsap.matchMedia; they never gate content.
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

/** Mid-story mound each card drops into (top, left, rotate) — beats 2–3. */
const MOUND: Array<[string, string, number]> = [
  ["34%", "30%", -7],
  ["46%", "6%", 5],
  ["55%", "44%", -4],
  ["65%", "2%", 3],
  ["72%", "50%", 7],
  ["83%", "20%", -5],
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

/** Inactive-sentence opacity — the studio's focus-dimming constant. */
const DIM = 0.4;

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const section = sectionRef.current;
        if (!section) return;
        const q = gsap.utils.selector(section);
        const beats = q("[data-mb]");
        const win = q(".lv2-mwin");
        const lines = q(".lv2-mwin-line");
        const chip = q(".lv2-mwin-chip");
        const cards = q(".lv2-mtasks li");
        const checks = q(".lv2-mtask-check");
        const beads = q(".lv2-manifesto-bead");

        // Rewind the resolved scene to its opening state (JS-only, reverted
        // by matchMedia if the viewport ever leaves the condition).
        gsap.set(beats.slice(1), { opacity: DIM });
        gsap.set(win, { y: 48, autoAlpha: 0 });
        gsap.set(lines, { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(chip, { scale: 0.5, autoAlpha: 0 });
        gsap.set(cards, {
          top: (i: number) => MOUND[i][0],
          left: (i: number) => MOUND[i][1],
          rotation: (i: number) => MOUND[i][2],
          y: -70,
          autoAlpha: 0,
          backgroundColor: "#fffcf8",
        });
        gsap.set(checks, { scale: 0.4, autoAlpha: 0 });
        gsap.set(beads, { scale: 0.75, autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            pin: true,
            start: "top top",
            end: "+=320%",
            scrub: 0.7,
            anticipatePin: 1,
          },
        });

        // Beat 1 — the weekend hack ships: window rises, UI draws in, goes live.
        tl.to(win, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out" }, 0);
        tl.to(lines, { scaleX: 1, duration: 0.6, stagger: 0.35 }, 0.7);
        tl.to(chip, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" }, 2.3);

        tl.to(beats[0], { opacity: DIM, duration: 0.4 }, 3.1);
        tl.to(beats[1], { opacity: 1, duration: 0.4 }, 3.1);

        // Beat 2 — the mound arrives: first three tasks drop onto the product.
        tl.to(cards.slice(0, 3), { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.5, ease: "power3.out" }, 3.5);
        tl.to(win, { scale: 0.95, y: 6, duration: 1 }, 3.6);

        tl.to(beats[1], { opacity: DIM, duration: 0.4 }, 6.6);
        tl.to(beats[2], { opacity: 1, duration: 0.4 }, 6.6);

        // Beat 3 — it keeps growing: three more land, the early ones sink,
        // the product disappears under the pile.
        tl.to(cards.slice(3), { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.5, ease: "power3.out" }, 7.0);
        tl.to(
          cards.slice(0, 3),
          { y: 8, rotation: (i: number) => MOUND[i][2] * 1.6, duration: 0.8 },
          7.1
        );
        tl.to(win, { autoAlpha: 0.45, duration: 1.2 }, 7.2);

        tl.to(beats[2], { opacity: DIM, duration: 0.4 }, 10.2);
        tl.to(beats[3], { opacity: 1, duration: 0.4 }, 10.2);

        // Beat 4 — Pancake clears it: beads sweep in, the mound files itself
        // into a tidy grid, the product resurfaces, every task gets checked.
        tl.to(beads, { scale: 1, autoAlpha: 0.9, duration: 1.4, stagger: 0.3 }, 10.6);
        tl.to(
          cards,
          {
            top: (i: number) => NEAT[i][0],
            left: (i: number) => NEAT[i][1],
            rotation: 0,
            y: 0,
            duration: 1.4,
            stagger: 0.18,
            ease: "power3.inOut",
          },
          11.0
        );
        tl.to(win, { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 11.2);
        // The studio's "done" grammar: the card flips to mint as its check lands.
        tl.to(cards, { backgroundColor: "#a8e5c9", duration: 0.5, stagger: 0.22 }, 13.2);
        tl.to(checks, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.22, ease: "back.out(2)" }, 13.2);
        // Settle beat: hold the resolved scene before the pin releases.
        tl.to({}, { duration: 1.2 }, 14.8);
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
            {BEATS.map((b, i) => (
              <p key={i} data-mb={i} className="lv2-manifesto-beat">
                {b}
              </p>
            ))}
          </div>
          <div className="lv2-manifesto-canvas" aria-hidden="true">
            <i className="lv2-manifesto-bead" data-tone="golden" />
            <i className="lv2-manifesto-bead" data-tone="purple" />
            <i className="lv2-manifesto-bead" data-tone="mint" />
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
          </div>
        </div>
      </div>
    </section>
  );
}
