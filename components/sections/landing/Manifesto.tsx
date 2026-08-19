/**
 * The manifesto — the "why" chapter, v5: the braintrust.dev observability
 * block, structure and organisation kept 1:1, drawn with our own product.
 * A two-tone headline across the top (claim in ink, consequence muted), then
 * two columns: copy, three bullets whose icons say what the words say, and
 * design-system CTAs (outline FxPill + quiet link) on the left; on the right
 * a plum square panel with how Pancake actually works: two agent orbits
 * running in parallel (Outreach and AI search), tangent at the GTM Brain that
 * improves both, everything flowing down to one goal: Customers.
 *
 * No pin. Text reveals once on enter (CSS transitions gated on html.lv2-anim
 * + IntersectionObserver); the orbits draw once, then agent dots circulate
 * (paused for reduced motion); no-JS visitors get the complete chapter.
 */

"use client";

import { useEffect, useRef } from "react";

import { FxPill } from "./FxPill";

const css = (vars: Record<string, string | number>) => vars as React.CSSProperties;

/** The three promises; each icon depicts its title literally. */
const POINTS = [
  {
    glyph: "target",
    title: "Find the right people",
    body: "Everyone Pancake contacts has a real reason to hear from you.",
  },
  {
    glyph: "bubble",
    title: "Reach them in your voice",
    body: "Outreach that meets your standard, and articles Google and ChatGPT recommend.",
  },
  {
    glyph: "loop",
    title: "Learn from every correction",
    body: "What Pancake learns improves your agents. Your data stays yours.",
  },
] as const;

function Glyph({ kind }: { kind: (typeof POINTS)[number]["glyph"] }) {
  // Literal marks in ink: a target (find), a speech bubble (your voice),
  // circling arrows (learning). Stroke 2, 20px box.
  if (kind === "target") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="10" cy="10" r="2.4" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "bubble") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M4.75 3.75h10.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H9.5L6 15.75v-3h-1.25a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23 4v6h-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Station geometry lives in the CSS (panel viewBox 480). */
const STATIONS = [
  { s: "signals", label: "Buying signals", i: 0 },
  { s: "outreach", label: "Outreach", i: 1 },
  { s: "ai", label: "AI search", i: 1 },
  { s: "brain", label: "GTM Brain", i: 2 },
  { s: "customers", label: "Customers", i: 3 },
] as const;

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
          <span className="lv2-mf-muted">You need a team that brings customers while you build.</span>
        </h2>

        <div className="lv2-mf-grid">
          <div className="lv2-mf-copy">
            <p className="lv2-mf-body lv2-mf-reveal" style={css({ "--d": "80ms" })}>
              An idea is a working product by Monday. Then you have to sell it:
              <br />
              a full market, tools glued together by hand, buyers who stopped answering templates.
              <br />
              Pancake does it for you, end to end.
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
              <FxPill variant="outline" data-lv2-open="call">
                Book a call
              </FxPill>
              <a href="#lead-finding" className="lv2-mf-link">
                <span className="lv2-mf-link-text">See how Pancake finds your buyers</span>&nbsp;
                <span className="lv2-mf-arrow" aria-hidden="true">
                  &rarr;
                </span>
              </a>
            </div>
          </div>

          {/* The panel: signals in, two parallel agent lanes, the Brain between
              them, one meeting point: Customers. */}
          <div
            className="lv2-mf-panel lv2-mf-reveal"
            style={css({ "--d": "120ms" })}
            role="img"
            aria-label="Diagram: buying signals flow into two parallel lanes of agents, outreach and AI search, and both lanes meet at one point: customers. In the middle, the GTM Brain points at buying signals, outreach and AI search: it improves all three."
          >
            <svg className="lv2-mf-net" viewBox="0 0 480 480" aria-hidden="true">
              {/* the two lanes: Signals → (Outreach | AI search) → Customers */}
              <path
                className="lv2-mf-lane"
                d="M95 240C95 185 160 140 240 140C320 140 385 185 385 240"
                pathLength="1"
              />
              <path
                className="lv2-mf-lane"
                d="M95 240C95 295 160 340 240 340C320 340 385 295 385 240"
                pathLength="1"
                style={css({ "--k": 1 })}
              />
              {/* the Brain improves all three: spokes out to Signals, Outreach,
                  AI search, each with an arrowhead and a soft outward pulse */}
              <path className="lv2-mf-spoke" d="M240 212V174" pathLength="1" />
              <path className="lv2-mf-spoke" d="M240 268v38" pathLength="1" />
              <path className="lv2-mf-spoke" d="M186 240h-14" pathLength="1" />
              <path className="lv2-mf-spokehead" d="M233 172 240 164l7 8" pathLength="1" />
              <path className="lv2-mf-spokehead" d="M233 308l7 8 7-8" pathLength="1" />
              <path className="lv2-mf-spokehead" d="M174 233l-8 7 8 7" pathLength="1" />
              <circle className="lv2-mf-pulse" data-p="up" r="3" />
              <circle className="lv2-mf-pulse" data-p="down" r="3" />
              <circle className="lv2-mf-pulse" data-p="left" r="3" />
              {/* the agents: dots flowing along each lane toward Customers */}
              <circle className="lv2-mf-agent" data-o="t" data-n="1" r="5" />
              <circle className="lv2-mf-agent" data-o="t" data-n="2" r="5" />
              <circle className="lv2-mf-agent" data-o="b" data-n="1" r="5" />
              <circle className="lv2-mf-agent" data-o="b" data-n="2" r="5" />
            </svg>
            {STATIONS.map((st) => (
              <span key={st.s} className="lv2-mf-station" data-s={st.s} style={css({ "--i": st.i })}>
                {st.s === "signals" ? (
                  <>
                    <span className="lv2-mf-station-long">Buying signals</span>
                    <span className="lv2-mf-station-short">Signals</span>
                  </>
                ) : (
                  st.label
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
