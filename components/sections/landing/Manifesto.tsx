/**
 * The manifesto — the page's dark chapter, v4: the Synthetic "Our aspiration"
 * pattern, nothing more. An eyebrow with a pink bar, the founder-approved
 * claim, one paragraph that carries the argument from the "Why we're building
 * Pancake" one-pager (the three reasons, then the turn), and one link forward.
 * No diagram, no pin, no timeline. Text reveals once on enter (CSS transitions
 * gated on html.lv2-anim + IntersectionObserver); no-JS and reduced-motion
 * visitors get the complete chapter from the first paint.
 */

"use client";

import { useEffect, useRef } from "react";

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
            <p className="lv2-mf-body lv2-mf-reveal" style={css({ "--d": "160ms" })}>
              With AI, an idea is a working product by Monday. Then you have to sell it. Everyone
              launched, so every market is crowded. Nobody built a Cursor for selling, so you glue
              tools together by hand. And buyers, after years of mass outreach, stopped answering
              anything that reads like a template.{" "}
              <strong className="lv2-mf-close">
                Pancake does the selling for you, end to end, with a team of agents that never trades
                quality for volume.
              </strong>
            </p>
            <a href="#lead-finding" className="lv2-mf-link lv2-mf-reveal" style={css({ "--d": "240ms" })}>
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
