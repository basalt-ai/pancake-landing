"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;
type MetaStandardEventName = "ViewContent" | "Lead" | "Contact" | "Schedule";
type MetaCustomEventName = "trial_click";
type MetaEventName = MetaStandardEventName | MetaCustomEventName;
type MetaPixelOptions = { eventID?: string };
type RedditEventName = "PageVisit";
type TrackedLinkEvent =
  | {
      dataLayerEvent: "trial_click";
      metaEvent: "trial_click";
      metaCustom: true;
      conversionName: "trial_click";
      destinationUrl: string;
    }
  | {
      dataLayerEvent: "meeting_click";
      metaEvent: "Contact";
      metaCustom: false;
      conversionName: "meeting_click";
      destinationUrl: string;
    };

type Fbq = {
  (
    command: "track" | "trackCustom",
    eventName: string,
    params?: AnalyticsParams,
    options?: MetaPixelOptions,
  ): void;
  (command: string, ...args: unknown[]): void;
};

type RedditTracker = {
  (command: "track", eventName: RedditEventName, params?: AnalyticsParams): void;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: Fbq;
    rdt?: RedditTracker;
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

function createEventId(eventName: MetaEventName) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${eventName}.${crypto.randomUUID()}`;
  }

  return `${eventName}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
}

function sendMetaConversion(
  eventName: MetaEventName,
  eventId: string,
  customData?: AnalyticsParams,
) {
  const body = JSON.stringify({
    event_name: eventName,
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: customData,
  });

  if (typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(
      "/events/mc",
      new Blob([body], { type: "application/json" }),
    );
    if (sent) return;
  }

  void fetch("/events/mc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics should never affect navigation or page behavior.
  });
}

function trackMeta(eventName: string, params?: AnalyticsParams, custom = false, eventId?: string) {
  if (typeof window.fbq !== "function") return;
  window.fbq(
    custom ? "trackCustom" : "track",
    eventName,
    params,
    eventId ? { eventID: eventId } : undefined,
  );
}

function trackReddit(eventName: RedditEventName, params?: AnalyticsParams) {
  if (typeof window.rdt !== "function") return;
  window.rdt("track", eventName, params);
}

function trackMetaWithConversionsApi(
  eventName: MetaStandardEventName,
  params?: AnalyticsParams,
  customData?: AnalyticsParams,
) {
  const eventId = createEventId(eventName);
  trackMeta(eventName, params, false, eventId);
  sendMetaConversion(eventName, eventId, customData ?? params);
  return eventId;
}

function trackMetaCustomWithConversionsApi(
  eventName: MetaCustomEventName,
  params?: AnalyticsParams,
  customData?: AnalyticsParams,
) {
  const eventId = createEventId(eventName);
  trackMeta(eventName, params, true, eventId);
  sendMetaConversion(eventName, eventId, customData ?? params);
  return eventId;
}

function linkText(anchor: HTMLAnchorElement) {
  return (
    anchor.getAttribute("aria-label") ||
    anchor.textContent?.replace(/\s+/g, " ").trim() ||
    "unlabeled link"
  ).slice(0, 120);
}

function trackedLinkEvent(anchor: HTMLAnchorElement): TrackedLinkEvent | null {
  const url = new URL(anchor.href, window.location.href);

  if (url.hostname === APP_HOST) {
    return {
      dataLayerEvent: "trial_click",
      metaEvent: "trial_click",
      metaCustom: true,
      conversionName: "trial_click",
      destinationUrl: url.toString(),
    };
  }

  if (url.hostname === MEETING_HOST) {
    return {
      dataLayerEvent: "meeting_click",
      metaEvent: "Contact",
      metaCustom: false,
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
    const viewContentParams = {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    };

    trackMetaWithConversionsApi("ViewContent", viewContentParams, {
      content_category: "landing_page",
      content_name: document.title || pagePath,
      page_path: pagePath,
      page_title: document.title,
    });

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
      trackReddit("PageVisit", params);
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
      const eventId = trackMetaWithConversionsApi("Schedule", params, {
        content_category: "meeting",
        content_name: "meeting_booked",
        conversion_name: "meeting_booked",
        page_path: pagePath,
        page_title: document.title,
      });

      pushDataLayer("meeting_booked", {
        ...params,
        event_id: eventId,
      });
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
      const customData = {
        content_category: "landing_page",
        content_name: trackedEvent.conversionName,
        conversion_name: trackedEvent.conversionName,
        destination_url: trackedEvent.destinationUrl,
        link_text: params.link_text,
        page_path: params.page_path,
        trigger,
      };
      const eventId = trackedEvent.metaCustom
        ? trackMetaCustomWithConversionsApi(trackedEvent.metaEvent, params, customData)
        : trackMetaWithConversionsApi(trackedEvent.metaEvent, params, customData);

      pushDataLayer(trackedEvent.dataLayerEvent, {
        ...params,
        event_id: eventId,
      });
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
