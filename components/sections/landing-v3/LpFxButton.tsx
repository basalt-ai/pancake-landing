"use client";

import { useEffect, useRef, type RefObject } from "react";

import { isAppCtaId, pushAcquisitionEvent } from "@/lib/analytics/data-layer";

/**
 * The landing-v2 pill FX (FxPill.tsx) ported onto the v3 `.lp-btn` recipe —
 * founder-requested reuse (2026-08-28): a snake-palette circle expands from
 * the pointer to flood the pill while the label slides up (l1 exits, l2
 * arrives), retracting toward the exit point on leave. Geometry stays the
 * Figma-exact `.lp-btn`; the FX layers are pure overlays.
 * LpFxLink is the anchor twin (real navigations); LpFxPill is the button twin
 * for in-page triggers (the "Book a call" dialog opener — its analytics fire
 * in LpModals, keyed off data-analytics-id, so no wiring here).
 */

const FILLS = [
  "var(--lp-yellow-30)",
  "var(--lp-purple-30)",
  "var(--lp-green-20)",
];

/** Module-level seed so sibling buttons start on different fills, like v2. */
let fxSeed = 0;

function useFxCircle(hostRef: RefObject<HTMLElement>, circleRef: RefObject<HTMLSpanElement>) {
  useEffect(() => {
    const host = hostRef.current;
    const c = circleRef.current;
    if (!host || !c) return;
    let count = fxSeed++;

    const place = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2.35;
      c.style.width = `${d}px`;
      c.style.height = `${d}px`;
      c.style.left = `${e.clientX - r.left}px`;
      c.style.top = `${e.clientY - r.top}px`;
    };

    const onEnter = (e: PointerEvent) => {
      // Hovering pointers only: on touch, iOS fires pointerenter on tap and
      // the flood then sticks with no reliable leave (founder report
      // 2026-08-26). Touch gets the OS press feedback instead.
      if (e.pointerType === "touch") return;
      c.style.transition = "none";
      place(e);
      c.style.background = FILLS[count++ % 3]!;
      void c.offsetWidth; // commit the repositioned, unscaled circle before animating
      c.style.transition = "";
      c.style.transform = "translate(-50%,-50%) scale(1)";
      // The label swap is driven by this class, NOT :hover — CSS-only :hover
      // could slide the plum .l2 onto the still-plum pill with no flood
      // (stationary-cursor page load, pre-hydration, reduced-motion), leaving
      // the label invisible (QA audit 2026-08-28).
      host.classList.add("is-fx");
    };

    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      place(e);
      c.style.transform = "translate(-50%,-50%) scale(0)";
      host.classList.remove("is-fx");
    };

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [hostRef, circleRef]);
}

export function LpFxLink({
  href,
  size,
  className,
  onClick,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  size?: "sm" | "lg";
  children: string;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  useFxCircle(linkRef, circleRef);

  // Same funnel wiring as v2's FxPillLink: app links emit the allow-listed
  // app_cta_clicked event (GTM/PostHog read it from dataLayer).
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    const ctaId = e.currentTarget.getAttribute("data-analytics-id");
    if (isAppCtaId(ctaId)) pushAcquisitionEvent("app_cta_clicked", { cta_id: ctaId });
  };

  return (
    <a
      {...rest}
      ref={linkRef}
      href={href}
      className={className ? `lp-btn ${className}` : "lp-btn"}
      data-size={size}
      onClick={handleClick}
    >
      <span className="lp-btn-fx" aria-hidden="true">
        <span ref={circleRef} className="c" />
      </span>
      <span className="lp-btn-label">
        <span className="l1">{children}</span>
        <span className="l2" aria-hidden="true">
          {children}
        </span>
      </span>
    </a>
  );
}

export function LpFxPill({
  size,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "lg";
  children: string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  useFxCircle(btnRef, circleRef);

  return (
    <button
      type="button"
      {...rest}
      ref={btnRef}
      className={className ? `lp-btn ${className}` : "lp-btn"}
      data-size={size}
    >
      <span className="lp-btn-fx" aria-hidden="true">
        <span ref={circleRef} className="c" />
      </span>
      <span className="lp-btn-label">
        <span className="l1">{children}</span>
        <span className="l2" aria-hidden="true">
          {children}
        </span>
      </span>
    </button>
  );
}
