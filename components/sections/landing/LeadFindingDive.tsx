import { Badge } from "@/components/ui/Badge";

import { FxPill, FxPillLink } from "./FxPill";

/**
 * Lead-finding deep dive — the Greptile move: show the mechanism, earn the
 * trust. Content is grounded in the real engine (lead-finding-proto): brain-
 * driven sources, LLM relevance scoring before any spend, the warmth-weighted
 * draw, enrichment, the ICP gate with its reason ledger, hard budget caps.
 * The run numbers in the strip are the 2026-07-28 live run, verbatim.
 *
 * Artifacts are hand-built mock UI in the same visual language as the
 * agents-loop video (same fictional cast: Anna Meyer, Marco Ruiz, Sofia
 * Bianchi) — one continuous pipeline, copy on the left rail, product on the
 * right. No card grid, no filler.
 */

type Step = {
  num: string;
  title: string;
  body: string;
  artifact: React.ReactNode;
};

/** Tiny presentational helpers — server-rendered, zero JS. */

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="lv2-dive-panel" aria-hidden="true">
      <div className="lv2-dive-panel-bar">
        <span className="lv2-dive-panel-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="lv2-dive-panel-label">{label}</span>
      </div>
      {children}
    </div>
  );
}

function Avatar({ initials, tone }: { initials: string; tone: "yellow" | "purple" | "mint" }) {
  return (
    <span className="lv2-dive-avatar" data-tone={tone}>
      {initials}
    </span>
  );
}

function RelevanceBar({ value }: { value: number }) {
  return (
    <span className="lv2-dive-bar">
      <i style={{ width: `${Math.round(value * 100)}%` }} />
    </span>
  );
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "It watches where your buyers actually talk",
    body: "Straight from your Brain: the phrases buyers type when they're ready to switch (“clay alternative”, not “sales tools”), your competitors' pages, the voices your market follows. Live conversations — not a database that went stale in March.",
    artifact: (
      <Panel label="Watching">
        <ul className="lv2-dive-rows">
          <li className="lv2-dive-row">
            <span className="lv2-dive-live" />
            <span className="lv2-dive-mono">&ldquo;clay alternative&rdquo;</span>
            <span className="lv2-dive-tag">watched phrase</span>
          </li>
          <li className="lv2-dive-row">
            <span className="lv2-dive-live" />
            <span className="lv2-dive-mono">Competitor company page</span>
            <span className="lv2-dive-tag">every post</span>
          </li>
          <li className="lv2-dive-row">
            <span className="lv2-dive-live" />
            <span className="lv2-dive-mono">Influencer your ICP follows</span>
            <span className="lv2-dive-tag">every post</span>
          </li>
        </ul>
      </Panel>
    ),
  },
  {
    num: "02",
    title: "It reads every post before spending a cent",
    body: "AI scores each thread on one question: is the author — or the audience — a buyer for you? Budget flows to the warmest conversations first, so a viral post can't eat your run just for being loud.",
    artifact: (
      <Panel label="Scoring">
        <ul className="lv2-dive-rows">
          <li className="lv2-dive-row">
            <span className="lv2-dive-mono lv2-dive-grow">Pricing rant under a competitor post</span>
            <RelevanceBar value={0.95} />
            <span className="lv2-dive-score">0.95</span>
          </li>
          <li className="lv2-dive-row">
            <span className="lv2-dive-mono lv2-dive-grow">&ldquo;How do you do outbound solo?&rdquo;</span>
            <RelevanceBar value={0.81} />
            <span className="lv2-dive-score">0.81</span>
          </li>
          <li className="lv2-dive-row is-dropped">
            <span className="lv2-dive-mono lv2-dive-grow">Generic growth-tips carousel</span>
            <span className="lv2-dive-tag">skipped — no spend</span>
          </li>
        </ul>
      </Panel>
    ),
  },
  {
    num: "03",
    title: "It turns engagement into people",
    body: "Every commenter and reactor on a warm thread, caught once, enriched with a full profile. Comments outrank likes — someone who took the time to write is closer to buying. And it remembers: the third time the same person engages, you'll know.",
    artifact: (
      <Panel label="People">
        <ul className="lv2-dive-rows">
          <li className="lv2-dive-row">
            <Avatar initials="AM" tone="purple" />
            <span className="lv2-dive-grow">
              <span className="lv2-dive-name">Anna Meyer</span>
              <span className="lv2-dive-sub">
                commented: &ldquo;we struggle with exactly this&rdquo;
              </span>
            </span>
            <span className="lv2-dive-tag is-warm">warm</span>
          </li>
          <li className="lv2-dive-row">
            <Avatar initials="MR" tone="yellow" />
            <span className="lv2-dive-grow">
              <span className="lv2-dive-name">Marco Ruiz</span>
              <span className="lv2-dive-sub">reacted to the same thread</span>
            </span>
            <span className="lv2-dive-tag">3rd time this quarter</span>
          </li>
        </ul>
      </Panel>
    ),
  },
  {
    num: "04",
    title: "It holds every profile against your ICP — with receipts",
    body: "Buying role, company size, geography, language. Competitors auto-disqualified. Every lead that reaches you carries a fit score and the reason it passed; everything rejected is logged with why. Nothing you paid for vanishes quietly.",
    artifact: (
      <Panel label="Judged against your ICP">
        <ul className="lv2-dive-rows">
          <li className="lv2-dive-row is-lead">
            <Avatar initials="AM" tone="purple" />
            <span className="lv2-dive-grow">
              <span className="lv2-dive-name">Anna Meyer · Head of Growth</span>
              <span className="lv2-dive-sub">buyer role · right size · engaged twice</span>
            </span>
            <span className="lv2-dive-fit">fit 0.87</span>
          </li>
          <li className="lv2-dive-row is-dropped">
            <Avatar initials="SB" tone="mint" />
            <span className="lv2-dive-grow">
              <span className="lv2-dive-name">Sofia Bianchi</span>
              <span className="lv2-dive-sub">outside your geography</span>
            </span>
            <span className="lv2-dive-tag">rejected — logged</span>
          </li>
        </ul>
      </Panel>
    ),
  },
];

