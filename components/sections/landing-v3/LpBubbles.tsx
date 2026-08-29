/**
 * Landing v3 — banner bubbles (Figma nodes 4420:971–1186, motion layer).
 *
 * Replaces lp-banner-bubbles.svg + lp-banner-bubble-extra.svg with 44 bubble
 * divs in card coordinates (1622×721) inside .lp-banner__canvas, each spinning
 * about its own center on the shared 20s master loop (+360°/20s linear
 * infinite — the .lp-anim-bubble keyframe).
 *
 * Ground truth (verified 2026-08-28 against the file itself, not the earlier
 * extraction notes): a recursive get_motion_context audit of card 4420:961
 * shows exactly 44 animated nodes — these bubbles, nothing else (no tracks on
 * the drop 4420:962, the union 4420:963, or the titles). Every bubble is a
 * plain VECTOR sized to its own circle (its Figma "wrapper" bbox is
 * concentric with it — orbit radius 0), each with one rotate-only track,
 * 20 000 ms linear infinite. Forty run −360°→0°; four run absolute-angle
 * variants (4420:986/996 −485.658°→−125.658°, 4420:991 −477.384°→−117.384°,
 * 4420:1111 −364.269°→−4.269°) whose END value equals the node's static
 * rotation — so relative to the baked artboard pose ALL 44 tracks are the
 * identical +360°/20s starting at 0° offset. No animation-delay, ever: a
 * frame-by-frame measurement of Figma's own rendered prototype video (export
 * _video of 4257:4893) confirms every bubble's centroid stays static (±1px)
 * across the full loop — the spin is in place; only the rim wobbles, because
 * the shapes are near- but not perfect circles.
 *
 * Geometry is sampled from the baked composite paths (not the raw node data):
 * the banner group's static pose squeezes x by ×0.99157 (the same 0.47° shear
 * + mirror the pancake arcs carry), so every rendered bubble is a hair
 * narrower than tall — hence per-bubble w/h. The four rotated bubbles'
 * sampled sizes ARE the rotated t=0 shape, which is exactly what their
 * tracks resume from.
 *
 * The last entry (4420:1186, the former "bubble-extra") is an irregular blob,
 * not a circle — it keeps its own vector (lp-banner-bubble-extra.svg) so its
 * spin is actually visible, exactly like the pancake arcs. Off-card bubbles
 * (negative cx) stay — the card's overflow clips them. DOM order == the
 * composite's paint order (== Figma z-order).
 */

interface Bubble {
  cx: number;
  cy: number;
  w: number;
  h: number;
  color: string;
  /** vector asset for the one non-circular bubble */
  img?: string;
}

