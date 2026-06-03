"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CreateIdeaModal } from "@/components/sections/roadmap/CreateIdeaModal";
import {
  ROADMAP_TABS,
  STATUS_META,
  TAG_LABELS,
  type RoadmapIdea,
  type RoadmapTab,
  type RoadmapTag,
} from "@/components/sections/roadmap/roadmap-data";

const VOTES_STORAGE_KEY = "pancake-roadmap-votes";
const VOTER_TOKEN_KEY = "pancake-roadmap-voter";

type Props = {
  initialIdeas: RoadmapIdea[];
  /** True when Supabase is live (enables posting + persisted votes). */
  backendEnabled: boolean;
  /** Server-resolved: does the current request carry a valid admin cookie? */
  isAdmin: boolean;
  /** True when an admin password is configured (shows the sign-in affordance). */
  adminAuthEnabled: boolean;
};

function CaretUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 4L13 11H3L8 4Z" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Stable per-browser id used to dedup anonymous votes. */
function getVoterToken(): string {
  try {
    let token = window.localStorage.getItem(VOTER_TOKEN_KEY);
    if (!token) {
      token =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Math.random().toString(36).slice(2)}${Date.now()}`;
      window.localStorage.setItem(VOTER_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "anon-no-storage";
  }
}

export function RoadmapBoard({ initialIdeas, backendEnabled, isAdmin, adminAuthEnabled }: Props) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<RoadmapIdea[]>(initialIdeas);
  const [activeTab, setActiveTab] = useState<RoadmapTab>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Admin login form state.
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Restore prior votes (button state) from localStorage.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VOTES_STORAGE_KEY);
      if (raw) setVotedIds(JSON.parse(raw) as string[]);
    } catch {
      /* private mode — votes just won't persist */
    }
  }, []);

  // Debounce search (PRD: instant, debounced 300ms).
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  const persistVoted = useCallback((next: string[]) => {
    setVotedIds(next);
    try {
      window.localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const setIdeaVotes = useCallback((id: string, voteCount: number) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, voteCount } : i)));
  }, []);

  async function toggleVote(idea: RoadmapIdea) {
    const hasVoted = votedIds.includes(idea.id);
    const delta = hasVoted ? -1 : 1;

    // Optimistic UI.
    persistVoted(hasVoted ? votedIds.filter((x) => x !== idea.id) : [...votedIds, idea.id]);
    setIdeaVotes(idea.id, Math.max(0, idea.voteCount + delta));

    if (!backendEnabled) return; // preview mode: local-only

    try {
      const res = await fetch(`/api/roadmap/ideas/${idea.id}/vote`, {
        method: hasVoted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterToken: getVoterToken() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "vote failed");
      if (typeof data.voteCount === "number") setIdeaVotes(idea.id, data.voteCount);
    } catch {
      persistVoted(hasVoted ? [...votedIds] : votedIds.filter((x) => x !== idea.id));
      setIdeaVotes(idea.id, idea.voteCount);
      setNotice("Couldn't save your vote. Try again.");
    }
  }

  async function deleteIdea(idea: RoadmapIdea) {
    if (!window.confirm(`Delete “${idea.title}”? This can't be undone.`)) return;
    const prev = ideas;
    setIdeas((list) => list.filter((i) => i.id !== idea.id)); // optimistic
    try {
      const res = await fetch(`/api/roadmap/ideas/${idea.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      setIdeas(prev); // revert
      setNotice("Couldn't delete that idea — your admin session may have expired.");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loginBusy) return;
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/roadmap/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data.error ?? "Login failed.");
        return;
      }
      setPassword("");
      setShowLogin(false);
      router.refresh(); // re-render server component → isAdmin = true
    } catch {
      setLoginError("Network error. Try again.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/roadmap/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  }

  function onCreated(idea: RoadmapIdea) {
    setIdeas((prev) => [idea, ...prev]);
    setNotice(null);
  }

  const defaultTag: RoadmapTag = activeTab === "all" ? "squads" : activeTab;

  const visibleIdeas = useMemo(() => {
    return ideas
      .filter((idea) => activeTab === "all" || idea.tag === activeTab)
      .filter((idea) => {
        if (!debouncedQuery) return true;
        return (
          idea.title.toLowerCase().includes(debouncedQuery) ||
          idea.description.toLowerCase().includes(debouncedQuery)
        );
      })
      .slice()
      .sort((a, b) => b.voteCount - a.voteCount);
  }, [ideas, activeTab, debouncedQuery]);

  return (
    <div className="roadmap-board">
      {/* Admin / auth bar */}
      <div className="roadmap-authbar">
        {!backendEnabled ? (
          <span className="roadmap-authbar__note">
            Preview mode — connect Supabase to enable posting and saved votes.
          </span>
        ) : isAdmin ? (
          <span className="roadmap-authbar__note">
            Admin mode ·{" "}
            <button type="button" className="roadmap-authbar__link" onClick={handleLogout}>
              Sign out
            </button>
          </span>
        ) : adminAuthEnabled ? (
          showLogin ? (
            <form className="roadmap-login" onSubmit={handleLogin}>
              <input
                type="password"
                className="input roadmap-login__input"
                placeholder="Admin password"
                aria-label="Admin password"
                value={password}
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={loginBusy}>
                {loginBusy ? "…" : "Enter"}
              </Button>
              <button
                type="button"
                className="roadmap-authbar__link"
                onClick={() => {
                  setShowLogin(false);
                  setLoginError(null);
                }}
              >
                Cancel
              </button>
              {loginError ? <span className="roadmap-login__error">{loginError}</span> : null}
            </form>
          ) : (
            <button
              type="button"
              className="roadmap-authbar__link"
              onClick={() => setShowLogin(true)}
            >
              Admin sign in
            </button>
          )
        ) : null}
      </div>

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
        <Button type="button" className="roadmap-share" onClick={() => setModalOpen(true)}>
          + Share an idea
        </Button>
      </div>

      {notice ? (
        <p className="roadmap-notice" role="status">
          {notice}
        </p>
      ) : null}

      {/* Idea list */}
      {visibleIdeas.length === 0 ? (
        <p className="roadmap-empty">
          {query.trim()
            ? `No ideas match “${query.trim()}”.`
            : "No ideas yet — be the first to share one."}
        </p>
      ) : (
        <ul className="roadmap-list">
          {visibleIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              voted={votedIds.includes(idea.id)}
              canDelete={isAdmin}
              onVote={() => toggleVote(idea)}
              onDelete={() => deleteIdea(idea)}
            />
          ))}
        </ul>
      )}

      <CreateIdeaModal
        open={modalOpen}
        defaultTag={defaultTag}
        onClose={() => setModalOpen(false)}
        onCreated={onCreated}
      />
    </div>
  );
}

function IdeaCard({
  idea,
  voted,
  canDelete,
  onVote,
  onDelete,
}: {
  idea: RoadmapIdea;
  voted: boolean;
  canDelete: boolean;
  onVote: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_META[idea.status];
  return (
    <li className="roadmap-card">
      <button
        type="button"
        className="roadmap-vote"
        data-voted={voted ? "" : undefined}
        aria-pressed={voted}
        aria-label={`Upvote “${idea.title}” — ${idea.voteCount} votes`}
        onClick={onVote}
      >
        <CaretUpIcon />
        <span className="roadmap-vote__count">{idea.voteCount}</span>
      </button>

      <div className="roadmap-card__body">
        <div className="roadmap-card__head">
          <h3 className="heading roadmap-card__title">{idea.title}</h3>
          <Badge variant={status.variant} className="roadmap-card__status">
            {status.label}
          </Badge>
        </div>
        {idea.description ? <p className="roadmap-card__desc">{idea.description}</p> : null}
        <div className="roadmap-card__meta">
          <span className="roadmap-card__tag">{TAG_LABELS[idea.tag]}</span>
          <span aria-hidden className="roadmap-card__dot">·</span>
          <span>{idea.authorName ?? "Anonymous"}</span>
          {canDelete ? (
            <>
              <span aria-hidden className="roadmap-card__dot">·</span>
              <button type="button" className="roadmap-card__delete" onClick={onDelete}>
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}
