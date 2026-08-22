import { pricingV2 } from "@/lib/copy";

/**
 * The capability list of the pricing card, Okara-style: an intro line with a
 * check, then each agent/capability as a group heading with short sub-bullets.
 * Shared by the homepage card and /pricing. Server-rendered, zero JS.
 */
export function PriceGroups() {
  return (
    <div className="lv2-price-groups">
      <p className="lv2-price-groups-intro">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            d="M3 8.5 6.5 12 13 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {pricingV2.includedIntro}
      </p>
      <ul className="lv2-price-group-list">
        {pricingV2.groups.map((g) => (
          <li key={g.name} className="lv2-price-group">
            <p className="lv2-price-group-name">{g.name}</p>
            <ul className="lv2-price-group-items">
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
