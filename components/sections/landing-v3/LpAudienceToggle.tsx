/**
 * Landing v3 — audience toggle (founder 2026-09-04: "un toggle en haut à
 * droite du hero", the groundwork for the For humans / For agents split).
 * Two real links, one per page: `/` is the cream landing, `/agents` the same
 * hero with the colors inverted. The current page IS the state — no client
 * JS, no query string; back/forward and open-in-new-tab just work.
 * Not on the Figma artboard: hero.css gives it the sm pill's metrics (38px
 * track, Fono 600 13.333) and skins it from the semantic tokens only, so the
 * inverted page flips it together with everything else.
 */
export type LpAudience = "humans" | "agents";

const OPTIONS: ReadonlyArray<{ id: LpAudience; label: string; href: string }> = [
  { id: "humans", label: "For humans", href: "/" },
  { id: "agents", label: "For agents", href: "/agents" },
];

export function LpAudienceToggle({ current }: { current: LpAudience }) {
  return (
    <nav className="lp-audience" aria-label="Audience">
      {OPTIONS.map((option) => (
        <a
          key={option.id}
          className="lp-audience__opt"
          href={option.href}
          aria-current={option.id === current ? "page" : undefined}
        >
          {option.label}
        </a>
      ))}
    </nav>
  );
}
