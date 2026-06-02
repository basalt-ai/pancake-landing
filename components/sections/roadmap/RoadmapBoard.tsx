"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import {
  ROADMAP_IDEAS,
  ROADMAP_TABS,
  STATUS_META,
  TAG_LABELS,
  type RoadmapIdea,
  type RoadmapTab,
} from "@/components/sections/roadmap/roadmap-data";

const DISCORD_INVITE_URL = "https://discord.gg/brJ99Up6ym";
/** localStorage key holding the set of idea ids the visitor has upvoted. */
const VOTES_STORAGE_KEY = "pancake-roadmap-votes";

function CaretUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 4L13 11H3L8 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 12L15.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Public community upvote board (PRD-Fider-Rebuild).
 *
 * Read-mostly: ideas are seeded statically and votes are tracked in
 * localStorage (no backend on the marketing site). One vote per idea per
 * browser, optimistic — the count bumps instantly and persists across reloads.
 * Submission is intentionally a link to Discord rather than a no-op modal.
 */
export function RoadmapBoard() {
  const [activeTab, setActiveTab] = useState<RoadmapTab>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [votedIds, setVotedIds] = useState<string[]>([]);

  // Restore the visitor's prior votes so a refresh keeps their +1.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VOTES_STORAGE_KEY);
      if (raw) setVotedIds(JSON.parse(raw) as string[]);
    } catch {
      // localStorage blocked (private mode) — votes just won't persist.
    }
  }, []);

  // Debounce search 300ms (PRD: instant results, debounced).
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  function toggleVote(id: string) {
    setVotedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore persistence failures
      }
      return next;
    });
  }

  const visibleIdeas = useMemo(() => {
    return ROADMAP_IDEAS
      .filter((idea) => activeTab === "all" || idea.tag === activeTab)
      .filter((idea) => {
        if (!debouncedQuery) return true;
        return (
          idea.title.toLowerCase().includes(debouncedQuery) ||
          idea.description.toLowerCase().includes(debouncedQuery)
        );
      })
      .map((idea) => ({
        ...idea,
        // optimistic count: seed + the visitor's own vote
        displayVotes: idea.upvotes + (votedIds.includes(idea.id) ? 1 : 0),
      }))
      .sort((a, b) => b.displayVotes - a.displayVotes);
  }, [activeTab, debouncedQuery, votedIds]);

  return (
    <div className="roadmap-board">
      {/* Tabs = tags */}
      <div className="roadmap-tabs" role="tablist" aria-label="Filter ideas by category">
        {ROADMAP_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className="roadmap-tab"
              data-active={isActive ? "" : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar: search + share */}
      <div className="roadmap-toolbar">
        <div className="roadmap-search">
          <span className="roadmap-search__icon" aria-hidden>
            <SearchIcon />
          </span>
          <input
            type="search"
            className="input roadmap-search__input"
            placeholder="Search ideas…"
            aria-label="Search ideas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="button roadmap-share inline-flex w-fit shrink-0 items-center justify-center no-underline"
        >
          + Share an idea
        </a>
      </div>

      {/* Idea list */}
      {visibleIdeas.length === 0 ? (
        <p className="roadmap-empty">
          No ideas match “{query.trim()}”.{" "}
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            Be the first to suggest it.
          </a>
        </p>
      ) : (
        <ul className="roadmap-list">
          {visibleIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              voted={votedIds.includes(idea.id)}
              onVote={() => toggleVote(idea.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function IdeaCard({
  idea,
  voted,
  onVote,
}: {
  idea: RoadmapIdea & { displayVotes: number };
  voted: boolean;
  onVote: () => void;
}) {
  const status = STATUS_META[idea.status];
  return (
    <li className="roadmap-card">
      <button
        type="button"
        className="roadmap-vote"
        data-voted={voted ? "" : undefined}
        aria-pressed={voted}
        aria-label={`Upvote “${idea.title}” — ${idea.displayVotes} votes`}
        onClick={onVote}
      >
        <CaretUpIcon />
        <span className="roadmap-vote__count">{idea.displayVotes}</span>
      </button>

      <div className="roadmap-card__body">
        <div className="roadmap-card__head">
          <h3 className="heading roadmap-card__title">{idea.title}</h3>
          <Badge variant={status.variant} className="roadmap-card__status">
            {status.label}
          </Badge>
        </div>
        <p className="roadmap-card__desc">{idea.description}</p>
        <div className="roadmap-card__meta">
          <span className="roadmap-card__tag">{TAG_LABELS[idea.tag]}</span>
          <span aria-hidden className="roadmap-card__dot">·</span>
          <span>{idea.comments} comments</span>
          <span aria-hidden className="roadmap-card__dot">·</span>
          <span>{idea.author}</span>
        </div>
      </div>
    </li>
  );
}
