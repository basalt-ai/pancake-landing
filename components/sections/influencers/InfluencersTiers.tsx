"use client";

import { useState } from "react";
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SiX } from "react-icons/si";
import type { IconType } from "react-icons";

/**
 * Reward tiers with a platform toggle (X / LinkedIn / Instagram / TikTok /
 * YouTube). The metric and thresholds differ per platform — X, Instagram,
 * TikTok and YouTube count Views (with higher numbers), LinkedIn counts
 * Impressions (lower numbers) — but cash + credits stay the same, so the
 * table swaps only the reach column when toggled.
 */
type Platform = "x" | "linkedin" | "instagram" | "tiktok" | "youtube";

type Tier = {
  cash: string;
  credits: string;
  /** Reach range per platform — most count Views, LinkedIn counts Impressions. */
  reach: Record<Platform, string>;
};

// Credits are intentionally 50% richer than cash — pick credits and you
// get more, pick cash and we eat the spread.
const TIERS: Tier[] = [
  {
    cash: "$100",
    credits: "$150",
    reach: {
      x: "2,000 – 9,999",
      linkedin: "1,000 – 4,999",
      instagram: "2,500 – 14,999",
      tiktok: "3,000 – 24,999",
      youtube: "2,000 – 9,999",
    },
  },
  {
    cash: "$200",
    credits: "$300",
    reach: {
      x: "10,000 – 34,999",
      linkedin: "5,000 – 19,999",
      instagram: "15,000 – 49,999",
      tiktok: "25,000 – 99,999",
      youtube: "10,000 – 39,999",
    },
  },
  {
    cash: "$300",
    credits: "$450",
    reach: {
      x: "35,000 – 174,999",
      linkedin: "20,000 – 99,999",
      instagram: "50,000 – 249,999",
      tiktok: "100,000 – 499,999",
      youtube: "40,000 – 199,999",
    },
  },
  {
    cash: "$700",
    credits: "$1,050",
    reach: {
      x: "175,000+",
      linkedin: "100,000+",
      instagram: "250,000+",
      tiktok: "500,000+",
      youtube: "200,000+",
    },
  },
];

const PLATFORMS: { id: Platform; label: string; Icon: IconType }[] = [
  { id: "x", label: "X", Icon: SiX },
  { id: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { id: "instagram", label: "Instagram", Icon: FaInstagram },
  { id: "tiktok", label: "TikTok", Icon: FaTiktok },
  { id: "youtube", label: "YouTube", Icon: FaYoutube },
];

const METRIC_LABEL: Record<Platform, string> = {
  x: "Views on X",
  linkedin: "Impressions on LinkedIn",
  instagram: "Views on Instagram",
  tiktok: "Views on TikTok",
  youtube: "Views on YouTube",
};

export function InfluencersTiers() {
  const [platform, setPlatform] = useState<Platform>("x");

  return (
    <div className="influencers-tiers" role="region" aria-label="Reward tiers">
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

      <table className="influencers-tiers__table">
        <thead>
          <tr>
            <th scope="col">{METRIC_LABEL[platform]}</th>
            <th scope="col">Take cash</th>
            <th scope="col" aria-hidden className="influencers-tiers__or-col" />
            <th scope="col">Or credits</th>
          </tr>
        </thead>
        <tbody>
          {TIERS.map((t) => (
            <tr key={t.credits}>
              <th scope="row">{t.reach[platform]}</th>
              <td>
                <span className="influencers-tiers__cash">{t.cash}</span>
              </td>
              <td aria-hidden className="influencers-tiers__or-col">
                <span className="influencers-tiers__or">or</span>
              </td>
              <td>
                <span className="influencers-tiers__credits">{t.credits}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="influencers-tiers__note">
        Pick one per post — cash or credits. Credits are 50% richer than cash
        because we&apos;d rather you spend it on Pancake. LinkedIn counts
        impressions, everywhere else counts views; the payouts are the same.
      </p>
    </div>
  );
}
