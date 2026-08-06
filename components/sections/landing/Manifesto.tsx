/**
 * The problem statement — the "why now" the page was missing (synthetic.ai's
 * aspiration-block pattern). Type only, no badge, no CTA, no illustration:
 * one display claim and a staccato paragraph, left-justified on cream.
 */
export function Manifesto() {
  return (
    <section className="lv2s lv2-manifesto" aria-labelledby="lv2-manifesto-title">
      <div className="lv2-container">
        <h2 id="lv2-manifesto-title" className="lv2-manifesto-title">
          Shipping got 10x easier.
          <br />
          Selling didn&rsquo;t.
        </h2>
        <p className="lv2-manifesto-body">
          With AI coding tools, a weekend hack can become a real product by Monday morning. But
          turning it into a real business still means a mountain of GTM work. Finding leads.
          Writing outreach. Publishing content. Getting cited by AI search. None of that got
          easier. Pancake is changing that.
        </p>
      </div>
    </section>
  );
}
