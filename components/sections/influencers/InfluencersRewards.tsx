import { LuBanknote, LuCheck, LuSparkles } from "react-icons/lu";

import { Badge } from "@/components/ui/Badge";
import { H3 } from "@/components/ui/Headings";

/**
 * "Credits or cash" explainer — two balanced cards on how each payout
 * works. Credits land automatically and 50% richer; cash is paid through
 * Passionfroot, which doubles as the relationship we keep with influencers
 * for future collaborations. Cash is US + Europe only for now.
 *
 * The dollar mapping lives in InfluencersTiers directly above, so this
 * section explains the trade-off rather than repeating the ladder.
 */
const PASSIONFROOT_SIGNUP_URL =
  "https://workspace.passionfroot.me/signup?partner=07d9dc3a-0f33-43df-90f8-713ec7d3a578&campaign=8390eb8f-2ad9-48f1-947d-63369ae779dc&pfPlus=true";

const CREDITS_CLAIM_URL = "mailto:support@getpancake.ai";

const CREDITS_POINTS = [
  "Every $1 in cash becomes $1.50 in credits",
  "Applied to your account automatically",
  "Go straight back to building on Pancake",
];

const CASH_POINTS = [
  "Free Passionfroot account, about a minute to set up",
  "Money clears within 5 business days",
  "Keeps us in touch for the next collab",
];

function PointList({ points }: { points: string[] }) {
  return (
    <ul className="influencers-payout__list">
      {points.map((point) => (
        <li key={point} className="influencers-payout__point">
          <LuCheck size={16} aria-hidden className="influencers-payout__check" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

export function InfluencersRewards() {
  return (
    <div className="influencers-payout" role="region" aria-label="Credits or cash">
      <div className="influencers-payout__card influencers-payout__card--credits">
        <span className="influencers-payout__icon" aria-hidden>
          <LuSparkles size={20} />
        </span>
        <div className="influencers-payout__head">
          <H3 className="heading influencers-payout__title">Pancake credits</H3>
          <Badge variant="brand-alt-1">50% richer</Badge>
        </div>
        <p className="influencers-payout__lead">
          Take your reward in credits and it lands worth half again as much:
          more agents running, more automations, more work out the door.
        </p>
        <PointList points={CREDITS_POINTS} />
        <div className="influencers-payout__foot-group">
          <a href={CREDITS_CLAIM_URL} className="influencers-payout__cta">
            Claim your credits &rarr;
          </a>
          <p className="influencers-payout__note">No invoice, no waiting.</p>
        </div>
      </div>

      <div className="influencers-payout__card influencers-payout__card--cash">
        <span className="influencers-payout__icon influencers-payout__icon--neutral" aria-hidden>
          <LuBanknote size={20} />
        </span>
        <div className="influencers-payout__head">
          <H3 className="heading influencers-payout__title">Cash</H3>
          <Badge variant="neutral">via Passionfroot</Badge>
        </div>
        <p className="influencers-payout__lead">
          Rather have it in the bank? We pay out through Passionfroot — quick to
          set up, with none of the invoicing on your side.
        </p>
        <PointList points={CASH_POINTS} />
        <div className="influencers-payout__foot-group">
          <a
            href={PASSIONFROOT_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="influencers-payout__cta"
          >
            Find us on Passionfroot &rarr;
          </a>
          <p className="influencers-payout__note">
            Cash payouts are in the US and Europe for now.
          </p>
        </div>
      </div>
    </div>
  );
}
