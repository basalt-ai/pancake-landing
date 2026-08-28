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

## Fonts — IMPORTANT

All display type (hero headline, every section title, "99 USD") uses **Aeonik Condensed Pro TRIAL** in Figma. The condensed OTFs are **not in the repo and not on the build machine**, so `--lp-font-cond` currently resolves to regular Aeonik (same foundry, wider letterforms). To reach exact metric parity:

1. Get the `Aeonik Condensed Pro TRIAL` OTFs (Regular, Medium, SemiBold, Black) from the designer.
2. Drop them in `app/fonts/aeonik-condensed/`.
3. Add a `localFont` block in `app/layout.tsx` exposing `--font-aeonik-condensed`.
4. Point `--lp-font-cond` at it in `foundation.css`.

Do **not** fake-condense with `transform: scaleX()`.

## Phase 2 (not in this PR)

Figma marks the rainbow arcs (hero, banner bubbles, CTA, pricing) as animated (`rotate` keys). The grouped SVG exports preserve layer ids (`fill`, `fill_2`, …) so the arcs can be animated by targeting SVG groups, or re-split from Figma via `get_motion_context` on nodes `4257:4907`, `4420:961`, `4389:4519`, `4257:5273`.
