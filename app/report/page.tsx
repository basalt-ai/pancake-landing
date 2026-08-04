import type { Metadata } from "next";

import { ReportExperience } from "@/components/sections/report/ReportExperience";

import "./report.css";

export const metadata: Metadata = {
  title: "Free AI GTM report — would ChatGPT recommend you? | Pancake",
  description:
    "Drop your domain and watch the scan run: how you show up in ChatGPT answers, where you rank on Google's money searches, and what to fix first.",
  alternates: { canonical: "https://getpancake.ai/report" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/report",
    title: "Free AI GTM report — would ChatGPT recommend you?",
    description:
      "A one-minute scan: ChatGPT visibility on your buyers' questions, Google money searches, and what to fix first.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake — free AI GTM report" }],
    siteName: "Pancake",
  },
};

export default function ReportPage() {
  return <ReportExperience />;
}
