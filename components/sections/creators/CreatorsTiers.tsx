"use client";

import { useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { SiX } from "react-icons/si";

/**
 * Reward tiers with an X / LinkedIn toggle. The metric and thresholds
 * differ per platform (X counts Views with higher numbers; LinkedIn
 * counts Impressions with lower numbers) — credits + surprises stay
 * the same, so the table swaps only the reach column when toggled.
 */
type Platform = "x" | "linkedin";

type Tier = {
  cash: string;
  credits: string;
  surprise: string;
  /** Reach range per platform — X uses Views, LinkedIn uses Impressions. */
  reach: Record<Platform, string>;
};

// Credits are intentionally 50% richer than cash — pick credits and you
// get more, pick cash and we eat the spread.
const TIERS: Tier[] = [
  {
    cash: "$200",
    credits: "$300",
    surprise: "A founder calls you and tells you a joke. In their own words.",
    reach: { x: "2,000 – 9,999", linkedin: "1,000 – 4,999" },
  },
  {
    cash: "$600",
    credits: "$900",
    surprise: "We ship actual pancakes to your office.",
    reach: { x: "10,000 – 34,999", linkedin: "5,000 – 19,999" },
  },
  {
    cash: "$1,000",
    credits: "$1,500",
    surprise: "Dinner for two at a one-star Michelin restaurant.",
    reach: { x: "35,000 – 174,999", linkedin: "20,000 – 99,999" },
  },
  {
    cash: "$2,000",
    credits: "$3,000",
    surprise: "A real Thermomix TM6 shipped to your door.",
    reach: { x: "175,000+", linkedin: "100,000+" },
  },
];

const METRIC_LABEL: Record<Platform, string> = {
  x: "Views on X",
  linkedin: "Impressions on LinkedIn",
};

export function CreatorsTiers() {
  const [platform, setPlatform] = useState<Platform>("x");

  return (
    <div className="creators-tiers" role="region" aria-label="Reward tiers">
      <div className="creators-toggle" role="tablist" aria-label="Platform">
        <button
          type="button"
          role="tab"
          aria-selected={platform === "x"}
          data-active={platform === "x" ? "" : undefined}
          className="creators-toggle__btn"
          onClick={() => setPlatform("x")}
        >
          <SiX size={14} aria-hidden />
          <span>X</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={platform === "linkedin"}
          data-active={platform === "linkedin" ? "" : undefined}
          className="creators-toggle__btn"
          onClick={() => setPlatform("linkedin")}
        >
          <FaLinkedin size={14} aria-hidden />
          <span>LinkedIn</span>
        </button>
      </div>

      <table className="creators-tiers__table">
        <thead>
          <tr>
            <th scope="col">{METRIC_LABEL[platform]}</th>
            <th scope="col">Take cash</th>
            <th scope="col" aria-hidden className="creators-tiers__or-col" />
            <th scope="col">Or credits</th>
            <th scope="col" aria-hidden className="creators-tiers__or-col" />
            <th scope="col">Or a surprise</th>
          </tr>
        </thead>
        <tbody>
          {TIERS.map((t) => (
            <tr key={t.credits}>
              <th scope="row">{t.reach[platform]}</th>
              <td>
                <span className="creators-tiers__cash">{t.cash}</span>
              </td>
              <td aria-hidden className="creators-tiers__or-col">
                <span className="creators-tiers__or">or</span>
              </td>
              <td>
                <span className="creators-tiers__credits">{t.credits}</span>
              </td>
              <td aria-hidden className="creators-tiers__or-col">
                <span className="creators-tiers__or">or</span>
              </td>
              <td>{t.surprise}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="creators-tiers__note">
        Pick one per post — cash, credits, or the surprise. Credits are 50%
        richer than cash because we&apos;d rather you spend it on Pancake. X
        counts views, LinkedIn counts impressions; the prizes are the same.
      </p>
    </div>
  );
}
