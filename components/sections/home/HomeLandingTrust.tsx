/**
 * Home — merged security + control section (founder call 2026-07-03: one
 * block, three pillars — SOC 2 / managed access / private pod — replacing
 * "Secure by design" and "You're always in control").
 *
 * Reuses the rich control-card skeleton (368×402, `.home-landing-control-*`
 * recipes) — the founder liked that design language. Each card = kit `.badge`
 * kicker + title + dense body + a product-flavored mini-visual:
 *  - **SOC 2** — control checklist rows with green ticks (the claims a
 *    reviewer would paste into a vendor form).
 *  - **Your accounts** — named connection rows (LinkedIn tied to Tristan,
 *    Gmail to Maya) + one pending approval with the approve/reject buttons:
 *    access is per-person and the human always has the last word.
 *  - **Your pod** — the sandboxed-scope ellipse graphic with a mono
 *    `pod: your-company` namespace chip.
 *
 * Copy rules (from the security-copy research): nouns over adjectives, one
 * mechanism per sentence, no borrowed vocabulary ("enterprise-grade",
 * "peace of mind"), claims stay bone-dry — the playfulness lives in the
 * visuals.
 */

import Image from "next/image";

/** Single white tick for the pink approve button (from the control card). */
function CheckIcon() {
  return (
    <svg viewBox="0 0 14 11" className="home-landing-control-card__btn-icon" aria-hidden>
      <path
        d="M1 5.5 L5.2 9.5 L13 1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** X icon for the cream reject button (from the control card). */
function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" className="home-landing-control-card__btn-icon" aria-hidden>
      <path
        d="M1.5 1.5 L10.5 10.5 M10.5 1.5 L1.5 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Green tick disc for the SOC 2 checklist rows. */
function TickDisc() {
  return (
    <span className="home-landing-trust-check__tick" aria-hidden>
      <svg viewBox="0 0 14 11">
        <path
          d="M1 5.5 L5.2 9.5 L13 1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

/** LinkedIn mark — same inline drawing as the integrations cloud. */
function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="home-landing-trust-conn__mark" aria-hidden>
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        fill="#FFFFFF"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45z"
      />
    </svg>
  );
}

/* ────────────────────────────── Card 1 — SOC 2 ───────────────────────────── */

const SOC2_CHECKS = [
  "Encrypted in transit and at rest",
  "Access reviewed and logged",
  "Incident response tested",
];

function Soc2Card() {
  return (
    <article className="home-landing-control-card" data-card="soc2">
      <header className="home-landing-control-card__header">
        <span className="badge home-landing-control-card__kicker">SOC 2</span>
        <h3 className="home-landing-control-card__title">Audited every year</h3>
        <p className="home-landing-control-card__body">
          An independent auditor tests the controls. The report is one email away.
        </p>
      </header>
      <ul className="home-landing-trust-check-list">
        {SOC2_CHECKS.map((label) => (
          <li key={label} className="home-landing-control-approve-row home-landing-trust-check">
            <TickDisc />
            <span className="home-landing-trust-check__label">{label}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ─────────────────────────── Card 2 — Your accounts ──────────────────────── */

function AccessCard() {
  return (
    <article className="home-landing-control-card" data-card="access">
      <header className="home-landing-control-card__header">
        <span className="badge home-landing-control-card__kicker">Your accounts</span>
        <h3 className="home-landing-control-card__title">Your LinkedIn stays tied to you</h3>
        <p className="home-landing-control-card__body">
          Each teammate connects their own accounts. Pancake acts within the scope you granted,
          and anything sensitive waits for your tap.
        </p>
      </header>
      <ul className="home-landing-control-approve-list">
        <li className="home-landing-control-approve-row">
          <LinkedInMark />
          <div className="home-landing-control-approve-row__main">
            <p className="home-landing-control-approve-row__role">Connected by Tristan</p>
            <p className="home-landing-control-approve-row__action">LinkedIn</p>
          </div>
          <span className="home-landing-trust-conn__revoke">Revoke</span>
          <span className="home-landing-trust-conn__status">Active</span>
        </li>
        <li className="home-landing-control-approve-row">
          <div className="home-landing-control-approve-row__main">
            <p className="home-landing-control-approve-row__role">
              <Image src="/control/dot-1.svg" alt="" width={7} height={7} aria-hidden unoptimized />
              <span>Waiting for you</span>
            </p>
            <p className="home-landing-control-approve-row__action">Send invoice</p>
          </div>
          <span className="home-landing-control-approve-row__amount">$4,820</span>
          <div className="home-landing-control-approve-row__buttons">
            <button
              type="button"
              aria-label="Approve Send invoice"
              className="home-landing-control-card__btn home-landing-control-card__btn--approve"
            >
              <CheckIcon />
            </button>
            <button
              type="button"
              aria-label="Reject Send invoice"
              className="home-landing-control-card__btn home-landing-control-card__btn--reject"
            >
              <CloseIcon />
            </button>
          </div>
        </li>
        {/* Third row rides the comp's deliberate bottom overflow. */}
        <li className="home-landing-control-approve-row">
          {/* eslint-disable-next-line @next/next/no-img-element -- integration mark */}
          <img className="home-landing-trust-conn__mark" src="/integrations/gmail.svg" alt="" />
          <div className="home-landing-control-approve-row__main">
            <p className="home-landing-control-approve-row__role">Connected by Maya</p>
            <p className="home-landing-control-approve-row__action">Gmail</p>
          </div>
          <span className="home-landing-trust-conn__status">Active</span>
        </li>
      </ul>
    </article>
  );
}

/* ──────────────────────────── Card 3 — Your pod ──────────────────────────── */

function PodCard() {
  return (
    <article className="home-landing-control-card" data-card="scope">
      <header className="home-landing-control-card__header">
        <span className="badge home-landing-control-card__kicker">Your pod</span>
        <h3 className="home-landing-control-card__title">Nothing leaves your pod</h3>
        <p className="home-landing-control-card__body">
          Your company gets its own sealed pod with its own memory and vault. None of it ever
          trains a model.
        </p>
      </header>
      <div className="home-landing-control-scope" aria-hidden>
        <div className="home-landing-control-scope__ellipse home-landing-control-scope__ellipse--center">
          <Image src="/control/sandbox-e1.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__ellipse home-landing-control-scope__ellipse--right">
          <Image src="/control/sandbox-e2.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__ellipse home-landing-control-scope__ellipse--left">
          <Image src="/control/sandbox-e3.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__icon home-landing-control-scope__icon--a">
          <Image src="/control/sandbox-icon-1.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__icon home-landing-control-scope__icon--b">
          <Image src="/control/sandbox-icon-2.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__icon home-landing-control-scope__icon--c">
          <Image src="/control/sandbox-icon-3.svg" alt="" fill unoptimized />
        </div>
        <span className="home-landing-trust-pod-label">pod: your-company</span>
      </div>
    </article>
  );
}

export function HomeLandingTrust() {
  return (
    <div className="home-landing-trust">
      <div className="home-landing-control">
        <Soc2Card />
        <AccessCard />
        <PodCard />
      </div>
      <p className="home-landing-trust__note">
        SOC 2 report and subprocessor list available on request.
      </p>
    </div>
  );
}
