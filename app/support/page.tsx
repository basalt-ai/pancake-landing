import type { Metadata } from "next";
import Link from "next/link";

import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import "@/app/_styles/landing-v2.css";

export const metadata: Metadata = {
  title: "Support — Pancake",
  description: "Get help with Pancake, including ChatGPT, Codex, Claude, and MCP connections.",
  alternates: { canonical: "https://getpancake.ai/support" },
};

export default function SupportPage() {
  return (
    <main id="main-content" className="lv2">
      <div className="lv2-viewport lv2-viewport--page">
        <LandingNav />
        <section className="lv2s" aria-labelledby="support-heading">
          <article className="lv2-legal">
            <h1 id="support-heading">Support</h1>
            <p>
              Email <a href="mailto:hey@pancake.ai">hey@pancake.ai</a> for product,
              installation, connection, privacy, or billing help. Include the client you use,
              the approximate time of the problem, and the visible error message.
            </p>

            <h2>ChatGPT, Codex, and Claude</h2>
            <ol>
              <li>Confirm the Pancake app opens normally.</li>
              <li>Reconnect Pancake from your AI client.</li>
              <li>Complete the browser sign-in and choose one workspace.</li>
              <li>
                In Pancake, open Settings → MCP → Connected clients to confirm or revoke the
                connection.
              </li>
              <li>Retry a read-only request, such as reading the GTM Brain.</li>
            </ol>
            <p>
              Never email an access token, authorization code, magic link, password, or other
              credential.
            </p>

            <h2>Privacy and security</h2>
            <p>
              Read the <Link href="/privacy">Privacy Policy</Link> for data handling and
              retention. Report a suspected security issue to{" "}
              <a href="mailto:hey@pancake.ai?subject=Security%20report">hey@pancake.ai</a> with
              the subject “Security report.” Do not include customer data or credentials.
            </p>
          </article>
        </section>
      </div>
      <LandingFooter />
    </main>
  );
}
