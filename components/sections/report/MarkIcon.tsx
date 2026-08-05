"use client";

/**
 * Crisp stroke marks for pass/fail bubbles — SVG paths, optically centered,
 * unlike text glyphs whose baselines drift inside small circles.
 */
export function MarkIcon({ ok, size = 11 }: { ok: boolean; size?: number }) {
  return ok ? (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true">
      <path
        d="M2.2 6.6 4.8 9.2 9.8 2.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true">
      <path
        d="M3.1 3.1l5.8 5.8M8.9 3.1 3.1 8.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
