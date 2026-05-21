"use client";

import { useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { SiX } from "react-icons/si";

/**
 * Reward tiers with an X / LinkedIn toggle. Thresholds match Viktor's
 * (same on both platforms) so the toggle is honest: same tiers, different
 * icon — picking your platform doesn't change the math.
 */
type Platform = "x" | "linkedin";

const TIERS = [
  {
    reach: "1k – 5k",
    credits: "$300",
    surprise: "A founder calls you and tells you a joke. In their own words.",
  },
  {
    reach: "5k – 20k",
    credits: "$900",
    surprise: "We ship actual pancakes to your office.",
  },
  {
    reach: "20k – 100k",
    credits: "$1,500",
    surprise: "Dinner for two at a one-star Michelin restaurant.",
  },
  {
    reach: "100k+",
    credits: "$3,000",
    surprise: "A real Thermomix TM6 shipped to your door.",
  },
] as const;

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
            <th scope="col">Impressions on {platform === "x" ? "X" : "LinkedIn"}</th>
            <th scope="col">Pancake credits</th>
            <th scope="col">Surprise</th>
          </tr>
        </thead>
        <tbody>
          {TIERS.map((t) => (
            <tr key={t.reach}>
              <th scope="row">{t.reach}</th>
              <td>
                <span className="creators-tiers__credits">{t.credits}</span>
              </td>
              <td>{t.surprise}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="creators-tiers__note">
        Same thresholds on X and LinkedIn. Credits stack — the more you post,
        the more agents you can run, the more Pancake there is to post about.
      </p>
    </div>
  );
}
