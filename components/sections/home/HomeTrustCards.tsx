/**
 * Home — security / privacy cards (founder brief 2026-07-06: replace the
 * 3D trust carousel with three static cards, exactly the Figma
 * `428:15125` layout — the pre-carousel design the founder liked).
 *
 * Three concepts survive the carousel, one card each:
 *  - **Secrets** — credentials live in an encrypted vault; agents use
 *    them without seeing them (dark vault panel + key pancake).
 *  - **Private environment** — one sealed workspace per company, nothing
 *    crosses customers (sandbox ellipses + workspace chip).
 *  - **Accounts** — each teammate's logins act for them alone (owner
 *    blobs with name tags).
 * Dropped per the brief: SOC 2, approve-before-it-ships, and
 * only-the-tools-you-connect. The carousel stays on disk unreferenced
 * (HomeTrustCarousel.tsx), like HomeLandingTrust before it.
 *
 * Cards reuse the `.home-landing-control-card` recipes; visuals are the
 * carousel's (vault, blobs) plus the sandbox-ellipse graphic from the
 * old pod card, chipless like the Figma comp (founder 2026-07-07: the
 * `workspace:` label wasn't in the design).
 */

import Image from "next/image";

/* ─────────────────────── visual 1 — secrets vault ─────────────────────── */

const VAULT_ROWS = [
  "vault://stripe/live",
  "vault://gmail/oauth",
  "vault://aws/deploy-key",
  "vault://linkedin/session",
];

function VaultVisual() {
  return (
    <div className="home-trust-vault" aria-hidden>
      {/* Peach key-pancake overlapping the panel's top-right corner. */}
      <span className="home-trust-vault__pancake">
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma SVG export */}
        <img className="home-trust-vault__pancake-side" src="/features/feature-247-side.svg" alt="" width={64} height={64} />
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma SVG export */}
        <img className="home-trust-vault__pancake-top" src="/features/feature-247-top.svg" alt="" width={61} height={59} />
        {/* eslint-disable-next-line @next/next/no-img-element -- local SVG glyph */}
        <img className="home-trust-vault__pancake-key" src="/features/feature-key.svg" alt="" width={26} height={26} />
      </span>
      <div className="home-trust-vault__panel">
        {VAULT_ROWS.map((path) => (
          <span key={path} className="home-trust-vault__row">
            <span className="home-trust-vault__dot" />
            <span className="home-trust-vault__path">{path}</span>
            <span className="home-trust-vault__mask">••••••••</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── visual 2 — sealed workspace ellipses ─────────────── */

function WorkspaceVisual() {
  return (
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
    </div>
  );
}

/* ─────────────────────── visual 3 — owner blobs ───────────────────────── */

/** Organic cream chip blob — same path as the integrations cloud chips. */
const BLOB_D =
  "M172.13 77.2048C172.13 125.026 134.869 169.339 87.3369 169.339C63.9016 169.339 38.4144 165.431 22.8941 150.144C6.93551 134.426 0 105.714 0 81.4702C0 54.3473 14.515 36.3508 33.9172 20.4742C48.7239 8.35805 66.7634 0 87.3369 0C134.869 0 172.13 29.3831 172.13 77.2048Z";

type OwnerBlob = {
  id: string;
  /** Blob box: x/y top-left, d = diameter, rotate in deg. */
  x: number;
  y: number;
  d: number;
  rotate: number;
  /** Owner tag chip position. */
  tagX: number;
  tagY: number;
  tag: string;
  logo: { kind: "img"; src: string } | { kind: "linkedin" };
};

const OWNER_BLOBS: OwnerBlob[] = [
  { id: "linkedin", x: 12, y: 14, d: 84, rotate: -8, tagX: 26, tagY: 102, tag: "tristan", logo: { kind: "linkedin" } },
  { id: "gmail", x: 116, y: 76, d: 72, rotate: 6, tagX: 128, tagY: 152, tag: "maya", logo: { kind: "img", src: "/integrations/gmail.svg" } },
  { id: "slack", x: 212, y: 22, d: 78, rotate: -4, tagX: 226, tagY: 104, tag: "you", logo: { kind: "img", src: "/integrations/slack.svg" } },
];

function AccountsVisual() {
  return (
    <div className="home-trust-blobs" aria-hidden>
      <svg viewBox="0 0 304 182" className="home-trust-blobs__svg">
        {/* Dotted connectors between blob rims — the sandbox-ellipse idiom. */}
        <path className="home-trust-blobs__wire" d="M92 66 C 108 84, 116 96, 130 106" />
        <path className="home-trust-blobs__wire" d="M186 108 C 200 96, 208 82, 218 68" />
        {OWNER_BLOBS.map((b) => {
          const s = b.d / 172.13;
          const logoSize = b.d * 0.42;
          const logoOff = (b.d - logoSize) / 2;
          return (
            <g key={b.id} transform={`translate(${b.x} ${b.y}) rotate(${b.rotate} ${b.d / 2} ${b.d / 2})`}>
              <path d={BLOB_D} transform={`scale(${s})`} fill="#FFF7EC" stroke="var(--stroke)" strokeWidth={1 / s} />
              {b.logo.kind === "linkedin" ? (
                <g transform={`translate(${logoOff} ${logoOff}) scale(${logoSize / 24})`}>
                  <rect width="24" height="24" rx="4" fill="#0A66C2" />
                  <path
                    fill="#FFFFFF"
                    d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45z"
                  />
                </g>
              ) : (
                <image href={b.logo.src} x={logoOff} y={logoOff} width={logoSize} height={logoSize} />
              )}
              {/* Active dot on the blob's upper-right rim. */}
              <circle cx={b.d * 0.86} cy={b.d * 0.16} r="4" fill="var(--palette-green-20)" />
            </g>
          );
        })}
      </svg>
      {OWNER_BLOBS.map((b) => (
        /* % of the 304×182 design box, not px — the svg scales with the
           card width and fixed-px tags drifted off their blobs on phones
           (mobile review 2026-07-07). */
        <span
          key={b.id}
          className="home-trust-blobs__tag"
          style={{ left: `${(b.tagX / 304) * 100}%`, top: `${(b.tagY / 182) * 100}%` }}
        >
          {b.tag}
        </span>
      ))}
    </div>
  );
}

/* ────────────────────────────── the cards ─────────────────────────────── */

type TrustCard = {
  id: string;
  title: string;
  body: string;
  visual: React.ReactNode;
};

const TRUST_CARDS: TrustCard[] = [
  {
    id: "secrets",
    title: "Secrets locked in a vault",
    body: "Keys and logins live encrypted. Agents use them without ever seeing them, and nothing sensitive touches the chat.",
    visual: <VaultVisual />,
  },
  {
    id: "workspace",
    title: "A sealed space per company",
    body: "You get your own private environment, memory included. Nothing is shared with other customers and none of it trains a model.",
    visual: <WorkspaceVisual />,
  },
  {
    id: "accounts",
    title: "Your accounts stay yours",
    body: "Each teammate connects their own logins. Pancake acts as you on your accounts, never for anyone else, and one click disconnects any of them.",
    visual: <AccountsVisual />,
  },
];

export function HomeTrustCards() {
  return (
    <div className="home-landing-trust">
      <div className="home-landing-control">
        {TRUST_CARDS.map((card) => (
          <article key={card.id} className="home-landing-control-card" data-card={card.id}>
            <header className="home-landing-control-card__header">
              <h3 className="home-landing-control-card__title">{card.title}</h3>
              <p className="home-landing-control-card__body">{card.body}</p>
            </header>
            {card.visual}
          </article>
        ))}
      </div>
    </div>
  );
}
