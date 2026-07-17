"use client";

import * as React from "react";

import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Scroll-motion primitives for the /gtm landing.
 *
 * All entrance styling lives in gtm.css and is gated on `html.gtm-anim`,
 * which is only added here on mount — without JS nothing is ever hidden.
 * Reduced-motion users get instant, static content via the media query
 * in gtm.css.
 */

function useInView(ref: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    document.documentElement.classList.add("gtm-anim");
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("gtm-inview");
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

/** Fade-and-rise wrapper. `delay` staggers siblings (ms). */
export function Reveal({
  className,
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  useInView(ref);
  return (
    <div
      ref={ref}
      data-reveal
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/** One display-size statement line that slides up out of an overflow mask. */
export function RevealLine({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  useInView(ref as React.RefObject<HTMLElement>);
  return (
    <span
      ref={ref}
      data-reveal-line
      className="gtm-line"
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      <span className="gtm-line-inner">{children}</span>
    </span>
  );
}

/**
 * Scroll-scrubbed parallax for decorative pancake shapes: every child
 * carrying `data-speed` drifts vertically at its own rate while the
 * section crosses the viewport. Desktop pointers only, and disabled for
 * reduced motion (GSAP matchMedia handles both).
 */
export function PancakeParallax({
  className,
  children,
  "aria-hidden": ariaHidden,
}: {
  className?: string;
  children: React.ReactNode;
  "aria-hidden"?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const root = ref.current;
        if (!root) return;
        root.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
          const speed = Number.parseFloat(el.dataset.speed ?? "0.2");
          gsap.to(el, {
            yPercent: -120 * speed,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} aria-hidden={ariaHidden}>
      {children}
    </div>
  );
}
