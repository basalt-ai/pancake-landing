import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import "@/app/_styles/landing-v3.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Pancake",
  description: "Connect an agent to Pancake's GTM Brain, leads, and SEO calendar. Read supported capabilities, setup instructions, and a first request.",
  alternates: { canonical: "https://getpancake.ai/agents" },
  openGraph: {
    title: "Pancake",
    description: "Pancake's connection guide for agents: GTM context, supported reads, and setup.",
    url: "https://getpancake.ai/agents",
  },
};

/** One public source supplies both the rendered guide and its Markdown form. */
export default async function AgentsPage() {
  const guide = await readFile(path.join(process.cwd(), "public", "agents.md"), "utf8");

  return (
    <main id="main-content" className="lp">
      <LpNav />
      <section className="lp-agent-guide" aria-labelledby="lp-agent-guide-title">
        <nav className="lp-agent-guide__resources" aria-label="Agent guide formats">
          <a href="/?audience=agents"><span aria-hidden="true">←</span> For agents</a>
          <a href="/agents.md">Raw Markdown <span aria-hidden="true">↗</span></a>
        </nav>
        <article className="lp-agent-guide__body">
          <ReactMarkdown components={{
            h1: ({ children }) => <h1 id="lp-agent-guide-title">{children}</h1>,
          }}>{guide}</ReactMarkdown>
        </article>
      </section>
      <LpFooter />
    </main>
  );
}
