/**
 * The manifesto — the "why" chapter, v5: the braintrust.dev observability
 * block, structure and organisation kept 1:1. A two-tone headline across the
 * top (the claim in ink, the consequence muted), then two columns: copy, three
 * glyph bullets and two pill links on the left; a dark square concept panel on
 * the right with the loop Pancake runs (Find → Reach → Learn). Scheme: the
 * page's pink-20 field with plum ink and a plum panel — the brand pink as a
 * full chapter, the only place on the page it is.
 *
 * No pin. Text reveals once on enter (CSS transitions gated on html.lv2-anim +
 * IntersectionObserver); the loop in the panel draws once; no-JS and reduced-
 * motion visitors get the complete chapter from first paint.
 */

"use client";

import { useEffect, useRef } from "react";

const css = (vars: Record<string, string | number>) => vars as React.CSSProperties;

/** The three promises, aligned with the loop in the panel (Find → Reach → Learn). */
const POINTS = [
  {
    glyph: "ring",
    title: "Find the right people",
    body: "Everyone Pancake contacts has a real reason to hear from you.",
  },
  {
    glyph: "arrow",
    title: "Reach them in your voice",
    body: "Outreach that meets your standard, and articles Google and ChatGPT recommend.",
  },
  {
    glyph: "grid",
    title: "Learn from every correction",
    body: "What Pancake learns improves your agents, not everyone’s. Your data stays yours.",
  },
] as const;

const LOOP = ["Find", "Reach", "Learn"] as const;

function Glyph({ kind }: { kind: (typeof POINTS)[number]["glyph"] }) {
  // Small abstract marks in ink, braintrust-style: a ring, an arrow, a dither.
  if (kind === "ring") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  if (kind === "arrow") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 16 16 4M7 4h9v9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 2h4v4H2zm8 0h4v4h-4zM6 6h4v4H6zm8 0h4v4h-4zM2 10h4v4H2zm8 0h4v4h-4zM6 14h4v4H6zm8 0h4v4h-4z"
      />
    </svg>
  );
}

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  // Reveal once: one observer, add .is-in, unobserve.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const items = Array.from(section.querySelectorAll<HTMLElement>(".lv2-mf-reveal"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="why" className="lv2s lv2-manifesto" aria-labelledby="lv2-manifesto-title">
      <div className="lv2-container">
        <h2 id="lv2-manifesto-title" className="lv2-manifesto-title lv2-mf-reveal">
          Building got <span className="nb">10x easier.</span> <span className="nb">Selling didn&rsquo;t.</span>{" "}
          <span className="lv2-mf-muted">You need a team that sells while you build.</span>
        </h2>

        <div className="lv2-mf-grid">
          <div className="lv2-mf-copy">
            <p className="lv2-mf-body lv2-mf-reveal" style={css({ "--d": "80ms" })}>
              An idea is a working product by Monday. Then you have to sell it: a full market, tools
              glued together by hand, buyers who stopped answering templates. Pancake does it for you,
              end to end.
            </p>

            <ul className="lv2-mf-points">
              {POINTS.map((p, i) => (
                <li key={p.title} className="lv2-mf-point lv2-mf-reveal" style={css({ "--d": `${160 + i * 80}ms` })}>
                  <span className="lv2-mf-glyph">
                    <Glyph kind={p.glyph} />
                  </span>
                  <span className="lv2-mf-point-text">
                    <strong>{p.title}</strong>
                    <span>{p.body}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="lv2-mf-links lv2-mf-reveal" style={css({ "--d": "420ms" })}>
              <a href="#lead-finding" className="lv2-mf-pill">
                See how Pancake finds your buyers
                <span className="lv2-mf-pill-arrow" aria-hidden="true">
                  &#8599;
                </span>
              </a>
              <button type="button" className="lv2-mf-pill" data-lv2-open="call">
                Book a call
                <span className="lv2-mf-pill-arrow" aria-hidden="true">
                  &#8599;
                </span>
              </button>
            </div>
          </div>

          {/* The concept panel: the loop Pancake runs, drawn once on enter. */}
          <div
            className="lv2-mf-panel lv2-mf-reveal"
            style={css({ "--d": "120ms" })}
            role="img"
            aria-label="Diagram: a loop. Find, then Reach, then Learn, and back to Find. Pancake runs it continuously."
          >
            <svg className="lv2-mf-loop" viewBox="0 0 480 480" aria-hidden="true">
              {/* station-to-station links (their ends hide behind the pills) */}
              <path className="lv2-mf-loop-link" d="M240 130V240" pathLength="1" />
              <path className="lv2-mf-loop-link" d="M240 240V350" pathLength="1" style={css({ "--k": 1 })} />
              {/* the return: down out of Learn, up the right side, over the top into Find */}
              <path
                className="lv2-mf-loop-return"
                d="M240 350C240 412 332 412 332 350V130C332 68 240 68 240 130"
                pathLength="1"
              />
              <path className="lv2-mf-loop-head" d="M318 254 332 240 346 254" pathLength="1" />
            </svg>
            {LOOP.map((step, i) => (
              <span key={step} className="lv2-mf-station" style={css({ "--i": i })}>
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
