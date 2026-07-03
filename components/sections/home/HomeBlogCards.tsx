/**
 * "From the blog" — home-page section surfacing the three newest posts as
 * kit-language cards (cover / date + read time / title / excerpt). Replaces
 * the former raw inline-styled link list.
 *
 * Server component: frontmatter is read from `content/blog/*.mdx` at build
 * time via `lib/posts`. GEO job: every card is a plain `<a href="/blog/…">`
 * so crawlers discover new articles straight from the home page — do NOT
 * convert these anchors to router buttons.
 */

import fs from "fs";
import path from "path";

import Image from "next/image";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { H2 } from "@/components/ui/Headings";
import { getAllPosts, getPostBySlug, type PostMeta } from "@/lib/posts";

import "@/app/_styles/home-blog.css";

/**
 * Loose frontmatter fields present across the MDX corpus but not part of the
 * typed `PostFrontmatter` (`lib/posts.ts` spreads ALL frontmatter through, so
 * these ride along at runtime). `description` is typed required upstream but
 * a few posts only ship `summary` — treat both as optional here.
 */
interface BlogCardMeta extends PostMeta {
  publishedAt?: string;
  summary?: string;
  cover_image?: string;
  cover_image_alt?: string;
}

/** Fallback tint rotation for posts without a cover (see home-blog.css). */
const FALLBACK_TONES = ["pink", "purple", "yellow"] as const;

/**
 * Frontmatter occasionally references covers that were never exported to
 * `public/` (renamed slugs, etc.) — verify the file exists on disk so we
 * never render a 404 image, and use the branded-blob fallback instead.
 */
function resolveCover(meta: BlogCardMeta): { src: string; alt: string } | null {
  if (!meta.cover_image || !meta.cover_image.startsWith("/")) return null;
  if (!fs.existsSync(path.join(process.cwd(), "public", meta.cover_image))) return null;
  // Missing alt → empty string: the card link already carries the title, so
  // the cover is decorative for screen readers.
  return { src: meta.cover_image, alt: meta.cover_image_alt ?? "" };
}

