import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import "../blog.css";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { Footer } from "@/components/shared/Footer";

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
    <main id="main-content" className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--surface)", color: "var(--text)" }}>
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

      <HomeNav />

      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-24">
        {/* Header */}
        <header className="mb-12">
          <time
            dateTime={meta.date}
            style={{ fontSize: "var(--font-scale-min-1)", color: "var(--subtle-text)" }}
          >
            {new Date(meta.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1
            className="mt-2 mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-scale-4)", fontWeight: 700, lineHeight: 1.15 }}
          >
            {meta.title}
          </h1>
          <p style={{ color: "var(--subtle-text)", fontSize: "var(--font-scale-1)" }}>
            {meta.description}
          </p>
          <div
            className="mt-4 flex items-center gap-3"
            style={{ fontSize: "var(--font-scale-min-1)", color: "var(--subtle-text)" }}
          >
            <span>By {meta.author}</span>
            <span aria-hidden>·</span>
            <span>
              Last updated:{" "}
              {new Date(meta.last_updated || meta.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Post body */}
        <div className="blog-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {/* FAQ section rendered from frontmatter */}
        {meta.faq && meta.faq.length > 0 && (
          <section className="mt-16">
            <h2
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-scale-2)", fontWeight: 600, marginBottom: "1.5rem" }}
            >
              Frequently asked questions
            </h2>
            <dl className="flex flex-col gap-8">
              {meta.faq.map((item, i) => (
                <div key={i}>
                  <dt style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{item.question}</dt>
                  <dd style={{ color: "var(--subtle-text)" }}>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </article>

      <Footer />
    </main>
  );
}
