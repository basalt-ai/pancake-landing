import type { ReactNode } from "react";

import { LpRingFlow } from "@/components/sections/landing-v3/LpRingFlow";

/**
 * Landing v3 — section 6 "How Pancake finds customers" (Figma 4257:4976,
 * rev2 artboard 1654×2969, re-extracted 2026-08-31).
 * Heading + 4 feature cards (1296×621) + 4 hairline separators (rev2 closes
 * the section with a 4th). Static, pixel-exact at a 1654px viewport; mock UIs
 * are decorative. f2/f4 rainbow rings and f3 logos are baked SVG exports —
 * the rings are four hand-offset outside-stroke rects Figma blends, not a
 * CSS-expressible gradient border.
 */

function FeatureText({ title, body, tag }: { title: string; body: string; tag?: string }) {
  return (
    <div className="lp-feat-text">
      {tag ? <p className="lp-feat-tag">{tag}</p> : null}
      <h3 className="lp-title-card lp-feat-h">{title}</h3>
      <p className="lp-feat-body">{body}</p>
    </div>
  );
}

/* ── Feature 1 — Tell Pancake what to watch ─────────────────────────── */

function SignalRow({
  label,
  on,
  act,
  children,
}: {
  label: string;
  on: boolean;
  /** choreography act (1-4) — toggles of tagged rows animate on desktop */
  act?: 1 | 2 | 3 | 4;
  children: ReactNode;
}) {
  return (
    <div className="lp-feat-f1-row" data-act={act}>
      {children}
      <p className="lp-feat-f1-label">{label}</p>
      <span className={"lp-feat-f1-toggle" + (on ? " is-on" : "")} />
      <img className="lp-feat-f1-chev" src="/lp/lp-f1-chevron.svg" alt="" width={13} height={13} />
    </div>
  );
}

function RoleRow({ label, checked, pop }: { label: string; checked: boolean; pop?: "s" | "m" | "cs" }) {
  return (
    <div className="lp-feat-f1-role">
      {checked ? (
        pop ? (
          /* choreography rows stack an (animation-only) empty outline under
             the check img, so the box reads "unchecked" before its pop */
          <span className="lp-feat-f1-checkwrap">
            <span className="lp-feat-f1-checkbox-off" />
            <img
              src="/lp/lp-f1-checkbox.svg"
              alt=""
              width={19}
              height={19}
              className="lp-feat-f1-checkimg"
              data-pop={pop}
            />
          </span>
        ) : (
          <img src="/lp/lp-f1-checkbox.svg" alt="" width={19} height={19} className="lp-feat-f1-checkimg" />
        )
      ) : (
        <span className="lp-feat-f1-checkbox-off" />
      )}
      <p className="lp-feat-f1-label">{label}</p>
    </div>
  );
}

