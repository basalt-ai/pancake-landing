"use client";

import { useEffect, useState } from "react";

const PH_URL =
  "https://www.producthunt.com/products/pancake-6?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-pancake-6";
const PH_IMG =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1152111&theme=light&t=1779321887351";
const PH_ALT =
  "Pancake - OpenClaw in Slack that makes your company autonomous | Product Hunt";

// 00:01 PT on launch day. May is PDT (UTC-7), so 00:01 PT = 07:01 UTC.
const LAUNCH_AT_MS = Date.UTC(2026, 4, 28, 7, 1, 0);

type ProductHuntBadgeProps = {
  width?: number;
  height?: number;
};

export function ProductHuntBadge({
  width = 250,
  height = 54,
}: ProductHuntBadgeProps) {
  // Optimistic SSR default: pre-launch. Client useEffect re-checks against
  // the real clock and flips to live once the threshold passes, so the
  // badge un-greys itself with no redeploy.
  const [preLaunch, setPreLaunch] = useState(true);

  useEffect(() => {
    const sync = () => {
      const isPre = Date.now() < LAUNCH_AT_MS;
      setPreLaunch(isPre);
      return isPre;
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
      className="product-hunt-badge fixed bottom-4 right-4 z-50 inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-label={preLaunch ? "Pancake — launching soon on Product Hunt" : "Find Pancake on Product Hunt"}
    >
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
