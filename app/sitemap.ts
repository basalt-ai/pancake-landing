import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

/**
 * Parse a frontmatter date, falling back to "now" when missing/unparseable.
 * Guards the build: an invalid date reaches `Date.toISOString()` during
 * prerender and throws `RangeError: Invalid time value`, failing the whole deploy.
 */
function safeDate(value: string | undefined): Date {
  const parsed = new Date(value ?? "");
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.getpancake.ai", lastModified: new Date(), priority: 1.0 },
    { url: "https://www.getpancake.ai/pricing", lastModified: new Date(), priority: 0.8 },
    { url: "https://www.getpancake.ai/open-roadmap", lastModified: new Date(), priority: 0.6 },
    { url: "https://www.getpancake.ai/privacy", lastModified: new Date(), priority: 0.3 },
    { url: "https://www.getpancake.ai/terms", lastModified: new Date(), priority: 0.3 },
    { url: "https://www.getpancake.ai/blog", lastModified: new Date(), priority: 0.8 },
    { url: "https://www.getpancake.ai/viktor-vs-pancake", lastModified: new Date(), priority: 0.8 },
    ...getAllPosts().map((post) => ({
      url: `https://www.getpancake.ai/blog/${post.slug}`,
      lastModified: safeDate(post.last_updated || post.date),
      priority: 0.7 as number,
    })),
  ];
}
