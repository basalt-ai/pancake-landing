import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.getpancake.ai", lastModified: new Date(), priority: 1.0 },
    { url: "https://www.getpancake.ai/pricing", lastModified: new Date(), priority: 0.8 },
    { url: "https://www.getpancake.ai/open-roadmap", lastModified: new Date(), priority: 0.6 },
    { url: "https://www.getpancake.ai/privacy", lastModified: new Date(), priority: 0.3 },
    { url: "https://www.getpancake.ai/terms", lastModified: new Date(), priority: 0.3 },
    { url: "https://www.getpancake.ai/blog", lastModified: new Date(), priority: 0.8 },
    ...getAllPosts().map((post) => ({
      url: `https://www.getpancake.ai/blog/${post.slug}`,
      lastModified: new Date(post.last_updated || post.date),
      priority: 0.7 as number,
    })),
  ];
}
