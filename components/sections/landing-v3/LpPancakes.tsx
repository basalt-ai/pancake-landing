/**
 * Landing v3 — animated "pancakes" ring groups (Figma motion layer).
 *
 * Replaces the flat composite exports (lp-pancakes-hero.svg,
 * lp-pancakes-pricing.svg, lp-cta-rainbow-*.svg) with per-arc structure so the
 * Figma prototype's 20s master loop can run: 6 stacked full-ring vectors
 * (5 for the CTA groups — no cream ring there), each an irregular disc that
 * paints over the previous one, leaving the visible rainbow bands between
 * consecutive disc edges. The page-colored cream disc masks the middle; its
 * once-per-loop 50px "pop" (size settle) makes the innermost band breathe.
 *
 * Structure per arc — see anim.css for the full composition/direction
 * reasoning:
 *   .lp-anim-arc   → the Figma post-transform bounds (bbox) inside the
 *                    clipping group container, flex-centered
 *   .lp-anim-pose  → the element at its design size with the STATIC artboard
 *                    transform as a matrix(); the linear parts below were
 *                    least-squares fitted (max err <0.01px) from the baked
 *                    path coordinates of the static composite SVGs, so t=0
 *                    reproduces the artboard exactly
 *   .lp-anim-spin  → rotation keyframes (±360°/20s linear infinite), INSIDE
 *                    the pose so the Figma track sign applies unmodified
 *   svg            → the ring vector (== public/lp/lp-arc-N.svg content)
 *                    inlined at 100% with preserveAspectRatio="none"
 *                    (canvas dims == element dims; see RingAsset.d) and
 *                    overflow visible (like the lp-arc-N.svg files declare):
 *                    each export viewBox is TANGENT to the ring ink on all
 *                    four edges, so the default svg viewport clip shaves the
 *                    anti-aliased edge row at the four tangency spots; the
 *                    shaved spots rotate with the ring and read as flat
 *                    ~100px cuts on a band's underside whenever one sweeps
 *                    through the visible slice (founder report 2026-08-31,
 *                    pricing at ≥2000px). overflow:visible restores the
 *                    composite artboard's un-clipped edges; the real clip
 *                    stays .lp-anim-box (the Figma group clip).
 *
 * Geometry source: scratchpad anim/arc-geometry.json (bboxes relative to each
 * pancakes container, Figma node ids in comments) + fitted pose matrices.
 */

type Spin = "cw" | "ccw";

interface RingAsset {
  file: string;
  /** element (== SVG canvas) design size */
  iw: number;
  ih: number;
  /** static-pose shear magnitude (fitted per color) */
  s: number;
  fill: string;
  /** the ring path (== public/lp file content), inlined so the browser renders
      the vector through the full transform chain (path-exact edge AA — a
      bitmap <img> gets resampled under the mirror/shear and measurably blurs
      the t=0 pixel parity) */
  d: string;
}

