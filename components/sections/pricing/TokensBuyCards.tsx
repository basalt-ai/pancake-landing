/**
 * "What your tokens buy" — asymmetric cards (2 top, 1 wide bottom) with
 * a simplified Slack-style exchange in each. The chat block reuses the same
 * typography/avatar grammar as `components/shared/SlackUI.tsx` so the visual
 * language stays consistent across the site, but stripped down: no sidebar,
 * no composer, no thread replies — just two stacked messages (user → pancake).
 */
import type { pricing as pricingCopy } from "@/lib/copy";

type Pricing = typeof pricingCopy;
type Card = Pricing["buys"]["cards"][number];

export function TokensBuyCards({ pricing }: { pricing: Pricing }) {
  return (
    <section className="pricing-buys" aria-labelledby="pricing-buys-title">
      <div className="pricing-buys__inner">
        <h2 id="pricing-buys-title" className="heading pricing-buys__title">
          {pricing.buys.title}
        </h2>
        <div className="pricing-buys__grid">
          {pricing.buys.cards.map((card) => (
            <BuyCard key={card.kicker} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BuyCard({ card }: { card: Card }) {
  return (
    <article
      className="pricing-buys__card"
      data-wide={card.wide ? "true" : undefined}
    >
      <header className="pricing-buys__card-header">
        <div className="pricing-buys__card-kicker-row">
          <p className="pricing-buys__card-kicker">{card.kicker}</p>
          <SignalBars intensity={card.intensity as 1 | 2 | 3} />
        </div>
        <p className="pricing-buys__card-tag">{card.tag}</p>
      </header>
      <div className="pricing-buys__chat">
        <UserMessage user={card.user} />
        <AgentMessage agent={card.agent} />
      </div>
    </article>
  );
}

/**
 * Wi-Fi-style 3-bar signal indicator — communicates the size of the work
 * without exposing token counts. Bars 1..intensity light up; the rest stay
 * dim. Replaces the old "50K – 100K tokens" technical headline.
 */
function SignalBars({ intensity }: { intensity: 1 | 2 | 3 }) {
  return (
    <span
      className="pricing-buys__signal"
      role="img"
      aria-label={`Signal ${intensity} of 3`}
    >
      {[1, 2, 3].map((b) => (
        <span
          key={b}
          className="pricing-buys__signal-bar"
          data-on={b <= intensity ? "true" : undefined}
        />
      ))}
    </span>
  );
}

function UserMessage({ user }: { user: Card["user"] }) {
  return (
    <div className="flex items-start gap-3">
      <UserInitialAvatar
        initial={user.initial}
        accent={user.accent}
        accentInk={user.accentInk}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">{user.name}</span>
          <span className="text-[12px] font-normal text-[#616061]">{user.time}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-[15px] font-normal leading-[1.46668] text-[#1d1c1d]">
          {user.text}
        </p>
      </div>
    </div>
  );
}

function AgentMessage({ agent }: { agent: Card["agent"] }) {
  const artifact = "artifact" in agent ? agent.artifact : undefined;
  return (
    <div className="flex items-start gap-3">
      <PancakeAgentAvatar />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">Pancake</span>
          <span className="rounded-[3px] bg-[#e8e8e8] px-1 py-px text-[10px] font-bold uppercase tracking-wide text-[#616061]">
            APP
          </span>
          <span className="text-[12px] font-normal text-[#616061]">{agent.time}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-[15px] font-normal leading-[1.46668] text-[#1d1c1d]">
          {agent.text}
        </p>
        {artifact === "outbound-tracker" ? <OutboundTrackerArtifact /> : null}
      </div>
    </div>
  );
}

/**
 * Ops-tool widget attached to the Full Projects agent reply. Mimics the
 * dashboard surface a Clay/Apollo/Outreach user would recognize: campaign
 * header, hard counters, progress to goal, channel meta, recent replies
 * with status pills. Numbers match the chat copy so the artifact reads as
 * real work shipped, not decoration.
 */
function OutboundTrackerArtifact() {
  return (
    <figure
      className="pricing-buys__tracker"
      aria-label="EU mid-market e-commerce outbound campaign"
    >
      <header className="pricing-buys__tracker-header">
        <p className="pricing-buys__tracker-title">EU mid-market e-comm</p>
        <p className="pricing-buys__tracker-meta">
          Day 3 of 5 · <span className="pricing-buys__tracker-running">Running</span>
        </p>
      </header>

      <dl className="pricing-buys__tracker-stats">
        <TrackerStat label="Prospects sourced" value="184" />
        <TrackerStat label="Emails sent" value="142" />
        <TrackerStat label="Replies" value="38" />
      </dl>

      <div className="pricing-buys__tracker-goal">
        <div className="pricing-buys__tracker-goal-row">
          <span className="pricing-buys__tracker-goal-label">Demos booked</span>
          <span className="pricing-buys__tracker-goal-value">19 / 30</span>
        </div>
        <div className="pricing-buys__tracker-goal-bar" aria-hidden>
          <span
            className="pricing-buys__tracker-goal-fill"
            style={{ width: `${(19 / 30) * 100}%` }}
          />
        </div>
      </div>

      <dl className="pricing-buys__tracker-channels">
        <div className="pricing-buys__tracker-channel">
          <dt>Top channel</dt>
          <dd>Cold email</dd>
        </div>
        <div className="pricing-buys__tracker-channel">
          <dt>Next</dt>
          <dd>LinkedIn</dd>
        </div>
      </dl>

      <ul className="pricing-buys__tracker-replies">
        <TrackerReply company="Acme" status="hot" tone="hot" />
        <TrackerReply company="Northstar" status="meeting booked" tone="booked" />
        <TrackerReply company="Brio" status="nurture" tone="nurture" />
      </ul>
    </figure>
  );
}

function TrackerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="pricing-buys__tracker-stat">
      <dt className="pricing-buys__tracker-stat-label">{label}</dt>
      <dd className="pricing-buys__tracker-stat-value">{value}</dd>
    </div>
  );
}

function TrackerReply({
  company,
  status,
  tone,
}: {
  company: string;
  status: string;
  tone: "hot" | "booked" | "nurture";
}) {
  return (
    <li className="pricing-buys__tracker-reply">
      <span className="pricing-buys__tracker-reply-company">{company}</span>
      <span
        className="pricing-buys__tracker-reply-pill"
        data-tone={tone}
      >
        {status}
      </span>
    </li>
  );
}

function UserInitialAvatar({
  initial,
  accent,
  accentInk,
}: {
  initial: string;
  accent: string;
  accentInk: string;
}) {
  return (
    <div
      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] shadow-[inset_0_-1px_0_rgba(0,0,0,0.10),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
      aria-hidden
      style={{ backgroundColor: accent }}
    >
      <span
        className="text-[15px] font-bold leading-none"
        style={{ color: accentInk }}
      >
        {initial}
      </span>
    </div>
  );
}

function PancakeAgentAvatar() {
  // Same disc + cream backing as SlackUI's CeoAgentAvatar so the agent reads
  // identically across the site. Square-radius 6px to match Slack app icons.
  return (
    <div
      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[#FFF1DA] shadow-[inset_0_-1px_0_rgba(0,0,0,0.10),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- pancake mascot raster */}
      <img
        src="/pancake-monster.png"
        alt=""
        width={32}
        height={32}
        className="block h-8 w-8 object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
