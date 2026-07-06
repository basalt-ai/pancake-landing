import type { Metadata } from "next";

import { FlappyBird } from "@/components/shared/FlappyBird";
import { Footer } from "@/components/shared/Footer";
import { Nav } from "@/components/shared/Nav";

export const metadata: Metadata = {
  title: "Meeting booked · Pancake",
  description: "Thanks for booking. See you soon.",
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Nav />
      <div className="px-4 pb-24 pt-[calc(4.5rem+3rem)] sm:px-6 sm:pt-[calc(4.5rem+4rem)]">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold text-[var(--text)] sm:text-5xl">
            Can&apos;t wait to meet you !
          </h1>
          <h2 className="mt-4 text-lg text-[var(--text-muted)] sm:text-xl">
            In the meantime, try entering our leaderboard
          </h2>

          <div className="mt-12 flex justify-center">
            <FlappyBird />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