// Ring assets map by FILL COLOR (file numbering does not follow z-order).
const RING = {
  yellow: {
    file: "/lp/lp-arc-1.svg",
    iw: 2600.38,
    ih: 2622.11,
    s: 0.008271,
    fill: "#FFBD7A",
    d: "M1236.11 0C1820.85 0 2600.38 626.975 2600.38 1272.42C2600.38 1970.66 2076.39 2622.11 1386.1 2622.11C1070.92 2622.11 735.048 2497.98 503.656 2313.03C228.274 2092.92 -3.80111 1841.42 0.0471839 1375.17C6.27243 621.2 579.008 0 1236.11 0Z",
  },
  pink: {
    file: "/lp/lp-arc-2.svg",
    iw: 2555.76,
    ih: 2577.24,
    s: 0.008297,
    fill: "#FF7AA0",
    d: "M1254.08 0C1652.53 0 2104.99 340.218 2320.85 625.314C2469.03 821.004 2555.76 1068.08 2555.76 1344.87C2555.76 2027.72 1995 2577.24 1316.33 2577.24C1006.45 2577.24 722.671 2442.94 495.176 2262.07C224.431 2046.8 -3.7371 1800.84 0.0463894 1344.87C6.16681 607.514 608.048 0 1254.08 0Z",
  },
  purple: {
    file: "/lp/lp-arc-5.svg",
    iw: 2499.05,
    ih: 2519.53,
    s: 0.008096,
    fill: "#BA8BFF",
    d: "M1361.45 0C1750.37 0 2059.06 282.082 2269.76 567.232C2414.39 762.961 2499.05 1010.08 2499.05 1286.92C2499.05 1969.91 1951.7 2519.53 1289.28 2519.53C626.852 2519.53 67.4716 2035.66 4.48892 1286.92C-33.7325 832.595 177.99 585.989 416.349 383.611C653.079 182.616 1034.64 0 1361.45 0Z",
  },
  blue: {
    file: "/lp/lp-arc-4.svg",
    iw: 2390.95,
    ih: 2410.54,
    s: 0.008097,
    fill: "#4660E7",
    d: "M1302.56 0C1674.65 0 1969.99 269.88 2171.58 542.696C2309.95 729.958 2390.95 966.387 2390.95 1231.25C2390.95 1884.69 1867.27 2410.54 1233.51 2410.54C599.736 2410.54 64.553 1947.6 4.29474 1231.25C-32.2733 796.579 170.291 560.641 398.339 367.017C624.829 174.716 989.889 0 1302.56 0Z",
  },
  green: {
    file: "/lp/lp-arc-3.svg",
    iw: 2390.57,
    ih: 2410.55,
    s: 0.008253,
    fill: "#68CEA7",
    d: "M1136.37 0C1673.93 0 2390.57 576.388 2390.57 1169.76C2390.57 1811.66 1908.86 2410.55 1274.27 2410.55C984.513 2410.55 675.741 2296.43 463.019 2126.41C209.856 1924.05 -3.49442 1692.84 0.0433768 1264.21C5.76634 571.079 532.291 0 1136.37 0Z",
  },
  cream: {
    file: "/lp/lp-arc-6.svg",
    iw: 2390.57,
    ih: 2331.05,
    s: 0.008254,
    fill: "#FBF6F1",
    d: "M1111.61 0.032579C1353.59 0.032579 1731.04 -6.75961 1963.89 175.801C2248.32 398.802 2390.57 763.988 2390.57 1090.26C2390.57 1732.16 1908.86 2331.05 1274.27 2331.05C984.518 2331.05 654.317 2254.18 441.595 2084.15C188.433 1881.8 -3.48967 1613.34 0.048125 1184.71C5.77109 491.579 379.372 0.032579 1111.61 0.032579Z",
  },
} satisfies Record<string, RingAsset>;

type RingName = keyof typeof RING;

interface ArcSpec {
  ring: RingName;
  /** bbox relative to the pancakes container */
  x: number;
  y: number;
  w: number;
  h: number;
  spin: Spin;
  pop?: boolean;
  /**
   * Compositing optimization, pixel-identical by construction: every disc's
   * interior is permanently hidden by the disc stacked above it (concentric
   * stack; the cover's minimum blob radius exceeds this hole radius plus the
   * center offset at every rotation angle, pop included). Cutting a
   * rotation-invariant concentric hole (evenodd subpath) makes those tiles
   * fully transparent, so the compositor skips them each frame — the 20s loop
   * costs a thin annulus per ring instead of a full disc. Top-of-stack rings
   * (cream; green in the CTA groups) keep their full interior.
   */
  hole?: number;
}

// Static pose matrix(a, b, c, d, 0, 0) per variant (s = per-color shear):
//   hero     [[-1, -s], [0,  1]]  — mirror + shear            (det −1)
//   pricing  [[-1, -s], [0, -1]]  — hero pose y-flipped       (det +1)
//   ctaRight [[ 0,  1], [1,  s]]  — hero pose rotated −90°    (det −1)
//   ctaLeft  [[ 0, -1], [1,  s]]  — ctaRight pose x-mirrored  (det +1)
const POSE: Record<Variant, (s: number) => string> = {
  hero: (s) => `matrix(-1, 0, ${-s}, 1, 0, 0)`,
  pricing: (s) => `matrix(-1, 0, ${-s}, -1, 0, 0)`,
  ctaRight: (s) => `matrix(0, 1, 1, ${s}, 0, 0)`,
  ctaLeft: (s) => `matrix(0, 1, -1, ${s}, 0, 0)`,
};

