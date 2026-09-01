/* canvas-only lottie-web build — same runtime surface as the main entry,
   typed by borrowing its declarations (used by LpBottleneck.tsx). */
declare module "lottie-web/build/player/lottie_canvas" {
  import lottie from "lottie-web";
  export default lottie;
}
