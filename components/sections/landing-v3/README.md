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
- Banner bubbles (`LpBubbles.tsx`): 44 near-circles in card coords spinning
  about their own centers — VERIFIED against Figma's own prototype render
  (`export_video` of 4257:4893, measured frame-by-frame): the bubbles do NOT
  orbit/pour, they shimmer in place. The four tracks with absolute-angle
  offsets end at each node's static rotation, so all 44 run +360° from a 0°
  offset — no animation-delay anywhere (earlier delays were a mis-encoding,
  removed 2026-08-28). The drop and bottle do not animate at all.
- Cream-ring pop plays ONCE (`20s linear 1 forwards`) — Figma exports it as
  infinite but replaying it broke the loop wrap (founder report).
- CTA desync (founder, 2026-08-28): the left CTA group runs at
  `animation-delay: -7.3s` so the two mirrored rainbows never render as a
  perfect reflection mid-animation.
- All keyframes in `app/_styles/landing-v3/anim.css`; `prefers-reduced-motion`
  disables everything (static = artboard). Current census at 1654:
  66 spins (22 arcs + 44 bubbles) 20 s linear ∞ · 2 one-shot pops · 1 logo
  marquee (32 s) · 2 tweet marquees (80 s, opposite directions) · 5 signal
  quips (21 s shared loop).
- WebKit guard: the hero/CTA/pricing text containers carry
  `transform: translateZ(0)` (+ `isolation: isolate` on the hero) — Safari's
  heuristic overlap-promotion dropped the H1's layer on scroll-return over
  the big animated ring layers.
- Perf note: transform-only compositor animations; the software-GL headless QA
  harness caps at ~35 fps (its compositor, not main-thread — static page reads
  63 fps there). Verify scroll feel on the Vercel preview with a real GPU.

## Founder overrides of the artboard (2026-08-28)

These intentionally diverge from the static Figma export — don't "fix" them
back during a fidelity pass:

- Casing: no capitals on common nouns mid-sentence ("Pancake sells it",
  "While you run your business,", "GTM brain").
- Steps media cards are the designer's vector illustrations (Figma 4636:3164,
  2026-09-02: knowledge graph / pipeline checklist / calendar week), exported
  as 464×426 SVGs with outlined text (`/public/how/step-*.svg`), contain-fit
  in a card that keeps the 464/426 aspect at every width — nothing cropped on
  phones. Step 03 copy is the founder's override, not the artboard's. The
  old studio loop trio (`/public/how/*-loop.mp4`) is retired from this section;
  the designer's storyboard loops (`/public/how/brain-research-loop.mp4`, …) take
  each card over as the founder approves them (all three done 2026-09-02; the SVG illustrations stay as the no-video fallback assets).
- Logo strip scrolls (seamless 1424px-period tile
  `lp-logo-strip-tile.png`, ~34 px/s leftward, blend moved to the track).
- Testimonials: two counter-scrolling marquees (~28.75 px/s), 48px between
  rows (Figma had 96), 8 distinct fictional authors/tweets; phones keep the
  old single stacked column (row 2 hidden there).
- Signals card: fixed "clay alternatives" sticker (bubble+text share one
  rotated box) + 5 popping quips (`.lp-feat-f1-quip`, one at a time, hidden
  under reduced motion).
- Footer content sits 48px closer to the pricing rings (height 467, brand
  top 56.43, cols top 76.75; Figma: 515/104.43/124.75).
- /careers runs on this design system (`app/careers/page.tsx` +
  `app/_styles/landing-v3/careers.css`, imported by the page only — not in
  the landing-v3.css manifest).
