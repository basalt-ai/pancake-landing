"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiDiscord } from "react-icons/si";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { ProductHuntBadge } from "@/components/shared/ProductHuntBadge";
import { Button } from "@/components/ui/Button";

/** Same Discord invite as `main`'s Nav. */
const DISCORD_INVITE_URL = "https://discord.gg/brJ99Up6ym";

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 5L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const navLinkClassName =
  "home-nav-primary-link inline-flex min-h-[var(--control-size-md)] items-center no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * Header bar + mobile drawer.
 *
 * - Desktop (>=lg): Discord icon + Pricing link inline next to the wordmark.
 * - Mobile (<lg): hamburger button opens a full-bleed drawer keyed to
 *   Figma `451:20140` — dark inverted-surface, Pancake wordmark on top,
 *   stacked Build in public / Discord / Pricing links. Closes on link
 *   click, Escape, or backdrop tap.
 */
export function HomeNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  // Swap "Pricing" → "Sign in" when already on /pricing, so the slot points
  // somewhere new instead of being redundant.
  const onPricingPage = pathname === "/pricing";
  const sideLinkLabel = onPricingPage ? "Sign in" : "Pricing";
  const sideLinkHref = onPricingPage ? "/signup" : "/pricing";

  // Lock body scroll while the drawer is open + close on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  return (
    <header
      className="w-full py-[var(--spacing-lg)] lg:py-[calc(2*var(--spacing-xxl))]"
      style={{
        backgroundColor: "var(--surface)",
      }}
    >
      <div className={`flex items-center justify-between gap-[var(--spacing-md)] ${HOME_PAGE_CONTAINER_CLASS}`}>
        <Link
          href="/"
          className="home-nav-logo-link inline-flex shrink-0 items-center no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Pancake home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- vector logo; next/image SVG tradeoffs */}
          <img
            src="/pancake-logo.svg"
            alt=""
            className="block h-[var(--size-home-nav-logo-height)] w-auto"
            width={156}
            height={44}
            decoding="async"
            fetchPriority="high"
          />
        </Link>

        <div className="home-nav-end flex items-center justify-end" style={{ gap: "calc(2 * var(--spacing-xl))" }}>
          <div className="flex lg:hidden">
            <Button
              type="button"
              iconOnly
              size="lg"
              variant="ghost"
              aria-label="Menu"
              aria-expanded={drawerOpen}
              aria-controls="home-mobile-nav-drawer"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </Button>
          </div>

          <nav className="hidden items-center lg:flex" style={{ gap: "calc(2 * var(--spacing-xl))" }} aria-label="Primary">
            <ProductHuntBadge />
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${navLinkClassName} home-nav-primary-link--icon`}
              aria-label="Join our Discord"
            >
              <SiDiscord size={20} aria-hidden />
            </a>
            <Link href="/blog" className={navLinkClassName}>
              Blog
            </Link>
            <Link href={sideLinkHref} className={navLinkClassName}>
              {sideLinkLabel}
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile drawer (Figma `451:20140`). */}
      <div
        id="home-mobile-nav-drawer"
        className={`home-nav-mobile-drawer ${drawerOpen ? "home-nav-mobile-drawer--open" : ""}`}
        role="dialog"
        aria-modal={drawerOpen}
        aria-label="Mobile navigation"
        hidden={!drawerOpen}
      >
        <div className="home-nav-mobile-drawer__inner">
          <div className="home-nav-mobile-drawer__top">
            <Link
              href="/"
              className="home-nav-mobile-drawer__logo"
              aria-label="Pancake home"
              onClick={() => setDrawerOpen(false)}
            >
              <span className="home-nav-mobile-drawer__wordmark">Pancake</span>
            </Link>
            <button
              type="button"
              className="home-nav-mobile-drawer__close"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <nav className="home-nav-mobile-drawer__nav" aria-label="Mobile primary">
            <ProductHuntBadge className="self-start" />
            {/* "Product" link removed — points to /build-in-public, which is
                an empty page today. Match the desktop nav (Discord + Pricing
                only) until the Product page exists. */}
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="home-nav-mobile-drawer__link"
              onClick={() => setDrawerOpen(false)}
            >
              Resources
            </a>
            <Link
              href="/blog"
              className="home-nav-mobile-drawer__link"
              onClick={() => setDrawerOpen(false)}
            >
              Blog
            </Link>
            <Link
              href={sideLinkHref}
              className="home-nav-mobile-drawer__link"
              onClick={() => setDrawerOpen(false)}
            >
              {sideLinkLabel}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
