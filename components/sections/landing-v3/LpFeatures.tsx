import type { ReactNode } from "react";

/**
 * Landing v3 — section 6 "How Pancake finds customers" (Figma 4257:4976).
 * Heading + 4 feature cards (1296×621) + 3 hairline separators.
 * Static, pixel-exact at a 1654px viewport; mock UIs are decorative.
 */

function FeatureText({ title, body }: { title: string; body: string }) {
  return (
    <div className="lp-feat-text">
      <h3 className="lp-title-card lp-feat-h">{title}</h3>
      <p className="lp-feat-body">{body}</p>
    </div>
  );
}

/* ── Feature 1 — Tell Pancake what to watch ─────────────────────────── */

function SignalRow({
  label,
  on,
  tinted,
  children,
}: {
  label: string;
  on: boolean;
  tinted?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={"lp-feat-f1-row" + (tinted ? " lp-feat-f1-row-tinted" : "")}>
      {children}
      <p className="lp-feat-f1-label">{label}</p>
      <span className={"lp-feat-f1-toggle" + (on ? " is-on" : "")} />
      <img className="lp-feat-f1-chev" src="/lp/lp-f1-chevron.svg" alt="" width={13} height={13} />
    </div>
  );
}

function RoleRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="lp-feat-f1-role">
      {checked ? (
        <img src="/lp/lp-f1-checkbox.svg" alt="" width={19} height={19} className="lp-feat-f1-checkimg" />
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
            <SignalRow label="Keyword mentions" on>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-pink">
                <img src="/lp/lp-f1-icon-doc-lines.svg" alt="" width={19} height={19} className="lp-feat-f1-docicon" />
              </span>
              <img src="/lp/lp-f1-avatar-purple.svg" alt="" width={38} height={38} className="lp-feat-f1-avatar" />
            </SignalRow>
            <SignalRow label="Competitor engagement" on>
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
            <SignalRow label="Companies hiring" on tinted>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-blue">
                <img src="/lp/lp-f1-icon-doc-lines-blue.svg" alt="" width={19} height={19} className="lp-feat-f1-docicon" />
              </span>
            </SignalRow>
            <SignalRow label="Your brand engagement" on={false}>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-cream">
                <img src="/lp/lp-f1-icon-doc-lines.svg" alt="" width={19} height={19} className="lp-feat-f1-docicon" />
              </span>
            </SignalRow>
            <SignalRow label="Technologies used" on>
              <span className="lp-feat-f1-tile lp-feat-f1-tile-pink">
                <img src="/lp/lp-f1-icon-doc-lines.svg" alt="" width={19} height={19} className="lp-feat-f1-docicon" />
              </span>
            </SignalRow>
          </div>
          <div className="lp-mockcard lp-feat-f1-roles">
            <div className="lp-feat-f1-roleshead">
              <p className="lp-feat-f1-rolestitle">Roles</p>
              <p className="lp-feat-f1-sigcount">3 selected</p>
            </div>
            <RoleRow label="Sales" checked />
            <RoleRow label="Marketing" checked />
            <RoleRow label="Customer success" checked />
            <RoleRow label="Operations" checked={false} />
          </div>
          <img src="/lp/lp-f1-annotation.svg" alt="" width={76} height={43} className="lp-feat-f1-bubble" />
          <p className="lp-feat-f1-bubbletext">clay alternatives</p>
        </div>
      </div>
    </article>
  );
}

/* ── Feature 2 — Every first message starts warm ────────────────────── */

function GreenChip({ label }: { label: string }) {
  return (
    <span className="lp-feat-f2-chip lp-feat-f2-chip-green">
      <img src="/lp/lp-f2-check-sm.svg" alt="" width={16} height={16} className="lp-feat-f2-chipicon" />
      {label}
    </span>
  );
}

