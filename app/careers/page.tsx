import type { Metadata } from "next";

import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingModals } from "@/components/sections/landing/LandingModals";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import "@/app/_styles/landing-v2.css";

/**
 * Careers — kinro.com/careers structure in the Pancake skin (founder,
 * 2026-08-24): hero claim + lede, an "Open roles" band of white cards
 * (title + department chip + one-liner left, type/location + arrow right),
 * and a closing band with the always-hiring note and a Meet-the-team pill.
 * ROLES is empty until real postings exist — add an entry and the card
 * renders; never invent openings.
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

const ROLES: Role[] = [];

const APPLY_EMAIL = "guillaume@getpancake.ai";

export default function CareersPage() {
  return (
    <main id="main-content" className="lv2">
      <div className="lv2-viewport lv2-viewport--page">
        <LandingNav />

        <div className="lv2-careers">
          {/* Hero */}
          <section className="lv2s lv2-careers-hero" aria-labelledby="careers-heading">
            <div className="lv2-careers-inner">
              <p className="lv2-careers-eyebrow">Careers</p>
              <h1 id="careers-heading" className="lv2-careers-title">
                Build the autonomous growth team.
              </h1>
              <p className="lv2-careers-lede">
                Pancake&rsquo;s agents find warm leads and grow AI search visibility for small
                businesses, on their own. We are five people in San Francisco, and every hire
                shapes the company.
              </p>
            </div>
          </section>

          {/* Open roles */}
          <section className="lv2s lv2-careers-roles-band" aria-labelledby="careers-roles-heading">
            <div className="lv2-careers-inner">
              <div className="lv2-careers-roles-head">
                <h2 id="careers-roles-heading">Open roles</h2>
                <span className="lv2-careers-count">
                  {ROLES.length} {ROLES.length === 1 ? "position" : "positions"}
                </span>
              </div>

              {ROLES.length === 0 ? (
                <div className="lv2-careers-card lv2-careers-card--empty">
                  <p>No open positions right now. New roles land here first.</p>
                </div>
              ) : (
                <ul className="lv2-careers-cards">
                  {ROLES.map((role) => (
                    <li key={role.title}>
                      <a className="lv2-careers-card" href={role.href}>
                        <span className="lv2-careers-card-main">
                          <span className="lv2-careers-card-title">
                            {role.title}
                            <span className="lv2-careers-chip">{role.department}</span>
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

          {/* Always-hiring note */}
          <section className="lv2s lv2-careers-note-band" aria-label="Open application">
            <div className="lv2-careers-inner lv2-careers-note">
              <p>
                Don&rsquo;t see your role? We&rsquo;re always interested in exceptional people.
                Send a note to <a href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</a>.
              </p>
              <a
                className="lv2-careers-meet"
                href="https://zcal.co/i/ZEHl48rv"
                target="_blank"
                rel="noopener noreferrer"
                data-lv2-open="call"
                data-analytics-id="call_careers"
              >
                Meet the team <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </section>
        </div>
      </div>
      <LandingFooter />
      <LandingModals />
    </main>
  );
}
