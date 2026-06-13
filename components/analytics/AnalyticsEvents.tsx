"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

type Fbq = {
  (command: "track" | "trackCustom", eventName: string, params?: AnalyticsParams): void;
  (command: string, ...args: unknown[]): void;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: Fbq;
  }
}

const APP_HOST = "app.getpancake.ai";
const MEETING_HOST = "zcal.co";

function currentPagePath() {
  return `${window.location.pathname}${window.location.search}`;
}

function pushDataLayer(event: string, params: AnalyticsParams = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
  });
}

function trackMeta(eventName: string, params?: AnalyticsParams, custom = false) {
  if (typeof window.fbq !== "function") return;
  window.fbq(custom ? "trackCustom" : "track", eventName, params);
}

function linkText(anchor: HTMLAnchorElement) {
  return (
    anchor.getAttribute("aria-label") ||
    anchor.textContent?.replace(/\s+/g, " ").trim() ||
    "unlabeled link"
  ).slice(0, 120);
}

function trackedLinkEvent(anchor: HTMLAnchorElement) {
  const url = new URL(anchor.href, window.location.href);

  if (url.hostname === APP_HOST) {
    return {
      dataLayerEvent: "trial_click",
      metaEvent: "Lead",
      conversionName: "trial_click",
      destinationUrl: url.toString(),
    };
  }

  if (url.hostname === MEETING_HOST) {
    return {
      dataLayerEvent: "meeting_click",
      metaEvent: "Contact",
      conversionName: "meeting_click",
      destinationUrl: url.toString(),
    };
  }

  return null;
}

export function AnalyticsEvents() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);
  const bookedTrackedRef = useRef(false);

  useEffect(() => {
    const pagePath = currentPagePath();

    if (previousPathRef.current && previousPathRef.current !== pagePath) {
      const params = {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      };

      pushDataLayer("page_view", {
        ...params,
        source: "next_app_router",
      });
      trackMeta("PageView");
    }

    previousPathRef.current = pagePath;

    if (pathname === "/booked" && !bookedTrackedRef.current) {
      bookedTrackedRef.current = true;
      const params = {
        conversion_name: "meeting_booked",
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      };

      pushDataLayer("meeting_booked", params);
      trackMeta("Schedule", params);
    }
  }, [pathname]);

  useEffect(() => {
    const trackedAnchors = new WeakMap<HTMLAnchorElement, number>();

    const trackAnchor = (anchor: HTMLAnchorElement, trigger: "pointerdown" | "click") => {
      const now = Date.now();
      const lastTrackedAt = trackedAnchors.get(anchor) ?? 0;
      if (now - lastTrackedAt < 1000) return;

      const trackedEvent = trackedLinkEvent(anchor);
      if (!trackedEvent) return;

      trackedAnchors.set(anchor, now);

      const params = {
        conversion_name: trackedEvent.conversionName,
        destination_url: trackedEvent.destinationUrl,
        link_text: linkText(anchor),
        page_path: currentPagePath(),
        page_location: window.location.href,
        trigger,
      };

      pushDataLayer(trackedEvent.dataLayerEvent, params);
      trackMeta(trackedEvent.metaEvent, params);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (target instanceof HTMLAnchorElement) {
        trackAnchor(target, "pointerdown");
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (target instanceof HTMLAnchorElement) {
        trackAnchor(target, "click");
      }
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    document.addEventListener("click", onClick, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return null;
}