const GUARANTEES = [
  "A hard spend cap on every run — it can't overspend, by construction",
  "Metered in cents, not seats",
  "Every lead arrives with the conversation that surfaced it — your first message opens warm",
] as const;

export function LeadFindingDive() {
  return (
    <section className="lv2s lv2-dive" id="lead-finding" aria-labelledby="lv2-dive-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <Badge variant="brand">Deep dive · Lead finding</Badge>
          <h2 id="lv2-dive-title" className="lv2-section-title">
            Your next customers are already raising their hands
          </h2>
          <p className="lv2-section-lede">
            Someone is commenting on your competitor&rsquo;s post right now. Someone else just
            reacted to a thread about the exact pain you solve. That&rsquo;s buying intent —
            public, timestamped, and gone in a week. Pancake reads it all day so you don&rsquo;t
            have to.
          </p>
        </header>

        <ol className="lv2-dive-steps">
          {STEPS.map((step) => (
            <li key={step.num} className="lv2-dive-step">
              <div className="lv2-dive-copy">
                <span className="lv2-dive-num" aria-hidden="true">
                  {step.num}
                </span>
                <h3 className="lv2-dive-title">{step.title}</h3>
                <p className="lv2-dive-body">{step.body}</p>
              </div>
              {step.artifact}
            </li>
          ))}
        </ol>

        {/* The 2026-07-28 live run, end to end — real numbers, no rounding. */}
        <p className="lv2-dive-run">
          <span className="lv2-dive-run-label">One live run</span>
          240 posts read <span aria-hidden="true">→</span> 25 people showed intent{" "}
          <span aria-hidden="true">→</span> 18 profiles held against the ICP{" "}
          <span aria-hidden="true">→</span> only the real fits came through.
        </p>

        <ul className="lv2-dive-proof">
          {GUARANTEES.map((g) => (
            <li key={g}>
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
              {g}
            </li>
          ))}
        </ul>

        <div className="lv2-button-group">
          <FxPillLink href="/ai-gtm-report">Get my AI GTM report</FxPillLink>
          <FxPill variant="outline" data-lv2-open="waitlist">
            Join waitlist
          </FxPill>
        </div>
      </div>
    </section>
  );
}
