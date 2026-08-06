"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/Input";

import { FxPill } from "./FxPill";
import { mountSnake } from "./snake";

/**
 * The hero stage — full-height band under the nav where the snake wanders,
 * revealing the duplicate H1/H2 through its circles. Port of the static
 * landing's `.prefooter` section, plus the adopted owner.com-style live
 * experience (lp-skeleton-review, 2026-07-30): one input ("yourcompany.com") +
 * one CTA ("Get my AI GTM report") that hands the domain to /ai-gtm-report.
 */

const H1_LINES = ["You run your company.", "We run your GTM."] as const;
const H2_COPY =
  "Pancake is a team of AI agents that understand your company and handle high quality GTM tasks autonomously.";

export function LandingHero() {
  const router = useRouter();
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const h1SnakeRef = useRef<HTMLSpanElement>(null);
  const h2SnakeRef = useRef<HTMLSpanElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!stageRef.current || !canvasRef.current) return;
    const cleanup = mountSnake({
      stage: stageRef.current,
      canvas: canvasRef.current,
      overlays: [h1SnakeRef.current, h2SnakeRef.current].filter(
        (el): el is HTMLSpanElement => el !== null,
      ),
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = url.trim();
    if (!domain) return;
    router.push(`/ai-gtm-report?url=${encodeURIComponent(domain)}`);
  };

  return (
    <section ref={stageRef} className="lv2-stage" aria-label="Pancake — AI agents for your GTM">
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
        <div className="lv2-hero-right">
          <h2 className="lv2-h2">
            {H2_COPY}
            <span ref={h2SnakeRef} className="lv2-h2-snake" aria-hidden="true">
              {H2_COPY}
            </span>
          </h2>
          <form className="lv2-hero-pill" onSubmit={submit}>
            <Input
              size="lg"
              placeholder="yourcompany.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-label="Your company's domain"
            />
            <FxPill type="submit" size="lg">
              Get my AI GTM report
            </FxPill>
          </form>
          <div className="lv2-button-group">
            <FxPill variant="outline" data-lv2-open="call">
              Book a call
            </FxPill>
            <FxPill data-lv2-open="waitlist">Join waitlist</FxPill>
          </div>
        </div>
      </div>
    </section>
  );
}
