import Link from "next/link";

import { FxPillLink } from "./FxPill";

/**
 * Landing nav — rime.ai-shaped: wordmark left, text links + two pills right
 * (Book a call outline, Get started primary). Text links collapse away below
 * 768px; the footer carries the full map there. "Book a call" is a real link
 * to zcal with a data-lv2-open="call" upgrade: pages that mount LandingModals
 * intercept it into the booking dialog, everywhere else it just navigates.
 */

const NAV_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/careers", label: "Careers" },
  { href: "https://app.getpancake.ai", label: "Log in", external: true },
];

export function LandingNav() {
  return (
    <header className="lv2-nav">
      <div className="lv2-nav-inner">
        <a href="https://getpancake.ai/" className="lv2-nav-wordmark" aria-label="Pancake">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand asset, same treatment as the static landing */}
          <img src="/pancake-wordmark.png" alt="Pancake" />
        </a>
        <div className="lv2-nav-right">
          <nav className="lv2-nav-links" aria-label="Primary">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} prefetch={false}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <FxPillLink
            variant="outline"
            href="https://zcal.co/i/ZEHl48rv"
            target="_blank"
            rel="noopener noreferrer"
            className="lv2-nav-call"
            data-lv2-open="call"
            data-analytics-id="call_nav"
          >
            Book a call
          </FxPillLink>
          <FxPillLink href="https://app.getpancake.ai" data-analytics-id="app_nav">
            Get started
          </FxPillLink>
        </div>
      </div>
    </header>
  );
}
