import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { formatPostDate, getAllPosts, getPostBySlug } from "@/lib/posts";
import "@/app/_styles/landing-v3.css";
import "../blog.css";

/**
 * Blog post on the landing-v3 system (2026-09-03) — see app/blog/page.tsx for
 * the why. Header band (date / title / description / byline) on the 1296
 * grid, the markdown body on a 760px measure, the frontmatter FAQ as cream
 * cards. Article + FAQPage JSON-LD unchanged.
 */

/* Status-bar zone matches the lp cream (Dynamic Island fix, 2026-08-31) */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.meta.title} — Pancake Blog`,
    description: post.meta.description,
    alternates: { canonical: `https://getpancake.ai/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `https://getpancake.ai/blog/${slug}`,
      title: post.meta.title,
      description: post.meta.description,
      publishedTime: post.meta.date,
      modifiedTime: post.meta.last_updated,
      authors: [post.meta.author],
      siteName: "Pancake",
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.description,
    },
  };
}

/* ReactMarkdown emits a bare <table>; the comparison tables in the posts are
   wider than the 760px measure on phones, so each one gets a scrolling box.
   `node` (the hast node react-markdown passes) must not reach the DOM. */
type TableProps = ComponentPropsWithoutRef<"table"> & { node?: unknown };
const markdownComponents: Components = {
  table: ({ node: _node, ...props }: TableProps) => (
    <div className="lp-blog-tablewrap">
      <table {...props} />
    </div>
  ),
};

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { meta, content } = post;

  // Build Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.last_updated || meta.date,
    author: {
      "@type": "Person",
      name: meta.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Pancake",
      url: "https://getpancake.ai",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://getpancake.ai/blog/${slug}`,
    },
  };

  // Build FAQPage JSON-LD if post has FAQ entries
  const faqJsonLd =
    meta.faq && meta.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: meta.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <main id="main-content" className="lp">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <LpNav />

      <article>
        <header className="lp-blog-hero">
          <div className="lp-content lp-blog-hero__inner">
            <a className="lp-blog-back" href="/blog">
              &larr; All posts
            </a>
            <p className="lp-blog-meta">
              <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
            </p>
            <h1 className="lp-blog-post__title lp-display">{meta.title}</h1>
            <p className="lp-blog-lede lp-blog-post__lede">{meta.description}</p>
            <p className="lp-blog-meta">
              <span>By {meta.author}</span>
              <span aria-hidden="true">&middot;</span>
              <span>Last updated {formatPostDate(meta.last_updated || meta.date)}</span>
            </p>
          </div>
        </header>

        <div className="lp-blog-article">
          <div className="lp-content">
            <div className="lp-blog-article__inner">
              <div className="lp-blog-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {content}
                </ReactMarkdown>
              </div>

              {/* FAQ section rendered from frontmatter */}
              {meta.faq && meta.faq.length > 0 && (
                <section className="lp-blog-faq" aria-labelledby="blog-faq-heading">
                  <h2 id="blog-faq-heading" className="lp-blog-faq__title">
                    Frequently asked questions
                  </h2>
                  <dl className="lp-blog-faq__list">
                    {meta.faq.map((item) => (
                      <div key={item.question} className="lp-blog-faq__item">
                        <dt className="lp-blog-faq__q">{item.question}</dt>
                        <dd className="lp-blog-faq__a">{item.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </div>
          </div>
        </div>
      </article>

      <LpFooter />
    </main>
  );
}