// prettier-ignore
const BUBBLES: Bubble[] = [
  { cx: 327.35, cy: 64.07, w: 32.41, h: 32.69, color: "#ffbd7a" },                    // 4420:971
  { cx: 667.5, cy: 432.92, w: 40.65, h: 41, color: "#ff7aa0" },                       // 4420:976
  { cx: 667.47, cy: 381.89, w: 20.76, h: 20.94, color: "#ff7aa0" },                   // 4420:981
  { cx: 781.23, cy: 342.79, w: 32.14, h: 31.1, color: "#ff7aa0" },                    // 4420:986 (−485.658→−125.658)
  { cx: 741.47, cy: 399.56, w: 32.27, h: 31.45, color: "#ff7aa0" },                   // 4420:991 (−477.384→−117.384)
  { cx: 894.22, cy: 331.79, w: 32.14, h: 31.11, color: "#ba8bff" },                   // 4420:996 (−485.658→−125.658)
  { cx: 700, cy: 382, w: 29.74, h: 30, color: "#ff7aa0" },                            // 4420:1001
  { cx: 741, cy: 370, w: 11.9, h: 12, color: "#ff7aa0" },                             // 4420:1006
  { cx: 775, cy: 377, w: 11.9, h: 12, color: "#ff7aa0" },                             // 4420:1011
  { cx: 716, cy: 427, w: 11.9, h: 12, color: "#ff7aa0" },                             // 4420:1016
  { cx: 647, cy: 343, w: 11.9, h: 12, color: "#ff7aa0" },                             // 4420:1021
  { cx: 663, cy: 248, w: 11.9, h: 12, color: "#ff7aa0" },                             // 4420:1026
  { cx: 669, cy: 477, w: 11.9, h: 12, color: "#ff7aa0" },                             // 4420:1031
  { cx: 923, cy: 322, w: 11.9, h: 12, color: "#4660e7" },                             // 4420:1036
  { cx: 863, cy: 330, w: 11.9, h: 12, color: "#ba8bff" },                             // 4420:1041
  { cx: 841, cy: 378, w: 11.9, h: 12, color: "#ba8bff" },                             // 4420:1046
  { cx: 619, cy: 327.42, w: 11.9, h: 12, color: "#ff7aa0" },                          // 4420:1051
  { cx: 923, cy: 348.42, w: 11.9, h: 12, color: "#4660e7" },                          // 4420:1056
  { cx: 805.08, cy: 374.5, w: 19.99, h: 20.16, color: "#ba8bff" },                    // 4420:1061
  { cx: 769.08, cy: 312.08, w: 19.99, h: 20.16, color: "#ba8bff" },                   // 4420:1066
  { cx: -189.8, cy: 80.62, w: 20.41, h: 20.41, color: "#68cea7" },                    // 4420:1071 (off-card)
  { cx: -228.19, cy: -15.03, w: 13.59, h: 13.59, color: "#68cea7" },                  // 4420:1076 (off-card)
  { cx: 681.2, cy: 273.62, w: 28.16, h: 28.4, color: "#ff7aa0" },                     // 4420:1081
  { cx: 661.2, cy: 312.62, w: 28.16, h: 28.41, color: "#ff7aa0" },                    // 4420:1086
  { cx: 563.36, cy: 523.36, w: 28.47, h: 28.71, color: "#ffbd7a" },                   // 4420:1091
  { cx: 250.96, cy: 613.38, w: 21.74, h: 21.93, color: "#ffbd7a" },                   // 4420:1096
  { cx: 318.42, cy: 655.84, w: 28.59, h: 28.84, color: "#ffbd7a" },                   // 4420:1101
  { cx: 143.65, cy: 655.77, w: 29.04, h: 29.29, color: "#68cea7" },                   // 4420:1106
  { cx: 871.73, cy: 368.73, w: 28.34, h: 28.65, color: "#ba8bff" },                   // 4420:1111 (−364.269→−4.269)
  { cx: 904.55, cy: 369.97, w: 20.92, h: 21.1, color: "#4660e7" },                    // 4420:1116
  { cx: 944.55, cy: 331.97, w: 20.92, h: 21.1, color: "#4660e7" },                    // 4420:1121
  { cx: 831.33, cy: 339.75, w: 46.26, h: 46.66, color: "#ba8bff" },                   // 4420:1126
  { cx: 476.82, cy: 90.24, w: 19.47, h: 19.63, color: "#ffbd7a" },                    // 4420:1131
  { cx: 140.82, cy: 68.24, w: 23.44, h: 23.64, color: "#68cea7" },                    // 4420:1136
  { cx: 225.35, cy: 47.76, w: 10.6, h: 10.69, color: "#ffbd7a" },                     // 4420:1141
  { cx: 726.35, cy: 326.77, w: 52.24, h: 52.69, color: "#ff7aa0" },                   // 4420:1146
  { cx: 726.35, cy: 326.77, w: 52.24, h: 52.69, color: "#ff7aa0" },                   // 4420:1151 (Figma duplicate of 1146)
  { cx: 514.68, cy: 587.09, w: 42.98, h: 43.35, color: "#ffbd7a" },                   // 4420:1156
  { cx: 940.11, cy: 370.52, w: 33.92, h: 34.21, color: "#4660e7" },                   // 4420:1161
  { cx: 607.97, cy: 257.38, w: 43.55, h: 43.93, color: "#ffbd7a" },                   // 4420:1166
  { cx: 497.48, cy: 177.48, w: 20.78, h: 20.96, color: "#ffbd7a" },                   // 4420:1171
  { cx: 608.48, cy: 463.9, w: 20.78, h: 20.96, color: "#ffbd7a" },                    // 4420:1176
  { cx: 612.65, cy: 533.07, w: 34.99, h: 35.3, color: "#ff7aa0" },                    // 4420:1181
  { cx: 561.43, cy: 171.85, w: 32.86, h: 32.86, color: "#ffbd7a", img: "/lp/lp-banner-bubble-extra.svg" }, // 4420:1186 (blob, ex bubble-extra)
];

export function LpBubbles() {
  return (
    <div aria-hidden="true" className="lp-anim-bubbles">
      {BUBBLES.map((b, i) =>
        b.img ? (
          <img
            key={i}
            alt=""
            src={b.img}
            className="lp-anim-bubble lp-anim-bubble--img"
            style={{
              height: b.h,
              left: b.cx - b.w / 2,
              top: b.cy - b.h / 2,
              width: b.w,
            }}
          />
        ) : (
          <div
            key={i}
            className="lp-anim-bubble"
            style={{
              background: b.color,
              height: b.h,
              left: b.cx - b.w / 2,
              top: b.cy - b.h / 2,
              width: b.w,
            }}
          />
        ),
      )}
    </div>
  );
}
