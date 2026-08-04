"use client";

import { Button, type ButtonProps } from "@/components/ui/Button";

/**
 * Kit Button wearing the landing's exact clothes: the label is duplicated so
 * the landing-v2 slide-up hover works (l1 exits upward, l2 arrives from
 * below). Geometry overrides live in report.css under `.rpt .button`.
 */
export function FxButton({ children, ...rest }: ButtonProps & { children: string }) {
  return (
    <Button {...rest}>
      <span className="rpt-btn-label">
        <span className="l1">{children}</span>
        <span className="l2" aria-hidden="true">
          {children}
        </span>
      </span>
    </Button>
  );
}
