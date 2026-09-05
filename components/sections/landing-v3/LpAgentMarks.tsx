import { useId } from "react";
import { getImageProps } from "next/image";

// Monochrome brand marks, matching the founder's Monid reference.
export function CursorMark() {
  return <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Cursor" focusable="false">
    <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
  </svg>;
}

// Preserve the official portrait's detail, remove its source-image frame, and
// let the surrounding page show through the paper instead of blending a box.
const hermesPortrait = getImageProps({
  src: "/lp/agent-marks/hermes.png",
  alt: "",
  width: 256,
  height: 260,
  quality: 90,
}).props.src;

export function HermesMark() {
  const id = useId();
  const maskId = `${id}-hermes-mask`;
  const filterId = `${id}-hermes-ink`;

  return <svg viewBox="0 0 1772 1799" role="img" aria-label="Hermes" focusable="false">
    <defs>
      <filter id={filterId} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.2126 -0.7152 -0.0722 0 1" />
        <feComponentTransfer><feFuncA type="linear" slope="1.02" intercept="-0.02" /></feComponentTransfer>
      </filter>
      {/* Inset beyond the frame's resampled edge, which otherwise leaves a
          white hairline when the optimized portrait is reduced to icon size. */}
      <mask id={maskId} maskUnits="userSpaceOnUse" x="32" y="35" width="1708" height="1729" style={{ maskType: "alpha" }}>
        <image href={hermesPortrait} width="1772" height="1799" filter={`url(#${filterId})`} />
      </mask>
    </defs>
    <rect width="1772" height="1799" fill="currentColor" mask={`url(#${maskId})`} />
  </svg>;
}

export function OpenClawMark() {
  return <svg viewBox="0 -2.5 120 120" fill="currentColor" role="img" aria-label="OpenClaw" focusable="false">
    <path d="M60 10C30 10 15 35 15 55C15 75 30 95 45 100L45 110H55V100C55 100 60 102 65 100V110H75V100C90 95 105 75 105 55C105 35 90 10 60 10Z" />
    <path d="M20 45C5 40 0 50 5 60C10 70 20 65 25 55C28 48 25 45 20 45ZM100 45C115 40 120 50 115 60C110 70 100 65 95 55C92 48 95 45 100 45Z" />
    <path d="M45 15Q35 5 30 8M75 15Q85 5 90 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="45" cy="35" r="6" fill="var(--lp-ink-100)" />
    <circle cx="75" cy="35" r="6" fill="var(--lp-ink-100)" />
  </svg>;
}
