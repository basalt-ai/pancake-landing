/**
 * Hero orbit “satellite” pancake instances — Figma `428:14900` (`hero`).
 *
 * Positions are **center offsets from the `pancake monster` frame** (`428:14920`, 160×160 in Figma),
 * in the same px space as `--size-home-hero-monster-max-width` (160 at default scale).
 * `dx`/`dy` = satellite bounding-box center minus monster frame center (from `absoluteBoundingBox`).
 * `rotationFigmaPluginDeg` = Figma Plugin `INSTANCE.rotation` (degrees). CSS uses **−** this value on `.home-hero-orbit-satellite-rot` (same sign rule as dotted orbits). Outer `.home-hero-orbit-satellite` only translates — matches Figma MCP codegen (position frame, then rotate child).
 *
 * Orbit assignment follows Figma layer order + distance check: there is **no** satellite on orbit 5 in this file.
 * Raster assets: co-located PNGs under `orbit-satellite-raster/` — imported so Next emits `/_next/static/media/…` (avoids stale or missing `public/` URLs on previews).
 */
import homeHeroMonsterEllipseRaster from "./orbit-satellite-raster/home-hero-monster-ellipse.png";
import raster42814904 from "./orbit-satellite-raster/home-hero-orbit-satellite-428-14904.png";
import raster42814907 from "./orbit-satellite-raster/home-hero-orbit-satellite-428-14907.png";
import raster42814911 from "./orbit-satellite-raster/home-hero-orbit-satellite-428-14911.png";
import raster42814921 from "./orbit-satellite-raster/home-hero-orbit-satellite-428-14921.png";
import raster42816755 from "./orbit-satellite-raster/home-hero-orbit-satellite-428-16755.png";

export type HomeHeroOrbitSatelliteLayer = "behindMascot" | "frontOfMascot";

export type HomeHeroOrbitSatellite = {
  readonly figmaNode: "428:14904" | "428:14907" | "428:14911" | "428:14921" | "428:16755";
  /** Which dotted orbit this instance sits on (for `data-orbit` / QA only). */
  readonly orbit: 1 | 2 | 3 | 4 | 6;
  readonly dxFigma: number;
  readonly dyFigma: number;
  readonly rotationFigmaPluginDeg: number;
  readonly widthFigma: number;
  readonly heightFigma: number;
  readonly layer: HomeHeroOrbitSatelliteLayer;
  /** Render as the shared two-tone pancake SVG instead of the Figma raster —
   *  used when the Figma export itself is clipped (the instance sat on the
   *  frame edge in the comp, so the PNG bounding box slices the pancake). */
  readonly inlinePancake?: "pink" | "purple" | "yellow" | "orange";
};

/** Figma `428:14920` monster frame = 160px — same basis as `--size-home-hero-monster-max-width`. */
export const HOME_HERO_MONSTER_FIGMA_PX = 160;

/** Cream halo (`428:16771`) — same bundling as orbit satellites so it is not a separate late `public/` fetch. */
export const HOME_HERO_MONSTER_ELLIPSE_SRC = homeHeroMonsterEllipseRaster.src;

export const HOME_HERO_ORBIT_SATELLITES: readonly HomeHeroOrbitSatellite[] = [
  {
    figmaNode: "428:14904",
    orbit: 1,
    dxFigma: -156,
    dyFigma: -139,
    rotationFigmaPluginDeg: 0,
    widthFigma: 32,
    heightFigma: 32,
    layer: "behindMascot",
  },
  {
    figmaNode: "428:14907",
    orbit: 4,
    dxFigma: 415.2674874448248,
    dyFigma: -138.73253554179826,
    rotationFigmaPluginDeg: 111.2654685992506,
    widthFigma: 34,
    heightFigma: 34,
    layer: "behindMascot",
  },
  {
    // Figma exported this instance clipped (67×41 bbox — it overlapped the
    // hero frame edge in the comp, so the PNG slices the pancake's top-left).
    // In the coded hero it floats mid-air, so it renders as the full two-tone
    // pancake SVG instead; box restored to the silhouette's 49:48 aspect.
    figmaNode: "428:14911",
    orbit: 6,
    dxFigma: -615.5639871583408,
    dyFigma: 358.4359562268801,
    rotationFigmaPluginDeg: -32.467800351709045,
    widthFigma: 67,
    heightFigma: 66,
    layer: "behindMascot",
    inlinePancake: "purple",
  },
  {
    figmaNode: "428:14921",
    orbit: 3,
    dxFigma: -287.0000338554382,
    dyFigma: 199.99997282028202,
    rotationFigmaPluginDeg: -19.975237597657962,
    widthFigma: 41,
    heightFigma: 41,
    layer: "frontOfMascot",
  },
  {
    figmaNode: "428:16755",
    orbit: 2,
    dxFigma: 197.12269846466364,
    dyFigma: 176.8178436716553,
    rotationFigmaPluginDeg: -122.48285820384838,
    widthFigma: 88,
    heightFigma: 88,
    layer: "frontOfMascot",
  },
] as const;

const HOME_HERO_ORBIT_SATELLITE_SRC: Record<HomeHeroOrbitSatellite["figmaNode"], string> = {
  "428:14904": raster42814904.src,
  "428:14907": raster42814907.src,
  "428:14911": raster42814911.src,
  "428:14921": raster42814921.src,
  "428:16755": raster42816755.src,
};

export function homeHeroOrbitSatelliteSrc(figmaNode: HomeHeroOrbitSatellite["figmaNode"]): string {
  return HOME_HERO_ORBIT_SATELLITE_SRC[figmaNode];
}

/** Same convention as dotted orbits: CSS `rotate(−figmaPluginRotation)`. */
export function homeHeroOrbitSatelliteCssRotationDeg(rotationFigmaPluginDeg: number): number {
  return -rotationFigmaPluginDeg;
}
