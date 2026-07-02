/**
 * Shared pancake mascot tints — the single source of truth for the two-tone
 * pancake silhouette colors used in inline SVGs (hero decor, integrations
 * cloud tails/berries, closing-CTA satellites, …).
 *
 * These are SVG `fill` values, so they can't consume CSS custom properties
 * directly in every context (e.g. server-rendered `<path fill>`); instead the
 * hex values are copied verbatim from the on-palette tokens in
 * `app/_styles/tokens.css`. If a token changes there, change it here too —
 * each entry cites the exact token it mirrors.
 *
 * Shape convention (matches `DecorPancake` in
 * `components/sections/home/HomeLandingBody.tsx` and
 * `pancake-svgs/angled-1.svg`):
 *  - `side` — the lighter "edge"/underbelly path, drawn first (bottom layer).
 *  - `top`  — the stronger upper-surface path, drawn on top.
 */
export const PANCAKE_TINTS: Record<
  "pink" | "purple" | "yellow" | "orange",
  { side: string; top: string }
> = {
  pink: {
    side: "#FFBBC7", // --palette-pink-20
    top: "#FF7AA0", // --palette-pink-30
  },
  purple: {
    side: "#DEC3F5", // --palette-purple-20
    top: "#BA8BFF", // --palette-purple-30
  },
  yellow: {
    side: "#FFDBB5", // --palette-yellow-20
    top: "#FFBD7A", // --palette-yellow-30
  },
  orange: {
    // Orange steps run darker than the other hues (orange-30 is #D43900,
    // a burnt red) — so orange uses the 10/20 pair to stay in the same
    // perceived lightness band as pink/purple/yellow's 20/30 pairs.
    side: "#FFDDBE", // --palette-orange-10
    top: "#FFA45F", // --palette-orange-20
  },
};
