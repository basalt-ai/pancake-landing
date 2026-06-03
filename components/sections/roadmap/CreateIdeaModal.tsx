"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useModalA11y } from "@/components/sections/roadmap/useModalA11y";
import {
  TAGS,
  TAG_LABELS,
  type RoadmapIdea,
  type RoadmapTag,
} from "@/components/sections/roadmap/roadmap-data";

type Props = {
  open: boolean;
  defaultTag: RoadmapTag;
  onClose: () => void;
  onCreated: (idea: RoadmapIdea) => void;
};

const TITLE_MAX = 255;
const DESC_MAX = 2000;

/**
 * Create-idea modal. Posts to /api/roadmap/ideas. Includes a visually hidden
 * honeypot field (`website`) the server uses to silently drop bots — real
 * users never see or focus it.
 */
export function CreateIdeaModal({ open, defaultTag, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState<RoadmapTag>(defaultTag);
  const [authorName, setAuthorName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus trap, scroll lock, Escape, and focus return.
  const panelRef = useModalA11y(open, onClose, titleRef);

  // Reset the category to the active tab + clear errors each time it opens.
  useEffect(() => {
    if (!open) return;
    setTag(defaultTag);
    setError(null);
  }, [open, defaultTag]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (title.trim().length < 3) {
      setError("Give your idea a title (at least 3 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/roadmap/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tag,
          authorName: authorName.trim(),
          website, // honeypot
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      if (data.idea) onCreated(data.idea as RoadmapIdea);
      // Reset for next time.
      setTitle("");
      setDescription("");
      setAuthorName("");
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="roadmap-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-modal-title"
    >
      <div className="roadmap-modal__backdrop" aria-hidden onClick={onClose} />
      <div className="roadmap-modal__panel" ref={panelRef} tabIndex={-1}>
        <div className="roadmap-modal__head">
          <h2 id="roadmap-modal-title" className="heading roadmap-modal__title">
            Share an idea
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

        <form className="roadmap-form" onSubmit={handleSubmit}>
          <label className="roadmap-field">
            <span className="roadmap-field__label">Title</span>
            <input
              ref={titleRef}
              className="input roadmap-field__input"
              type="text"
              value={title}
              maxLength={TITLE_MAX}
              placeholder="e.g. A squad that writes release notes"
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="roadmap-field">
            <span className="roadmap-field__label">Details</span>
            <textarea
              className="textarea roadmap-field__textarea"
              value={description}
              maxLength={DESC_MAX}
              rows={4}
              placeholder="What should it do, and why does it matter?"
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className="roadmap-field__hint">
              {description.length}/{DESC_MAX}
            </span>
          </label>

          <div className="roadmap-form__row">
            <label className="roadmap-field">
              <span className="roadmap-field__label">Category</span>
              <select
                className="input roadmap-field__input"
                value={tag}
                onChange={(e) => setTag(e.target.value as RoadmapTag)}
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {TAG_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>

            <label className="roadmap-field">
              <span className="roadmap-field__label">Your name (optional)</span>
              <input
                className="input roadmap-field__input"
                type="text"
                value={authorName}
                maxLength={80}
                placeholder="Anonymous"
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </label>
          </div>

          {/* Honeypot — hidden from humans, catnip for bots. */}
          <div className="roadmap-honeypot" aria-hidden>
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          {error ? (
            <p className="roadmap-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="roadmap-form__actions">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting…" : "Post idea"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