/** ~220 wpm over the raw MDX body — a reading hint, not a science. */
function readingMinutes(slug: string): number | null {
  const post = getPostBySlug(slug);
  if (!post) return null;
  const words = post.content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * "2026-06-30" → "June 30, 2026" (UTC so the day never shifts with server tz).
 * Returns null on unparseable frontmatter dates — same failure class
 * `app/sitemap.ts`'s safeDate() guards against; the card then omits its
 * <time> instead of printing "Invalid Date" on the homepage.
 */
function formatDate(iso: string): string | null {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return new Date(t).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Two-tone pancake blob for cover-less posts — same silhouette as the
 * closing-CTA decor in `HomeLandingBody` (side + top paths from
 * `pancake-svgs/angled-1.svg`), tinted per-card via CSS
 * (`.home-blog-card__fallback--{pink|purple|yellow}`).
 */
function FallbackBlob() {
  return (
    <svg className="home-blog-card__blob" viewBox="0 0 49 48" aria-hidden focusable="false">
      <path
        className="home-blog-card__blob-side"
        d="M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z"
      />
      <path
        className="home-blog-card__blob-top"
        d="M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z"
      />
    </svg>
  );
}

// Founder-curated shelf (2026-07-02): newest-3 surfaced whichever GEO
// comparison post shipped last — thin reads for a homepage visitor. Two
// internal picks (the vision manifesto + the real-numbers proof) and one
// external partner post (below). Order = display order. If a slug is
// renamed, the newest remaining posts pad the internal slots.
const FEATURED_SLUGS = [
  "the-next-unicorns-will-have-five-employees",
  "autonomous-company-benchmark-2026",
];

/**
 * Third card — external partner post about Pancake's agent inbox (founder
 * call 2026-07-02: replaced the stack post, judged the weakest of the
 * three). Same card anatomy, but the anchor leaves the site: title and
 * excerpt are the AgentMail article's own text, read time from its ~1,100
 * words at the same 220 wpm formula as internal posts.
 */
const AGENTMAIL_CARD = {
  key: "agentmail-superagent-inbox",
  href: "https://www.agentmail.to/blog/how-pancake-gives-its-superagent-a-real-inbox-with-agentmail",
  title: "How Pancake Gives Its Superagent a Real Inbox with AgentMail",
  excerpt:
    "An inbox the agent fully owns, not a founder's personal address. Shipped in a day, zero-touch threads, response times from hours to minutes.",
  dateISO: "2026-06-16",
  minutes: 5 as number | null,
  source: "AgentMail",
};

/** Unified card view-model — internal posts and the external partner post
 *  render through the same markup. */
type ShelfCard = {
  key: string;
  href: string;
  external: boolean;
  title: string;
  excerpt?: string;
  dateISO: string;
  minutes: number | null;
  cover: { src: string; alt: string } | null;
  source?: string;
};

export function HomeBlogCards() {
  const now = Date.now();
  const postTime = (p: BlogCardMeta) => {
    const t = new Date(p.publishedAt ?? p.date).getTime();
    return Number.isFinite(t) ? t : 0;
  };
  const all = [...getAllPosts()] as BlogCardMeta[];
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const featured = FEATURED_SLUGS.flatMap((slug) => {
    const p = bySlug.get(slug);
    return p ? [p] : [];
  });
  // Pad with the newest non-featured, non-future posts if curation ever
  // goes stale (renamed slug) — same guards as the old recency logic
  // (future-dated GEO posts skipped, bad dates sort last).
  const pad = all
    .filter((p) => !FEATURED_SLUGS.includes(p.slug) && postTime(p) <= now)
    .sort((a, b) => postTime(b) - postTime(a));
  const internal = [...featured, ...pad].slice(0, 2);

  const cards: ShelfCard[] = internal.map((p) => ({
    key: p.slug,
    href: `/blog/${p.slug}`,
    external: false,
    title: p.title,
    excerpt: p.description ?? p.summary,
    dateISO: p.publishedAt ?? p.date,
    minutes: readingMinutes(p.slug),
    cover: resolveCover(p),
  }));
  cards.push({ ...AGENTMAIL_CARD, external: true, cover: null });

  // Even with a stripped content dir the external card keeps the shelf alive;
  // the guard only fires if that ever changes.
  if (cards.length === 0) return null;

  return (
    <section className="home-landing-section" aria-labelledby="home-landing-blog-heading">
      <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
        <header className="home-landing-section__header">
          <H2 id="home-landing-blog-heading" className="heading home-landing-section__title text-center">
            From the blog
          </H2>
          <p className="home-landing-section__lede text-center">Fresh off the griddle.</p>
        </header>

        <div className="home-blog">
          <ul className="home-blog__grid">
            {cards.map((card, index) => {
              const tone = FALLBACK_TONES[index % FALLBACK_TONES.length];
              return (
                <li key={card.key} className="home-blog__cell">
                  {/* Plain anchor on purpose — see GEO note in the file header.
                      External cards open in a new tab so the homepage stays. */}
                  <a
                    href={card.href}
                    className="home-blog-card"
                    {...(card.external ? { target: "_blank", rel: "noopener" } : {})}
                  >
                    <div className="home-blog-card__media">
                      {card.cover ? (
                        <Image
                          src={card.cover.src}
                          alt={card.cover.alt}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="home-blog-card__img"
                        />
                      ) : (
                        <div
                          className={`home-blog-card__fallback home-blog-card__fallback--${tone}`}
                          aria-hidden
                        >
                          <FallbackBlob />
                        </div>
                      )}
                    </div>
                    <div className="home-blog-card__body">
                      <p className="home-blog-card__meta">
                        {formatDate(card.dateISO) !== null && (
                          <time dateTime={card.dateISO}>{formatDate(card.dateISO)}</time>
                        )}
                        {card.minutes !== null && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{card.minutes} min read</span>
                          </>
                        )}
                        {card.source && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{card.source}</span>
                          </>
                        )}
                      </p>
                      <h3 className="home-blog-card__title">{card.title}</h3>
                      {card.excerpt && <p className="home-blog-card__excerpt">{card.excerpt}</p>}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>

          <a href="/blog" className="home-blog__all">
            See all posts{" "}
            <span className="home-blog__all-arrow" aria-hidden>
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
