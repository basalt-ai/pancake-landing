import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { HomeUGCWall } from "@/components/sections/home/HomeUGCWall";

/**
 * Social proof — the X carousel and the UGC video wall, reused from the
 * previous landing body. The tweets strip must sit OUTSIDE the container div
 * (direct section child) to go full-bleed; the UGC wall renders its own
 * section and rides directly under the tweets, exactly as designed
 * (HomeLandingBody precedent — the wall has no header of its own).
 */
export function LandingTestimonials() {
  return (
    <>
      <section
        className="home-landing-section home-landing-section--testimonials lv2-testimonials"
        aria-labelledby="lv2-testimonials-title"
      >
        <div className="lv2-container">
          <header className="lv2-section-header">
            <h2 id="lv2-testimonials-title" className="lv2-section-title">
              Take it from them
            </h2>
          </header>
        </div>
        <HomeLandingTestimonials />
      </section>
      <HomeUGCWall />
    </>
  );
}