function Feature1() {
  return (
    <article className="lp-feat-card" data-side="left">
      <FeatureText
        tag="AGENT Y"
        title={"Tell Pancake \nwhat to watch"}
        body="Choose the keywords, competitors, influencers, hiring activity, and tech stacks that matter. Pancake finds matching buyers and keeps the source attached."
      />
      <div className="lp-feat-mockzone" aria-hidden="true">
        <div className="lp-feat-f1">
          <div className="lp-mockcard lp-feat-f1-signals">
            <div className="lp-feat-f1-sighead">
              <p className="lp-feat-f1-sigtitle">Signals</p>
              <p className="lp-feat-f1-sigcount">4 active</p>
            </div>
            <SignalRow label="Keyword mentions" on act={1}>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-pink">
                <img src="/lp/lp-f1-icon-doc-lines.svg" alt="" width={19} height={19} className="lp-feat-f1-docicon" />
              </span>
              <img src="/lp/lp-f1-avatar-purple.svg" alt="" width={38} height={38} className="lp-feat-f1-avatar" />
            </SignalRow>
            <SignalRow label="Competitor engagement" on act={2}>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-amber">
                <span className="lp-feat-f1-chart">
                  <i className="lp-feat-f1-bar1" />
                  <i className="lp-feat-f1-bar2" />
                  <i className="lp-feat-f1-bar3" />
                  <b className="lp-feat-f1-d1">1</b>
                  <b className="lp-feat-f1-d2">2</b>
                  <b className="lp-feat-f1-d3">3</b>
                </span>
              </span>
            </SignalRow>
            <SignalRow label="Industry expert engagement" on={false}>
              <img src="/lp/lp-f1-avatar-green.svg" alt="" width={32} height={32} className="lp-feat-f1-icon32" />
            </SignalRow>
            <SignalRow label="Companies hiring" on act={3}>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-blue">
                <img src="/lp/lp-f1-icon-doc-lines-blue.svg" alt="" width={19} height={19} className="lp-feat-f1-docicon" />
              </span>
            </SignalRow>
            <SignalRow label="Your brand engagement" on={false}>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-cream">
                <img src="/lp/lp-f1-icon-doc-lines.svg" alt="" width={19} height={19} className="lp-feat-f1-docicon" />
              </span>
            </SignalRow>
            <SignalRow label="Technologies used" on act={4}>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-pink">
                <img src="/lp/lp-f1-icon-doc-lines.svg" alt="" width={19} height={19} className="lp-feat-f1-docicon" />
              </span>
            </SignalRow>
          </div>
          <div className="lp-mockcard lp-feat-f1-roles">
            <div className="lp-feat-f1-roleshead">
              <p className="lp-feat-f1-rolestitle">Roles</p>
              {/* rest DOM is the artboard's "3 selected"; the 0/1/2 overlays
                  are animation-only layers that count up with the checks */}
              <p className="lp-feat-f1-sigcount lp-feat-f1-rolecount">
                <span data-rc="3">3 selected</span>
                <span className="lp-feat-f1-rc-alt" data-rc="0">0 selected</span>
                <span className="lp-feat-f1-rc-alt" data-rc="1">1 selected</span>
                <span className="lp-feat-f1-rc-alt" data-rc="2">2 selected</span>
              </p>
            </div>
            <RoleRow label="Sales" checked pop="s" />
            <RoleRow label="Marketing" checked pop="m" />
            <RoleRow label="Customer success" checked pop="cs" />
            <RoleRow label="Operations" checked={false} />
          </div>
          {/* static clay sticker — the reduced-motion / no-animation render
              only (choreography hides it and act 1 takes over its copy) */}
          <img src="/lp/lp-f1-annotation.svg" alt="" width={76} height={43} className="lp-feat-f1-bubble" />
          <p className="lp-feat-f1-bubbletext">clay alternatives</p>
          {/* choreography quips — one per act, each slapped at the clay
              sticker's artboard offset from its own row's toggle; pure CSS
              16s loop, hidden on reduced motion */}
          <p className="lp-feat-f1-quip" data-quip="1">clay alternatives</p>
          <p className="lp-feat-f1-quip" data-quip="2">flirting with your rival</p>
          <p className="lp-feat-f1-quip" data-quip="3">budget just landed</p>
          <p className="lp-feat-f1-quip" data-quip="4">webflow but no crm</p>
        </div>
      </div>
    </article>
  );
}

/* ── Feature 2 — Every first message starts warm ────────────────────── */

