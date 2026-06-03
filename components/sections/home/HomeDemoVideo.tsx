"use client";

import { useRef, useState } from "react";

/**
 * Product demo video below the hero (à la monaco.com): a wide, near-bleed 16:9
 * player with rounded corners, no chrome frame. A centered play button overlays
 * the "Meet Pancake" poster until first play, then native controls take over.
 * Source is web-optimized H.264 with `+faststart` — see `public/demo-video.mp4`.
 */
export function HomeDemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    void video.play();
  };

  return (
    <section className="home-demo-video" aria-label="Pancake product demo">
      <div className="home-demo-video__wrap">
        <div className="home-demo-video__frame">
          <video
            ref={videoRef}
            className="home-demo-video__player"
            playsInline
            preload="metadata"
            poster="/demo-video-poster.jpg"
            controls={started}
            onPlay={() => setStarted(true)}
          >
            <source src="/demo-video.mp4" type="video/mp4" />
          </video>

          {!started && (
            <button
              type="button"
              className="home-demo-video__play"
              onClick={startPlayback}
              aria-label="Play the Pancake demo"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.79-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