// z-order bottom→top; spin per the Figma tracks (cw = increasing track
// −180→180 / −540→−180 → 0→+360deg; ccw = decreasing 540→180 / 180→−180 →
// 0→−360deg). Adjacent rings counter-rotate.
const ARCS: Record<Variant, ArcSpec[]> = {
  // hero container 2622×1478 (nodes 4257:4909–4914)
  hero: [
    { ring: "yellow", x: -0.25, y: 207.14, w: 2622.07, h: 2622.02, spin: "cw", hole: 1200 },
    { ring: "pink", x: 22.22, y: 229.58, w: 2577.15, h: 2577.15, spin: "ccw", hole: 1183 },
    { ring: "purple", x: 51.08, y: 258.43, w: 2519.45, h: 2519.45, spin: "cw", hole: 1132 },
    { ring: "blue", x: 105.56, y: 312.92, w: 2410.47, h: 2410.47, spin: "ccw", hole: 1125 },
    { ring: "green", x: 105.56, y: 312.92, w: 2410.47, h: 2410.47, spin: "cw", hole: 1104 },
    { ring: "cream", x: 105.57, y: 392.42, w: 2409.81, h: 2330.97, spin: "ccw", pop: true },
  ],
  // pricing container 2622×1039 (nodes 4257:5279–5311)
  pricing: [
    { ring: "yellow", x: -478.94, y: -1732.96, w: 2622.07, h: 2622.02, spin: "cw", hole: 1200 },
    { ring: "pink", x: -456.47, y: -1710.52, w: 2577.15, h: 2577.15, spin: "ccw", hole: 1183 },
    { ring: "purple", x: -427.61, y: -1681.67, w: 2519.45, h: 2519.45, spin: "cw", hole: 1132 },
    { ring: "blue", x: -373.13, y: -1627.18, w: 2410.47, h: 2410.47, spin: "ccw", hole: 1125 },
    { ring: "green", x: -373.13, y: -1627.18, w: 2410.47, h: 2410.47, spin: "cw", hole: 1104 },
    { ring: "cream", x: -373.12, y: -1627.18, w: 2409.81, h: 2330.97, spin: "ccw", pop: true },
  ],
  // CTA right group container 1478×2622 (nodes 4389:4531–4535)
  ctaRight: [
    { ring: "yellow", x: 357.64, y: 0.19, w: 2622.02, h: 2622.07, spin: "cw", hole: 1200 },
    { ring: "pink", x: 380.08, y: 22.63, w: 2577.15, h: 2577.15, spin: "ccw", hole: 1183 },
    { ring: "purple", x: 408.93, y: 51.47, w: 2519.45, h: 2519.45, spin: "cw", hole: 1132 },
    { ring: "blue", x: 463.42, y: 105.97, w: 2410.47, h: 2410.47, spin: "ccw", hole: 1125 },
    { ring: "green", x: 463.42, y: 105.97, w: 2410.47, h: 2410.47, spin: "cw" },
  ],
  // CTA left group container 1478×2622 (nodes 4389:4538–4542)
  ctaLeft: [
    { ring: "yellow", x: -1535.47, y: 0.18, w: 2622.02, h: 2622.07, spin: "cw", hole: 1200 },
    { ring: "pink", x: -1513.03, y: 22.63, w: 2577.15, h: 2577.15, spin: "ccw", hole: 1183 },
    { ring: "purple", x: -1484.18, y: 51.47, w: 2519.45, h: 2519.45, spin: "cw", hole: 1132 },
    { ring: "blue", x: -1429.69, y: 105.97, w: 2410.47, h: 2410.47, spin: "ccw", hole: 1125 },
    { ring: "green", x: -1429.69, y: 105.97, w: 2410.47, h: 2410.47, spin: "cw" },
  ],
};

const BOX_CLASS: Record<Variant, string> = {
  hero: "lp-anim-box--hero",
  pricing: "lp-anim-box--pricing",
  ctaRight: "lp-anim-box--cta-right",
  ctaLeft: "lp-anim-box--cta-left",
};

export type Variant = "hero" | "pricing" | "ctaRight" | "ctaLeft";

/** ring path + concentric circular cutout (see ArcSpec.hole) */
function withHole(ring: RingAsset, r: number): string {
  const cx = ring.iw / 2;
  const cy = ring.ih / 2;
  return `${ring.d} M${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}Z`;
}

export function LpPancakes({ variant }: { variant: Variant }) {
  const pose = POSE[variant];
  return (
    <div aria-hidden="true" className={`lp-anim-box ${BOX_CLASS[variant]}`}>
      {ARCS[variant].map((arc) => {
        const ring = RING[arc.ring];
        return (
          <div
            key={arc.ring}
            className="lp-anim-arc"
            style={{ height: arc.h, left: arc.x, top: arc.y, width: arc.w }}
          >
            <div
              className="lp-anim-pose"
              style={{ height: ring.ih, transform: pose(ring.s), width: ring.iw }}
            >
              <div className={`lp-anim-spin lp-anim-spin--${arc.spin}`}>
                {/* overflow visible: the viewBox is tangent to the ink — the
                    default svg clip would shave the AA edge row (flat cuts on
                    the bands at wide viewports). See the header comment. */}
                <svg
                  className={arc.pop ? "lp-anim-fill lp-anim-pop" : "lp-anim-fill"}
                  fill="none"
                  preserveAspectRatio="none"
                  style={{ overflow: "visible" }}
                  viewBox={`0 0 ${ring.iw} ${ring.ih}`}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d={arc.hole ? withHole(ring, arc.hole) : ring.d}
                    /* the hole radius, for LpRainbowGL: the GL fill skips
                       the hole subpath and colours an annulus instead */
                    data-lp-hole={arc.hole}
                    fill={ring.fill}
                    fillRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