function Feature2() {
  return (
    <article className="lp-feat-card" data-side="right">
      <FeatureText
        title="Every first message starts warm"
        body="Pancake visits their profile, likes a recent post, and connects before following up. Every message starts from their activity and sounds like you."
      />
      <div className="lp-feat-mockzone" aria-hidden="true">
        <div className="lp-feat-f2">
          {/* LinkedIn-style x-post (Inter pastiche; icon layer is one baked SVG) */}
          <div className="lp-feat-f2-post">
            <img src="/lp/lp-f2-post-icons.svg" alt="" width={364} height={171} className="lp-feat-f2-posticons" />
            <img src="/lp/lp-f2-avatar-sarah.jpg" alt="" width={43} height={43} className="lp-feat-f2-avatar" />
            <div className="lp-feat-f2-meta">
              <p className="lp-feat-f2-name">
                Sarah Velasquez<span className="lp-feat-f2-degree">• 1st</span>
              </p>
              <p className="lp-feat-f2-headline">Principal Design Engineer @ Shift | Ex-Apple Design</p>
              <p className="lp-feat-f2-time">3h •</p>
            </div>
            <p className="lp-feat-f2-body">Third no-show this week...</p>
            <div className="lp-feat-f2-skel">
              <span className="lp-feat-f2-skelgrp">
                <i style={{ width: "14.4px" }} />
                <i style={{ width: "63.9px" }} />
              </span>
              <span className="lp-feat-f2-skelgrp">
                <i style={{ width: "14.4px" }} />
                <i style={{ width: "46.8px" }} />
              </span>
              <span className="lp-feat-f2-skelgrp">
                <i style={{ width: "14.4px" }} />
                <i style={{ width: "136.8px" }} />
              </span>
            </div>
            <span className="lp-feat-f2-count" style={{ left: "32.4px" }}>34</span>
            <span className="lp-feat-f2-count" style={{ left: "79.8px" }}>5</span>
            <span className="lp-feat-f2-count" style={{ left: "119.2px" }}>5</span>
            <span className="lp-feat-f2-count" style={{ left: "158.6px" }}>5</span>
          </div>
          {/* rainbow draft ring — baked Figma export (4 offset outside-stroke rects) */}
          <img src="/lp/lp-f2-draft-ring.svg" alt="" width={405} height={284} className="lp-feat-f2-ring" />
          {/* ring flow: each of the ring's four hand-drawn squiggles masks its
              own spinning palette wheel, so the exact stroke geometry stays
              and the colors chase along the contour (founder 2026-08-31);
              shown only when motion is allowed — the img above is the rest
              state. Stack order p1→p4 mirrors the baked svg paint order. */}
          <div className="lp-feat-ringfx lp-feat-f2-ringfx lp-feat-ringfx--p1" aria-hidden="true"><i /></div>
          <div className="lp-feat-ringfx lp-feat-f2-ringfx lp-feat-ringfx--p2" aria-hidden="true"><i /></div>
          <div className="lp-feat-ringfx lp-feat-f2-ringfx lp-feat-ringfx--p3" aria-hidden="true"><i /></div>
          <div className="lp-feat-ringfx lp-feat-f2-ringfx lp-feat-ringfx--p4" aria-hidden="true"><i /></div>
          {/* ring flow on canvas: the same masks × wheels; once its first
              frame is up it replaces the eight discs above (desktop) — Gecko
              ran them on the main thread. See LpRingFlow.tsx. */}
          <LpRingFlow variant="f2" />
          <div className="lp-feat-f2-draft">
            <p className="lp-feat-f2-eyebrow">Draft ready</p>
            <p className="lp-feat-f2-msg">
              Hey Anna, saw your post on no-shows. Pelican sends reminders patients actually open. Worth a quick look
              Thursday?
            </p>
            <span className="lp-feat-f2-send">Send</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Feature 3 — Show up where buyers search ────────────────────────── */

function Feature3() {
  return (
    <article className="lp-feat-card" data-side="left">
      <FeatureText
        title={"Show up where \nbuyers search"}
        body="Pancake finds the questions where Google and AI miss you. It drafts the article, waits for your review, and publishes it to your CMS."
      />
      <div className="lp-feat-mockzone" aria-hidden="true">
        <div className="lp-feat-f3">
          {/* AI-answers collage: ChatGPT spiral behind the card, Claude
              asterisk + Gemini star above it (baked SVG exports, rotation
              pre-applied) */}
          <img src="/lp/lp-f3-logo-chatgpt.svg" alt="" width={141} height={141} className="lp-feat-f3-chatgpt" />
          <div className="lp-feat-f3-card">
            <div className="lp-feat-f3-bubble">
              <p>best online booking tool for a small clinic</p>
            </div>
            <div className="lp-feat-f3-resp">
              <p className="lp-feat-f3-thought">Thought for 1s</p>
              <p className="lp-feat-f3-answer">
                If you’re into high intensity, cardio-heavy workouts, I’d definitely recommend{" "}
                <b className="lp-feat-f3-mark">DeRox.</b>
                {"\n\n"}
                There seems to be a general consensus amongst Hyrox, and crossfit athletes to track their workouts
                because it offers great precision over alternatives.
              </p>
            </div>
            <div className="lp-feat-f3-composer">
              <img src="/lp/lp-f3-composer-icons.svg" alt="" width={251} height={38} className="lp-feat-f3-compicons" />
              <p className="lp-feat-f3-ask">Ask Chat</p>
            </div>
          </div>
          <img src="/lp/lp-f3-logo-gemini.svg" alt="" width={241} height={241} className="lp-feat-f3-gemini" />
          <img src="/lp/lp-f3-logo-claude.svg" alt="" width={109} height={109} className="lp-feat-f3-claude" />
        </div>
      </div>
    </article>
  );
}

/* ── Feature 4 — Pancake learns from what wins ──────────────────────── */

function Feature4() {
  return (
    <article className="lp-feat-card" data-side="right">
      <FeatureText
        title="Pancake learns from what wins"
        body="Pancake compares reply rates and remembers which opening, message length, and ask worked. The next campaign starts there."
      />
      <div className="lp-feat-mockzone" aria-hidden="true">
        <div className="lp-feat-f4">
          <div className="lp-feat-f4-graph">
            <div className="lp-feat-f4-stat">
              <span className="lp-feat-f4-pct">56%</span>
              <img src="/lp/lp-f4-arrow.svg" alt="" width={17} height={17} className="lp-feat-f4-arrowup" />
            </div>
            <p className="lp-feat-f4-vslabel">vs last period</p>
            <div className="lp-feat-f4-bars">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className="lp-feat-f4-bar" />
              ))}
            </div>
            <div className="lp-feat-f4-weeks">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>
          <div className="lp-feat-f4-worked">
            <p className="lp-feat-f4-cardtitle">What worked</p>
            <div className="lp-feat-f4-chips">
              <span className="lp-feat-f4-chip">Lead with no-shows</span>
              <span className="lp-feat-f4-chip">Shorter intros</span>
              <span className="lp-feat-f4-chip">Ask for Thursdays</span>
            </div>
          </div>
          {/* rainbow ring — baked Figma export, sits behind the brain card */}
          <img src="/lp/lp-f4-brain-ring.svg" alt="" width={475} height={105} className="lp-feat-f4-ring" />
          <div className="lp-feat-ringfx lp-feat-f4-ringfx lp-feat-ringfx--p1" aria-hidden="true"><i /></div>
          <div className="lp-feat-ringfx lp-feat-f4-ringfx lp-feat-ringfx--p2" aria-hidden="true"><i /></div>
          <div className="lp-feat-ringfx lp-feat-f4-ringfx lp-feat-ringfx--p3" aria-hidden="true"><i /></div>
          <div className="lp-feat-ringfx lp-feat-f4-ringfx lp-feat-ringfx--p4" aria-hidden="true"><i /></div>
          {/* ring flow on canvas — the same handoff as f2 (LpRingFlow.tsx) */}
          <LpRingFlow variant="f4" />
          <div className="lp-feat-f4-brain">
            <p className="lp-feat-f4-cardtitle">Brain updated</p>
            <p className="lp-feat-f4-brainsub">The winning playbook is ready for the next campaign.</p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Section ────────────────────────────────────────────────────────── */

export function LpFeatures() {
  return (
    <section className="lp-feat" aria-labelledby="lp-feat-heading-title">
      <div className="lp-feat-heading">
        <h2 id="lp-feat-heading-title" className="lp-title-section lp-feat-headline">
          How Pancake finds customers
        </h2>
      </div>
      <Feature1 />
      <hr className="lp-feat-sep" />
      <Feature2 />
      <hr className="lp-feat-sep" />
      <Feature3 />
      <hr className="lp-feat-sep" />
      <Feature4 />
      {/* rev2 artboard closes the section with a 4th separator (4526:3448) */}
      <hr className="lp-feat-sep" />
    </section>
  );
}
