/**
 * Landing v3 — audience switch (founder 2026-09-04: the toggle is Figma
 * node 4389:781 — a green pill track with a round white knob, "the green
 * of the arc-en-ciel"; placed by his red box, centred above the headline
 * row). Groundwork for the For humans / For agents split.
 * One real link with switch semantics: off on the humans homepage (knob
 * left, goes to /agents), on on /agents (knob right, goes back to /). The
 * page IS the state — no client JS, no query string; back/forward and
 * open-in-new-tab just work. Geometry in hero.css (.lp-audience).
 */
export type LpAudience = "humans" | "agents";

export function LpAudienceToggle({ current }: { current: LpAudience }) {
  const on = current === "agents";
  return (
    <a className="lp-audience" href={on ? "/" : "/agents"} role="switch" aria-checked={on}>
      <span className="lp-audience__track" aria-hidden="true">
        <span className="lp-audience__knob" />
      </span>
      <span className="lp-audience__label">For agents</span>
    </a>
  );
}
