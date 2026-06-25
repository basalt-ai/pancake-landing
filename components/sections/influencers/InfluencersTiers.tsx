"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SiX } from "react-icons/si";

/**
 * Reward tiers with a platform toggle. The metric and thresholds differ
 * per platform (LinkedIn counts Impressions with lower numbers; everyone
 * else counts Views with higher numbers) — cash + tokens stay the same
 * across every platform, so the table swaps only the reach column when
 * toggled.
 */
type Platform = "linkedin" | "x" | "instagram" | "youtube" | "tiktok";

type Tier = {
  cash: string;
  tokens: string;
  /** Reach range per platform — LinkedIn uses Impressions, the rest use Views. */
  reach: Record<Platform, string>;
};

const PLATFORMS: { key: Platform; label: string; Icon: IconType }[] = [
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { key: "x", label: "X", Icon: SiX },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
];

// Tokens are intentionally 50% richer than cash — pick tokens and you
// get more, pick cash and we eat the spread. Payouts are identical across
// every platform; only the reach thresholds shift.
const TIERS: Tier[] = [
  {
    cash: "$100",
    tokens: "$150",
    reach: {
      linkedin: "1,000 – 4,999",
      x: "3,000 – 14,999",
      instagram: "3,000 – 14,999",
      youtube: "2,000 – 9,999",
      tiktok: "3,000 – 9,999",
    },
  },
  {
    cash: "$200",
    tokens: "$300",
    reach: {
      linkedin: "5,000 – 14,999",
      x: "15,000 – 29,999",
      instagram: "15,000 – 29,999",
      youtube: "10,000 – 29,999",
      tiktok: "10,000 – 29,999",
    },
  },
  {
    cash: "$500",
    tokens: "$750",
    reach: {
      linkedin: "15,000 – 29,999",
      x: "30,000 – 69,999",
      instagram: "30,000 – 199,999",
      youtube: "30,000 – 79,999",
      tiktok: "30,000 – 69,999",
    },
  },
  {
    cash: "$1,000",
    tokens: "$1,500",
    reach: {
      linkedin: "30,000 – 99,999",
      x: "70,000 – 299,999",
      instagram: "200,000 – 999,999",
      youtube: "80,000 – 299,999",
      tiktok: "70,000 – 299,999",
    },
  },
  {
    cash: "$1,500",
    tokens: "$2,250",
    reach: {
      linkedin: "100,000+",
      x: "300,000+",
      instagram: "1,000,000+",
      youtube: "300,000+",
      tiktok: "300,000+",
    },
  },
];

const METRIC_LABEL: Record<Platform, string> = {
  linkedin: "Impressions on LinkedIn",
  x: "Views on X",
  instagram: "Views on Instagram",
  youtube: "Views on YouTube",
  tiktok: "Views on TikTok",
};

export function InfluencersTiers() {
  const [platform, setPlatform] = useState<Platform>("x");

  return (
    <div className="influencers-tiers" role="region" aria-label="Reward tiers">
      <div className="influencers-toggle" role="tablist" aria-label="Platform">
        {PLATFORMS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={platform === key}
            aria-label={label}
            data-active={platform === key ? "" : undefined}
            className="influencers-toggle__btn"
            onClick={() => setPlatform(key)}
          >
            <Icon size={14} aria-hidden />
            <span className="influencers-toggle__label">{label}</span>
          </button>
        ))}
      </div>

      <table className="influencers-tiers__table">
        <thead>
          <tr>
            <th scope="col">{METRIC_LABEL[platform]}</th>
            <th scope="col">Take cash</th>
            <th scope="col" aria-hidden className="influencers-tiers__or-col" />
            <th scope="col">Or tokens</th>
          </tr>
        </thead>
        <tbody>
          {TIERS.map((t) => (
            <tr key={t.tokens}>
              <th scope="row">{t.reach[platform]}</th>
              <td>
                <span className="influencers-tiers__cash">{t.cash}</span>
              </td>
              <td aria-hidden className="influencers-tiers__or-col">
                <span className="influencers-tiers__or">or</span>
              </td>
              <td>
                <span className="influencers-tiers__tokens">{t.tokens}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="influencers-tiers__note">
        Pick one per post — cash or tokens. Tokens are 50% richer than cash
        because we&apos;d rather you spend it on Pancake. LinkedIn counts
        impressions; X, Instagram, YouTube, and TikTok count views — the payouts
        are the same.
      </p>
    </div>
  );
}
