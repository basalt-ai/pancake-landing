/**
 * The manifesto — the page's dark chapter, v4: the Synthetic "Our aspiration"
 * pattern, kept tight. An eyebrow with a pink bar, the founder-approved claim,
 * and on the right: one setup line, the one-pager's three reasons as a ruled
 * list with mono labels (Crowded / Unsolved / Ignored), the turn, one link.
 * No diagram, no pin, no timeline. Text reveals once on enter (CSS transitions
 * gated on html.lv2-anim + IntersectionObserver); no-JS and reduced-motion
 * visitors get the complete chapter from the first paint.
 */

"use client";

import { useEffect, useRef } from "react";

/** The one-pager's three reasons selling got harder, one line each. */
const REASONS = [
  { label: "Crowded", line: "Everyone launched. Every market is full." },
  { label: "Unsolved", line: "There is no Cursor for selling. You glue tools together by hand." },
  { label: "Ignored", line: "Buyers stopped answering anything that reads like a template." },
] as const;

const css = (vars: Record<string, string | number>) => vars as React.CSSProperties;

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
        <p className="lv2-mf-eyebrow lv2-mf-reveal">
          <span>Why we&rsquo;re building Pancake</span>
          <i className="lv2-mf-bar" aria-hidden="true" />
        </p>
        <div className="lv2-mf-grid">
          <h2 id="lv2-manifesto-title" className="lv2-manifesto-title lv2-mf-reveal" style={css({ "--d": "80ms" })}>
            <span className="ln">
              Building got <span className="nb">10x easier.</span>
            </span>
            <br />
            <span className="ln">Selling didn&rsquo;t.</span>
          </h2>
          <div className="lv2-mf-copy">
            <p className="lv2-mf-setup lv2-mf-reveal" style={css({ "--d": "160ms" })}>
              An idea is a working product by Monday. Then you have to sell it.
            </p>
            <dl className="lv2-mf-reasons">
              {REASONS.map((r, i) => (
                <div key={r.label} className="lv2-mf-reason lv2-mf-reveal" style={css({ "--d": `${220 + i * 70}ms` })}>
                  <dt>{r.label}</dt>
                  <dd>{r.line}</dd>
                </div>
              ))}
            </dl>
            <p className="lv2-mf-close lv2-mf-reveal" style={css({ "--d": "440ms" })}>
              Pancake does the selling for you, end to end, and never trades quality for volume.
            </p>
            <a href="#lead-finding" className="lv2-mf-link lv2-mf-reveal" style={css({ "--d": "520ms" })}>
              <span className="lv2-mf-link-text">See how it finds your buyers</span>&nbsp;
              <span className="lv2-mf-arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