function Feature2() {
  return (
    <article className="lp-feat-card" data-side="right">
      <FeatureText
        title="Every first message starts warm"
        body="Pancake visits their profile, likes a recent post, and connects before following up. Every message starts from their activity and sounds like you."
      />
      <div className="lp-feat-mockzone" aria-hidden="true">
        <div className="lp-feat-f2">
          <div className="lp-mockcard lp-feat-f2-carda">
            <p className="lp-feat-f2-eyebrow">CAMPAIGN</p>
            <div className="lp-feat-f2-post">
              <span className="lp-feat-f2-avatarbox">
                <img src="/lp/lp-f2-avatar.png" alt="" width={38} height={38} className="lp-feat-f2-avatar" />
                <img src="/lp/lp-f2-linkedin-badge.svg" alt="" width={16} height={16} className="lp-feat-f2-badge" />
              </span>
              <div className="lp-feat-f2-postcol">
                <p className="lp-feat-f2-name">Anna Meyer</p>
                <p className="lp-feat-f2-quote">“Third no-show this week...”</p>
                <p className="lp-feat-f2-ago">2h ago</p>
              </div>
            </div>
            <div className="lp-feat-f2-chips">
              <GreenChip label="Profile visited" />
              <GreenChip label="Post liked" />
              <GreenChip label="Connection accepted" />
              <span className="lp-feat-f2-chip lp-feat-f2-chip-pending">
                <img src="/lp/lp-f2-ellipsis.svg" alt="" width={16} height={16} className="lp-feat-f2-chipicon" />
                Reach out
              </span>
            </div>
          </div>
          <div className="lp-mockcard lp-feat-f2-cardb">
            <div className="lp-feat-f2-labels">
              <span>Follow-up</span>
              <span>•</span>
              <span className="lp-feat-f2-ready">Draft ready</span>
            </div>
            <p className="lp-feat-f2-msg">
              Hey Anna, saw your post on no-shows. Pelican sends reminders patients actually open. Worth a quick look
              Thursday?
            </p>
            <div className="lp-feat-f2-btns">
              <span className="lp-feat-f2-approve">
                <img src="/lp/lp-f2-check-lg.svg" alt="" width={21} height={21} className="lp-feat-f2-checklg" />
                Approve
              </span>
              <span className="lp-feat-f2-revise">Revise</span>
            </div>
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
          <div className="lp-mockcard lp-feat-f3-query">
            <div className="lp-feat-f3-qhead">
              <img src="/lp/lp-f3-chatgpt.svg" alt="" width={20} height={20} />
              <p className="lp-feat-f3-eyebrow">QUERY</p>
            </div>
            <p className="lp-feat-f3-q">best online booking tool for a small clinic</p>
            <div className="lp-feat-f3-chips">
              <span className="lp-chip lp-feat-f3-chip-muted">Not ranked</span>
              <span className="lp-chip lp-feat-f3-chip-gap">Gap found</span>
            </div>
          </div>
          <img src="/lp/lp-f3-arrow-down.svg" alt="" width={19} height={26} className="lp-feat-f3-arrow" />
          <div className="lp-feat-f3-holder">
            <div className="lp-mockcard lp-feat-f3-article">
              <div className="lp-feat-f3-labels">
                <span>ARTICLE</span>
                <span>•</span>
                <span>WEBFLOW</span>
              </div>
              <p className="lp-feat-f3-atitle">Online booking for small clinics</p>
              <p className="lp-feat-f3-abody">Drafter from your brain and the questions buyers ask.</p>
              <div className="lp-feat-f3-achips">
                <span className="lp-feat-f3-achip">
                  <img src="/lp/lp-f3-check.svg" alt="" width={19} height={19} className="lp-feat-f3-check" />
                  Published
                </span>
                <span className="lp-feat-f3-achip">
                  <img src="/lp/lp-f3-check.svg" alt="" width={19} height={19} className="lp-feat-f3-check" />
                  Approved
                </span>
              </div>
            </div>
          </div>
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
          <div className="lp-feat-f4-head">
            <p className="lp-feat-f4-eyebrow">CLINIC OWNERS</p>
            <p className="lp-feat-f4-htitle">Campaign performance</p>
          </div>
          <div className="lp-mockcard lp-feat-f4-graph">
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
            <div className="lp-feat-f4-stat">
              <span className="lp-feat-f4-pct">56%</span>
              <img src="/lp/lp-f4-arrow-up.svg" alt="" width={15} height={15} className="lp-feat-f4-arrowup" />
            </div>
            <p className="lp-feat-f4-vslabel">VS LAST PERIOD</p>
          </div>
          <div className="lp-mockcard lp-feat-f4-worked">
            <p className="lp-feat-f4-cardtitle">What worked</p>
            <div className="lp-feat-f4-chips">
              <span className="lp-chip lp-feat-f4-chip">Lead with no-shows</span>
              <span className="lp-chip lp-feat-f4-chip">Shorter intros</span>
              <span className="lp-chip lp-feat-f4-chip">Ask for Thursdays</span>
            </div>
          </div>
          <div className="lp-mockcard lp-feat-f4-brain">
            <span className="lp-feat-f4-circle">
              <img src="/lp/lp-f4-brain-icon.svg" alt="" width={32} height={32} className="lp-feat-f4-brainicon" />
            </span>
            <div className="lp-feat-f4-braincol">
              <p className="lp-feat-f4-cardtitle">Brain updated</p>
              <p className="lp-feat-f4-brainsub">The winning playbook is ready for the next campaign.</p>
            </div>
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
    </section>
  );
}
