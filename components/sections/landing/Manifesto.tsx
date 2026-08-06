/**
 * The problem statement — the page's dark chapter (synthetic.ai's cream→dark
 * flip; Figma/Retool dark-chapter precedent from Mobbin). Copy left with the
 * page's one kicker; right, the "mountain of GTM busywork" the copy names:
 * a pile of tilted task cards with three brand beads glowing behind it.
 */

const TASKS = [
  "Find leads",
  "Write outreach",
  "Publish content",
  "Position the launch",
  "Follow up",
  "Get cited by AI search",
] as const;

export function Manifesto() {
  return (
    <section className="lv2s lv2-manifesto" aria-labelledby="lv2-manifesto-title">
      <div className="lv2-container">
        <p className="lv2-manifesto-kicker">The bottleneck</p>
        <h2 id="lv2-manifesto-title" className="lv2-manifesto-title">
          Shipping got 10x easier.
          <br />
          Selling didn&rsquo;t.
        </h2>
      </div>
      <div className="lv2-container lv2-manifesto-grid">
        <p className="lv2-manifesto-body">
          With AI coding tools, a weekend hack can become a real product by Monday morning. But
          turning it into a real business still means a mountain of GTM work. Finding leads.
          Writing outreach. Publishing content. Getting cited by AI search. None of that got
          easier. Pancake is changing that.
        </p>
        <div className="lv2-manifesto-mountain" aria-hidden="true">
          <i className="lv2-manifesto-bead" data-tone="golden" />
          <i className="lv2-manifesto-bead" data-tone="purple" />
          <i className="lv2-manifesto-bead" data-tone="mint" />
          <ul className="lv2-manifesto-pile">
            {TASKS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
