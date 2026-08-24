import type { Metadata } from "next";

import { FxPillLink } from "@/components/sections/landing/FxPill";
import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingModals } from "@/components/sections/landing/LandingModals";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import "@/app/_styles/landing-v2.css";

/**
 * Careers — standout.work company-page format in the Pancake skin (founder,
 * 2026-08-24 round 7): dense, no viewport-filling bands, no mascot. Hero
 * claim + lede + quick-facts strip, full-bleed Open-roles band, the team
 * grid (LinkedIn photos in /public/team), and the always-hiring note.
 * Facts sourced from linkedin.com/company/get-pancake; ROLES stays empty
 * until real postings exist.
 */

export const metadata: Metadata = {
  title: "Careers — Pancake",
  description:
    "Pancake is five people in San Francisco building the AI agents that bring small businesses customers. See open roles, meet the team, or send a note.",
  alternates: { canonical: "https://getpancake.ai/careers" },
};

type Role = {
  title: string;
  department: string;
  blurb: string;
  type: string;
  location: string;
  href: string;
};

type TeamMember = {
  name: string;
  role: string;
  photo?: string;
  linkedin?: string;
};

const ROLES: Role[] = [];

/* Titles as each person states them publicly (LinkedIn headlines / funding
   announcements, researched 2026-08-24). Photos are their public avatars in
   /public/team; Zakaria has no public photo — pancake mark until he sends one. */
const TEAM: TeamMember[] = [
  {
    name: "Guillaume Marquis",
    role: "Co-founder & CEO",
    photo: "/team/guillaume.jpg",
    linkedin: "https://www.linkedin.com/in/marquis-guillaume/",
  },
  {
    name: "François de Fitte",
    role: "Co-founder",
    photo: "/team/francois.jpg",
    linkedin: "https://www.linkedin.com/in/francoisdefitte/",
  },
  {
    name: "Tristan Comte",
    role: "Founding GTM",
    photo: "/team/tristan.jpg",
    linkedin: "https://www.linkedin.com/in/tristan-comte-7b460b129/",
  },
  {
    name: "Zakaria Benhadi",
    role: "Founding Engineer",
    photo: "/team/zakaria.jpg",
    linkedin: "https://www.linkedin.com/in/zakaria-benhadi-13b02288/",
  },
  {
    name: "Théophile Cousin",
    role: "Engineer",
    photo: "/team/theophile.jpg",
    linkedin: "https://www.linkedin.com/in/theocousin/",
  },
];

const APPLY_EMAIL = "guillaume@getpancake.ai";

export default function CareersPage() {
  return (
    <main id="main-content" className="lv2 lv2-careers">
      <div className="lv2-page-top">
        <LandingNav />
      </div>

      {/* Hero + quick facts */}
      <section className="lv2s lv2-careers-hero" aria-labelledby="careers-heading">
        <div className="lv2-container">
          <header className="lv2-section-header">
            <h1 id="careers-heading" className="lv2-section-title">
              Build the autonomous GTM team.
            </h1>
            <p className="lv2-section-lede">
              Pancake&rsquo;s agents find warm leads and grow AI search visibility for small
              businesses, on their own. We are five people in San Francisco, and every hire
              shapes the company.
            </p>
          </header>
          <ul className="lv2-careers-facts" aria-label="Company facts">
            <li>5 people</li>
            <li>San Francisco, CA</li>
            <li>$5M seed</li>
            <li>Founded 2026</li>
            <li>
              <a
                href="https://www.linkedin.com/company/get-pancake"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a href="https://x.com/getpancake_ai" target="_blank" rel="noopener noreferrer">
                X
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Open roles */}
      <section className="lv2s" aria-labelledby="careers-roles-heading">
        <div className="lv2-container">
          <header className="lv2-section-header">
            <h2 id="careers-roles-heading" className="lv2-section-title">
              Open roles
            </h2>
          </header>
          {ROLES.length === 0 ? (
            <p className="lv2-careers-empty">
              None right now. New roles land on this page first.
            </p>
          ) : (
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

      {/* The team */}
      {TEAM.length > 0 && (
        <section id="team" className="lv2s" aria-labelledby="careers-team-heading">
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
                    <img src={member.photo} alt="" width={64} height={64} loading="lazy" />
                  )}
                  <span className="lv2-careers-member-name">{member.name}</span>
                  <span className="lv2-careers-member-role">{member.role}</span>
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Always-hiring note */}
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
            <FxPillLink href={`mailto:${APPLY_EMAIL}`}>Send a note</FxPillLink>
          </div>
        </div>
      </section>

      <LandingFooter />
      <LandingModals />
    </main>
  );
}
