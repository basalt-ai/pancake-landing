import type { IconType } from "react-icons";
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";
import { LuArrowUpRight } from "react-icons/lu";
import { SiX } from "react-icons/si";

/**
 * "Ready to get paid" platform picker. Each button opens the shared Tally
 * submission form, passing the chosen platform + source as hidden fields
 * (https://tally.so/r/Pdre5V?platform=<slug>&source=influencers). One form,
 * five entry points — the form branches on the payout choice (tokens ask for
 * the Pancake account email; cash points to Passionfroot).
 *
 * Slugs match the canonical Platform set in InfluencersTiers.tsx.
 */
const TALLY_FORM_URL = "https://tally.so/r/Pdre5V";

type Platform = "linkedin" | "x" | "instagram" | "youtube" | "tiktok";

const PLATFORMS: { key: Platform; label: string; Icon: IconType }[] = [
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { key: "x", label: "X", Icon: SiX },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
];

function submitHref(platform: Platform): string {
  return `${TALLY_FORM_URL}?platform=${platform}&source=influencers`;
}

export function InfluencersSubmit() {
  return (
    <div className="influencers-submit">
      <p className="influencers-submit__label">
        Pick the platform you posted on to open its submission form.
      </p>

      <div className="influencers-submit__grid">
        {PLATFORMS.map(({ key, label, Icon }) => (
          <a
            key={key}
            href={submitHref(key)}
            target="_blank"
            rel="noopener noreferrer"
            className="button influencers-submit__option"
            data-size="lg"
            data-variant="outline"
            aria-label={`Submit on ${label}`}
          >
            <Icon className="influencers-submit__option-icon" aria-hidden />
            <span className="influencers-submit__option-label">Submit on {label}</span>
            <LuArrowUpRight className="influencers-submit__option-arrow" aria-hidden />
          </a>
        ))}
      </div>

      <p className="influencers-submit__note">
        No follower minimum. No approvals. We review within 48 hours.
      </p>
    </div>
  );
}
