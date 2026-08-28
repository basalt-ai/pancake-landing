# Landing v3 — Figma replication notes

Source of truth: Figma `Pancake-Design`, page `└-> Desktop` (node `4197-9774`), frame `hero` (`4257:4893`, 1654×9632).
Extraction date: 2026-08-28. Extraction spec + reference screenshots live in the session scratchpad (`figma-spec/`, `figma-refs/`).

## Structure

| Piece | Where |
|---|---|
| Token layer (Figma variables 1:1) | `app/_styles/landing-v3/foundation.css` — `--lp-*` vars scoped to `.lp` |
| Shared recipes | `.lp-btn` (3 exact sizes), `.lp-title-section`, `.lp-title-card`, `.lp-chip`, `.lp-mockcard`, `.lp-content` |
| Sections | `Lp*.tsx` here + one CSS file each in `app/_styles/landing-v3/` |
| Art assets | `public/lp/` — grouped SVG exports from Figma (backdrop/page rects stripped) + icons/photos. `public/lp/manifest.json` maps Figma asset ids → files |

## Why some tokens differ from `tokens.css`

The Figma file's variables differ from the old palette on three points, and AGENTS.md says Figma wins — but only this page uses the new values, so they are scoped to `.lp` instead of edited in `@layer semantic`:

- `--lp-ink-10: #fffbf6` (old `--palette-chrome-10: #FFFCF8`)
- `--lp-green-10: #ceead5` (old `#CFF0E1`)
- page background `#fbf6f1` and the `--lp-ink-tr-*` alpha ramp are new.

## Fonts

All display type (hero headline, every section title, "99 USD") is **Aeonik Condensed Pro TRIAL** — upright cuts in `app/fonts/aeonik-condensed/` (CoType trial zip, downloaded 2026-08-28 at Tristan's direction), loaded in `app/layout.tsx` as `--font-aeonik-condensed` and consumed via `--lp-font-cond`. Body/labels stay Aeonik Fono; UI-mock labels use Aeonik Medium.

⚠️ All three families are TRIAL-licensed — settle the CoType license before this ships to production.

## Buttons

The four CTAs are `LpFxLink` (`LpFxButton.tsx`) — the landing-v2 pill FX ported onto the
Figma-exact `.lp-btn` geometry: pointer-anchored circle flood (yellow-30/purple-30/green-20
cycle) + label slide on hover, touch-guarded, `app_cta_clicked` analytics on the existing
allow-listed ids (app_nav / app_hero / app_final / app_pricing_card). The resting label is
cream; the slide-in label is plum for contrast on the pastel flood.
Every Figma rectangle carries cornerSmoothing (buttons .75, cards .6, testimonials 1.0) —
`corner-shape: squircle` is applied via the grouped rule in `foundation.css`; browsers
without support fall back to plain rounded corners at the same radii.
Gotcha that bit us: `.lp a { color: inherit }` outranks `.lp-btn` — anchor buttons need the
`.lp a.lp-btn` color rule or their labels render plum-on-plum (invisible).

## Motion (shipped 2026-08-28, Figma-exact)

Extracted with `get_motion_context`: ONE 20 000 ms linear infinite master loop
rooted at the page frame — every animated node shares the clock, and t=0 equals
the static artboard (enforced by a pixel-parity gate).

- Rings (`LpPancakes.tsx`, variants hero/pricing/ctaRight/ctaLeft): full-circle
  vectors (`public/lp/lp-arc-1..6.svg`, mapped by fill color) at their Figma
  bboxes; static pose as a fitted `matrix()` (mirror + 0.47° shear, fitted to
  <0.01px against the baked composites); a spinner inside the pose applies the
  track sign unmodified (0→±360°/20 s). The cream ring "pops" −50px over the
  first 500 ms of each loop (`lp-anim-pop`, cubic-bezier(0,0,.58,1)) — that is
  Figma's own keyframe, so raw t=0 differs from the settled artboard by exactly
  that annulus.
- Banner bubbles (`LpBubbles.tsx`): 44 circles in card coords spinning about
  their own centers (near-invisible for true circles — faithful to the
  prototype; the one irregular blob visibly wobbles), 4 with phase offsets via
  negative animation-delay.
- All keyframes in `app/_styles/landing-v3/anim.css`; `prefers-reduced-motion`
  disables everything (static = artboard). Timing audited via
  `document.getAnimations()`: 68 animations, all 20000 ms/linear/Infinity.
- Perf note: transform-only compositor animations; the software-GL headless QA
  harness caps at ~35 fps (its compositor, not main-thread — static page reads
  63 fps there). Verify scroll feel on the Vercel preview with a real GPU.
