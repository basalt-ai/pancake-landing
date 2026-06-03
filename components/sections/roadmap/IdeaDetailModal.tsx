"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useModalA11y } from "@/components/sections/roadmap/useModalA11y";
import {
  STATUS_META,
  TAG_LABELS,
  type RoadmapIdea,
} from "@/components/sections/roadmap/roadmap-data";

type Props = {
  /** The idea to show, or null to close. Read live so votes/deletes reflect. */
  idea: RoadmapIdea | null;
  voted: boolean;
  canDelete: boolean;
  onVote: () => void;
  onDelete: () => void;
  onClose: () => void;
};

function UpCaret() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 4L13 11H3L8 4Z" fill="currentColor" />
    </svg>
  );
}

/** Full-detail view of an idea (full description + actions). */
export function IdeaDetailModal({ idea, voted, canDelete, onVote, onDelete, onClose }: Props) {
  const panelRef = useModalA11y(Boolean(idea), onClose);

  if (!idea) return null;
  const status = STATUS_META[idea.status];

  return (
    <div
      className="roadmap-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-detail-title"
      aria-describedby="roadmap-detail-desc"
    >
      <div className="roadmap-modal__backdrop" aria-hidden onClick={onClose} />
      <div className="roadmap-modal__panel" ref={panelRef} tabIndex={-1}>
        <div className="roadmap-modal__head">
          <h2 id="roadmap-detail-title" className="heading roadmap-modal__title">
            {idea.title}
          </h2>
          <button
            type="button"
            className="roadmap-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="roadmap-detail__meta">
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className="roadmap-card__tag">{TAG_LABELS[idea.tag]}</span>
          <span aria-hidden className="roadmap-card__dot">·</span>
          <span>{idea.authorName ?? "Anonymous"}</span>
        </div>

        <p id="roadmap-detail-desc" className="roadmap-detail__desc">
          {idea.description ? idea.description : "No description provided."}
        </p>

        <div className="roadmap-detail__actions">
          <Button
            type="button"
            variant={voted ? "subtle" : "brand"}
            onClick={onVote}
            aria-pressed={voted}
          >
            <span className="roadmap-detail__voteinner">
              <UpCaret />
              {voted ? "Upvoted" : "Upvote"} · {idea.voteCount}
            </span>
          </Button>
          {canDelete ? (
            <Button type="button" variant="negative" onClick={onDelete}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
