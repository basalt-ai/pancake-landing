import { Badge, type BadgeVariant } from "@/components/ui/Badge";

/**
 * Feature deep-dive — what Pancake actually runs, and what each part buys the
 * founder. Content grounded in the product's real vocabulary (cmo-app brief:
 * Brain objects, signal names, trust mechanics) rather than invented claims.
 * Four equal-height cards, left-justified copy, no hover effects — per the
 * Pancake design rules.
 */

type Feature = {
  badge: string;
  badgeVariant: BadgeVariant;
  title: string;
  body: string;
  points: string[];
};

const FEATURES: Feature[] = [
  {
    badge: "The Brain",
    badgeVariant: "brand",
    title: "A living strategy, not a slide deck",
    body: "Pancake researches your company and holds the result as one connected graph — refreshed as your market moves, shared by every agent.",
    points: ["ICP & personas", "Message pillars & voice", "Keyword portfolio", "Market references"],
  },
  {
    badge: "Outbound",
    badgeVariant: "brand-alt-1",
    title: "Hot leads found, checked, contacted",
    body: "Agents watch buying signals around the clock, score every lead against your ICP, and reach out in your voice — so pipeline builds while you build product.",
    points: ["Keyword & competitor signals", "ICP-checked leads", "Personalized outreach"],
  },
  {
    badge: "AI search",
    badgeVariant: "brand-alt-2",
    title: "Recommended on Google and ChatGPT",
    body: "One article a day, briefed from the Brain and written to answer your buyers' real questions — the content AI assistants cite when your ICP asks who to use.",
    points: ["Daily briefs & drafts", "You approve, it publishes", "Built for AI search"],
  },
  {
    badge: "Control",
    badgeVariant: "neutral",
    title: "Autonomous, never out of bounds",
    body: "Every run carries its own spend cap, nothing ships until you approve it, and your feedback rewrites the playbook — Pancake gets sharper every week.",
    points: ["Per-run spend caps", "Approvals before send", "Feedback loop"],
  },
];

export function FeatureDive() {
  return (
    <section className="lv2s lv2-features" aria-labelledby="lv2-features-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <Badge>Under the hood</Badge>
          <h2 id="lv2-features-title" className="lv2-section-title">
            One Brain. A team of agents on top.
          </h2>
          <p className="lv2-section-lede">
            Everything Pancake does starts from what it knows about your company — and everything
            it learns makes the next run better.
          </p>
        </header>

        <div className="lv2-feature-grid">
          {FEATURES.map((f) => (
            <article key={f.badge} className="lv2-feature-card">
              <Badge variant={f.badgeVariant}>{f.badge}</Badge>
              <h3 className="lv2-feature-title">{f.title}</h3>
              <p className="lv2-feature-body">{f.body}</p>
              <ul className="lv2-feature-points">
                {f.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
