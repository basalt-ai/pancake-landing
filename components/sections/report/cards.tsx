"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

import type { PromptRow, ReportState } from "./useReport";

/**
 * The report cards. Everything the visitor watched happen stays visible; the
 * locked layer is the written interpretation (who gets cited instead, the full
 * search list, the remaining opportunities) — skeleton rows with honest counts,
 * never a blur over content.
 */

const CHECK_LABELS: Record<string, string> = {
  crawlers: "AI crawler access",
  llms: "llms.txt",
  schema: "Structured data",
  meta_quality: "Titles & descriptions",
};

/** Crisp stroke marks for the pass/fail circles — optically centered, unlike
 *  text glyphs whose baselines drift inside a 24px circle. */
function MarkIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path
        d="M2.2 6.6 4.8 9.2 9.8 2.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path
        d="M3.2 3.2l5.6 5.6M8.8 3.2 3.2 8.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Tiny padlock for locked-detail captions. */
function LockIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <rect x="2" y="5.2" width="8" height="5.6" rx="1.6" fill="currentColor" />
      <path
        d="M3.8 5.2V3.9a2.2 2.2 0 0 1 4.4 0v1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChecklistCard({ state }: { state: ReportState }) {
  if (state.checks.length === 0) return null;
  return (
    <Card className="rpt-card">
      <header className="rpt-card-head">
        <h2>Can the machines read you?</h2>
      </header>
      <ul className="rpt-checklist">
        {state.checks.map((check) => (
          <li key={check.id} data-pass={check.pass}>
            <span className="rpt-flip" aria-hidden>
              <MarkIcon ok={check.pass} />
            </span>
            <div>
              <strong>{CHECK_LABELS[check.id] ?? check.id}</strong>
              <p>{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PromptLine({ row, unlocked }: { row: PromptRow; unlocked: boolean }) {
  return (
    <li data-state={row.status} data-cited={row.cited}>
      <span className="rpt-flip rpt-prompt-mark" aria-hidden>
        {row.status !== "checking" && row.cited !== undefined && (
          <MarkIcon ok={row.cited === true} />
        )}
      </span>
      <div>
        <p className="rpt-prompt-text">{row.prompt}</p>
        {row.status === "done" &&
          (unlocked ? (
            <p className="rpt-prompt-detail">
              {row.detail}
              {row.estimated ? " (estimated)" : ""}
            </p>
          ) : row.cited === false ? (
            // Static on purpose: an animated shimmer here reads as "still
            // loading", not "locked".
            <span className="rpt-locked-inline">
              <LockIcon />
              what ChatGPT answered instead — unlock below
            </span>
          ) : null)}
      </div>
    </li>
  );
}

export function PromptsCard({ state }: { state: ReportState }) {
  if (!state.brain) return null;
  const done = state.prompts.filter((p) => p.status === "done");
  const cited = done.filter((p) => p.cited).length;
  return (
    <Card className="rpt-card">
      <header className="rpt-card-head">
        <h2>ChatGPT · buyer questions</h2>
        {done.length > 0 && (
          <Badge variant={cited >= done.length / 2 ? "success" : "warning"}>
            {cited}/{state.prompts.length}
          </Badge>
        )}
      </header>
      <p className="rpt-icp-line">
        <span className="rpt-icp-label">Your ICP, as we read it:</span> {state.brain.icp}
      </p>
      <ul className="rpt-prompts">
        {state.prompts.map((row, i) => (
          <PromptLine key={i} row={row} unlocked={state.unlocked} />
        ))}
      </ul>
      {done.length > 0 && (
        <p className="rpt-tally">
          Cited in {cited} of {state.prompts.length} buyer questions.
        </p>
      )}
    </Card>
  );
}

export function GoogleCard({ state }: { state: ReportState }) {
  const google = state.google;
  if (!google) return null;
  return (
    <Card className="rpt-card">
      <header className="rpt-card-head">
        <h2>Google · money searches</h2>
        <Badge variant="brand-alt-2">{google.toWin} to win</Badge>
      </header>
      {google.commentary && <p className="rpt-icp-line">{google.commentary}</p>}
      <ul className="rpt-google">
        {google.rows.map((row) => (
          <li key={row.term}>
            <strong>{row.term}</strong>
            <span>{row.detail}</span>
          </li>
        ))}
      </ul>
      {google.estimated && <p className="rpt-estimated">estimated from your site content</p>}
    </Card>
  );
}

export function OpportunitiesCard({ state }: { state: ReportState }) {
  const opps = state.opportunities;
  if (!opps) return null;
  return (
    <Card className="rpt-card">
      <header className="rpt-card-head">
        <h2>Opportunities</h2>
        <Badge variant="brand-alt-1">+{opps.count}</Badge>
      </header>
      {/* One list, one visual plane: every opportunity is the same row. The
          first shows its playbook; the rest carry a lock where the playbook
          will appear. */}
      <ul className={state.unlocked ? "rpt-opps rpt-unlock-cascade" : "rpt-opps"}>
        {opps.items.map((item, i) => {
          const open = state.unlocked || i === 0;
          return (
            <li key={item.title}>
              <div className="rpt-opp-row">
                <strong>{item.title}</strong>
                {!open && <LockIcon />}
              </div>
              {open ? (
                <p>{item.detail}</p>
              ) : (
                <p className="rpt-opp-locked-line">playbook locked — unlock below</p>
              )}
            </li>
          );
        })}
      </ul>
      {state.score !== null && state.potentialScore !== null && (
        <div className="rpt-potential">
          <div className="rpt-potential-bar" aria-hidden>
            <span
              className="rpt-potential-fill-after"
              style={{ width: `${state.potentialScore}%` }}
            />
            <span className="rpt-potential-fill-now" style={{ width: `${state.score}%` }} />
          </div>
          <p>
            Today <strong>{state.score}/100</strong> · with these applied, our estimate puts{" "}
            {state.domain} at <strong>{state.potentialScore}/100</strong>
          </p>
        </div>
      )}
    </Card>
  );
}
