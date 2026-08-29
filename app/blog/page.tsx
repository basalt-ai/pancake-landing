import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import "./blog.css";
import "@/app/_styles/landing-v2.css";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Blog · Pancake",
  description: "Guides and strategies on AI-native company building, automation, and the future of work.",
  alternates: { canonical: "https://getpancake.ai/blog" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/blog",
    title: "Blog · Pancake",
    description: "Guides and strategies on AI-native company building, automation, and the future of work.",
    siteName: "Pancake",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main id="main-content" className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--surface)", color: "var(--text)" }}>
      <div className="lv2 px-5 md:px-10">
        <LandingNav />
      </div>

      <section className="mx-auto w-full max-w-3xl flex-1 px-6 py-24">
        <h1
          className="mb-4"
          style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-scale-4)", fontWeight: 700 }}
        >
          Blog
        </h1>
        <p className="mb-16" style={{ color: "var(--subtle-text)", fontSize: "var(--font-scale-1)" }}>
          We are Pancake and we help small teams achieve great things with AI. This is where we share our recipes, come cook with us!
        </p>

        {posts.length === 0 ? (
          <p style={{ color: "var(--subtle-text)" }}>No posts yet. Check back soon.</p>
        ) : (
          <ul className="flex flex-col gap-12" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block no-underline"
                  prefetch={false}
                >
                  <div className="flex items-center gap-2">
                    <time
                      dateTime={post.date}
                      style={{ fontSize: "var(--font-scale-min-1)", color: "var(--subtle-text)" }}
                    >
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    {post.pinned && (
                      <span
                        style={{
                          fontSize: "var(--font-scale-min-1)",
                          color: "var(--accent, var(--subtle-text))",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontWeight: 600,
                        }}
                      >
                        · Pinned
                      </span>
                    )}
                  </div>
                  <h2
                    className="mt-1 mb-2 transition-opacity group-hover:opacity-70"
                    style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-scale-2)", fontWeight: 600 }}
                  >
                    {post.title}
                  </h2>
                  <p style={{ color: "var(--subtle-text)", fontSize: "var(--font-scale-0)" }}>
                    {post.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Footer />
    </main>
  );
}
