"use client";

import { useEffect, useRef } from "react";

import { Button, type ButtonProps } from "@/components/ui/Button";

/**
 * Kit Button wearing landing-v2's exact clothes — both halves of its hover:
 * the label slides up (l1 exits, l2 arrives) while a snake-palette circle
 * expands from the pointer to flood the button, retracting toward the exit
 * point on leave. Verbatim port of the landing's `[data-fx]` script, native
 * pointer listeners included; geometry overrides live in report.css under
 * `.rpt .button`.
 */

const FILLS = [
  "var(--palette-yellow-30)",
  "var(--palette-purple-30)",
  "var(--palette-green-20)",
];

/** Module-level seed so sibling buttons start on different fills, like the landing. */
let fxSeed = 0;

export function FxButton({ children, ...rest }: ButtonProps & { children: string }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const c = circleRef.current;
    if (!btn || !c) return;
    let count = fxSeed++;

    const place = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2.35;
      c.style.width = `${d}px`;
      c.style.height = `${d}px`;
      c.style.left = `${e.clientX - r.left}px`;
      c.style.top = `${e.clientY - r.top}px`;
    };

    const onEnter = (e: PointerEvent) => {
      c.style.transition = "none";
      place(e);
      c.style.background = FILLS[count++ % 3]!;
      void c.offsetWidth; // commit the repositioned, unscaled circle before animating
      c.style.transition = "";
      c.style.transform = "translate(-50%,-50%) scale(1)";
    };

    const onLeave = (e: PointerEvent) => {
      place(e);
      c.style.transform = "translate(-50%,-50%) scale(0)";
    };

    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointerleave", onLeave);
    return () => {
      btn.removeEventListener("pointerenter", onEnter);
      btn.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <Button {...rest} ref={btnRef}>
      <span className="rpt-btn-fx" aria-hidden="true">
        <span ref={circleRef} className="c" />
      </span>
      <span className="rpt-btn-label">
        <span className="l1">{children}</span>
        <span className="l2" aria-hidden="true">
          {children}
        </span>
      </span>
    </Button>
  );
}
