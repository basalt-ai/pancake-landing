/**
 * Landing v3 — Nav (Figma node 4257:4894, 1654×120).
 * Logo left edge 179px, links dead-center, dark CTA right-anchored at the
 * same 179px margin (= the 1296 content grid's side margin at 1654).
 * Link targets are provisional (not specified in Figma) — flagged in the PR.
 */
export function LpNav() {
  return (
    <header className="lp-nav">
      <a className="lp-nav-logo" href="/" aria-label="Pancake home">
        <img alt="" src="/lp/lp-nav-logo.svg" width={114.956} height={56} />
      </a>
      <nav className="lp-nav-links" aria-label="Primary">
        <a href="/#how-it-works">Product</a>
        <a href="/#why">Company</a>
        <a href="/careers">Careers</a>
      </nav>
      <a className="lp-btn lp-nav-cta" data-size="sm" href="https://app.getpancake.ai">
        Get started
      </a>
    </header>
  );
}
