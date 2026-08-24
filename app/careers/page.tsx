import type { Metadata } from "next";

import { FxPillLink } from "@/components/sections/landing/FxPill";
import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingModals } from "@/components/sections/landing/LandingModals";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import "@/app/_styles/landing-v2.css";

/**
 * Careers — standout.work/companies/standout-shaped, general-application mode
 * (founder, 2026-08-24: no open roles, apply straight to Tristan's inbox).
 * ROLES is empty on purpose; add entries and the cards render in place of the
 * "no roles" copy.
 */

export const metadata: Metadata = {
  title: "Careers — Pancake",
  description:
    "Pancake is five people in San Francisco building AI agents that bring companies customers. No open roles right now — exceptional people are welcome anytime.",
  alternates: { canonical: "https://getpancake.ai/careers" },
};

type Role = {
  title: string;
  type: string;
  location: string;
};

const ROLES: Role[] = [];

const STEPS = [
  {
    n: "01",
    title: "Email Tristan.",
    body: "Send what you have built to tristan@getpancake.ai. Links beat resumes.",
  },
  {
    n: "02",
    title: "A founder reads it.",
    body: "No ATS, no recruiter, no form.",
  },
  {
    n: "03",
    title: "We meet.",
    body: "If it clicks, you hear back within days. Coffee in SF, or a call.",
  },
] as const;

export default function CareersPage() {
  return (
    <main id="main-content" className="lv2">
      <div className="lv2-viewport lv2-viewport--page">
        <LandingNav />
        <section className="lv2s" aria-labelledby="careers-heading">
          <div className="lv2-careers">
            <p className="lv2-careers-eyebrow">Careers · San Francisco</p>
            <h1 id="careers-heading" className="lv2-careers-title">
              Come teach AI to bring customers.
            </h1>
            <p className="lv2-careers-lede">
              Pancake is five people in San Francisco. We build the AI agents that find warm
              leads and grow AI search visibility for small teams.
            </p>

            <ul className="lv2-careers-facts" aria-label="Company facts">
              <li>5 people</li>
              <li>San Francisco, CA</li>
              <li>
                <a href="https://x.com/getpancake_ai" target="_blank" rel="noopener noreferrer">
                  X
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/get-pancake"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>

            <h2 className="lv2-careers-h2">Open roles ({ROLES.length})</h2>
            {ROLES.length === 0 ? (
              <p className="lv2-careers-none">
                None posted right now. The team grows when someone exceptional shows up, not
                when a req opens.
              </p>
            ) : (
              <ul className="lv2-careers-roles">
                {ROLES.map((role) => (
                  <li key={role.title}>
                    <span className="lv2-careers-role-title">{role.title}</span>
                    <span className="lv2-careers-role-meta">
                      {role.type} · {role.location}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <h2 className="lv2-careers-h2">What happens when you write</h2>
            <ol className="lv2-careers-steps">
              {STEPS.map((step) => (
                <li key={step.n}>
                  <span className="lv2-careers-step-n" aria-hidden="true">
                    {step.n}
                  </span>
                  <span className="lv2-careers-step-title">{step.title}</span>
                  <span className="lv2-careers-step-body">{step.body}</span>
                </li>
              ))}
            </ol>

            <div className="lv2-button-group lv2-careers-cta">
              <FxPillLink href="mailto:tristan@getpancake.ai" data-analytics-id="careers_email">
                Email Tristan
              </FxPillLink>
              <FxPillLink
                variant="outline"
                href="https://x.com/getpancake_ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow the build
              </FxPillLink>
            </div>
          </div>
        </section>
      </div>
      <LandingFooter />
      <LandingModals />
    </main>
  );
}
