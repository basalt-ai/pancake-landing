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

function Locked({ lines, note }: { lines: number; note: string }) {
  return (
    <div className="rpt-locked" aria-label={`Locked: ${note}`}>
      {Array.from({ length: lines }, (_, i) => (
        <span className="rpt-skeleton" key={i} style={{ width: `${88 - i * 14}%` }} />
      ))}
      <span className="rpt-locked-note">{note}</span>
    </div>
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
              {check.pass ? "✓" : "✗"}
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
        {row.status === "checking" ? "" : row.cited ? "✓" : "✗"}
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
            <span className="rpt-skeleton rpt-skeleton-inline" aria-label="Locked detail" />
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
        <h2>ChatGPT · ICP prompts</h2>
        {done.length > 0 && (
          <Badge variant={cited >= done.length / 2 ? "success" : "warning"}>
            {cited}/{state.prompts.length}
          </Badge>
        )}
      </header>
      <p className="rpt-icp-line">Your ICP, as I read it: {state.brain.icp}</p>
      <ul className="rpt-prompts">
        {state.prompts.map((row, i) => (
          <PromptLine key={i} row={row} unlocked={state.unlocked} />
        ))}
      </ul>
      {done.length > 0 && (
        <p className="rpt-tally">
          cited in {cited} of {state.prompts.length} buyer questions
        </p>
      )}
    </Card>
  );
}

const FREE_GOOGLE_ROWS = 3;

export function GoogleCard({ state }: { state: ReportState }) {
  const google = state.google;
  if (!google) return null;
  const free = google.rows.slice(0, FREE_GOOGLE_ROWS);
  const lockedCount = Math.max(0, google.rows.length - FREE_GOOGLE_ROWS);
  return (
    <Card className="rpt-card">
      <header className="rpt-card-head">
        <h2>Google · money searches</h2>
        <Badge variant="brand-alt-2">{google.toWin} to win</Badge>
      </header>
      {google.commentary && <p className="rpt-icp-line">{google.commentary}</p>}
      <ul className="rpt-google">
        {free.map((row) => (
          <li key={row.term}>
            <strong>{row.term}</strong>
            <span>{google.estimated ? row.detail : row.detail}</span>
          </li>
        ))}
      </ul>
      {lockedCount > 0 &&
        (state.unlocked ? (
          <ul className="rpt-google rpt-unlock-cascade">
            {google.rows.slice(FREE_GOOGLE_ROWS).map((row) => (
              <li key={row.term}>
                <strong>{row.term}</strong>
                <span>{row.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Locked lines={Math.min(lockedCount, 3)} note={`${lockedCount} more searches, with positions`} />
        ))}
      {google.estimated && <p className="rpt-estimated">estimated from your site content</p>}
    </Card>
  );
}

export function OpportunitiesCard({ state }: { state: ReportState }) {
  const opps = state.opportunities;
  if (!opps) return null;
  const [first, ...rest] = opps.items;
  return (
    <Card className="rpt-card">
      <header className="rpt-card-head">
        <h2>Opportunities</h2>
        <Badge variant="brand-alt-1">+{opps.count}</Badge>
      </header>
      {first && (
        <div className="rpt-opp">
          <strong>{first.title}</strong>
          <p>{first.detail}</p>
        </div>
      )}
      {rest.length > 0 &&
        (state.unlocked ? (
          <div className="rpt-unlock-cascade">
            {rest.map((item) => (
              <div className="rpt-opp" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <Locked lines={rest.length} note={`${rest.length} more, ICP-checked`} />
        ))}
    </Card>
  );
}
