"use client";

import { useEffect, useState } from "react";

const PH_URL =
  "https://www.producthunt.com/products/pancake-6?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-pancake-6";
const PH_IMG =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1152111&theme=light&t=1779321887351";
const PH_ALT =
  "Pancake - OpenClaw in Slack that makes your company autonomous | Product Hunt";

// PDT (UTC-7) on launch day → 00:01 PT = 07:01 UTC.
const LAUNCH_AT_MS = Date.UTC(2026, 4, 28, 7, 1, 0);

type ProductHuntBadgeProps = {
  className?: string;
  width?: number;
  height?: number;
};

export function ProductHuntBadge({
  className,
  width = 250,
  height = 54,
}: ProductHuntBadgeProps) {
  // Optimistic default: SSR renders the pre-launch pill. Client useEffect
  // re-checks against the real clock and hides the pill once the threshold
  // passes, so the UI flips on its own with no redeploy.
  const [preLaunch, setPreLaunch] = useState(true);

  useEffect(() => {
    const sync = () => {
      const now = Date.now();
      setPreLaunch(now < LAUNCH_AT_MS);
      return now < LAUNCH_AT_MS;
    };
    if (!sync()) return;
    const id = setInterval(() => {
      if (!sync()) clearInterval(id);
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <a
      href={PH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`product-hunt-badge relative inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${preLaunch ? "is-pre-launch" : ""} ${className ?? ""}`}
      aria-label={preLaunch ? "Pancake — launching soon on Product Hunt" : "Find Pancake on Product Hunt"}
    >
      {preLaunch && (
        <span
          aria-hidden
          className="product-hunt-badge__soon"
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%) rotate(-4deg)",
            transformOrigin: "center",
            padding: "2px 10px 3px",
            borderRadius: 9999,
            background: "#fde68a",
            color: "#1f1147",
            border: "1.5px solid #1f1147",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "lowercase",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 0 #1f1147",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          soon
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- external badge served by Product Hunt CDN */}
      <img
        alt={PH_ALT}
        width={width}
        height={height}
        src={PH_IMG}
        className="product-hunt-badge__img"
        style={{
          width,
          height,
          filter: preLaunch ? "grayscale(1) contrast(0.85)" : "none",
          opacity: preLaunch ? 0.5 : 1,
          transition: "filter 220ms ease, opacity 220ms ease",
        }}
        decoding="async"
        loading="lazy"
      />
    </a>
  );
}
