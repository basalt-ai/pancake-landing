"use client";

import { useEffect, useRef } from "react";

import { FxPill } from "./FxPill";
import { mountSnake } from "./snake";

/**
 * The hero stage — full-height band under the nav where the snake wanders,
 * revealing the duplicate H1/H2 through its circles. Port of the static
 * landing's `.prefooter` section: H1 left, H2 + the two CTAs right — the
 * same disposition as the previous production hero. (The owner.com-style
 * AI GTM report input shipped here briefly; founder pulled it 2026-08-11
 * pre-launch — the /ai-gtm-report route still exists, just unlinked.)
 */

// SMB pass 2026-08-11: "GTM" read as big-company jargon to the audience we
// actually sell to. Customers, not pipeline; bring, not find (covers outbound
// AND being found on Google/ChatGPT). Two sentences, period each — the V1
// cadence that worked, and the voice skill's strongest form.
const H1_LINES = ["You run your company.", "We bring you customers."] as const;
const H2_COPY =
  "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.";

export function LandingHero() {
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const h1SnakeRef = useRef<HTMLSpanElement>(null);
  const h2SnakeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!stageRef.current || !canvasRef.current) return;
    const cleanup = mountSnake({
      stage: stageRef.current,
      canvas: canvasRef.current,
      overlays: [h1SnakeRef.current, h2SnakeRef.current].filter(
        (el): el is HTMLSpanElement => el !== null,
      ),
      // The H2/CTA column is a keep-out: the wander repels from it and
      // the mobile orbit shrinks to the band above it (impeccable P0 — the
      // snake parked mid-H2 at the exact "what is this" moment). The H1 is
      // deliberately NOT covered: beads crossing it fire the reveal, the
      // hero's signature.
      keepOut: rightColRef.current ?? undefined,
    });
    // Entrance reveal, report-page pattern: the hidden starting state only
    // exists under html.lv2-anim, so pre-hydration paint and no-JS visitors
    // always see the copy — LCP is never gated on hydration.
    document.documentElement.classList.add("lv2-anim");
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => contentRef.current?.classList.add("is-in")),
    );
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("lv2-anim");
      cleanup();
    };
  }, []);

  return (
    <section ref={stageRef} className="lv2-stage" aria-label="Pancake — AI agents that bring you customers">
      <canvas ref={canvasRef} className="lv2-stage-canvas" aria-hidden="true" />
      <div ref={contentRef} className="lv2-stage-content">
        <h1 className="lv2-h1">
          <span className="ln">{H1_LINES[0]}</span>
          <br />
          <span className="ln">{H1_LINES[1]}</span>
          <span ref={h1SnakeRef} className="lv2-h1-snake" aria-hidden="true">
            <span className="ln">{H1_LINES[0]}</span>
            <br />
            <span className="ln">{H1_LINES[1]}</span>
          </span>
        </h1>
        <div ref={rightColRef} className="lv2-hero-right">
          <h2 className="lv2-h2">
            {H2_COPY}
            <span ref={h2SnakeRef} className="lv2-h2-snake" aria-hidden="true">
              {H2_COPY}
            </span>
          </h2>
          <div className="lv2-button-group">
            <FxPill variant="outline" data-lv2-open="call" data-analytics-id="call_hero">
              Book a call
            </FxPill>
            <FxPill data-lv2-open="waitlist" data-analytics-id="waitlist_hero">
              Join waitlist
            </FxPill>
          </div>
        </div>
      </div>
    </section>
  );
}
