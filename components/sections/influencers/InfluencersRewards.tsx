import { Badge } from "@/components/ui/Badge";
import { H3 } from "@/components/ui/Headings";

/**
 * "Credits or cash" explainer — two cards laying out how each payout type
 * works. Credits land automatically and 50% richer; cash is paid through
 * Passionfroot, which doubles as the relationship we keep with influencers
 * for future collaborations. Cash is US + Europe only for now.
 *
 * The ladder mirrors InfluencersTiers — payouts are identical across every
 * platform, so it lives here as a flat cash → credits mapping.
 */
const PASSIONFROOT_SIGNUP_URL =
  "https://workspace.passionfroot.me/signup/brand-experience";

const LADDER: { cash: string; credits: string }[] = [
  { cash: "$200 cash", credits: "$300 in credits" },
  { cash: "$600 cash", credits: "$900 in credits" },
  { cash: "$1,500 cash", credits: "$2,250 in credits" },
  { cash: "$5,000 cash", credits: "$7,500 in credits" },
  { cash: "$10,000 cash", credits: "$15,000 in credits" },
];

export function InfluencersRewards() {
  return (
    <div className="influencers-rewards" role="region" aria-label="Credits or cash">
      <div className="influencers-reward-card influencers-reward-card--credits">
        <div className="influencers-reward-card__head">
          <H3 className="heading influencers-reward-card__title">Pancake credits</H3>
          <Badge variant="brand-alt-1">50% more with credits</Badge>
        </div>
        <p className="influencers-reward-card__body">
          We add 1.5&times; the cash equivalent straight to your Pancake account.
          More tasks, more automations, more AI employee time. Automatic. No
          strings.
        </p>
        <ul className="influencers-reward-ladder">
          {LADDER.map((row) => (
            <li key={row.cash} className="influencers-reward-ladder__row">
              <span className="influencers-reward-ladder__cash">{row.cash}</span>
              <span aria-hidden className="influencers-reward-ladder__arrow">
                &rarr;
              </span>
              <span className="influencers-reward-ladder__credits">
                {row.credits}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="influencers-reward-card influencers-reward-card--cash">
        <div className="influencers-reward-card__head">
          <H3 className="heading influencers-reward-card__title">Cash</H3>
          <Badge variant="neutral">Paid through Passionfroot</Badge>
        </div>
        <p className="influencers-reward-card__body">
          Create a free Passionfroot account — it takes about a minute — add your
          payout details, and get paid within 5 business days. No invoicing.
        </p>
        <p className="influencers-reward-card__body">
          It also keeps the door open for future collaborations: we keep a tight
          circle with Pancake influencers, and Passionfroot is how we stay in
          touch.
        </p>
        <a
          href={PASSIONFROOT_SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="influencers-reward-card__cta"
        >
          Create your Passionfroot account &rarr;
        </a>
        <p className="influencers-reward-card__note">
          Cash payouts are available in the US and Europe for now.
        </p>
      </div>
    </div>
  );
}
