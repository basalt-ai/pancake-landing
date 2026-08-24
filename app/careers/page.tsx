import type { Metadata } from "next";

import { FxPillLink } from "@/components/sections/landing/FxPill";
import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingModals } from "@/components/sections/landing/LandingModals";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import { PancakeStack } from "@/components/sections/pricing/PancakeStack";
import "@/app/_styles/landing-v2.css";

/**
 * Careers — kinro.com/careers structure told entirely in the landing's own
 * grammar (founder, 2026-08-24: no one-off styling): lv2 section headers with
 * Fono titles, price-card surfaces for the role and team cards, kit .badge
 * for labels, FxPill buttons, PancakeStack decor.
 *
 * ROLES and TEAM are empty until real data lands — never invent openings or
 * people. With TEAM filled, the #team band renders (kinro's team section) and
 * the Meet-the-team pill anchors to it; until then the pill books a call.
 */

export const metadata: Metadata = {
  title: "Careers — Pancake",
  description:
    "Pancake is five people in San Francisco building the AI agents that bring small businesses customers. See open roles or send a note.",
  alternates: { canonical: "https://getpancake.ai/careers" },
};

type Role = {
  title: string;
  department: string;
  blurb: string;
  type: string;
  location: string;
  href: string; // mailto or posting link
};

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  photo?: string; // e.g. /team/tristan.jpg
  links?: { label: string; href: string }[];
};

const ROLES: Role[] = [];
const TEAM: TeamMember[] = [];

const APPLY_EMAIL = "guillaume@getpancake.ai";

export default function CareersPage() {
  return (
    <main id="main-content" className="lv2">
      <div className="lv2-viewport lv2-viewport--page">
        <LandingNav />

        <div className="lv2-careers">
          {/* Hero — pricing-page grammar, pancake stack riding shotgun */}
          <section className="lv2s lv2-careers-hero" aria-labelledby="careers-heading">
            <div className="lv2-container">
              <div className="lv2-careers-fold">
                <header className="lv2-section-header">
                  <h1 id="careers-heading" className="lv2-section-title">
                    Build the autonomous GTM team.
                  </h1>
                  <p className="lv2-section-lede">
                    Pancake&rsquo;s agents find warm leads and grow AI search visibility for
                    small businesses, on their own. We are five people in San Francisco, and
                    every hire shapes the company.
                  </p>
                </header>
                <div className="lv2-careers-decor" aria-hidden="true">
                  <PancakeStack count={5} />
                </div>
              </div>
            </div>
          </section>

          {/* Open roles */}
          <section className="lv2s lv2s--surface" aria-labelledby="careers-roles-heading">
            <div className="lv2-container">
              <header className="lv2-section-header">
                <h2 id="careers-roles-heading" className="lv2-section-title">
                  Open roles
                </h2>
                {ROLES.length === 0 && (
                  <p className="lv2-section-lede">
                    None right now. New roles land on this page first.
                  </p>
                )}
              </header>
              {ROLES.length > 0 && (
                <ul className="lv2-careers-cards">
                  {ROLES.map((role) => (
                    <li key={role.title}>
                      <a className="lv2-careers-card" href={role.href}>
                        <span className="lv2-careers-card-main">
                          <span className="lv2-careers-card-title">
                            {role.title}
                            <span className="badge">{role.department}</span>
                          </span>
                          <span className="lv2-careers-card-blurb">{role.blurb}</span>
                        </span>
                        <span className="lv2-careers-card-meta">
                          {role.type} · {role.location}
                          <span aria-hidden="true" className="lv2-careers-arrow">
                            &rarr;
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* The team — renders once TEAM is filled (kinro's team section) */}
          {TEAM.length > 0 && (
            <section id="team" className="lv2s lv2s--brand" aria-labelledby="careers-team-heading">
              <div className="lv2-container">
                <header className="lv2-section-header">
                  <h2 id="careers-team-heading" className="lv2-section-title">
                    The team
                  </h2>
                </header>
                <ul className="lv2-careers-team">
                  {TEAM.map((member) => (
                    <li key={member.name} className="lv2-careers-member">
                      {member.photo && (
                        // eslint-disable-next-line @next/next/no-img-element -- small static portraits
                        <img src={member.photo} alt="" width={72} height={72} loading="lazy" />
                      )}
                      <span className="lv2-careers-member-name">{member.name}</span>
                      <span className="badge">{member.role}</span>
                      <p>{member.bio}</p>
                      {member.links && (
                        <span className="lv2-careers-member-links">
                          {member.links.map((l) => (
                            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                              {l.label}
                            </a>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Closing note */}
          <section className="lv2s" aria-labelledby="careers-note-heading">
            <div className="lv2-container">
              <header className="lv2-section-header">
                <h2 id="careers-note-heading" className="lv2-section-title">
                  Don&rsquo;t see your role?
                </h2>
                <p className="lv2-section-lede">
                  We&rsquo;re always interested in exceptional people. Send a note to{" "}
                  <a href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</a>.
                </p>
              </header>
              <div className="lv2-button-group">
                {TEAM.length > 0 ? (
                  <FxPillLink href="#team">Meet the team</FxPillLink>
                ) : (
                  <FxPillLink
                    href="https://zcal.co/i/ZEHl48rv"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-lv2-open="call"
                    data-analytics-id="call_careers"
                  >
                    Meet the team
                  </FxPillLink>
                )}
                <FxPillLink variant="outline" href={`mailto:${APPLY_EMAIL}`}>
                  Send a note
                </FxPillLink>
              </div>
            </div>
          </section>
        </div>
      </div>
      <LandingFooter />
      <LandingModals />
    </main>
  );
}
