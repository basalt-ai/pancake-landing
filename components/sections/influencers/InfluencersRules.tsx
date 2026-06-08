"use client";

import { useState } from "react";
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SiX } from "react-icons/si";
import type { IconType } from "react-icons";

/**
 * Rules block with a platform toggle (X / LinkedIn / Instagram / TikTok /
 * YouTube). Most rules are shared; the cadence ones differ, matching the
 * relative half-life of each feed (fast feeds tolerate more frequent posts).
 */
type Platform = "x" | "linkedin" | "instagram" | "tiktok" | "youtube";

const CADENCE: Record<Platform, { perMonth: string; between: string }> = {
  x: { perMonth: "12 posts per month", between: "2 days between posts" },
  linkedin: { perMonth: "4 posts per month", between: "5 days between posts" },
  instagram: { perMonth: "6 posts per month", between: "4 days between posts" },
  tiktok: { perMonth: "8 posts per month", between: "3 days between posts" },
  youtube: { perMonth: "4 posts per month", between: "5 days between posts" },
};

const PLATFORMS: { id: Platform; label: string; Icon: IconType }[] = [
  { id: "x", label: "X", Icon: SiX },
  { id: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { id: "instagram", label: "Instagram", Icon: FaInstagram },
  { id: "tiktok", label: "TikTok", Icon: FaTiktok },
  { id: "youtube", label: "YouTube", Icon: FaYoutube },
];

const REQUIREMENTS = [
  "Tag @getpancake_ai in the post",
  "Include a screenshot or screen recording of Pancake's actual output",
  "Organic reach only — no boosts, no promoted posts",
  "Real Pancake output from your real workspace",
];

const CONTENT = [
  "Blur anything sensitive — customer names, money, private messages",
  "Your own content from your own Pancake",
  "No staged, mocked, or fabricated output",
  "No pre-approval needed — post first, submit later",
];

export function InfluencersRules() {
  const [platform, setPlatform] = useState<Platform>("x");
  const cadence = CADENCE[platform];

  const limits = [
    cadence.perMonth,
    cadence.between,
    "$1,050 credits / $700 cash cap per post",
    "Pancake should be the subject, not part of a tool roundup",
  ];

  return (
    <div className="influencers-rules-block" role="region" aria-label="House rules">
      <div className="influencers-toggle" role="tablist" aria-label="Platform">
        {PLATFORMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={platform === id}
            data-active={platform === id ? "" : undefined}
            className="influencers-toggle__btn"
            onClick={() => setPlatform(id)}
          >
            <Icon size={14} aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="influencers-rules-grid">
        <RuleColumn title="Requirements" tone="brand-alt-1" items={REQUIREMENTS} />
        <RuleColumn title="Limits" tone="brand" items={limits} highlightFirstTwo />
        <RuleColumn title="Content" tone="brand-alt-2" items={CONTENT} />
      </div>
    </div>
  );
}

function RuleColumn({
  title,
  tone,
  items,
  highlightFirstTwo,
}: {
  title: string;
  tone: "brand" | "brand-alt-1" | "brand-alt-2";
  items: string[];
  highlightFirstTwo?: boolean;
}) {
  return (
    <div className="influencers-rules-col">
      <span className="influencers-rules-col__chip" data-tone={tone}>
        {title}
      </span>
      <ul className="influencers-rules-col__list">
        {items.map((item, i) => {
          const highlighted = highlightFirstTwo && i < 2;
          return (
            <li
              key={item}
              className="influencers-rules-col__item"
              data-highlight={highlighted ? "" : undefined}
            >
              <span aria-hidden className="influencers-rules-col__dot" />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
