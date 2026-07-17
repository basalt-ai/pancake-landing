"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Agent library gallery — adaptation of the provided framer-motion
 * ExpandableGallery: same interaction skeleton (hover-to-expand flex
 * panels, click for an expanded view with prev/next + counter), but
 * panels carry agent content instead of images and there is no dim
 * overlay on the resting panels (house rule: no hover dim).
 */

export type AgentAccent = "sky" | "grass" | "coral" | "neutral";

export type GalleryAgent = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  /** The agent infrastructure behind it, surfaced on expand. */
  infra: string;
  accent: AgentAccent;
  /** Decorative pancake SVG from /public/pancake-svgs. */
  art: string;
  expert?: {
    name: string;
    title: string;
    quote: string;
    initials: string;
  };
  comingSoon?: boolean;
};

const ACCENT_COLOR: Record<AgentAccent, string> = {
  sky: "var(--gtm-sky)",
  grass: "var(--gtm-grass)",
  coral: "var(--gtm-coral)",
  neutral: "var(--gtm-muted)",
};

function panelStyle(accent: AgentAccent): React.CSSProperties {
  const color = ACCENT_COLOR[accent];
  if (accent === "neutral") {
    return {
      "--gtm-panel-bg": "color-mix(in srgb, var(--gtm-sandstone) 55%, var(--gtm-surface))",
      "--gtm-panel-stroke": "var(--gtm-hairline)",
      "--gtm-expert-accent": "var(--gtm-sandstone)",
    } as React.CSSProperties;
  }
  return {
    "--gtm-panel-bg": `color-mix(in srgb, ${color} 14%, var(--gtm-surface))`,
    "--gtm-panel-stroke": `color-mix(in srgb, ${color} 45%, transparent)`,
    "--gtm-expert-accent": `color-mix(in srgb, ${color} 55%, var(--gtm-surface))`,
  } as React.CSSProperties;
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExpertCard({ agent }: { agent: GalleryAgent }) {
  if (!agent.expert) return null;
  const { name, title, quote, initials } = agent.expert;
  return (
    <figure className="gtm-expert" style={{ margin: 0 }}>
      <span className="gtm-expert-avatar" aria-hidden>
        {initials}
      </span>
      <div>
        <blockquote className="gtm-expert-quote" style={{ margin: 0 }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
        <figcaption className="gtm-expert-byline">
          Improved by {name} · {title}
        </figcaption>
      </div>
    </figure>
  );
}

export function ExpandableAgentGallery({ agents }: { agents: GalleryAgent[] }) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  // The hover/focus reveal layer only exists at >=900px (see gtm.css), so
  // the expansion state must be gated on the same breakpoint — otherwise
  // hover/tap below it fades the collapsed label with nothing to reveal.
  const [canExpand, setCanExpand] = React.useState(false);
  const reducedMotion = useReducedMotion();
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setCanExpand(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const flexTransition = { duration: reducedMotion ? 0 : 0.5, ease: "easeInOut" as const };
  const fadeTransition = { duration: reducedMotion ? 0 : 0.3 };

  const getFlexGrow = (index: number) => {
    if (!canExpand || hoveredIndex === null) return 1;
    return hoveredIndex === index ? 2.6 : 0.75;
  };

  const closeModal = React.useCallback(() => setSelectedIndex(null), []);

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((current) => (current === null ? null : (current + 1) % agents.length));
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((current) =>
      current === null ? null : (current - 1 + agents.length) % agents.length,
    );
  };

  // Escape closes the modal, Tab is trapped inside it, and body scroll is
  // locked while it is open (Escape/scroll-lock pattern from HomeNav).
  React.useEffect(() => {
    if (selectedIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }
      if (e.key === "Tab") {
        const root = overlayRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>("button, [href]");
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!root.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedIndex, closeModal]);

  // Return focus to the panel button that opened the modal once it closes.
  const wasOpenRef = React.useRef(false);
  React.useEffect(() => {
    if (selectedIndex !== null) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [selectedIndex]);

  const selected = selectedIndex === null ? null : agents[selectedIndex];

  return (
    <div>
      <div className="gtm-gallery">
        {agents.map((agent, index) => {
          const expanded = canExpand && hoveredIndex === index;
          return (
            <motion.div
              key={agent.id}
              className="gtm-panel"
              style={{ ...panelStyle(agent.accent), flexBasis: 0 }}
              animate={{ flexGrow: getFlexGrow(index) }}
              transition={flexTransition}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative vector */}
              <img src={agent.art} alt="" className="gtm-panel-pancake" aria-hidden />

              {/* Collapsed label */}
              <motion.div
                className="gtm-panel-collapsed"
                animate={{ opacity: expanded ? 0 : 1 }}
                transition={fadeTransition}
                aria-hidden={expanded}
              >
                <span className="gtm-dot" style={{ background: ACCENT_COLOR[agent.accent] }} />
                <h3 className="gtm-panel-name">{agent.name}</h3>
              </motion.div>

              {/* Expanded reveal (desktop hover / keyboard focus) */}
              <motion.div
                className="gtm-panel-content"
                initial={false}
                animate={{ opacity: expanded ? 1 : 0 }}
                transition={fadeTransition}
                style={{ pointerEvents: "none" }}
                aria-hidden={!expanded}
              >
                <div className="gtm-panel-content-top">
                  <span className="badge">
                    <span className="gtm-dot" style={{ background: ACCENT_COLOR[agent.accent] }} />
                    {agent.comingSoon ? "Coming soon" : "Agent"}
                  </span>
                  <h3 className="gtm-panel-name">{agent.name}</h3>
                  <p className="gtm-panel-tagline">{agent.tagline}</p>
                  <p className="gtm-panel-infra">{agent.infra}</p>
                </div>
                <div className="gtm-panel-bottom">
                  <ExpertCard agent={agent} />
                  <span className="gtm-panel-open-hint">Open the playbook →</span>
                </div>
              </motion.div>

              <button
                type="button"
                className="gtm-panel-hit"
                aria-label={`Open ${agent.name} details`}
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setSelectedIndex(index);
                }}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex((current) => (current === index ? null : current))}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Expanded view modal — kept from the original component: backdrop
          click closes, prev/next cycle, counter at the bottom. */}
      <AnimatePresence>
        {selected !== null && selectedIndex !== null && (
          <motion.div
            ref={overlayRef}
            className="gtm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} details`}
          >
            {agents.length > 1 && (
              <button
                type="button"
                className="gtm-modal-nav gtm-modal-nav--prev"
                aria-label="Previous agent"
                onClick={goToPrev}
              >
                <ChevronIcon direction="left" />
              </button>
            )}

            <motion.div
              key={selected.id}
              className="gtm-modal"
              style={panelStyle(selected.accent)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={fadeTransition}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                ref={closeButtonRef}
                className="gtm-modal-close"
                aria-label="Close"
                onClick={closeModal}
              >
                <CloseIcon />
              </button>

              <span className="badge">
                <span className="gtm-dot" style={{ background: ACCENT_COLOR[selected.accent] }} />
                {selected.comingSoon ? "Coming soon" : "Agent"}
              </span>

              <h3 className="gtm-modal-name">{selected.name}</h3>
              <p className="gtm-modal-desc">{selected.description}</p>

              <ul className="gtm-modal-list">
                {selected.bullets.map((bullet) => (
                  <li key={bullet}>
                    <span className="gtm-dot" style={{ background: ACCENT_COLOR[selected.accent] }} />
                    {bullet}
                  </li>
                ))}
              </ul>

              <p className="gtm-panel-infra">{selected.infra}</p>

              <div className="gtm-modal-meta">
                <span className="badge">Runs on Claude Code</span>
                <span className="badge">Runs on Codex</span>
              </div>

              <ExpertCard agent={selected} />

              <a
                className="gtm-btn"
                href={selected.comingSoon ? "/open-roadmap" : "https://app.getpancake.ai"}
              >
                <span className="gtm-dot" aria-hidden />
                {selected.comingSoon ? "Vote on the roadmap" : `Deploy ${selected.name}`}
              </a>
            </motion.div>

            {agents.length > 1 && (
              <button
                type="button"
                className="gtm-modal-nav gtm-modal-nav--next"
                aria-label="Next agent"
                onClick={goToNext}
              >
                <ChevronIcon direction="right" />
              </button>
            )}

            <div className="gtm-modal-counter" aria-hidden>
              {selectedIndex + 1} / {agents.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
